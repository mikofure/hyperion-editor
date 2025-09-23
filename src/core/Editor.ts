import { Document } from './Document.js';
import type { Position, Range } from './Document.js';
import { Cursor } from './Cursor.js';
import type { CursorListener } from './Cursor.js';

/**
 * Editor class is the main entry point for the text editor functionality
 */
export class Editor implements CursorListener {
  private document: Document;
  private cursor: Cursor;
  private readonly listeners: EditorListener[] = [];
  private readonly keyBindings: Map<string, EditorCommand> = new Map();

  constructor(initialContent: string = '') {
    this.document = new Document(initialContent);
    this.cursor = new Cursor();
    this.cursor.addListener(this);
    this.setupDefaultKeyBindings();
  }

  /**
   * Get the document instance
   */
  getDocument(): Document {
    return this.document;
  }

  /**
   * Get the cursor instance
   */
  getCursor(): Cursor {
    return this.cursor;
  }

  /**
   * Insert text at the current cursor position
   */
  insertText(text: string): void {
    const position = this.cursor.getPosition();
    
    // If there's a selection, delete it first
    const selection = this.cursor.getSelection();
    if (selection) {
      this.document.deleteText(selection);
      this.cursor.setPosition(selection.start);
    }

    this.document.insertText(position, text);
    
    // Move cursor to after the inserted text
    const lines = text.split('\n');
    if (lines.length === 1) {
      this.cursor.move(0, text.length);
    } else {
      const lastLine = lines[lines.length - 1];
      this.cursor.setPosition({
        line: position.line + lines.length - 1,
        column: lastLine ? lastLine.length : 0
      });
    }

    this.notifyListeners();
  }

  /**
   * Delete the character before the cursor (backspace)
   */
  backspace(): void {
    const selection = this.cursor.getSelection();
    
    if (selection) {
      // Delete selected text
      this.document.deleteText(selection);
      this.cursor.setPosition(selection.start);
    } else {
      // Delete character before cursor
      const position = this.cursor.getPosition();
      if (position.column > 0) {
        const range: Range = {
          start: { line: position.line, column: position.column - 1 },
          end: position
        };
        this.document.deleteText(range);
        this.cursor.move(0, -1);
      } else if (position.line > 0) {
        // Join with previous line
        const prevLineLength = this.document.getLine(position.line - 1).length;
        const range: Range = {
          start: { line: position.line - 1, column: prevLineLength },
          end: { line: position.line, column: 0 }
        };
        this.document.deleteText(range);
        this.cursor.setPosition({ line: position.line - 1, column: prevLineLength });
      }
    }

    this.notifyListeners();
  }

  /**
   * Delete the character after the cursor (delete)
   */
  delete(): void {
    const selection = this.cursor.getSelection();
    
    if (selection) {
      // Delete selected text
      this.document.deleteText(selection);
      this.cursor.setPosition(selection.start);
    } else {
      // Delete character after cursor
      const position = this.cursor.getPosition();
      const currentLine = this.document.getLine(position.line);
      
      if (position.column < currentLine.length) {
        const range: Range = {
          start: position,
          end: { line: position.line, column: position.column + 1 }
        };
        this.document.deleteText(range);
      } else if (position.line < this.document.getLineCount() - 1) {
        // Join with next line
        const range: Range = {
          start: position,
          end: { line: position.line + 1, column: 0 }
        };
        this.document.deleteText(range);
      }
    }

    this.notifyListeners();
  }

  /**
   * Insert a new line at the cursor position
   */
  newLine(): void {
    this.insertText('\n');
  }

  /**
   * Move cursor up one line
   */
  moveCursorUp(): void {
    const position = this.cursor.getPosition();
    if (position.line > 0) {
      const targetLine = position.line - 1;
      const targetLineLength = this.document.getLine(targetLine).length;
      const newColumn = Math.min(position.column, targetLineLength);
      this.cursor.setPosition({ line: targetLine, column: newColumn });
    }
  }

  /**
   * Move cursor down one line
   */
  moveCursorDown(): void {
    const position = this.cursor.getPosition();
    if (position.line < this.document.getLineCount() - 1) {
      const targetLine = position.line + 1;
      const targetLineLength = this.document.getLine(targetLine).length;
      const newColumn = Math.min(position.column, targetLineLength);
      this.cursor.setPosition({ line: targetLine, column: newColumn });
    }
  }

  /**
   * Move cursor left one character
   */
  moveCursorLeft(): void {
    const position = this.cursor.getPosition();
    if (position.column > 0) {
      this.cursor.move(0, -1);
    } else if (position.line > 0) {
      const prevLineLength = this.document.getLine(position.line - 1).length;
      this.cursor.setPosition({ line: position.line - 1, column: prevLineLength });
    }
  }

