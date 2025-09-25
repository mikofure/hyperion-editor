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

set(HYPERION_HEADERS
    # include headers
    src/native/include/Hyperion.hpp
    src/native/include/HyperionCall.hpp
    src/native/include/HyperionMessages.hpp
    src/native/include/HyperionStructures.hpp
    src/native/include/HyperionTypes.hpp
    src/native/include/HyperionWidget.hpp
    src/native/include/Hyp_Position.hpp
    src/native/include/ILexer.hpp
    src/native/include/ILoader.hpp

    # api headers
    src/native/api/AutoComplete.hpp
    src/native/api/CallTip.hpp
    src/native/api/ChangeHistory.hpp
    src/native/api/Editor.hpp
    src/native/api/HyperionBase.hpp

    # core headers
    src/native/core/CellBuffer.hpp
    src/native/core/ContractionState.hpp
    src/native/core/Document.hpp
    src/native/core/EditModel.hpp
    src/native/core/KeyMap.hpp
    src/native/core/Partitioning.hpp
    src/native/core/PerLine.hpp
    src/native/core/RunStyles.hpp
    src/native/core/Selection.hpp
    src/native/core/SplitVector.hpp
    src/native/core/UndoHistory.hpp

    # platform headers
    src/native/platform/Debugging.hpp
    src/native/platform/ElapsedPeriod.hpp
    src/native/platform/Geometry.hpp
    src/native/platform/Platform.hpp
    src/native/platform/Position.hpp
    src/native/platform/SparseVector.hpp
    src/native/platform/XPM.hpp

    # syntax headers
    src/native/syntax/CaseConvert.hpp
    src/native/syntax/CaseFolder.hpp
    src/native/syntax/CharacterCategoryMap.hpp
    src/native/syntax/CharacterType.hpp
    src/native/syntax/CharClassify.hpp
    src/native/syntax/DBCS.hpp
    src/native/syntax/RESearch.hpp
    src/native/syntax/UniConversion.hpp
    src/native/syntax/UniqueString.hpp

    # view headers
    src/native/view/Decoration.hpp
    src/native/view/EditView.hpp
    src/native/view/Indicator.hpp
    src/native/view/LineMarker.hpp
    src/native/view/MarginView.hpp
    src/native/view/PositionCache.hpp
    src/native/view/Style.hpp
    src/native/view/ViewStyle.hpp
)

# -----------------------------
# Build HyperionCore library
# -----------------------------
add_library(HyperionCore STATIC
    ${HYPERION_SOURCES}
    ${HYPERION_HEADERS}
)

target_include_directories(HyperionCore PUBLIC
    src/native/include
    src/native/api
    src/native/core
    src/native/platform
    src/native/syntax
    src/native/view
)

# Example: link dependencies
# target_link_libraries(HyperionCore PRIVATE SDL3::SDL3)

# -----------------------------
# Example executable
# -----------------------------
add_executable(hyperion_app
    src/native/HyperionCall.cpp   # entry point if you want a demo
)

target_link_libraries(hyperion_app PRIVATE HyperionCore)
