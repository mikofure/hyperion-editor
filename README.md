# mikoeditor

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run index.ts
```

# MikoEditor

A modern, lightweight text editor library built with TypeScript. MikoEditor provides a full-featured text editing experience with syntax highlighting, cursor management, undo/redo functionality, and a customizable canvas-based rendering system.

## Features

- 🎨 **Syntax Highlighting** - Built-in support for JavaScript, TypeScript, Python, JSON
- ⌨️ **Full Keyboard Support** - Complete keyboard navigation and editing
- 🔄 **Undo/Redo** - Complete history management with unlimited undo/redo
- 🎯 **Cursor Management** - Advanced cursor positioning and text selection
- 🎨 **Themes** - Built-in dark and light themes, easily customizable
- 📱 **Responsive** - Adapts to container size changes
- 🚀 **Performance** - Canvas-based rendering for smooth scrolling and editing
- 🔧 **Extensible** - Plugin-friendly architecture

## Installation

```bash
npm install mikoeditor
```

## Quick Start

```typescript
import { EditorView, defaultTheme } from 'mikoeditor';

// Create editor container
const container = document.getElementById('editor');

// Initialize editor with content
const editor = new EditorView(container, 'console.log("Hello, World!");', defaultTheme);

// Set language for syntax highlighting
editor.setLanguage('typescript');
```

## API Reference

### Core Classes

#### `Editor`
The main editor engine that handles text operations, cursor management, and history.

```typescript
const editor = new Editor('initial content');

// Text operations
editor.insertText('Hello');
editor.backspace();
editor.delete();
editor.newLine();

// Cursor movement
editor.moveCursorUp();
editor.moveCursorDown();
editor.moveCursorLeft();
editor.moveCursorRight();

// History
editor.undo();
editor.redo();

// Selection
editor.selectAll();
const text = editor.copy();
editor.cut();
editor.paste('new text');
```

#### `EditorView`
The visual interface component that renders the editor to a canvas element.

```typescript
const view = new EditorView(containerElement, initialContent, theme);

// Configuration
view.setLanguage('javascript');
view.setTheme(lightTheme);
view.setFontSize(16);

// Access underlying editor
const editor = view.getEditor();
```

#### `Document`
Manages the text content and provides low-level text operations.

```typescript
const doc = new Document('initial content');

// Text operations
doc.insertText({ line: 0, column: 0 }, 'Hello');
doc.deleteText({ start: { line: 0, column: 0 }, end: { line: 0, column: 5 } });

// Content access
const content = doc.getContent();
const line = doc.getLine(0);
const lineCount = doc.getLineCount();
```

#### `SyntaxHighlighter`
Provides syntax highlighting for various programming languages.

```typescript
const highlighter = new SyntaxHighlighter();

// Tokenize code
const tokens = highlighter.tokenize('const x = 42;', 'typescript');

// Register custom language
highlighter.registerLanguage({
  name: 'mylang',
  keywords: new Set(['if', 'else', 'while']),
  operators: ['=', '+', '-'],
  stringDelimiters: ['"'],
  caseSensitive: true,
  wordBoundary: /[a-zA-Z_]/
});
```

### Themes

#### Built-in Themes

```typescript
import { defaultTheme, lightTheme } from 'mikoeditor';

// Dark theme (default)
const editor = new EditorView(container, content, defaultTheme);

// Light theme
const editor = new EditorView(container, content, lightTheme);
```

#### Custom Themes

```typescript
const customTheme = {
  background: '#282c34',
  text: '#abb2bf',
  keyword: '#c678dd',
  string: '#98c379',
  comment: '#5c6370',
  number: '#d19a66',
  operator: '#56b6c2',
  function: '#61afef',
  type: '#e06c75',
  identifier: '#e06c75',
  punctuation: '#abb2bf',
  lineNumber: '#4b5263',
  selection: '#3e4451',
  cursor: '#528bff'
};

const editor = new EditorView(container, content, customTheme);
```

### Event Handling

```typescript
// Listen to editor changes
editor.addListener({
  onEditorChange: (editor) => {
    console.log('Content changed:', editor.getContent());
  }
});

// Custom key bindings
editor.registerKeyBinding('s', { ctrl: true, shift: false, alt: false }, {
  execute: (editor) => {
    // Save functionality
    console.log('Save triggered');
  }
});
```

## Supported Languages

- JavaScript
- TypeScript  
- Python
- JSON

### Adding Custom Languages

```typescript
const highlighter = new SyntaxHighlighter();

highlighter.registerLanguage({
  name: 'rust',
  keywords: new Set([
    'fn', 'let', 'mut', 'const', 'static', 'if', 'else', 'match',
    'while', 'for', 'loop', 'break', 'continue', 'return', 'struct',
    'enum', 'impl', 'trait', 'pub', 'mod', 'use', 'crate'
  ]),
  operators: ['=', '+', '-', '*', '/', '%', '!', '&', '|', '^', '<<', '>>', '==', '!=', '<', '>', '<=', '>=', '&&', '||'],
  lineComment: '//',
  commentStart: '/*',
  commentEnd: '*/',
  stringDelimiters: ['"'],
  caseSensitive: true,
  wordBoundary: /[a-zA-Z_]/
});
```

## Examples

### Basic Text Editor

```html
<!DOCTYPE html>
<html>
<head>
    <style>
        #editor { width: 100%; height: 400px; border: 1px solid #ccc; }
    </style>
</head>
<body>
    <div id="editor"></div>
    
    <script type="module">
        import { EditorView, defaultTheme } from './dist/index.js';
        
        const container = document.getElementById('editor');
        const editor = new EditorView(container, '', defaultTheme);
        editor.setLanguage('typescript');
    </script>
</body>
</html>
```

### Multi-language Support

```typescript
import { EditorView, SyntaxHighlighter } from 'mikoeditor';

const editor = new EditorView(container);

// Language switcher
function setLanguage(lang) {
  editor.setLanguage(lang);
}

// Support for different file types
const fileExtensions = {
  '.js': 'javascript',
  '.ts': 'typescript',
  '.py': 'python',
  '.json': 'json'
};

function loadFile(filename, content) {
  const ext = filename.substring(filename.lastIndexOf('.'));
  const language = fileExtensions[ext] || 'text';
  
  editor.getEditor().setContent(content);
  editor.setLanguage(language);
}
```

## Building from Source

```bash
# Clone the repository
git clone https://github.com/mikoeditor/mikoeditor.git
cd mikoeditor

# Install dependencies
npm install

# Build the library
npm run build

# Development mode with watch
npm run dev
```

## Architecture

MikoEditor is built with a modular architecture:

- **Core**: Text manipulation, cursor management, and document handling
- **GUI**: Canvas-based rendering and user interaction
- **Syntax**: Language-specific highlighting and tokenization

The editor uses a canvas-based approach for rendering, providing smooth scrolling and high performance even with large documents.

## Browser Support

- Chrome 60+
- Firefox 60+
- Safari 12+
- Edge 79+

## License

MIT License - see LICENSE file for details.

## Contributing

Contributions are welcome! Please read the contributing guidelines and submit pull requests to the main repository.

## Roadmap

- [ ] Code folding
- [ ] Minimap
- [ ] Find and replace
- [ ] Multiple cursors
- [ ] Bracket matching
- [ ] Auto-completion
- [ ] Language server protocol support
- [ ] Plugin system
- [ ] Mobile touch support [Bun](https://bun.com) is a fast all-in-one JavaScript runtime.
