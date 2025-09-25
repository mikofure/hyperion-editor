// Platform stubs for DLL export
// This file provides minimal implementations for platform-specific functions
// Copyright 2025 by Ariz Kamizuki <ariz@mikofure.org>

#include <cstdarg>
#include <cstdio>
#include <memory>

#include "Platform.hpp"
#include "Geometry.hpp"
#include "../include/HyperionTypes.hpp"

using namespace Hyperion;

namespace Hyperion::Internal {

// Platform debugging functions
void Platform::Assert(const char *c, const char *file, int line) {
    // Simple assertion - in a real implementation this would show a dialog or log
    fprintf(stderr, "Assertion failed: %s at %s:%d\n", c, file, line);
}

void Platform::DebugPrintf(const char *format, ...) {
    // Simple debug output - in a real implementation this might go to debug console
    va_list args;
    va_start(args, format);
    vfprintf(stderr, format, args);
    va_end(args);
}

unsigned int Platform::DoubleClickTime() {
    // Return standard Windows double-click time
    return 500; // milliseconds
}

int Platform::DefaultFontSize() {
    // Return standard font size
    return 11; // points
}

const char* Platform::DefaultFont() {
    // Return standard font name
    return "Courier New";
}

ColourRGBA Platform::Chrome() {
    // Return standard chrome color (light gray)
    return ColourRGBA(0xF0, 0xF0, 0xF0);
}

ColourRGBA Platform::ChromeHighlight() {
    // Return highlight color (blue)
    return ColourRGBA(0x00, 0x78, 0xD4);
}

// Window class implementation - inherits from Platform.hpp
Window::~Window() noexcept {}

void Window::Destroy() noexcept {}

PRectangle Window::GetPosition() const { return PRectangle(0, 0, 800, 600); }

void Window::SetPosition(PRectangle rc) {}

void Window::SetPositionRelative(PRectangle rc, const Window *relativeTo) {}

PRectangle Window::GetClientPosition() const { return PRectangle(0, 0, 800, 600); }

void Window::Show(bool show) {}

void Window::InvalidateAll() {}

void Window::InvalidateRectangle(PRectangle rc) {}

void Window::SetCursor(Cursor curs) {}

PRectangle Window::GetMonitorRect(Point pt) { return PRectangle(0, 0, 1920, 1080); }

// Surface class stub implementation - inherits from Platform.hpp
class SurfaceStub : public Surface {
public:
    void Init(WindowID wid) override {}
    void Init(SurfaceID sid, WindowID wid) override {}
    std::unique_ptr<Surface> AllocatePixMap(int width, int height) override {
        return std::make_unique<SurfaceStub>();
    }
    void SetMode(SurfaceMode mode) override {}
    void Release() override {}
    int SupportsFeature(Supports feature) override { return 0; }
    bool Initialised() override { return true; }
    int LogPixelsY() override { return 96; }
    int PixelDivisions() override { return 1; }
    int DeviceHeightFont(int points) override { return points; }
    void LineTo(int x, int y) override {}
    void MoveTo(int x, int y) override {}
    void Polygon(const Point *pts, size_t npts, FillStroke fillStroke) override {}
    void RectangleDraw(PRectangle rc, FillStroke fillStroke) override {}
    void RectangleFrame(PRectangle rc) override {}
    void FillRectangle(PRectangle rc, ColourRGBA back) override {}
    void RoundedRectangle(PRectangle rc, FillStroke fillStroke) override {}
    void AlphaRectangle(PRectangle rc, XYPOSITION cornerSize, FillStroke fillStroke) override {}
    void GradientRectangle(PRectangle rc, const std::vector<ColourStop> &stops, GradientOptions options) override {}
    void DrawRGBAImage(PRectangle rc, int width, int height, const unsigned char *pixelsImage) override {}
    void Ellipse(PRectangle rc, FillStroke fillStroke) override {}
    void Stadium(PRectangle rc, FillStroke fillStroke, int ends) override {}
    void Copy(PRectangle rc, Point from, Surface &surfaceSource) override {}
    std::unique_ptr<IScreenLineLayout> Layout(const IScreenLine *screenLine) override { return nullptr; }
    void DrawTextNoClip(PRectangle rc, const Font *font_, XYPOSITION ybase, std::string_view text, ColourRGBA fore, ColourRGBA back) override {}
    void DrawTextClipped(PRectangle rc, const Font *font_, XYPOSITION ybase, std::string_view text, ColourRGBA fore, ColourRGBA back) override {}
    void DrawTextTransparent(PRectangle rc, const Font *font_, XYPOSITION ybase, std::string_view text, ColourRGBA fore) override {}
    void MeasureWidths(const Font *font_, std::string_view text, XYPOSITION *positions) override {}
    XYPOSITION WidthText(const Font *font_, std::string_view text) override { return 0.0; }
    void DrawTextBaseNoClip(PRectangle rc, const Font *font_, XYPOSITION ybase, std::string_view text, ColourRGBA fore, ColourRGBA back) override {}
    void DrawTextBaseClipped(PRectangle rc, const Font *font_, XYPOSITION ybase, std::string_view text, ColourRGBA fore, ColourRGBA back) override {}
    void DrawTextBaseTransparent(PRectangle rc, const Font *font_, XYPOSITION ybase, std::string_view text, ColourRGBA fore) override {}
    XYPOSITION Ascent(const Font *font_) override { return 10.0; }
    XYPOSITION Descent(const Font *font_) override { return 3.0; }
    XYPOSITION InternalLeading(const Font *font_) override { return 0.0; }
    XYPOSITION Height(const Font *font_) override { return 13.0; }
    XYPOSITION AverageCharWidth(const Font *font_) override { return 7.0; }
    void SetClip(PRectangle rc) override {}
    void PopClip() override {}
    void FlushCachedState() override {}
    void FlushDrawing() override {}
};

// ListBox class stub implementation - inherits from Platform.hpp
class ListBoxStub : public ListBox {
public:
    void SetFont(const Font *font) override {}
    void Create(Window &parent, int ctrlID, Point location, int lineHeight_, bool unicodeMode_, Technology technology_) override {}
    void SetAverageCharWidth(int width) override {}
    void SetVisibleRows(int rows) override {}
    int GetVisibleRows() const override { return 10; }
    PRectangle GetDesiredRect() override { return PRectangle(0, 0, 200, 100); }
    int CaretFromEdge() override { return 2; }
    void Clear() noexcept override {}
    void Append(char *s, int type = -1) override {}
    int Length() override { return 0; }
    void Select(int n) override {}
    int GetSelection() override { return 0; }
    int Find(const char *prefix) override { return 0; }
    std::string GetValue(int n) override { return ""; }
    void RegisterImage(int type, const char *xpm_data) override {}
    void RegisterRGBAImage(int type, int width, int height, const unsigned char *pixelsImage) override {}
    void ClearRegisteredImages() override {}
    void SetDelegate(IListBoxDelegate *lbDelegate) override {}
    void SetList(const char *list, char separator, char typesep) override {}
    void SetOptions(ListOptions options_) override {}
};

// Base class constructors and destructors
ListBox::ListBox() noexcept = default;
ListBox::~ListBox() noexcept = default;

// Menu class implementation - inherits from Platform.hpp
Menu::Menu() noexcept : mid(nullptr) {}

void Menu::CreatePopUp() {}

void Menu::Destroy() noexcept {}

void Menu::Show(Point pt, const Window &w) {}

// Factory methods
std::unique_ptr<Surface> Surface::Allocate(Technology technology) {
    return std::make_unique<SurfaceStub>();
}

std::unique_ptr<ListBox> ListBox::Allocate() {
    return std::make_unique<ListBoxStub>();
}

std::shared_ptr<Font> Font::Allocate(const FontParameters &fp) {
    return std::make_shared<Font>();
}

} // namespace Hyperion::Internal