  /**
   * Move cursor right one character
   */
  moveCursorRight(): void {
    const position = this.cursor.getPosition();
    const currentLineLength = this.document.getLine(position.line).length;
    
    if (position.column < currentLineLength) {
      this.cursor.move(0, 1);
    } else if (position.line < this.document.getLineCount() - 1) {
      this.cursor.setPosition({ line: position.line + 1, column: 0 });
    }
  }

  /**
   * Move cursor to the beginning of the current line
   */
  moveCursorToLineStart(): void {
    this.cursor.moveToLineStart();
  }

  /**
   * Move cursor to the end of the current line
   */
  moveCursorToLineEnd(): void {
    const position = this.cursor.getPosition();
    const lineLength = this.document.getLine(position.line).length;
    this.cursor.moveToLineEnd(lineLength);
  }

  /**
   * Extend selection up one line
   */
  extendSelectionUp(): void {
    const position = this.cursor.getPosition();
    if (position.line > 0) {
      if (!this.cursor.hasSelection()) {
        this.cursor.startSelection();
      }
      const targetLine = position.line - 1;
      const targetLineLength = this.document.getLine(targetLine).length;
      const newColumn = Math.min(position.column, targetLineLength);
      this.cursor.extendSelection({ line: targetLine, column: newColumn });
    }
  }

  /**
   * Extend selection down one line
   */
  extendSelectionDown(): void {
    const position = this.cursor.getPosition();
    if (position.line < this.document.getLineCount() - 1) {
      if (!this.cursor.hasSelection()) {
        this.cursor.startSelection();
      }
      const targetLine = position.line + 1;
      const targetLineLength = this.document.getLine(targetLine).length;
      const newColumn = Math.min(position.column, targetLineLength);
      this.cursor.extendSelection({ line: targetLine, column: newColumn });
    }
  }

  /**
   * Extend selection left one character
   */
  extendSelectionLeft(): void {
    const position = this.cursor.getPosition();
    if (!this.cursor.hasSelection()) {
      this.cursor.startSelection();
    }
    
    if (position.column > 0) {
      this.cursor.extendSelection({ line: position.line, column: position.column - 1 });
    } else if (position.line > 0) {
      const prevLineLength = this.document.getLine(position.line - 1).length;
      this.cursor.extendSelection({ line: position.line - 1, column: prevLineLength });
    }
  }

  /**
   * Extend selection right one character
   */
  extendSelectionRight(): void {
    const position = this.cursor.getPosition();
    if (!this.cursor.hasSelection()) {
      this.cursor.startSelection();
    }
    
    const currentLineLength = this.document.getLine(position.line).length;
    if (position.column < currentLineLength) {
      this.cursor.extendSelection({ line: position.line, column: position.column + 1 });
    } else if (position.line < this.document.getLineCount() - 1) {
      this.cursor.extendSelection({ line: position.line + 1, column: 0 });
    }
  }

  /**
   * Extend selection to the beginning of the current line
   */
  extendSelectionToLineStart(): void {
    const position = this.cursor.getPosition();
    if (!this.cursor.hasSelection()) {
      this.cursor.startSelection();
    }
    this.cursor.extendSelection({ line: position.line, column: 0 });
  }

  /**
   * Extend selection to the end of the current line
   */
  extendSelectionToLineEnd(): void {
    const position = this.cursor.getPosition();
    if (!this.cursor.hasSelection()) {
      this.cursor.startSelection();
    }
    const lineLength = this.document.getLine(position.line).length;
    this.cursor.extendSelection({ line: position.line, column: lineLength });
  }

  /**
   * Undo the last action
   */
  undo(): boolean {
    const result = this.document.undo();
    if (result) {
      this.notifyListeners();
    }
    return result;
  }

  /**
   * Redo the next action
   */
  redo(): boolean {
    const result = this.document.redo();
    if (result) {
      this.notifyListeners();
    }
    return result;
  }

  /**
   * Select all text in the document
   */
  selectAll(): void {
    const lastLineIndex = this.document.getLineCount() - 1;
    const lastLineLength = this.document.getLine(lastLineIndex).length;
    this.cursor.selectAll(lastLineIndex, lastLineLength);
  }

  /**
   * Copy selected text to clipboard (returns the text)
   */
  copy(): string | null {
    const selection = this.cursor.getSelection();
    if (!selection) return null;
    
    return this.document.getTextInRange(selection);
  }

  /**
   * Cut selected text to clipboard (returns the text)
   */
  cut(): string | null {
    const selection = this.cursor.getSelection();
    if (!selection) return null;
    
    const text = this.document.getTextInRange(selection);
    this.document.deleteText(selection);
    this.cursor.setPosition(selection.start);
    this.notifyListeners();
    return text;
  }

  /**
   * Paste text at the current cursor position
   */
  paste(text: string): void {
    this.insertText(text);
  }

