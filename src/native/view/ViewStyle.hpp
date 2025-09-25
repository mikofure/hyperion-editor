// Hyperion source code edit control
/** @file ViewStyle.h
 ** Store information on how the document is to be viewed.
 **/
// Copyright 1998-2001 by Neil Hodgson <neilh@Hyperion.org>
// The License.txt file describes the conditions under which this software may be distributed.

#ifndef VIEWSTYLE_HPP
#define VIEWSTYLE_HPP

namespace Hyperion::Internal {

/**
 */
class MarginStyle {
public:
	Hyperion::MarginType style;
	ColourRGBA back;
	int width;
	int mask;
	bool sensitive;
	Hyperion::CursorShape cursor;
	MarginStyle(Hyperion::MarginType style_= Hyperion::MarginType::Symbol, int width_=0, int mask_=0) noexcept;
	bool ShowsFolding() const noexcept;
};

/**
 */


class FontRealised {
public:
	FontMeasurements measurements;
	std::shared_ptr<Font> font;
	void Realise(Surface &surface, int zoomLevel, Hyperion::Technology technology, const FontSpecification &fs, const char *localeName);
};

typedef std::map<FontSpecification, std::unique_ptr<FontRealised>> FontMap;

using ColourOptional = std::optional<ColourRGBA>;

inline ColourOptional OptionalColour(Hyperion::uptr_t wParam, Hyperion::sptr_t lParam) noexcept {
	if (wParam) {
		return ColourRGBA::FromIpRGB(lParam);
	} else {
		return {};
	}
}

struct SelectionAppearance {
	// Is the selection visible?
	bool visible = true;
	// Whether to draw on base layer or over text
	Hyperion::Layer layer = Layer::Base;
	// Draw selection past line end characters up to right border
	bool eolFilled = false;
};

struct CaretLineAppearance {
	// Whether to draw on base layer or over text
	Hyperion::Layer layer = Layer::Base;
	// Also show when non-focused
	bool alwaysShow = false;
	// highlight sub line instead of whole line
	bool subLine = false;
	// Non-0: draw a rectangle around line instead of filling line. Value is pixel width of frame
	int frame = 0;
};

struct CaretAppearance {
	// Line, block, over-strike bar ...
	Hyperion::CaretStyle style = CaretStyle::Line;
	// Width in pixels
	int width = 1;
};

struct WrapAppearance {
	// No wrapping, word, character, whitespace appearance
	Hyperion::Wrap state = Wrap::None;
	// Show indication of wrap at line end, line start, or in margin
	Hyperion::WrapVisualFlag visualFlags = WrapVisualFlag::None;
	// Show indication near margin or near text
	Hyperion::WrapVisualLocation visualFlagsLocation = WrapVisualLocation::Default;
	// How much indentation to show wrapping
	int visualStartIndent = 0;
	// WrapIndentMode::Fixed, Same, Indent, DeepIndent
	Hyperion::WrapIndentMode indentMode = WrapIndentMode::Fixed;
};

struct EdgeProperties {
	int column = 0;
	ColourRGBA colour;
	constexpr EdgeProperties(int column_ = 0, ColourRGBA colour_ = ColourRGBA::FromRGB(0)) noexcept :
		column(column_), colour(colour_) {
	}
};

// This is an old style enum so that its members can be used directly as indices without casting
enum StyleIndices {
	StyleDefault = static_cast<int>(Hyperion::StylesCommon::Default),
	StyleLineNumber = static_cast<int>(Hyperion::StylesCommon::LineNumber),
	StyleBraceLight = static_cast<int>(Hyperion::StylesCommon::BraceLight),
	StyleBraceBad = static_cast<int>(Hyperion::StylesCommon::BraceBad),
	StyleControlChar = static_cast<int>(Hyperion::StylesCommon::ControlChar),
	StyleIndentGuide = static_cast<int>(Hyperion::StylesCommon::IndentGuide),
	StyleCallTip = static_cast<int>(Hyperion::StylesCommon::CallTip),
	StyleFoldDisplayText = static_cast<int>(Hyperion::StylesCommon::FoldDisplayText),
};

/**
 */
class ViewStyle {
	UniqueStringSet fontNames;
	FontMap fonts;
public:
	std::vector<Style> styles;
	int nextExtendedStyle;
	std::vector<LineMarker> markers;
	int largestMarkerHeight;
	std::vector<Indicator> indicators;
	bool indicatorsDynamic;
	bool indicatorsSetFore;
	Hyperion::Technology technology;
	int lineHeight;
	int lineOverlap;
	XYPOSITION maxAscent;
	XYPOSITION maxDescent;
	XYPOSITION aveCharWidth;
	XYPOSITION spaceWidth;
	XYPOSITION tabWidth;

	SelectionAppearance selection;

	int controlCharSymbol;
	XYPOSITION controlCharWidth;
	ColourRGBA selbar;
	ColourRGBA selbarlight;
	ColourOptional foldmarginColour;
	ColourOptional foldmarginHighlightColour;
	bool hotspotUnderline;
	/// Margins are ordered: Line Numbers, Selection Margin, Spacing Margin
	int leftMarginWidth;	///< Spacing margin on left of text
	int rightMarginWidth;	///< Spacing margin on right of text
	int maskInLine = 0;	///< Mask for markers to be put into text because there is nowhere for them to go in margin
	int maskDrawInText = 0;	///< Mask for markers that always draw in text
	int maskDrawWrapped = 0;	///< Mask for markers that draw on wrapped lines
	std::vector<MarginStyle> ms;
	int fixedColumnWidth = 0;	///< Total width of margins
	bool marginInside;	///< true: margin included in text view, false: separate views
	int textStart;	///< Starting x position of text within the view
	int zoomLevel;
	Hyperion::WhiteSpace viewWhitespace;
	Hyperion::TabDrawMode tabDrawMode;
	int whitespaceSize;
	Hyperion::IndentView viewIndentationGuides;
	bool viewEOL;

