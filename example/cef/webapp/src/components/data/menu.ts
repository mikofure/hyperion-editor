// TypeScript interfaces and data for editor menu structure

interface MenuItem {
    label: string;
    action?: string;
    shortcut?: string;
    submenu?: MenuItem[];
    separator?: boolean;
    toggle?: boolean;
}

interface MenuSection {
    title: string;
    items: MenuItem[];
}

// Main menu data structure - Basic/Compact version
const editorMenu: MenuSection[] = [
    {
        title: "File",
        items: [
            { label: "New", action: "file.new" },
            { label: "Open...", action: "file.open" },
            //@ts-expect-error
            { separator: true },
            { label: "Save", action: "file.save" },
            { label: "Save As...", action: "file.saveAs" },
            //@ts-expect-error
            { separator: true },
            { label: "Preferences", action: "file.preferences" },
            //@ts-expect-error
            { separator: true },
            { label: "Exit", action: "window.close" }
        ]
    },
    {
        title: "Edit",
        items: [
            { label: "Undo", action: "edit.undo" },
            { label: "Redo", action: "edit.redo" },
            //@ts-expect-error
            { separator: true },
            { label: "Cut", action: "edit.cut" },
            { label: "Copy", action: "edit.copy" },
            { label: "Paste", action: "edit.paste" },
            //@ts-expect-error
            { separator: true },
            { label: "Select All", action: "edit.selectAll" },
            //@ts-expect-error
            { separator: true },
            { label: "Find", action: "edit.find" },
            { label: "Replace", action: "edit.replace" }
        ]
    },
    {
        title: "View",
        items: [
            { label: "Explorer", action: "view.explorer", toggle: true },
            { label: "Terminal", action: "view.terminal", toggle: true },
            //@ts-expect-error
            { separator: true },
            { label: "Zoom In", action: "view.zoomIn" },
            { label: "Zoom Out", action: "view.zoomOut" },
            { label: "Reset Zoom", action: "view.resetZoom" },
            //@ts-expect-error
            { separator: true },
            { label: "Full Screen", action: "view.fullScreen", toggle: true }
        ]
    },
    {
        title: "Tools",
        items: [
            { label: "Build", action: "tools.build" },
            { label: "Run", action: "tools.run" },
            //@ts-expect-error
            { separator: true },
            { label: "Settings", action: "tools.settings" },
            { label: "Command Palette", action: "tools.commandPalette" }
        ]
    },
    {
        title: "Help",
        items: [
            { label: "Documentation", action: "help.documentation" },
            { label: "About", action: "help.about" }
        ]
    }
];

// Helper types for working with the menu structure
type MenuAction = string;
type MenuPath = string[];

// Utility functions
function findMenuItem(menu: MenuSection[], path: MenuPath): MenuItem | null {
    for (const section of menu) {
        if (section.title === path[0]) {
            if (path.length === 1) return null; // Section found but no item specified

            const item = findMenuItemInSection(section.items, path.slice(1));
            if (item) return item;
        }
    }
    return null;
}

function findMenuItemInSection(items: MenuItem[], path: MenuPath): MenuItem | null {
    for (const item of items) {
        if (item.label === path[0]) {
            if (path.length === 1) return item;
            if (item.submenu) {
                return findMenuItemInSection(item.submenu, path.slice(1));
            }
        }
    }
    return null;
}

// Export the main menu structure
export { editorMenu, type MenuItem, type MenuSection, type MenuAction, type MenuPath, findMenuItem };