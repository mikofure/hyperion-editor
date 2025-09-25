// Hyperion source code edit control
/** @file Style.h
 ** Defines the font and colour style for a class of text.
 **/
// Copyright 1998-2001 by Neil Hodgson <neilh@scintilla.org>
// The License.txt file describes the conditions under which this software may be distributed.

#ifndef STYLE_HPP
#define STYLE_HPP

namespace Hyperion::Internal {

struct FontSpecification {
	// fontName is allocated by a ViewStyle container object and may be null
	const char *fontName;
	int size;
	Hyperion::FontWeight weight = Hyperion::FontWeight::Normal;
	Hyperion::FontStretch stretch = Hyperion::FontStretch::Normal;
	bool italic = false;
	Hyperion::CharacterSet characterSet = Hyperion::CharacterSet::Default;
	Hyperion::FontQuality extraFontFlag = Hyperion::FontQuality::QualityDefault;
	bool checkMonospaced = false;

	constexpr FontSpecification(const char *fontName_=nullptr, int size_=10*Hyperion::FontSizeMultiplier) noexcept :
		fontName(fontName_), size(size_) {
	}
	bool operator==(const FontSpecification &other) const noexcept;
	bool operator<(const FontSpecification &other) const noexcept;
};

struct FontMeasurements {
	XYPOSITION ascent = 1;
	XYPOSITION descent = 1;
	XYPOSITION capitalHeight = 1;	// Top of capital letter to baseline: ascent - internal leading
	XYPOSITION aveCharWidth = 1;
	XYPOSITION monospaceCharacterWidth = 1;
	XYPOSITION spaceWidth = 1;
	bool monospaceASCII = false;
	int sizeZoomed = 2;
};

/**
 */
class Style : public FontSpecification, public FontMeasurements {
public:
	ColourRGBA fore;
	ColourRGBA back;
	bool eolFilled;
	bool underline;
	enum class CaseForce {mixed, upper, lower, camel};
	CaseForce caseForce;
	bool visible;
	bool changeable;
	bool hotspot;
	char invisibleRepresentation[5];

	std::shared_ptr<Font> font;

	Style(const char *fontName_=nullptr) noexcept;
	void Copy(std::shared_ptr<Font> font_, const FontMeasurements &fm_) noexcept;
	bool IsProtected() const noexcept { return !(changeable && visible);}
};

}

#endif