	CaretAppearance caret;

	CaretLineAppearance caretLine;

	bool someStylesProtected;
	bool someStylesForceCase;
	Hyperion::FontQuality extraFontFlag;
	int extraAscent;
	int extraDescent;
	int marginStyleOffset;
	Hyperion::AnnotationVisible annotationVisible;
	int annotationStyleOffset;
	Hyperion::EOLAnnotationVisible eolAnnotationVisible;
	int eolAnnotationStyleOffset;
	bool braceHighlightIndicatorSet;
	int braceHighlightIndicator;
	bool braceBadLightIndicatorSet;
	int braceBadLightIndicator;
	Hyperion::EdgeVisualStyle edgeState;
	EdgeProperties theEdge;
	std::vector<EdgeProperties> theMultiEdge;
	int marginNumberPadding; // the right-side padding of the number margin
	int ctrlCharPadding; // the padding around control character text blobs
	int lastSegItalicsOffset; // the offset so as not to clip italic characters at EOLs
	int autocStyle;

	using ElementMap = std::map<Hyperion::Element, ColourOptional>;
	ElementMap elementColours;
	ElementMap elementBaseColours;
	std::set<Hyperion::Element> elementAllowsTranslucent;

	WrapAppearance wrap;

	std::string localeName;

	ViewStyle(size_t stylesSize_=256);
	ViewStyle(const ViewStyle &source);
	ViewStyle(ViewStyle &&) = delete;
	// Can only be copied through copy constructor which ensures font names initialised correctly
	ViewStyle &operator=(const ViewStyle &) = delete;
	ViewStyle &operator=(ViewStyle &&) = delete;
	~ViewStyle();
	void CalculateMarginWidthAndMask() noexcept;
	void Refresh(Surface &surface, int tabInChars);
	void ReleaseAllExtendedStyles() noexcept;
	int AllocateExtendedStyles(int numberStyles);
	void EnsureStyle(size_t index);
	void ResetDefaultStyle();
	void ClearStyles();
	void SetStyleFontName(int styleIndex, const char *name);
	void SetFontLocaleName(const char *name);
	bool ProtectionActive() const noexcept;
	int ExternalMarginWidth() const noexcept;
	int MarginFromLocation(Point pt) const noexcept;
	bool ValidStyle(size_t styleIndex) const noexcept;
	void CalcLargestMarkerHeight() noexcept;
	int GetFrameWidth() const noexcept;
	bool IsLineFrameOpaque(bool caretActive, bool lineContainsCaret) const;
	ColourOptional Background(int marksOfLine, bool caretActive, bool lineContainsCaret) const;
	bool SelectionBackgroundDrawn() const noexcept;
	bool SelectionTextDrawn() const;
	bool WhitespaceBackgroundDrawn() const;
	ColourRGBA WrapColour() const;

	void AddMultiEdge(int column, ColourRGBA colour);

	ColourOptional ElementColour(Hyperion::Element element) const;
	ColourRGBA ElementColourForced(Hyperion::Element element) const;
	bool ElementAllowsTranslucent(Hyperion::Element element) const;
	bool ResetElement(Hyperion::Element element);
	bool SetElementColour(Hyperion::Element element, ColourRGBA colour);
	bool SetElementColourOptional(Hyperion::Element element, Hyperion::uptr_t wParam, Hyperion::sptr_t lParam);
	void SetElementRGB(Hyperion::Element element, int rgb);
	void SetElementAlpha(Hyperion::Element element, int alpha);
	bool ElementIsSet(Hyperion::Element element) const;
	bool SetElementBase(Hyperion::Element element, ColourRGBA colour);

	bool SetWrapState(Hyperion::Wrap wrapState_) noexcept;
	bool SetWrapVisualFlags(Hyperion::WrapVisualFlag wrapVisualFlags_) noexcept;
	bool SetWrapVisualFlagsLocation(Hyperion::WrapVisualLocation wrapVisualFlagsLocation_) noexcept;
	bool SetWrapVisualStartIndent(int wrapVisualStartIndent_) noexcept;
	bool SetWrapIndentMode(Hyperion::WrapIndentMode wrapIndentMode_) noexcept;

	bool WhiteSpaceVisible(bool inIndent) const noexcept;

	enum class CaretShape { invisible, line, block, bar };
	bool IsBlockCaretStyle() const noexcept;
	bool IsCaretVisible(bool isMainSelection) const noexcept;
	bool DrawCaretInsideSelection(bool inOverstrike, bool imeCaretBlockOverride) const noexcept;
	CaretShape CaretShapeForMode(bool inOverstrike, bool isMainSelection) const noexcept;

private:
	void AllocStyles(size_t sizeNew);
	void CreateAndAddFont(const FontSpecification &fs);
	FontRealised *Find(const FontSpecification &fs);
	void FindMaxAscentDescent() noexcept;
};

}

#endif
