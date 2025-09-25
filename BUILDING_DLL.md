# Building Hyperion as a Shared Library (DLL)

The Hyperion editor can be built as both a static library (.lib) and a shared library (.dll/.so). This document explains how to enable and build the shared library.

## Current Status

✅ **Static Library**: Ready to build and use  
❌ **Shared Library**: Requires platform-specific implementations (see below)

## Building Static Library

The static library is always available and builds successfully:

```bash
# Configure
cmake -DBUILD_SHARED_LIB=OFF -B build

# Build
cmake --build build --config Release --target HyperionCore
```

This produces:
- `build/Release/HyperionCore_static.lib` (static library)

## Building Shared Library (DLL)

To enable shared library building:

```bash
# Configure with shared library enabled
cmake -DBUILD_SHARED_LIB=ON -B build
```

## What's Needed for DLL Support

The shared library requires platform-specific implementations that are currently missing:

### Platform Functions (in `Platform` namespace)
- `Platform::Assert(const char*, const char*, int)`
- `Platform::DebugPrintf(const char*, ...)`
- `Platform::DoubleClickTime()` → `unsigned int`
- `Platform::DefaultFontSize()` → `int`
- `Platform::DefaultFont()` → `const char*`
- `Platform::Chrome()` → `ColourRGBA`
- `Platform::ChromeHighlight()` → `ColourRGBA`

### Platform Classes
- **Window**: Window management (create, destroy, positioning, invalidation, cursor)
- **Surface**: Drawing surface (text rendering, shapes, clipping, pixel operations)
- **ListBox**: List control for autocompletion
- **Menu**: Context menus
- **Font**: Font management and metrics

### Type Definitions
These types need to be properly included from HyperionTypes.hpp:
- `FontWeight`, `FontQuality`, `FontStretch`
- `Technology`, `CharacterSet`
- `Supports` enum for Surface capabilities
- `ListOptions`, `AutoCompleteOption`

## Platform-Specific Implementation

For Windows (Win32 API), you would typically implement:
- `PlatformWin.cpp` - Windows-specific platform functions
- `WindowWin.cpp` - Win32 window wrapper
- `SurfaceWin.cpp` - DirectWrite/GDI+ drawing surface
- `ListBoxWin.cpp` - Windows list control
- `MenuWin.cpp` - Windows menu API

For Linux (GTK), you would implement:
- `PlatformGTK.cpp` - GTK platform functions  
- `WindowGTK.cpp` - GTK window wrapper
- `SurfaceGTK.cpp` - Cairo/Pango drawing surface
- etc.

## Export Macros

The project includes `HyperionExport.hpp` with proper DLL export macros:
- `HYPERION_API` - for functions and variables
- `HYPERION_CLASS_API` - for classes

These are already applied to the main API interfaces:
- `ILoader`, `IDocumentEditable` (ILoader.hpp)
- `IDocument`, `ILexer4`, `ILexer5` (ILexer.hpp)
- `HyperionCall` (HyperionCall.hpp)
- `Hyperion_RegisterClasses`, `Hyperion_ReleaseResources` (Hyperion.hpp)

## Current Workaround

A stub implementation (`PlatformStubs.cpp`) provides minimal implementations to resolve linker errors, but these stubs don't provide actual functionality. This is mainly useful for:
- Testing the build system
- Ensuring the API exports are correct
- Providing a starting point for platform implementations

## Next Steps

To complete DLL support:

1. **Choose target platform** (Windows, Linux, macOS)
2. **Implement platform layer** using the appropriate APIs
3. **Test with real applications** to ensure functionality
4. **Add platform detection** to CMakeLists.txt for automatic selection
5. **Create platform-specific build instructions**

The architecture is designed to support multiple platforms by swapping out the platform implementation while keeping the core editor logic unchanged.