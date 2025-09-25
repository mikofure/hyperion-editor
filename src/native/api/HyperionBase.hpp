// Hyperion source code edit control
/** @file HyperionBase.h
 ** Defines an enhanced subclass of Editor with calltips, autocomplete and context menu.
 **/
// Copyright 1998-2002 by Neil Hodgson <neilh@scintilla.org>
// The License.txt file describes the conditions under which this software may be distributed.

#ifndef HyperionBASE_HPP
#define HYPERIONBASE_HPP

namespace Hyperion::Internal {

// For most platforms (not Cocoa) all IME indicators are drawn in same colour,
// blue, with different patterns.
constexpr ColourRGBA colourIME(0x0, 0x0, 0xffU);

constexpr int IndicatorInput = static_cast<int>(Hyperion::IndicatorNumbers::Ime);
constexpr int IndicatorTarget = IndicatorInput + 1;
constexpr int IndicatorConverted = IndicatorInput + 2;
constexpr int IndicatorUnknown = IndicatorInput + 3;

class LexState;
/**
 */
class HyperionBase : public Editor, IListBoxDelegate {
protected:
	/** Enumeration of commands and child windows. */
	enum {
		idCallTip=1,
		idAutoComplete=2,

		idcmdUndo=10,
		idcmdRedo=11,
		idcmdCut=12,
		idcmdCopy=13,
		idcmdPaste=14,
		idcmdDelete=15,
		idcmdSelectAll=16
	};

	Hyperion::PopUp displayPopupMenu;
	Menu popup;
	Hyperion::Internal::AutoComplete ac;

	CallTip ct;

	int listType;			///< 0 is an autocomplete list
	int maxListWidth;		/// Maximum width of list, in average character widths
	Hyperion::MultiAutoComplete multiAutoCMode; /// Mode for autocompleting when multiple selections are present

	LexState *DocumentLexState();
	void Colourise(int start, int end);

	HyperionBase();
	// Deleted so HyperionBase objects can not be copied.
	HyperionBase(const HyperionBase &) = delete;
	HyperionBase(HyperionBase &&) = delete;
	HyperionBase &operator=(const HyperionBase &) = delete;
	HyperionBase &operator=(HyperionBase &&) = delete;
	// ~HyperionBase() in public section
	void Initialise() override {}
	void Finalise() override;

	void InsertCharacter(std::string_view sv, Hyperion::CharacterSource charSource) override;
	void Command(int cmdId);
	void CancelModes() override;
	int KeyCommand(Hyperion::Message iMessage) override;

	void MoveImeCarets(Sci::Position offset) noexcept;
	void DrawImeIndicator(int indicator, Sci::Position len);

	void AutoCompleteInsert(Sci::Position startPos, Sci::Position removeLen, std::string_view text);
	void AutoCompleteStart(Sci::Position lenEntered, const char *list);
	void AutoCompleteCancel();
	void AutoCompleteMove(int delta);
	int AutoCompleteGetCurrent() const;
	int AutoCompleteGetCurrentText(char *buffer) const;
	void AutoCompleteCharacterAdded(char ch);
	void AutoCompleteCharacterDeleted();
	void AutoCompleteNotifyCompleted(char ch, CompletionMethods completionMethod, Sci::Position firstPos, const char *text);
	void AutoCompleteCompleted(char ch, Hyperion::CompletionMethods completionMethod);
	void AutoCompleteMoveToCurrentWord();
	void AutoCompleteSelection();
	void ListNotify(ListBoxEvent *plbe) override;

	void CallTipClick();
	void CallTipShow(Point pt, const char *defn);
	virtual void CreateCallTipWindow(PRectangle rc) = 0;

	virtual void AddToPopUp(const char *label, int cmd=0, bool enabled=true) = 0;
	bool ShouldDisplayPopup(Point ptInWindowCoordinates) const;
	void ContextMenu(Point pt);

	void ButtonDownWithModifiers(Point pt, unsigned int curTime, Hyperion::KeyMod modifiers) override;
	void RightButtonDownWithModifiers(Point pt, unsigned int curTime, Hyperion::KeyMod modifiers) override;

	void NotifyStyleToNeeded(Sci::Position endStyleNeeded) override;

public:
	~HyperionBase() override;

	// Public so Hyperion_send_message can use it
	Hyperion::sptr_t WndProc(Hyperion::Message iMessage, Hyperion::uptr_t wParam, Hyperion::sptr_t lParam) override;
};

}

#endif
