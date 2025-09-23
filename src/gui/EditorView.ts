import { Editor } from '../core/Editor.js';
import type { EditorListener, KeyModifiers } from '../core/Editor.js';
import { SyntaxHighlighter } from '../core/SyntaxHighlighter.js';
import type { Token } from '../core/SyntaxHighlighter.js';
import { TextRenderer } from './TextRenderer.js';
import type { Theme } from './TextRenderer.js';

/**
 * Represents a range of selected text in the editor.
 */
type SelectionRange = {
  startLine: number;
  startColumn: number;
  endLine: number;
  endColumn: number;
};

/**
 * EditorView provides the visual interface for the text editor
 */
export class EditorView implements EditorListener {
  private editor: Editor;
  private renderer: TextRenderer;
  private syntaxHighlighter: SyntaxHighlighter;
  private container: HTMLElement;
  private canvas: HTMLCanvasElement;
  private language: string = 'typescript';
  private cursorVisible: boolean = true;
  private cursorBlinkInterval: number = 0;
  private scrollTop: number = 0;
  private scrollLeft: number = 0;
  private isMouseDown: boolean = false;
  private mouseDownPosition: { line: number; column: number } | null = null;

  constructor(container: HTMLElement, initialContent: string = '', theme?: Theme) {
    this.container = container;
    this.editor = new Editor(initialContent);
    this.syntaxHighlighter = new SyntaxHighlighter();
    
    this.canvas = document.createElement('canvas');
    this.canvas.style.display = 'block';
    this.canvas.style.outline = 'none';
    this.canvas.tabIndex = 0;
    this.container.appendChild(this.canvas);
    
    this.renderer = new TextRenderer(this.canvas, theme);
    
    this.setupEventListeners();
    this.editor.addListener(this);
    this.startCursorBlink();
    this.resize();
    this.render();
  }

  /**
   * Set the language for syntax highlighting
   */
  setLanguage(language: string): void {
    if (this.syntaxHighlighter.isLanguageSupported(language)) {
      this.language = language;
      this.render();
    }
  }

  /**
   * Get the current language
   */
  getLanguage(): string {
    return this.language;
  }

  /**
   * Set the theme
   */
  setTheme(theme: Theme): void {
    this.renderer.setTheme(theme);
    this.render();
  }

  /**
   * Set the font size
   */
  setFontSize(size: number): void {
    this.renderer.setFontSize(size);
    this.render();
  }

  /**
   * Get the editor instance
   */
  getEditor(): Editor {
    return this.editor;
  }

  /**
   * Focus the editor
   */
  focus(): void {
    this.canvas.focus();
  }

  /**
   * Check if the editor is focused
   */
  isFocused(): boolean {
    return document.activeElement === this.canvas;
  }

  /**
   * Resize the editor to fit the container
   */
  resize(): void {
    const rect = this.container.getBoundingClientRect();
    const devicePixelRatio = window.devicePixelRatio || 1;
    
    // Set actual canvas size in memory (scaled up for high DPI)
    this.canvas.width = rect.width * devicePixelRatio;
    this.canvas.height = rect.height * devicePixelRatio;
    
    // Scale the canvas down using CSS
    this.canvas.style.width = rect.width + 'px';
    this.canvas.style.height = rect.height + 'px';
    
    // Scale the drawing context so everything draws at the correct size
    this.renderer.resize(this.canvas.width, this.canvas.height);
    const ctx = this.canvas.getContext('2d');
    if (ctx) {
      ctx.scale(devicePixelRatio, devicePixelRatio);
    }
    
    this.render();
  }

  /**
   * Scroll to the specified position
   */
  scrollTo(top: number, left: number): void {
    this.scrollTop = Math.max(0, top);
    this.scrollLeft = Math.max(0, left);
    this.render();
  }

  /**
   * Scroll to make the cursor visible
   */
  scrollToCursor(): void {
    const position = this.editor.getCursor().getPosition();
    const lineHeight = this.renderer.getLineHeight();
    const charWidth = this.renderer.getCharWidth();
    
    const cursorY = position.line * lineHeight;
    const cursorX = this.renderer.getLineNumberWidth() + position.column * charWidth;
    
    const viewHeight = this.canvas.height;
    const viewWidth = this.canvas.width;
    
    // Vertical scrolling
    if (cursorY < this.scrollTop) {
      this.scrollTop = cursorY;
    } else if (cursorY + lineHeight > this.scrollTop + viewHeight) {
      this.scrollTop = cursorY + lineHeight - viewHeight;
    }
    
    // Horizontal scrolling
    if (cursorX < this.scrollLeft) {
      this.scrollLeft = cursorX;
    } else if (cursorX > this.scrollLeft + viewWidth) {
      this.scrollLeft = cursorX - viewWidth;
    }
    
    this.render();
  }

  /**
   * Destroy the editor view
   */
  destroy(): void {
    this.stopCursorBlink();
    this.editor.removeListener(this);
    this.container.removeChild(this.canvas);
  }

  // EditorListener implementation
  onEditorChange(editor: Editor): void {
    this.render();
    this.scrollToCursor();
  }

