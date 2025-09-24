/**
 * Document class represents the text content and manages text operations
 */
export class Document {
  private lines: string[];
  private modified: boolean = false;
  private readonly history: DocumentAction[] = [];
  private historyIndex: number = -1;

  constructor(content: string = '') {
    this.lines = content ? content.split('\n') : [''];
    // Ensure we always have at least one line
    if (this.lines.length === 0) {
      this.lines = [''];
    }
  }

  /**
   * Get the entire document content as a string
   */
  getContent(): string {
    return this.lines.join('\n');
  }

  /**
   * Get a specific line by index
   */
  getLine(lineIndex: number): string {
    if (lineIndex < 0 || lineIndex >= this.lines.length) {
      return '';  // Return empty string instead of throwing error
    }
    const line = this.lines[lineIndex];
    return line ?? '';
  }

  /**
   * Get the total number of lines
   */
  getLineCount(): number {
    return this.lines.length;
  }

  /**
   * Insert text at the specified position
   */
  insertText(position: Position, text: string): void {
    // Validate position bounds
    const validatedPosition = this.validatePosition(position);
    
    const action: DocumentAction = {
      type: 'insert',
      position: validatedPosition,
      text,
      timestamp: Date.now()
    };

    this.applyAction(action);
    this.addToHistory(action);
  }

  /**
   * Delete text from the specified range
   */
  deleteText(range: Range): string {
    // Validate range bounds
    const validatedRange = this.validateRange(range);
    const deletedText = this.getTextInRange(validatedRange);
    
    const action: DocumentAction = {
      type: 'delete',
      position: validatedRange.start,
      text: deletedText,
      timestamp: Date.now()
    };

    this.applyAction(action);
    this.addToHistory(action);
    return deletedText;
  }

  /**
   * Replace text in the specified range
   */
  replaceText(range: Range, newText: string): void {
    const deletedText = this.deleteText(range);
    this.insertText(range.start, newText);
  }

  /**
   * Get text within a specific range
   */
  getTextInRange(range: Range): string {
    const { start, end } = range;
    
    if (start.line === end.line) {
      const line = this.lines[start.line] ?? '';
      return line.substring(start.column, end.column);
    }

    const startLine = this.lines[start.line] ?? '';
    let result = startLine.substring(start.column) + '\n';
    
    for (let i = start.line + 1; i < end.line; i++) {
      result += (this.lines[i] ?? '') + '\n';
    }
    
    const endLine = this.lines[end.line] ?? '';
    result += endLine.substring(0, end.column);
    return result;
  }

  /**
   * Undo the last action
   */
  undo(): boolean {
    if (this.historyIndex < 0) return false;

    const action = this.history[this.historyIndex];
    if (!action) return false;
    
    const reverseAction = this.getReverseAction(action);
    this.applyAction(reverseAction);
    this.historyIndex--;
    return true;
  }

  /**
   * Redo the next action
   */
  redo(): boolean {
    if (this.historyIndex >= this.history.length - 1) return false;

    this.historyIndex++;
    const action = this.history[this.historyIndex];
    if (!action) return false;
    
    this.applyAction(action);
    return true;
  }

  /**
   * Check if the document has been modified
   */
  isModified(): boolean {
    return this.modified;
  }

  /**
   * Mark the document as saved
   */
  markAsSaved(): void {
    this.modified = false;
  }

  private applyAction(action: DocumentAction): void {
    switch (action.type) {
      case 'insert':
        this.performInsert(action.position, action.text);
        break;
      case 'delete':
        this.performDelete(action.position, action.text);
        break;
    }
    this.modified = true;
  }

  private performInsert(position: Position, text: string): void {
    const { line, column } = position;
    const textLines = text.split('\n');
    
    if (textLines.length === 1) {
      // Single line insert
      const currentLine = this.lines[line] ?? '';
      this.lines[line] = currentLine.substring(0, column) + text + currentLine.substring(column);
    } else {
      // Multi-line insert
      const currentLine = this.lines[line] ?? '';
      const beforeText = currentLine.substring(0, column);
      const afterText = currentLine.substring(column);
      
      this.lines[line] = beforeText + (textLines[0] ?? '');
      
      for (let i = 1; i < textLines.length - 1; i++) {
        this.lines.splice(line + i, 0, textLines[i] ?? '');
      }
      
      const lastTextLine = textLines[textLines.length - 1] ?? '';
      this.lines.splice(line + textLines.length - 1, 0, lastTextLine + afterText);
    }
  }

  private performDelete(position: Position, text: string): void {
    const textLines = text.split('\n');
    const { line, column } = position;
    
    if (textLines.length === 1) {
      // Single line delete
      const currentLine = this.lines[line] ?? '';
      this.lines[line] = currentLine.substring(0, column) + currentLine.substring(column + text.length);
    } else {
      // Multi-line delete
      const firstLine = this.lines[line] ?? '';
      const lastLineIndex = line + textLines.length - 1;
      const lastLine = this.lines[lastLineIndex] ?? '';
      
      const beforeText = firstLine.substring(0, column);
      const lastTextLine = textLines[textLines.length - 1] ?? '';
      const afterText = lastLine.substring(column + lastTextLine.length);
      
      this.lines.splice(line, textLines.length, beforeText + afterText);
    }
  }

  private getReverseAction(action: DocumentAction): DocumentAction {
    switch (action.type) {
      case 'insert':
        const endPosition: Position = {
          line: action.position.line,
          column: action.position.column + action.text.length
        };
        return {
          type: 'delete',
          position: action.position,
          text: action.text,
          timestamp: Date.now()
        };
      case 'delete':
        return {
          type: 'insert',
          position: action.position,
          text: action.text,
          timestamp: Date.now()
        };
    }
  }

  private addToHistory(action: DocumentAction): void {
    // Remove any actions after current position (for redo functionality)
    if (this.historyIndex < this.history.length - 1) {
      this.history.splice(this.historyIndex + 1);
    }

    this.history.push(action);
    this.historyIndex = this.history.length - 1;

    // Limit history size to prevent memory issues
    const maxHistorySize = 1000;
    if (this.history.length > maxHistorySize) {
      this.history.shift();
      this.historyIndex--;
    }
  }

  /**
   * Validate and clamp position to document bounds
   */
  private validatePosition(position: Position): Position {
    // Ensure we have valid input
    if (typeof position.line !== 'number' || typeof position.column !== 'number') {
      return { line: 0, column: 0 };
    }
    
    // Ensure we have at least one line
    if (this.lines.length === 0) {
      this.lines = [''];
    }
    
    const line = Math.max(0, Math.min(position.line, this.lines.length - 1));
    const currentLine = this.lines[line] ?? '';
    const column = Math.max(0, Math.min(position.column, currentLine.length));
    
    return { line, column };
  }

  /**
   * Validate and clamp range to document bounds
   */
  private validateRange(range: Range): Range {
    const start = this.validatePosition(range.start);
    const end = this.validatePosition(range.end);
    
    // Ensure start comes before end
    if (start.line > end.line || (start.line === end.line && start.column > end.column)) {
      return { start: end, end: start };
    }
    
    return { start, end };
  }
}

export interface Position {
  line: number;
  column: number;
}

export interface Range {
  start: Position;
  end: Position;
}

export interface DocumentAction {
  type: 'insert' | 'delete';
  position: Position;
  text: string;
  timestamp: number;
}