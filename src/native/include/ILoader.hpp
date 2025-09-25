// Hyperion source code edit control
/** @file ILoader.h
 ** Interface for loading into a Hyperion document from a background thread.
 ** Interface for manipulating a document without a view.
 **/
// Copyright 1998-2017 by Neil Hodgson <neilh@scintilla.org>
// Copyright 2025 by Ariz Kamizuki <ariz@mikofure.org>
// The License.txt file describes the conditions under which this software may be distributed.

#ifndef ILOADER_HPP
#define ILOADER_HPP

#include "Hyp_Position.hpp"

namespace Hyperion {

class ILoader {
public:
	virtual int SCI_METHOD Release() = 0;
	// Returns a status code from SC_STATUS_*
	virtual int SCI_METHOD AddData(const char *data, Sci_Position length) = 0;
	virtual void * SCI_METHOD ConvertToDocument() = 0;
};

static constexpr int deRelease0 = 0;

class IDocumentEditable {
public:
	// Allow this interface to add methods over time and discover whether new methods available.
	virtual int SCI_METHOD DEVersion() const noexcept = 0;

	// Lifetime control
	virtual int SCI_METHOD AddRef() noexcept = 0;
	virtual int SCI_METHOD Release() = 0;
};

}

#endif