  private setupEventListeners(): void {
    // Keyboard events
    this.canvas.addEventListener('keydown', (e) => {
      const modifiers: KeyModifiers = {
        ctrl: e.ctrlKey,
        shift: e.shiftKey,
        alt: e.altKey
      };
      
      const handled = this.editor.handleKeyInput(e.key, modifiers);
      if (handled) {
        e.preventDefault();
      }
    });

    // Mouse events
    this.canvas.addEventListener('mousedown', (e) => {
      this.handleMouseDown(e);
    });

    this.canvas.addEventListener('mousemove', (e) => {
      this.handleMouseMove(e);
    });

    this.canvas.addEventListener('mouseup', (e) => {
      this.handleMouseUp(e);
    });

    // Focus events
    this.canvas.addEventListener('focus', () => {
      this.startCursorBlink();
    });

    this.canvas.addEventListener('blur', () => {
      this.stopCursorBlink();
    });

    // Scroll events
    this.canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      const deltaY = e.deltaY;
      const deltaX = e.deltaX;
      
      this.scrollTo(
        this.scrollTop + deltaY,
        this.scrollLeft + deltaX
      );
    });

    // Resize observer
    if (typeof ResizeObserver !== 'undefined') {
      const resizeObserver = new ResizeObserver(() => {
        this.resize();
      });
      resizeObserver.observe(this.container);
    }

    // Fallback resize listener
    window.addEventListener('resize', () => {
      this.resize();
    });
  }

  private handleMouseDown(e: MouseEvent): void {
    const rect = this.canvas.getBoundingClientRect();
    const devicePixelRatio = window.devicePixelRatio || 1;
    
    // Account for CSS scaling when calculating coordinates
    const x = (e.clientX - rect.left) + this.scrollLeft;
    const y = (e.clientY - rect.top) + this.scrollTop;
    
    const position = this.renderer.pixelToPosition(x, y);
    
    // Clamp position to document bounds
    const lineCount = this.editor.getDocument().getLineCount();
    position.line = Math.max(0, Math.min(position.line, lineCount - 1));
    
    const line = this.editor.getDocument().getLine(position.line);
    position.column = Math.max(0, Math.min(position.column, line.length));
    
    // Start selection or move cursor
    if (e.shiftKey && this.editor.getCursor().hasSelection()) {
      // Extend existing selection
      this.editor.getCursor().extendSelection(position);
    } else {
      // Clear any existing selection and set cursor position
      this.editor.getCursor().setPosition(position);
      if (!e.shiftKey) {
        this.mouseDownPosition = position;
        this.isMouseDown = true;
      }
    }
    
    this.focus();
    e.preventDefault();
  }

  private handleMouseMove(e: MouseEvent): void {
    if (!this.isMouseDown || !this.mouseDownPosition) return;
    
    const rect = this.canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) + this.scrollLeft;
    const y = (e.clientY - rect.top) + this.scrollTop;
    
    const position = this.renderer.pixelToPosition(x, y);
    
    // Clamp position to document bounds
    const lineCount = this.editor.getDocument().getLineCount();
    position.line = Math.max(0, Math.min(position.line, lineCount - 1));
    
    const line = this.editor.getDocument().getLine(position.line);
    position.column = Math.max(0, Math.min(position.column, line.length));
    
    // Start selection if we haven't already
    if (!this.editor.getCursor().hasSelection()) {
      this.editor.getCursor().setPosition(this.mouseDownPosition);
      this.editor.getCursor().startSelection();
    }
    
    // Extend selection to current position
    this.editor.getCursor().extendSelection(position);
    e.preventDefault();
  }

  private handleMouseUp(e: MouseEvent): void {
    this.isMouseDown = false;
    this.mouseDownPosition = null;
    e.preventDefault();
  }

  private render(): void {
    this.renderer.clear();
    
    const document = this.editor.getDocument();
    const cursor = this.editor.getCursor();
    const selection = cursor.getSelection();
    
    const lineHeight = this.renderer.getLineHeight();
    const viewHeight = this.canvas.height / (window.devicePixelRatio || 1);
    
    const startLine = Math.floor(this.scrollTop / lineHeight);
    const endLine = Math.min(
      document.getLineCount(),
      Math.ceil((this.scrollTop + viewHeight) / lineHeight) + 1
    );
    
    // Save the current transform
    this.renderer.getContext().save();
    
    // Apply scroll offset
    this.renderer.getContext().translate(-this.scrollLeft, -this.scrollTop);
    
    // Render visible lines
    for (let lineIndex = startLine; lineIndex < endLine; lineIndex++) {
      const line = document.getLine(lineIndex);
      const tokens = this.syntaxHighlighter.tokenize(line, this.language);
      const y = lineIndex * lineHeight;
      
      // Check if this line has selection
      let selectedRange: SelectionRange | undefined;
      if (selection && 
          ((selection.start.line === lineIndex && selection.end.line === lineIndex) ||
           (selection.start.line <= lineIndex && selection.end.line >= lineIndex))) {
        
        const startColumn = selection.start.line === lineIndex ? selection.start.column : 0;
        const endColumn = selection.end.line === lineIndex ? selection.end.column : line.length;
        selectedRange = {
          startLine: lineIndex,
          startColumn: startColumn,
          endLine: lineIndex,
          endColumn: endColumn
        };
      }
      
      this.renderer.renderLine(lineIndex, tokens, y, selectedRange);
    }
    
    // Render cursor
    const cursorPosition = cursor.getPosition();
    if (cursorPosition.line >= startLine && cursorPosition.line < endLine) {
      this.renderer.renderCursor(
        cursorPosition.line,
        cursorPosition.column,
        this.cursorVisible && this.isFocused()
      );
    }
    
    // Restore the transform
    this.renderer.getContext().restore();
  }

  private startCursorBlink(): void {
    this.stopCursorBlink();
    this.cursorVisible = true;
    this.cursorBlinkInterval = window.setInterval(() => {
      this.cursorVisible = !this.cursorVisible;
      this.render();
    }, 530);
  }

  private stopCursorBlink(): void {
    if (this.cursorBlinkInterval) {
      clearInterval(this.cursorBlinkInterval);
      this.cursorBlinkInterval = 0;
    }
    this.cursorVisible = false;
  }
}