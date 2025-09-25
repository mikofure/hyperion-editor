#pragma once

#include "../include/HyperionTypes.hpp"

namespace Hyperion::Internal {

class Range {
public:
	Sci::Position start;
	Sci::Position end;

	explicit Range(Sci::Position pos=0) noexcept :
		start(pos), end(pos) {
	}
	Range(Sci::Position start_, Sci::Position end_) noexcept :
		start(start_), end(end_) {
	}

	bool operator==(const Range &other) const noexcept {
		return (start == other.start) && (end == other.end);
	}

	bool Valid() const noexcept {
		return (start != Sci::invalidPosition) && (end != Sci::invalidPosition);
	}

	[[nodiscard]] bool Empty() const noexcept {
		return start == end;
	}

	[[nodiscard]] Sci::Position Length() const noexcept {
		return (start <= end) ? (end - start) : (start - end);
	}

	Sci::Position First() const noexcept {
		return (start <= end) ? start : end;
	}

	Sci::Position Last() const noexcept {
		return (start > end) ? start : end;
	}

	// Is the position within the range?
	bool Contains(Sci::Position pos) const noexcept {
		if (start < end) {
			return (pos >= start && pos <= end);
		} else {
			return (pos <= start && pos >= end);
		}
	}

	// Is the character after pos within the range?
	bool ContainsCharacter(Sci::Position pos) const noexcept {
		if (start < end) {
			return (pos >= start && pos < end);
		} else {
			return (pos < start && pos >= end);
		}
	}

	bool Contains(Range other) const noexcept {
		return Contains(other.start) && Contains(other.end);
	}

	bool Overlaps(Range other) const noexcept {
		return
		Contains(other.start) ||
		Contains(other.end) ||
		other.Contains(start) ||
		other.Contains(end);
	}
};

}