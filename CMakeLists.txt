cmake_minimum_required(VERSION 3.16)
project(Hyperion LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_EXTENSIONS OFF)

# -----------------------------
# Sources (no glob, manual list)
# -----------------------------
set(HYPERION_SOURCES
    src/native/HyperionCall.cpp

    # api
    src/native/api/AutoComplete.cpp
    src/native/api/CallTip.cpp
    src/native/api/ChangeHistory.cpp
    src/native/api/Editor.cpp
    src/native/api/HyperionBase.cpp

    # core
    src/native/core/CellBuffer.cpp
    src/native/core/ContractionState.cpp
    src/native/core/Document.cpp
    src/native/core/EditModel.cpp
    src/native/core/KeyMap.cpp
    src/native/core/PerLine.cpp
    src/native/core/RunStyles.cpp
    src/native/core/Selection.cpp
    src/native/core/UndoHistory.cpp

    # platform
    src/native/platform/Geometry.cpp
    src/native/platform/XPM.cpp

    # syntax
    src/native/syntax/CaseConvert.cpp
    src/native/syntax/CaseFolder.cpp
    src/native/syntax/CharacterCategoryMap.cpp
    src/native/syntax/CharacterType.cpp
    src/native/syntax/CharClassify.cpp
    src/native/syntax/DBCS.cpp
    src/native/syntax/RESearch.cpp
    src/native/syntax/UniConversion.cpp
    src/native/syntax/UniqueString.cpp

    # view
    src/native/view/Decoration.cpp
    src/native/view/EditView.cpp
    src/native/view/Indicator.cpp
    src/native/view/LineMarker.cpp
    src/native/view/MarginView.cpp
    src/native/view/PositionCache.cpp
    src/native/view/Style.cpp
    src/native/view/ViewStyle.cpp
)

# -----------------------------
# Build HyperionCore libraries (both static and shared)
# -----------------------------

# Static library (.lib) - always available
add_library(HyperionCore STATIC
    ${HYPERION_SOURCES}
)

target_include_directories(HyperionCore PUBLIC
    src/native/include
)

# Option to build shared library
option(BUILD_SHARED_LIB "Build shared library (.dll)" OFF)

if(BUILD_SHARED_LIB)
    # Note: Shared library requires platform-specific implementations for:
    # - Platform::Assert, Platform::DebugPrintf, Platform::DoubleClickTime
    # - Platform::Chrome, Platform::ChromeHighlight, Platform::DefaultFont, Platform::DefaultFontSize
    # - Window, Surface, ListBox, Menu classes
    # These are not included in the current source list and need to be implemented
    # for the target platform (Windows, Linux, macOS, etc.)
    
    add_library(HyperionCore_Shared SHARED
        ${HYPERION_SOURCES}
        # Platform stubs for missing implementations
        src/native/platform/PlatformStubs.cpp
    )

    target_include_directories(HyperionCore_Shared PUBLIC
        src/native/include
    )

    # Set output names to avoid conflicts
    set_target_properties(HyperionCore_Shared PROPERTIES
        OUTPUT_NAME "HyperionCore"
        RUNTIME_OUTPUT_DIRECTORY "${CMAKE_BINARY_DIR}/bin"
        LIBRARY_OUTPUT_DIRECTORY "${CMAKE_BINARY_DIR}/lib"
        ARCHIVE_OUTPUT_DIRECTORY "${CMAKE_BINARY_DIR}/lib"
    )

    # Define export macro for DLL
    target_compile_definitions(HyperionCore_Shared PRIVATE
        HYPERION_EXPORTS
    )

    target_compile_definitions(HyperionCore_Shared INTERFACE
        HYPERION_DLL
    )
endif()

# Set output names to avoid conflicts
set_target_properties(HyperionCore PROPERTIES
    OUTPUT_NAME "HyperionCore_static"
)

# Example: link dependencies
# target_link_libraries(HyperionCore PRIVATE SDL3::SDL3)
# if(BUILD_SHARED_LIB)
#     target_link_libraries(HyperionCore_Shared PRIVATE SDL3::SDL3)
# endif()

# -----------------------------
# Example executable
# -----------------------------
# add_executable(hyperion_app
#     src/native/HyperionCall.cpp  
# )

# target_link_libraries(hyperion_app PRIVATE HyperionCore)
