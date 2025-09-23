# MikoEditor API Documentation

## Quick Start

```typescript
import { EditorView, defaultTheme } from 'mikoeditor';

const container = document.getElementById('editor');
const editor = new EditorView(container, 'Hello, World!', defaultTheme);
editor.setLanguage('typescript');
```

## Core Classes

### `Editor`

The main editor engine that handles text operations and state management.

#### Constructor
```typescript
new Editor(initialContent?: string)
```

#### Methods

##### Text Operations
- `insertText(text: string): void` - Insert text at cursor position
- `backspace(): void` - Delete character before cursor
- `delete(): void` - Delete character after cursor
- `newLine(): void` - Insert new line

##### Cursor Movement
- `moveCursorUp(): void`
- `moveCursorDown(): void`
- `moveCursorLeft(): void`
- `moveCursorRight(): void`
- `moveCursorToLineStart(): void`
- `moveCursorToLineEnd(): void`

##### History
- `undo(): boolean` - Returns true if undo was performed
- `redo(): boolean` - Returns true if redo was performed

##### Selection
- `selectAll(): void`
- `copy(): string | null` - Returns copied text or null
- `cut(): string | null` - Returns cut text or null
- `paste(text: string): void`

##### Content Management
- `getContent(): string`
- `setContent(content: string): void`

##### Event Handling
- `addListener(listener: EditorListener): void`
- `removeListener(listener: EditorListener): void`
- `registerKeyBinding(key: string, modifiers: KeyModifiers, command: EditorCommand): void`

### `EditorView`

The visual interface component that renders the editor.

#### Constructor
```typescript
new EditorView(container: HTMLElement, initialContent?: string, theme?: Theme)
```

#### Methods

##### Configuration
- `setLanguage(language: string): void`
- `getLanguage(): string`
- `setTheme(theme: Theme): void`
- `setFontSize(size: number): void`

##### Navigation
- `focus(): void`
- `isFocused(): boolean`
- `resize(): void`
- `scrollTo(top: number, left: number): void`
- `scrollToCursor(): void`

##### Access
- `getEditor(): Editor` - Get the underlying editor instance

##### Lifecycle
- `destroy(): void` - Clean up resources

### `Document`

Low-level document management.

#### Constructor
```typescript
new Document(content?: string)
```

#### Methods

##### Content Access
- `getContent(): string`
- `getLine(lineIndex: number): string`
- `getLineCount(): number`
- `getTextInRange(range: Range): string`

##### Text Operations
- `insertText(position: Position, text: string): void`
- `deleteText(range: Range): string`
- `replaceText(range: Range, newText: string): void`

##### History
- `undo(): boolean`
- `redo(): boolean`

##### State
- `isModified(): boolean`
- `markAsSaved(): void`

### `Cursor`

Cursor and selection management.

#### Constructor
```typescript
new Cursor(initialPosition?: Position)
```

#### Methods

##### Position
- `getPosition(): Position`
- `setPosition(position: Position): void`
- `move(deltaLine: number, deltaColumn: number): void`

##### Selection
- `startSelection(): void`
- `extendSelection(newPosition: Position): void`
- `clearSelection(): void`
- `hasSelection(): boolean`
- `getSelection(): Range | null`

##### Convenience
- `selectAll(lastLineIndex: number, lastLineLength: number): void`
- `selectLine(lineLength: number): void`
- `selectWord(line: string): void`

##### Events
- `addListener(listener: CursorListener): void`
- `removeListener(listener: CursorListener): void`

### `SyntaxHighlighter`

Syntax highlighting for various programming languages.

#### Constructor
```typescript
new SyntaxHighlighter()
```

#### Methods

##### Highlighting
- `tokenize(text: string, languageName: string): Token[]`

##### Language Management
- `registerLanguage(language: LanguageDefinition): void`
- `getLanguages(): string[]`
- `isLanguageSupported(languageName: string): boolean`

## Interfaces

