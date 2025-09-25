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
  private cursorOpacity: number = 1.0;
  private cursorBlinkInterval: number = 0;
  private cursorAnimationFrame: number = 0;
  private cursorAnimationType: 'blink' | 'fade' | 'pulse' = 'fade';
  private cursorBlinkSpeed: number = 530; // milliseconds
  private scrollTop: number = 0;
  private scrollLeft: number = 0;
  private targetScrollTop: number = 0;
  private targetScrollLeft: number = 0;
  private scrollVelocityY: number = 0;
  private scrollVelocityX: number = 0;
  private smoothScrollEnabled: boolean = true;
  private scrollAnimationFrame: number = 0;
  private lastScrollTime: number = 0;
  private touchStartY: number = 0;
  private touchStartX: number = 0;
  private isTouching: boolean = false;
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
   * Set cursor animation type
   */
  setCursorAnimation(type: 'blink' | 'fade' | 'pulse', speed: number = 530): void {
    this.cursorAnimationType = type;
    this.cursorBlinkSpeed = speed;
    this.startCursorBlink(); // Restart with new animation
  }

  /**
   * Get cursor animation configuration
   */
  getCursorAnimation(): { type: 'blink' | 'fade' | 'pulse'; speed: number } {
    return {
      type: this.cursorAnimationType,
      speed: this.cursorBlinkSpeed
    };
  }

  /**
   * Get the editor instance
   */
  getEditor(): Editor {
    return this.editor;
  }

  /**
   * Get the text renderer instance
   */
  getRenderer(): TextRenderer {
    return this.renderer;
  }

  /**
   * Refresh the editor display
   */
  refresh(): void {
    this.render();
  }

  /**
   * Enable or disable smooth scrolling
   */
  setSmoothScrolling(enabled: boolean): void {
    this.smoothScrollEnabled = enabled;
    if (!enabled) {
      // Cancel any ongoing smooth scroll animation
      this.cancelSmoothScrolling();
      this.scrollTop = this.targetScrollTop;
      this.scrollLeft = this.targetScrollLeft;
      this.render();
    }
  }

  /**
   * Get smooth scrolling status
   */
  isSmoothScrollingEnabled(): boolean {
    return this.smoothScrollEnabled;
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
    const maxScrollTop = Math.max(0, this.getMaxScrollTop());
    const maxScrollLeft = Math.max(0, this.getMaxScrollLeft());
    
    this.targetScrollTop = Math.max(0, Math.min(top, maxScrollTop));
    this.targetScrollLeft = Math.max(0, Math.min(left, maxScrollLeft));
    
    if (this.smoothScrollEnabled) {
      this.startSmoothScroll();
    } else {
      this.scrollTop = this.targetScrollTop;
      this.scrollLeft = this.targetScrollLeft;
      this.render();
    }
  }

  /**
   * Scroll by the specified delta amounts
   */
  scrollBy(deltaY: number, deltaX: number): void {
    this.scrollTo(this.targetScrollTop + deltaY, this.targetScrollLeft + deltaX);
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
    
    // Use CSS pixel dimensions for viewport calculations
    const viewHeight = this.canvas.height / (window.devicePixelRatio || 1);
    const viewWidth = this.canvas.width / (window.devicePixelRatio || 1);
    
    // Calculate target scroll position
    let newScrollTop = this.targetScrollTop;
    let newScrollLeft = this.targetScrollLeft;
    
    // Vertical scrolling with padding
    const verticalPadding = lineHeight * 2; // Show 2 lines above/below cursor
    if (cursorY < this.targetScrollTop + verticalPadding) {
      newScrollTop = Math.max(0, cursorY - verticalPadding);
    } else if (cursorY + lineHeight > this.targetScrollTop + viewHeight - verticalPadding) {
      newScrollTop = cursorY + lineHeight - viewHeight + verticalPadding;
    }
    
    // Horizontal scrolling with padding
    const horizontalPadding = charWidth * 5; // Show 5 characters before/after cursor
    if (cursorX < this.targetScrollLeft + horizontalPadding) {
      newScrollLeft = Math.max(0, cursorX - horizontalPadding);
    } else if (cursorX > this.targetScrollLeft + viewWidth - horizontalPadding) {
      newScrollLeft = cursorX - viewWidth + horizontalPadding;
    }
    
    // Only scroll if position changed
    if (newScrollTop !== this.targetScrollTop || newScrollLeft !== this.targetScrollLeft) {
      this.scrollTo(newScrollTop, newScrollLeft);
    }
  }

  /**
   * Destroy the editor view
   */
  destroy(): void {
    this.stopCursorBlink();
    this.cancelSmoothScrolling();
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

    // Clipboard events
    this.canvas.addEventListener('paste', async (e) => {
      e.preventDefault();
      
      try {
        const clipboardData = e.clipboardData;
        if (clipboardData) {
          const text = clipboardData.getData('text/plain');
          if (text) {
            // Insert text at cursor position
            this.editor.insertText(text);
            this.render();
          }
        }
      } catch (error) {
        console.warn('Failed to paste from clipboard:', error);
        
        // Fallback: try to read from clipboard API if available
        if (navigator.clipboard && navigator.clipboard.readText) {
          try {
            const text = await navigator.clipboard.readText();
            if (text) {
              this.editor.insertText(text);
              this.render();
            }
          } catch (fallbackError) {
            console.warn('Clipboard API also failed:', fallbackError);
          }
        }
      }
    });

    // Copy event
    this.canvas.addEventListener('copy', (e) => {
      e.preventDefault();
      
      const cursor = this.editor.getCursor();
      if (cursor.hasSelection()) {
        const selection = cursor.getSelection();
        if (selection && e.clipboardData) {
          const selectedText = this.editor.getDocument().getTextInRange(selection);
          e.clipboardData.setData('text/plain', selectedText);
        }
      }
    });

    // Cut event
    this.canvas.addEventListener('cut', (e) => {
      e.preventDefault();
      
      const cursor = this.editor.getCursor();
      if (cursor.hasSelection()) {
        const selection = cursor.getSelection();
        if (selection && e.clipboardData) {
          const selectedText = this.editor.getDocument().getTextInRange(selection);
          e.clipboardData.setData('text/plain', selectedText);
          
          // Delete the selected text
          this.editor.getDocument().deleteText(selection);
          this.editor.getCursor().setPosition(selection.start);
          this.render();
        }
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

    // Scroll events with momentum
    this.canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      
      // Calculate scroll delta with momentum
      let deltaY = e.deltaY;
      let deltaX = e.deltaX;
      
      // Scale delta based on delta mode
      if (e.deltaMode === 1) { // DOM_DELTA_LINE
        deltaY *= this.renderer.getLineHeight();
        deltaX *= this.renderer.getCharWidth();
      } else if (e.deltaMode === 2) { // DOM_DELTA_PAGE
        const viewHeight = this.canvas.height / (window.devicePixelRatio || 1);
        const viewWidth = this.canvas.width / (window.devicePixelRatio || 1);
        deltaY *= viewHeight;
        deltaX *= viewWidth;
      }
      
      // Apply momentum if smooth scrolling is enabled
      if (this.smoothScrollEnabled) {
        const now = performance.now();
        const timeDelta = now - this.lastScrollTime;
        this.lastScrollTime = now;
        
        // Add velocity based momentum
        const momentumMultiplier = Math.min(1.5, Math.max(0.5, 100 / timeDelta));
        deltaY *= momentumMultiplier;
        deltaX *= momentumMultiplier;
        
        // Add to velocity for momentum effect
        this.scrollVelocityY += deltaY * 0.1;
        this.scrollVelocityX += deltaX * 0.1;
        
        // Clamp velocity to prevent excessive speed
        this.scrollVelocityY = Math.max(-50, Math.min(50, this.scrollVelocityY));
        this.scrollVelocityX = Math.max(-50, Math.min(50, this.scrollVelocityX));
      }
      
      this.scrollBy(deltaY, deltaX);
    });

    // Touch events for mobile smooth scrolling
    this.canvas.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        const touch = e.touches[0];
        if (touch) {
          this.touchStartY = touch.clientY;
          this.touchStartX = touch.clientX;
          this.isTouching = true;
          
          // Cancel any ongoing smooth scroll
          this.cancelSmoothScrolling();
        }
        e.preventDefault();
      }
    });

    this.canvas.addEventListener('touchmove', (e) => {
      if (this.isTouching && e.touches.length === 1) {
        const touch = e.touches[0];
        if (touch) {
          const deltaY = this.touchStartY - touch.clientY;
          const deltaX = this.touchStartX - touch.clientX;
          
          // Add momentum to touch scrolling
          this.scrollVelocityY = deltaY * 0.5;
          this.scrollVelocityX = deltaX * 0.5;
          
          this.scrollBy(deltaY, deltaX);
          
          this.touchStartY = touch.clientY;
          this.touchStartX = touch.clientX;
        }
        e.preventDefault();
      }
    });

    this.canvas.addEventListener('touchend', (e) => {
      if (this.isTouching) {
        this.isTouching = false;
        
        // Apply momentum after touch ends
        if (this.smoothScrollEnabled && (Math.abs(this.scrollVelocityY) > 2 || Math.abs(this.scrollVelocityX) > 2)) {
          this.startMomentumScroll();
        }
        
        e.preventDefault();
      }
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
    
    // Calculate mouse position relative to canvas (in CSS pixels)
    const cssX = e.clientX - rect.left;
    const cssY = e.clientY - rect.top;
    
    // Add scroll offset (scroll values are already in logical pixels)
    const x = cssX + this.scrollLeft;
    const y = cssY + this.scrollTop;
    
    const position = this.renderer.pixelToPosition(x, y);
    
    // Clamp position to document bounds more carefully
    const lineCount = this.editor.getDocument().getLineCount();
    const clampedLine = Math.max(0, Math.min(position.line, lineCount - 1));
    
    // Ensure we have a valid line to work with and get more precise column
    let line = '';
    try {
      line = this.editor.getDocument().getLine(clampedLine);
    } catch (e) {
      line = '';
    }
    
    // Use the more precise column calculation
    const clampedColumn = Math.max(0, Math.min(
      this.renderer.pixelToColumn(x, line), 
      line.length
    ));
    const clampedPosition = { line: clampedLine, column: clampedColumn };
    
    // Start selection or move cursor
    if (e.shiftKey && this.editor.getCursor().hasSelection()) {
      // Extend existing selection
      this.editor.getCursor().extendSelection(clampedPosition);
    } else {
      // Clear any existing selection and set cursor position
      this.editor.getCursor().setPosition(clampedPosition);
      if (!e.shiftKey) {
        this.mouseDownPosition = clampedPosition;
        this.isMouseDown = true;
      }
    }
    
    this.focus();
    e.preventDefault();
  }

  private handleMouseMove(e: MouseEvent): void {
    if (!this.isMouseDown || !this.mouseDownPosition) return;
    
    const rect = this.canvas.getBoundingClientRect();
    
    // Calculate mouse position relative to canvas (in CSS pixels)
    const cssX = e.clientX - rect.left;
    const cssY = e.clientY - rect.top;
    
    // Add scroll offset (scroll values are already in logical pixels)
    const x = cssX + this.scrollLeft;
    const y = cssY + this.scrollTop;
    
    const position = this.renderer.pixelToPosition(x, y);
    
    // Clamp position to document bounds more carefully
    const lineCount = this.editor.getDocument().getLineCount();
    const clampedLine = Math.max(0, Math.min(position.line, lineCount - 1));
    
    // Ensure we have a valid line to work with
    let line = '';
    try {
      line = this.editor.getDocument().getLine(clampedLine);
    } catch (e) {
      line = '';
    }
    
    const clampedColumn = Math.max(0, Math.min(position.column, line.length));
    const clampedPosition = { line: clampedLine, column: clampedColumn };
    
    // Start selection if we haven't already
    if (!this.editor.getCursor().hasSelection()) {
      this.editor.getCursor().setPosition(this.mouseDownPosition);
      this.editor.getCursor().startSelection();
    }
    
    // Extend selection to current position
    this.editor.getCursor().extendSelection(clampedPosition);
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
        this.cursorVisible && this.isFocused(),
        this.cursorOpacity
      );
    }
    
    // Restore the transform
    this.renderer.getContext().restore();
  }

  private startCursorBlink(): void {
    this.stopCursorBlink();
    this.cursorVisible = true;
    this.cursorOpacity = 1.0;

    switch (this.cursorAnimationType) {
      case 'blink':
        this.startBlinkAnimation();
        break;
      case 'fade':
        this.startFadeAnimation();
        break;
      case 'pulse':
        this.startPulseAnimation();
        break;
    }
  }

  private startBlinkAnimation(): void {
    this.cursorBlinkInterval = window.setInterval(() => {
      this.cursorVisible = !this.cursorVisible;
      this.cursorOpacity = this.cursorVisible ? 1.0 : 0.0;
      this.render();
    }, this.cursorBlinkSpeed);
  }

  private startFadeAnimation(): void {
    let fadeDirection = -1; // -1 for fade out, 1 for fade in
    const fadeStep = 0.05; // How much to change opacity each frame
    const frameRate = 16; // ~60fps

    this.cursorBlinkInterval = window.setInterval(() => {
      this.cursorOpacity += fadeDirection * fadeStep;
      
      if (this.cursorOpacity <= 0.1) {
        this.cursorOpacity = 0.1;
        fadeDirection = 1;
      } else if (this.cursorOpacity >= 1.0) {
        this.cursorOpacity = 1.0;
        fadeDirection = -1;
      }
      
      this.cursorVisible = this.cursorOpacity > 0.1;
      this.render();
    }, frameRate);
  }

  private startPulseAnimation(): void {
    let phase = 0;
    const pulseSpeed = 0.1;
    const frameRate = 16; // ~60fps

    this.cursorBlinkInterval = window.setInterval(() => {
      phase += pulseSpeed;
      // Use sine wave for smooth pulsing effect
      this.cursorOpacity = 0.3 + 0.7 * (Math.sin(phase) * 0.5 + 0.5);
      this.cursorVisible = true;
      this.render();
    }, frameRate);
  }

  private stopCursorBlink(): void {
    if (this.cursorBlinkInterval) {
      clearInterval(this.cursorBlinkInterval);
      this.cursorBlinkInterval = 0;
    }
    if (this.cursorAnimationFrame) {
      cancelAnimationFrame(this.cursorAnimationFrame);
      this.cursorAnimationFrame = 0;
    }
    this.cursorVisible = false;
    this.cursorOpacity = 0.0;
  }

  /**
   * Get maximum scroll position (vertical)
   */
  private getMaxScrollTop(): number {
    const document = this.editor.getDocument();
    const lineCount = document.getLineCount();
    const lineHeight = this.renderer.getLineHeight();
    const viewHeight = this.canvas.height / (window.devicePixelRatio || 1);
    
    return Math.max(0, lineCount * lineHeight - viewHeight);
  }

  /**
   * Get maximum scroll position (horizontal)
   */
  private getMaxScrollLeft(): number {
    // For now, return a reasonable maximum based on longest line
    const document = this.editor.getDocument();
    let maxLineLength = 0;
    
    for (let i = 0; i < document.getLineCount(); i++) {
      const line = document.getLine(i);
      maxLineLength = Math.max(maxLineLength, line.length);
    }
    
    const charWidth = this.renderer.getCharWidth();
    const viewWidth = this.canvas.width / (window.devicePixelRatio || 1);
    const maxContentWidth = this.renderer.getLineNumberWidth() + maxLineLength * charWidth;
    
    return Math.max(0, maxContentWidth - viewWidth);
  }

  /**
   * Start smooth scroll animation
   */
  private startSmoothScroll(): void {
    if (this.scrollAnimationFrame) {
      cancelAnimationFrame(this.scrollAnimationFrame);
    }
    
    const animate = () => {
      const deltaY = this.targetScrollTop - this.scrollTop;
      const deltaX = this.targetScrollLeft - this.scrollLeft;
      
      // Use easing function for smooth animation
      const easing = 0.15; // Adjust for smoother/faster animation
      const threshold = 0.5; // Stop animation when very close to target
      
      if (Math.abs(deltaY) > threshold || Math.abs(deltaX) > threshold) {
        this.scrollTop += deltaY * easing;
        this.scrollLeft += deltaX * easing;
        
        // Apply momentum velocity
        this.scrollTop += this.scrollVelocityY;
        this.scrollLeft += this.scrollVelocityX;
        
        // Apply friction to velocity
        this.scrollVelocityY *= 0.95;
        this.scrollVelocityX *= 0.95;
        
        // Clamp scroll positions
        const maxScrollTop = this.getMaxScrollTop();
        const maxScrollLeft = this.getMaxScrollLeft();
        
        this.scrollTop = Math.max(0, Math.min(this.scrollTop, maxScrollTop));
        this.scrollLeft = Math.max(0, Math.min(this.scrollLeft, maxScrollLeft));
        
        this.render();
        this.scrollAnimationFrame = requestAnimationFrame(animate);
      } else {
        // Animation complete
        this.scrollTop = this.targetScrollTop;
        this.scrollLeft = this.targetScrollLeft;
        this.scrollVelocityY = 0;
        this.scrollVelocityX = 0;
        this.scrollAnimationFrame = 0;
        this.render();
      }
    };
    
    this.scrollAnimationFrame = requestAnimationFrame(animate);
  }

  /**
   * Cancel smooth scrolling animation
   */
  private cancelSmoothScrolling(): void {
    if (this.scrollAnimationFrame) {
      cancelAnimationFrame(this.scrollAnimationFrame);
      this.scrollAnimationFrame = 0;
    }
    this.scrollVelocityY = 0;
    this.scrollVelocityX = 0;
  }

  /**
   * Start momentum scrolling (for touch devices)
   */
  private startMomentumScroll(): void {
    if (this.scrollAnimationFrame) {
      cancelAnimationFrame(this.scrollAnimationFrame);
    }
    
    const animate = () => {
      // Apply velocity
      this.targetScrollTop += this.scrollVelocityY;
      this.targetScrollLeft += this.scrollVelocityX;
      
      // Apply friction
      this.scrollVelocityY *= 0.92;
      this.scrollVelocityX *= 0.92;
      
      // Clamp to bounds
      const maxScrollTop = this.getMaxScrollTop();
      const maxScrollLeft = this.getMaxScrollLeft();
      
      this.targetScrollTop = Math.max(0, Math.min(this.targetScrollTop, maxScrollTop));
      this.targetScrollLeft = Math.max(0, Math.min(this.targetScrollLeft, maxScrollLeft));
      
      // Bounce at edges
      if (this.targetScrollTop <= 0 || this.targetScrollTop >= maxScrollTop) {
        this.scrollVelocityY *= -0.3; // Bounce back
      }
      if (this.targetScrollLeft <= 0 || this.targetScrollLeft >= maxScrollLeft) {
        this.scrollVelocityX *= -0.3; // Bounce back
      }
      
      // Continue animation if still moving
      if (Math.abs(this.scrollVelocityY) > 0.5 || Math.abs(this.scrollVelocityX) > 0.5) {
        this.startSmoothScroll();
        this.scrollAnimationFrame = requestAnimationFrame(animate);
      } else {
        // Animation complete
        this.scrollVelocityY = 0;
        this.scrollVelocityX = 0;
        this.scrollAnimationFrame = 0;
      }
    };
    
    this.scrollAnimationFrame = requestAnimationFrame(animate);
  }
}