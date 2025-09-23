import type { Token } from '../core/SyntaxHighlighter.js';
import { TokenType } from '../core/SyntaxHighlighter.js';

export class TextRenderer {
  private canvas: HTMLCanvasElement;
  private context: CanvasRenderingContext2D;
  private fontSize: number = 14;
  private fontFamily: string = 'Monaco, Menlo, "Jetbrains Mono", monospace';
  private lineHeight: number = 1.4;
  private charWidth: number = 0;
  private theme: Theme;

  constructor(canvas: HTMLCanvasElement, theme: Theme = defaultTheme) {
    this.canvas = canvas;
    this.theme = theme;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Failed to get 2D context from canvas');
    }
    this.context = ctx;
    this.setupCanvas();
    this.measureCharWidth();
  }

  renderLine(
    lineNumber: number,
    tokens: Token[],
    y: number,
    selection?: SelectionRange
  ): void {
    const lineY = y + this.fontSize;
    let x = this.getLineNumberWidth();

    // Render line number
    this.renderLineNumber(lineNumber, y);

    // Render selection background (multi-line aware)
    if (selection) {
      const lineLength = tokens.reduce((len, t) => len + t.value.length, 0);
      this.renderSelectionForLine(lineNumber, y, selection, lineLength);
    }

    // Render tokens
    for (const token of tokens) {
      this.renderToken(token, x, lineY);
      x += token.value.length * this.charWidth;
    }
  }

  renderCursor(line: number, column: number, isVisible: boolean): void {
    if (!isVisible) return;

    const x = this.getLineNumberWidth() + column * this.charWidth;
    const y = line * this.getLineHeight();

    this.context.fillStyle = this.theme.cursor;
    this.context.fillRect(x, y, 2, this.getLineHeight());
  }

  clear(): void {
    this.context.fillStyle = this.theme.background;
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  getLineHeight(): number {
    return this.fontSize * this.lineHeight;
  }

  getCharWidth(): number {
    return this.charWidth;
  }

  getLineNumberWidth(): number {
    return 60;
  }

  getContext(): CanvasRenderingContext2D {
    return this.context;
  }

  pixelToPosition(x: number, y: number): { line: number; column: number } {
    const line = Math.floor(y / this.getLineHeight());
    const column = Math.max(
      0,
      Math.floor((x - this.getLineNumberWidth()) / this.charWidth)
    );
    return { line, column };
  }

  positionToPixel(line: number, column: number): { x: number; y: number } {
    const x = this.getLineNumberWidth() + column * this.charWidth;
    const y = line * this.getLineHeight();
    return { x, y };
  }

  setFontSize(size: number): void {
    this.fontSize = size;
    this.setupCanvas();
    this.measureCharWidth();
  }

  setTheme(theme: Theme): void {
    this.theme = theme;
  }

  resize(width: number, height: number): void {
    this.canvas.width = width;
    this.canvas.height = height;
    this.setupCanvas();
  }

  private setupCanvas(): void {
    this.context.font = `${this.fontSize}px ${this.fontFamily}`;
    this.context.textBaseline = 'top';
    this.context.fillStyle = this.theme.background;
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  private measureCharWidth(): void {
    this.context.font = `${this.fontSize}px ${this.fontFamily}`;
    const metrics = this.context.measureText('M');
    this.charWidth = metrics.width;
  }

  private renderToken(token: Token, x: number, y: number): void {
    const color = this.getTokenColor(token.type);
    this.context.fillStyle = color;
    this.context.fillText(token.value, x, y);
  }

  private renderLineNumber(lineNumber: number, y: number): void {
    const text = (lineNumber + 1).toString().padStart(3, ' ');
    this.context.fillStyle = this.theme.lineNumber;
    this.context.fillText(text, 10, y + this.fontSize);
  }

  /**
   * Multi-line aware selection renderer
   */
  private renderSelectionForLine(
    lineNumber: number,
    y: number,
    range: SelectionRange,
    lineLength: number
  ): void {
    if (lineNumber < range.startLine || lineNumber > range.endLine) return;

    let startCol = 0;
    let endCol = lineLength;

    if (lineNumber === range.startLine) {
      startCol = range.startColumn;
    }
    if (lineNumber === range.endLine) {
      endCol = range.endColumn;
    }

    const startX = this.getLineNumberWidth() + startCol * this.charWidth;
    const width = (endCol - startCol) * this.charWidth;

    this.context.fillStyle = this.theme.selection;
    this.context.fillRect(startX, y, width, this.getLineHeight());
  }

  private getTokenColor(tokenType: TokenType): string {
    switch (tokenType) {
      case TokenType.KEYWORD:
        return this.theme.keyword;
      case TokenType.STRING:
        return this.theme.string;
      case TokenType.COMMENT:
        return this.theme.comment;
      case TokenType.NUMBER:
        return this.theme.number;
      case TokenType.OPERATOR:
        return this.theme.operator;
      case TokenType.FUNCTION:
        return this.theme.function;
      case TokenType.TYPE:
        return this.theme.type;
      case TokenType.IDENTIFIER:
        return this.theme.identifier;
      case TokenType.PUNCTUATION:
        return this.theme.punctuation;
      default:
        return this.theme.text;
    }
  }
}

export interface SelectionRange {
  startLine: number;
  startColumn: number;
  endLine: number;
  endColumn: number;
}

export interface Theme {
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

export const defaultTheme: Theme = {
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

export const lightTheme: Theme = {
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
