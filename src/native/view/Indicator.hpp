// Hyperion source code edit control
/** @file Indicator.h
 ** Defines the style of indicators which are text decorations such as underlining.
 **/
// Copyright 1998-2001 by Neil Hodgson <neilh@Hyperion.org>
// The License.txt file describes the conditions under which this software may be distributed.

#ifndef INDICATOR_HPP
#define INDICATOR_HPP

namespace Hyperion::Internal {

struct StyleAndColour {
	Hyperion::IndicatorStyle style;
	ColourRGBA fore;
	StyleAndColour() noexcept : style(Hyperion::IndicatorStyle::Plain), fore(black) {
	}
	StyleAndColour(Hyperion::IndicatorStyle style_, ColourRGBA fore_ = black) noexcept : style(style_), fore(fore_) {
	}
	bool operator==(const StyleAndColour &other) const noexcept {
		return (style == other.style) && (fore == other.fore);
	}
};

/**
 */
class Indicator {
public:
	enum class State { normal, hover };
	StyleAndColour sacNormal;
	StyleAndColour sacHover;
	bool under;
	int fillAlpha;
	int outlineAlpha;
	Hyperion::IndicFlag attributes;
	XYPOSITION strokeWidth = 1.0f;
	Indicator() noexcept : under(false), fillAlpha(30), outlineAlpha(50), attributes(Hyperion::IndicFlag::None) {
	}
	Indicator(Hyperion::IndicatorStyle style_, ColourRGBA fore_= black, bool under_=false, int fillAlpha_=30, int outlineAlpha_=50) noexcept :
		sacNormal(style_, fore_), sacHover(style_, fore_), under(under_), fillAlpha(fillAlpha_), outlineAlpha(outlineAlpha_), attributes(Hyperion::IndicFlag::None) {
	}
	void Draw(Surface *surface, const PRectangle &rc, const PRectangle &rcLine, const PRectangle &rcCharacter, State drawState, int value) const;
	bool IsDynamic() const noexcept {
		return !(sacNormal == sacHover);
	}
	bool OverridesTextFore() const noexcept {
		return sacNormal.style == Hyperion::IndicatorStyle::TextFore || sacHover.style == Hyperion::IndicatorStyle::TextFore;
	}
	Hyperion::IndicFlag Flags() const noexcept {
		return attributes;
	}
	void SetFlags(Hyperion::IndicFlag attributes_) noexcept;
};

}

#endif
