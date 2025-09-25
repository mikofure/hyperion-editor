// Hyperion source code edit control
/** @file EditModel.cpp
 ** Defines the editor state that must be visible to EditorView.
 **/
// Copyright 1998-2014 by Neil Hodgson <neilh@Hyperion.org>
// The License.txt file describes the conditions under which this software may be distributed.

#include <cstddef>
#include <cstdlib>
#include <cstdint>
#include <cassert>
#include <cstring>
#include <cmath>

#include <stdexcept>
#include <string>
#include <string_view>
#include <vector>
#include <map>
#include <set>
#include <optional>
#include <algorithm>
#include <memory>

#include "HyperionTypes.hpp"
#include "ILoader.hpp"
#include "ILexer.hpp"

#include "platform/Debugging.hpp"
#include "platform/Geometry.hpp"
#include "platform/Platform.hpp"

#include "syntax/CharacterCategoryMap.hpp"

#include "platform/Position.hpp"
#include "syntax/UniqueString.hpp"
#include "SplitVector.hpp"
#include "Partitioning.hpp"
#include "RunStyles.hpp"
#include "ContractionState.hpp"
#include "CellBuffer.hpp"
#include "view/Indicator.hpp"
#include "view/LineMarker.hpp"
#include "view/Style.hpp"
#include "view/ViewStyle.hpp"
#include "syntax/CharClassify.hpp"
#include "view/Decoration.hpp"
#include "syntax/CaseFolder.hpp"
#include "Document.hpp"
#include "syntax/UniConversion.hpp"
#include "Selection.hpp"
#include "view/PositionCache.hpp"
#include "EditModel.hpp"

using namespace Hyperion;
using namespace Hyperion::Internal;

Caret::Caret() noexcept :
	active(false), on(false), period(500) {}

void ModelState::RememberSelectionForUndo(int index, const Selection &sel) {
	historyForUndo.indexCurrent = index;
	historyForUndo.ssCurrent = sel.ToString();
}

void ModelState::ForgetSelectionForUndo() noexcept {
	historyForUndo.indexCurrent = -1;
}

void ModelState::RememberSelectionOntoStack(int index, Sci::Line topLine) {
	if ((historyForUndo.indexCurrent >= 0) && (index == historyForUndo.indexCurrent + 1)) {
		// Don't overwrite initial selection save if most recent action was coalesced
		historyForUndo.stack[index] = { historyForUndo.ssCurrent, topLine };
	}
}

void ModelState::RememberSelectionForRedoOntoStack(int index, const Selection &sel, Sci::Line topLine) {
	historyForRedo.stack[index] = { sel.ToString(), topLine };
}

SelectionWithScroll ModelState::SelectionFromStack(int index, UndoRedo history) const {
	const SelectionHistory &sh = history == UndoRedo::undo ? historyForUndo : historyForRedo;
	const SelectionStack::const_iterator it = sh.stack.find(index);
	if (it != sh.stack.end()) {
		return it->second;
	}
	return {};
}

void ModelState::TruncateUndo(int index) {
	const SelectionStack::const_iterator itUndo = historyForUndo.stack.find(index);
	historyForUndo.stack.erase(itUndo, historyForUndo.stack.end());
	const SelectionStack::const_iterator itRedo = historyForRedo.stack.find(index);
	historyForRedo.stack.erase(itRedo, historyForRedo.stack.end());
}

EditModel::EditModel() : braces{} {
	inOverstrike = false;
	xOffset = 0;
	trackLineWidth = false;
	posDrag = SelectionPosition(Sci::invalidPosition);
	braces[0] = Sci::invalidPosition;
	braces[1] = Sci::invalidPosition;
	bracesMatchStyle = StyleBraceBad;
	highlightGuideColumn = 0;
	hasFocus = false;
	primarySelection = true;
	imeInteraction = IMEInteraction::Windowed;
	bidirectional = Bidirectional::Disabled;
	foldFlags = FoldFlag::None;
	foldDisplayTextStyle = FoldDisplayTextStyle::Hidden;
	hotspot = Range(Sci::invalidPosition);
	hotspotSingleLine = true;
	hoverIndicatorPos = Sci::invalidPosition;
	wrapWidth = LineLayout::wrapWidthInfinite;
	reprs = std::make_unique<SpecialRepresentations>();
	pdoc = new Document(DocumentOption::Default);
	pdoc->AddRef();
	pcs = ContractionStateCreate(pdoc->IsLarge());
}

EditModel::~EditModel() {
	try {
		// Erasing the view state won't throw even though SetViewState
		// and the resulting map::erase aren't marked noexcept.
		pdoc->SetViewState(this, {});
		// This never throws but isn't marked noexcept for compatibility
		pdoc->Release();
	} catch (...) {
		// Ignore any exception
	}
	pdoc = nullptr;
}

bool EditModel::BidirectionalEnabled() const noexcept {
	return (bidirectional != Bidirectional::Disabled) &&
		(CpUtf8 == pdoc->dbcsCodePage);
}

bool EditModel::BidirectionalR2L() const noexcept {
	return bidirectional == Bidirectional::R2L;
}

SurfaceMode EditModel::CurrentSurfaceMode() const noexcept {
	return SurfaceMode(pdoc->dbcsCodePage, BidirectionalR2L());
}

void EditModel::SetDefaultFoldDisplayText(const char *text) {
	defaultFoldDisplayText = IsNullOrEmpty(text) ? UniqueString() : UniqueStringCopy(text);
}

const char *EditModel::GetDefaultFoldDisplayText() const noexcept {
	return defaultFoldDisplayText.get();
}

const char *EditModel::GetFoldDisplayText(Sci::Line lineDoc) const noexcept {
	if (foldDisplayTextStyle == FoldDisplayTextStyle::Hidden || pcs->GetExpanded(lineDoc)) {
		return nullptr;
	}

	const char *text = pcs->GetFoldDisplayText(lineDoc);
	return text ? text : defaultFoldDisplayText.get();
}

InSelection EditModel::LineEndInSelection(Sci::Line lineDoc) const {
	const Sci::Position posAfterLineEnd = pdoc->LineStart(lineDoc + 1);
	return sel.InSelectionForEOL(posAfterLineEnd);
}

int EditModel::GetMark(Sci::Line line) const {
	return pdoc->GetMark(line, FlagSet(changeHistoryOption, ChangeHistoryOption::Markers));
}

void EditModel::EnsureModelState() {
	if (!modelState && (undoSelectionHistoryOption != UndoSelectionHistoryOption::Disabled)) {
		if (ViewStateShared vss = pdoc->GetViewState(this)) {
			modelState = std::dynamic_pointer_cast<ModelState>(vss);
		} else {
			modelState = std::make_shared<ModelState>();
			pdoc->SetViewState(this, std::static_pointer_cast<ViewState>(modelState));
		}
	}
}

void EditModel::ChangeUndoSelectionHistory(Hyperion::UndoSelectionHistoryOption undoSelectionHistoryOptionNew) {
	undoSelectionHistoryOption = undoSelectionHistoryOptionNew;
	if (undoSelectionHistoryOption == UndoSelectionHistoryOption::Disabled) {
		modelState.reset();
		pdoc->SetViewState(this, {});
	}
}