### `Position`
```typescript
interface Position {
  line: number;
  column: number;
}
```

### `Range`
```typescript
interface Range {
  start: Position;
  end: Position;
}
```

### `Theme`
```typescript
interface Theme {
  background: string;
  text: string;
  keyword: string;
  string: string;
  comment: string;
  number: string;
  operator: string;
  function: string;
  type: string;
  identifier: string;
  punctuation: string;
  lineNumber: string;
  selection: string;
  cursor: string;
}
```

### `KeyModifiers`
```typescript
interface KeyModifiers {
  ctrl: boolean;
  shift: boolean;
  alt: boolean;
}
```

### `EditorCommand`
```typescript
interface EditorCommand {
  execute(editor: Editor): void;
}
```

### `EditorListener`
```typescript
interface EditorListener {
  onEditorChange(editor: Editor): void;
}
```

### `LanguageDefinition`
```typescript
interface LanguageDefinition {
  name: string;
  keywords: Set<string>;
  operators: string[];
  commentStart?: string;
  commentEnd?: string;
  lineComment?: string;
  stringDelimiters: string[];
  caseSensitive: boolean;
  wordBoundary: RegExp;
}
```

### `Token`
```typescript
interface Token {
  type: TokenType;
  value: string;
  start: number;
  end: number;
}
```

### `TokenType`
```typescript
enum TokenType {
  TEXT = 'text',
  KEYWORD = 'keyword',
  STRING = 'string',
  COMMENT = 'comment',
  NUMBER = 'number',
  OPERATOR = 'operator',
  IDENTIFIER = 'identifier',
  FUNCTION = 'function',
  TYPE = 'type',
  WHITESPACE = 'whitespace',
  PUNCTUATION = 'punctuation'
}
```

## Pre-built Themes

### `defaultTheme` (Dark)
```typescript
const defaultTheme: Theme = {
  background: '#1e1e1e',
  text: '#d4d4d4',
  keyword: '#569cd6',
  string: '#ce9178',
  comment: '#6a9955',
  number: '#b5cea8',
  operator: '#d4d4d4',
  function: '#dcdcaa',
  type: '#4ec9b0',
  identifier: '#9cdcfe',
  punctuation: '#d4d4d4',
  lineNumber: '#858585',
  selection: '#264f78',
  cursor: '#ffffff'
};
```

### `lightTheme`
```typescript
const lightTheme: Theme = {
  background: '#ffffff',
  text: '#000000',
  keyword: '#0000ff',
  string: '#a31515',
  comment: '#008000',
  number: '#098658',
  operator: '#000000',
  function: '#795e26',
  type: '#267f99',
  identifier: '#001080',
  punctuation: '#000000',
  lineNumber: '#237893',
  selection: '#add6ff',
  cursor: '#000000'
};
```

## Supported Languages

- `javascript` - JavaScript
- `typescript` - TypeScript
- `python` - Python  
- `json` - JSON

## Custom Language Example

```typescript
const highlighter = new SyntaxHighlighter();

highlighter.registerLanguage({
  name: 'rust',
  keywords: new Set(['fn', 'let', 'mut', 'const', 'if', 'else', 'match']),
  operators: ['=', '+', '-', '*', '/', '!', '&', '|', '^'],
  lineComment: '//',
  commentStart: '/*',
  commentEnd: '*/',
  stringDelimiters: ['"'],
  caseSensitive: true,
  wordBoundary: /[a-zA-Z_]/
});
```

## Event Handling Example

```typescript
const editor = new EditorView(container);

// Listen to changes
editor.getEditor().addListener({
  onEditorChange: (editor) => {
    console.log('Content changed:', editor.getContent().length, 'characters');
  }
});

// Custom key binding
editor.getEditor().registerKeyBinding('s', { ctrl: true, shift: false, alt: false }, {
  execute: (editor) => {
    console.log('Save triggered');
    // Implement save functionality
  }
});
```