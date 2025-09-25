# Hyperion Editor

Hyperion Editor is a **Hybrid Text Editor Engine**  
Consisting of **C++ Native Core (Hyperion, Scintilla-Based)** + **React/TypeScript Frontend** running through CEF/SDL3  

---

## ✨ Features

- 🎨 **Syntax Highlighting** – Lexer engine (HyperionCore, forked from Scintilla) + TS Highlighter
- ⌨️ **Full Keyboard Support** – Complete keybinding support (native + web)
- 🔄 **Undo/Redo** – High-performance editing history system
- 🎯 **Cursor/Selection Management** – Multiple cursors, advanced selection
- 🎨 **Themes** – Dark/Light + custom themes
- 🚀 **Performance** – Native core (C++17) + Canvas-based renderer
- 🔧 **Extensible** – Plugin / IPC integration support

## 🖥️ C++ Native (HyperionCore, Scintilla-Based)

- Developed with **C++17**  
- Forked from **Scintilla/Lexilla** but completely redesigned → `HyperionCore`  
- Modular structure: `api/`, `core/`, `view/`, `syntax/`, `platform/`  
- Cross-platform rendering:
  - Windows → DirectX11 + DWrite
  - Linux → Vulkan + Freetype + SDL3  
- Supports **advanced text editing features**: undo/redo, multiple selections, complex lexers

---

## 🚀 Frontend (React/TypeScript)

- UI layer built with React + Vite  
- Code editor integration through CEF → Native Core  
- Overlays: Command palette, context menus, tab management  
- State management with Redux  

```typescript
import { EditorView, defaultTheme } from 'Hyperion Editor';

const container = document.getElementById('editor');
const editor = new EditorView(container, 'console.log("Hello, World!");', defaultTheme);
editor.setLanguage('typescript');
````

---

## ⚙️ Architecture

```
[Frontend React/TS]
      ↓ IPC (CEF/SDL3)
[HyperionClient (C++)]
      ↓
[HyperionCore (Scintilla-Based, Document, Lexer, Syntax)]
      ↓
[Renderer DX11/Vulkan + SDL Window]
```

---

## 📌 Roadmap

* [ ] Code folding
* [ ] Minimap
* [ ] Language server protocol support
* [ ] Plugin system (native + web)
* [ ] Mobile touch support

---

## 📜 License

* Core (Hyperion/Hyperion Editor fork) → HPND-style (Scintilla) + Ariz Kamizuki (2025)
* Frontend (React/TS) → MIT
---

## 🤝 Contributing

PRs welcome!
Please read the contributing guide before submitting a Pull Request 🚀

