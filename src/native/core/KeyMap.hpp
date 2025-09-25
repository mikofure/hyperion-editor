// Hyperion source code edit control
/** @file KeyMap.h
 ** Defines a mapping between keystrokes and commands.
 **/
// Copyright 1998-2001 by Neil Hodgson <neilh@scintilla.org>
// The License.txt file describes the conditions under which this software may be distributed.

#pragma once
namespace Hyperion::Internal {

#define SCI_NORM KeyMod::Norm
#define SCI_SHIFT KeyMod::Shift
#define SCI_CTRL KeyMod::Ctrl
#define SCI_ALT KeyMod::Alt
#define SCI_META KeyMod::Meta
#define SCI_SUPER KeyMod::Super
#define SCI_CSHIFT (KeyMod::Ctrl | KeyMod::Shift)
#define SCI_ASHIFT (KeyMod::Alt | KeyMod::Shift)

/**
 */
class KeyModifiers {
public:
	Hyperion::Keys key;
	Hyperion::KeyMod modifiers;
	KeyModifiers() noexcept : key{}, modifiers(KeyMod::Norm) {
	};
	KeyModifiers(Hyperion::Keys key_, Hyperion::KeyMod modifiers_) noexcept : key(key_), modifiers(modifiers_) {
	}
	bool operator<(const KeyModifiers &other) const noexcept {
		if (key == other.key)
			return modifiers < other.modifiers;
		else
			return key < other.key;
	}
};

/**
 */
class KeyToCommand {
public:
	Hyperion::Keys key;
	Hyperion::KeyMod modifiers;
	Hyperion::Message msg;
};

/**
 */
class KeyMap {
	std::map<KeyModifiers, Hyperion::Message> kmap;
	static const KeyToCommand MapDefault[];

public:
	KeyMap();
	void Clear() noexcept;
	void AssignCmdKey(Hyperion::Keys key, Hyperion::KeyMod modifiers, Hyperion::Message msg);
	Hyperion::Message Find(Hyperion::Keys key, Hyperion::KeyMod modifiers) const;	// 0 returned on failure
	const std::map<KeyModifiers, Hyperion::Message> &GetKeyMap() const noexcept;
};

}