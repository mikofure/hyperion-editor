import type { Position, Range } from './Document.js';

/**
 * Cursor class manages the text cursor position and selection
 */
export class Cursor {
  private position: Position;
  private selectionStart: Position | null = null;
  private readonly listeners: CursorListener[] = [];

  constructor(initialPosition: Position = { line: 0, column: 0 }) {
    this.position = { ...initialPosition };
  }

  /**
   * Get the current cursor position
   */
  getPosition(): Position {
    return { ...this.position };
  }

  /**
   * Set the cursor position
   */
  setPosition(position: Position): void {
    this.position = { ...position };
    this.clearSelection();
    this.notifyListeners();
  }

  /**
   * Move the cursor by the specified offset
   */
  move(deltaLine: number, deltaColumn: number): void {
    this.position.line = Math.max(0, this.position.line + deltaLine);
    this.position.column = Math.max(0, this.position.column + deltaColumn);
    this.clearSelection();
    this.notifyListeners();
  }

  /**
   * Move cursor to the beginning of the line
   */
  moveToLineStart(): void {
    this.position.column = 0;
    this.clearSelection();
    this.notifyListeners();
  }

  /**
   * Move cursor to the end of the line
   */
  moveToLineEnd(lineLength: number): void {
    this.position.column = lineLength;
    this.clearSelection();
    this.notifyListeners();
  }

  /**
   * Move cursor to the beginning of the document
   */
  moveToDocumentStart(): void {
    this.position.line = 0;
    this.position.column = 0;
    this.clearSelection();
    this.notifyListeners();
  }

  /**
   * Move cursor to the end of the document
   */
  moveToDocumentEnd(lastLineIndex: number, lastLineLength: number): void {
    this.position.line = lastLineIndex;
    this.position.column = lastLineLength;
    this.clearSelection();
    this.notifyListeners();
  }

  /**
   * Start text selection from the current position
   */
  startSelection(): void {
    this.selectionStart = { ...this.position };
    this.notifyListeners();
  }

  /**
   * Extend selection to the current position
   */
  extendSelection(newPosition: Position): void {
    if (!this.selectionStart) {
      this.startSelection();
    }
    this.position = { ...newPosition };
    this.notifyListeners();
  }

  /**
   * Clear the current selection
   */
  clearSelection(): void {
    this.selectionStart = null;
    this.notifyListeners();
  }

  /**
   * Check if there's an active selection
   */
  hasSelection(): boolean {
    return this.selectionStart !== null && !this.isPositionEqual(this.selectionStart, this.position);
  }

  /**
   * Get the current selection range
   */
  getSelection(): Range | null {
    if (!this.hasSelection() || !this.selectionStart) {
      return null;
    }

    const start = this.isPositionBefore(this.selectionStart, this.position) 
      ? this.selectionStart 
      : this.position;
    const end = this.isPositionBefore(this.selectionStart, this.position) 
      ? this.position 
      : this.selectionStart;

    return { start: { ...start }, end: { ...end } };
  }

  /**
   * Select all text in the document
   */
  selectAll(lastLineIndex: number, lastLineLength: number): void {
    this.selectionStart = { line: 0, column: 0 };
    this.position = { line: lastLineIndex, column: lastLineLength };
    this.notifyListeners();
  }

  /**
   * Select the current line
   */
  selectLine(lineLength: number): void {
    this.selectionStart = { line: this.position.line, column: 0 };
    this.position = { line: this.position.line, column: lineLength };
    this.notifyListeners();
  }

  /**
   * Select word at cursor position
   */
  selectWord(line: string): void {
    const { column } = this.position;
    let start = column;
    let end = column;

    // Find word boundaries
    while (start > 0 && line[start - 1] !== undefined && this.isWordCharacter(line[start - 1]!)) {
      start--;
    }
    while (end < line.length && line[end] !== undefined && this.isWordCharacter(line[end]!)) {
      end++;
    }

    this.selectionStart = { line: this.position.line, column: start };
    this.position = { line: this.position.line, column: end };
    this.notifyListeners();
  }

  /**
   * Add a cursor movement listener
   */
  addListener(listener: CursorListener): void {
    this.listeners.push(listener);
  }

  /**
   * Remove a cursor movement listener
   */
  removeListener(listener: CursorListener): void {
    const index = this.listeners.indexOf(listener);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
  }

  private isPositionEqual(pos1: Position, pos2: Position): boolean {
    return pos1.line === pos2.line && pos1.column === pos2.column;
  }

  private isPositionBefore(pos1: Position, pos2: Position): boolean {
    return pos1.line < pos2.line || (pos1.line === pos2.line && pos1.column < pos2.column);
  }

  private isWordCharacter(char: string): boolean {
    return /\w/.test(char);
  }

  private notifyListeners(): void {
    for (const listener of this.listeners) {
      listener.onCursorChange(this.getPosition(), this.getSelection());
    }
  }
}

export interface CursorListener {
  onCursorChange(position: Position, selection: Range | null): void;
}