  /**
   * Handle key input
   */
  handleKeyInput(key: string, modifiers: KeyModifiers): boolean {
    const keyCombo = this.getKeyCombo(key, modifiers);
    const command = this.keyBindings.get(keyCombo);
    
    if (command) {
      command.execute(this);
      return true;
    }
    
    // Handle regular character input
    if (key.length === 1 && !modifiers.ctrl && !modifiers.alt) {
      this.insertText(key);
      return true;
    }
    
    return false;
  }

  /**
   * Register a key binding
   */
  registerKeyBinding(key: string, modifiers: KeyModifiers, command: EditorCommand): void {
    const keyCombo = this.getKeyCombo(key, modifiers);
    this.keyBindings.set(keyCombo, command);
  }

  /**
   * Add an editor event listener
   */
  addListener(listener: EditorListener): void {
    this.listeners.push(listener);
  }

  /**
   * Remove an editor event listener
   */
  removeListener(listener: EditorListener): void {
    const index = this.listeners.indexOf(listener);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
  }

  /**
   * Get the current content of the editor
   */
  getContent(): string {
    return this.document.getContent();
  }

  /**
   * Set the content of the editor
   */
  setContent(content: string): void {
    this.document = new Document(content);
    this.cursor.setPosition({ line: 0, column: 0 });
    this.notifyListeners();
  }

  // CursorListener implementation
  onCursorChange(position: Position, selection: Range | null): void {
    this.notifyListeners();
  }

  private setupDefaultKeyBindings(): void {
    // Navigation
    this.registerKeyBinding('ArrowUp', { ctrl: false, shift: false, alt: false }, 
      { execute: (editor) => editor.moveCursorUp() });
    this.registerKeyBinding('ArrowDown', { ctrl: false, shift: false, alt: false }, 
      { execute: (editor) => editor.moveCursorDown() });
    this.registerKeyBinding('ArrowLeft', { ctrl: false, shift: false, alt: false }, 
      { execute: (editor) => editor.moveCursorLeft() });
    this.registerKeyBinding('ArrowRight', { ctrl: false, shift: false, alt: false }, 
      { execute: (editor) => editor.moveCursorRight() });
    
    // Selection with Shift + Arrow keys
    this.registerKeyBinding('ArrowUp', { ctrl: false, shift: true, alt: false }, 
      { execute: (editor) => editor.extendSelectionUp() });
    this.registerKeyBinding('ArrowDown', { ctrl: false, shift: true, alt: false }, 
      { execute: (editor) => editor.extendSelectionDown() });
    this.registerKeyBinding('ArrowLeft', { ctrl: false, shift: true, alt: false }, 
      { execute: (editor) => editor.extendSelectionLeft() });
    this.registerKeyBinding('ArrowRight', { ctrl: false, shift: true, alt: false }, 
      { execute: (editor) => editor.extendSelectionRight() });
    
    // Editing
    this.registerKeyBinding('Backspace', { ctrl: false, shift: false, alt: false }, 
      { execute: (editor) => editor.backspace() });
    this.registerKeyBinding('Delete', { ctrl: false, shift: false, alt: false }, 
      { execute: (editor) => editor.delete() });
    this.registerKeyBinding('Enter', { ctrl: false, shift: false, alt: false }, 
      { execute: (editor) => editor.newLine() });
    
    // Undo/Redo
    this.registerKeyBinding('z', { ctrl: true, shift: false, alt: false }, 
      { execute: (editor) => editor.undo() });
    this.registerKeyBinding('y', { ctrl: true, shift: false, alt: false }, 
      { execute: (editor) => editor.redo() });
    
    // Selection
    this.registerKeyBinding('a', { ctrl: true, shift: false, alt: false }, 
      { execute: (editor) => editor.selectAll() });
    
    // Home/End
    this.registerKeyBinding('Home', { ctrl: false, shift: false, alt: false }, 
      { execute: (editor) => editor.moveCursorToLineStart() });
    this.registerKeyBinding('End', { ctrl: false, shift: false, alt: false }, 
      { execute: (editor) => editor.moveCursorToLineEnd() });
    
    // Selection with Shift + Home/End
    this.registerKeyBinding('Home', { ctrl: false, shift: true, alt: false }, 
      { execute: (editor) => editor.extendSelectionToLineStart() });
    this.registerKeyBinding('End', { ctrl: false, shift: true, alt: false }, 
      { execute: (editor) => editor.extendSelectionToLineEnd() });
  }

  private getKeyCombo(key: string, modifiers: KeyModifiers): string {
    const parts: string[] = [];
    if (modifiers.ctrl) parts.push('Ctrl');
    if (modifiers.shift) parts.push('Shift');
    if (modifiers.alt) parts.push('Alt');
    parts.push(key);
    return parts.join('+');
  }

  private notifyListeners(): void {
    for (const listener of this.listeners) {
      listener.onEditorChange(this);
    }
  }
}

export interface KeyModifiers {
  ctrl: boolean;
  shift: boolean;
  alt: boolean;
}

export interface EditorCommand {
  execute(editor: Editor): void;
}

export interface EditorListener {
  onEditorChange(editor: Editor): void;
}