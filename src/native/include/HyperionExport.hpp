// HyperionExport.hpp - DLL Export macros for Hyperion editor
// Copyright 2025 by Ariz Kamizuki <ariz@mikofure.org>
// This file provides DLL export/import macros for building Hyperion as a shared library

#pragma once

#ifdef _WIN32
  #ifdef HYPERION_EXPORTS
    // Building the DLL - export symbols
    #define HYPERION_API __declspec(dllexport)
    #define HYPERION_CLASS_API __declspec(dllexport)
  #elif defined(HYPERION_DLL)
    // Using the DLL - import symbols
    #define HYPERION_API __declspec(dllimport)
    #define HYPERION_CLASS_API __declspec(dllimport)
  #else
    // Static library - no decoration needed
    #define HYPERION_API
    #define HYPERION_CLASS_API
  #endif
#else
  // Non-Windows platforms
  #ifdef HYPERION_EXPORTS
    #define HYPERION_API __attribute__((visibility("default")))
    #define HYPERION_CLASS_API __attribute__((visibility("default")))
  #else
    #define HYPERION_API
    #define HYPERION_CLASS_API
  #endif
#endif

// Template and inline functions don't need explicit export
#define HYPERION_INLINE_API