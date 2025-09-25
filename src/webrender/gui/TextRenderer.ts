import type { Token } from '../core/SyntaxHighlighter.js';
import { TokenType } from '../core/SyntaxHighlighter.js';
import { defaultTheme, themes, getTheme, type ThemeEntry } from './themes/index.js';

export class TextRenderer {
    private canvas: HTMLCanvasElement;
    private context: CanvasRenderingContext2D;
    private fontSize: number = 14;
    private fontFamily: string = 'Monaco, Menlo, "Jetbrains Mono", monospace';
    private lineHeight: number = 1.4;
    private charWidth: number = 0;
    private theme: Theme;
    private devicePixelRatio: number = 1;
    private subpixelEnabled: boolean = true;

    constructor(canvas: HTMLCanvasElement, theme: Theme = defaultTheme) {
        this.canvas = canvas;
        this.theme = theme;
        this.devicePixelRatio = window.devicePixelRatio || 1;
        
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

        this.renderLineNumber(lineNumber, y);

        const lineText = tokens.map(t => t.value).join("");

        if (selection) {
            this.renderSelectionForLine(lineNumber, y, selection, lineText);
        }

        for (const token of tokens) {
            this.renderToken(token, x, lineY);
            x += this.context.measureText(token.value).width;
        }
    }

    renderCursor(line: number, column: number, isVisible: boolean, opacity: number = 1.0): void {
        if (!isVisible || opacity <= 0) return;

        // Calculate cursor position with subpixel precision
        const x = this.subpixelRound(this.getLineNumberWidth() + column * this.charWidth);
        const y = this.subpixelRound(line * this.getLineHeight());

        this.context.save();
        this.context.globalAlpha = Math.max(0, Math.min(1, opacity));

        const cursorHeight = this.getLineHeight();
        const cursorWidth = this.subpixelEnabled ? 1.5 : 2;

        const gradient = this.context.createLinearGradient(x, y, x, y + cursorHeight);
        gradient.addColorStop(0, this.theme.cursor);
        gradient.addColorStop(0.5, this.theme.cursor);
        gradient.addColorStop(1, this.theme.cursor + '80');

        this.context.fillStyle = gradient;
        this.context.fillRect(x, y, cursorWidth, cursorHeight);

        if (opacity > 0.7) {
            this.context.shadowColor = this.theme.cursor;
            this.context.shadowBlur = 3;
            this.context.shadowOffsetX = 0;
            this.context.shadowOffsetY = 0;
            this.context.fillRect(x, y, cursorWidth, cursorHeight);
        }

        this.context.restore();
    }

    clear(): void {
        this.context.fillStyle = this.theme.background;
        // Clear with proper dimensions considering device pixel ratio
        this.context.fillRect(0, 0, this.canvas.width / this.devicePixelRatio, this.canvas.height / this.devicePixelRatio);
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
        // Input coordinates are in CSS pixels, no need to scale by device pixel ratio
        // The canvas coordinate system handles device pixel ratio internally
        
        const line = Math.floor(y / this.getLineHeight());
        const adjustedX = Math.max(0, x - this.getLineNumberWidth());
        
        // For more accurate positioning, we need to get the actual text of the line
        // and measure each character individually rather than using fixed charWidth
        const column = Math.round(adjustedX / this.charWidth);
        
        return { 
            line: Math.max(0, line), 
            column: Math.max(0, column)
        };
    }

    /**
     * More precise column calculation for a specific line of text
     */
    pixelToColumn(x: number, lineText: string): number {
        const adjustedX = Math.max(0, x - this.getLineNumberWidth());
        
        if (adjustedX <= 0 || lineText.length === 0) {
            return 0;
        }
        
        let currentX = 0;
        for (let i = 0; i < lineText.length; i++) {
            const char = lineText[i];
            const charWidth = this.context.measureText(char ?? '').width;
            
            // If we're past the halfway point of this character, select the next position
            if (adjustedX <= currentX + charWidth / 2) {
                return i;
            }
            
            currentX += charWidth;
        }
        
        // If we're past all characters, position at the end
        return lineText.length;
    }

    positionToPixel(line: number, column: number): { x: number; y: number } {
        // Use subpixel positioning for precise cursor placement
        const x = this.subpixelRound(this.getLineNumberWidth() + column * this.charWidth);
        const y = this.subpixelRound(line * this.getLineHeight());
        return { x, y };
    }

    setFontSize(size: number): void {
        this.fontSize = size;
        this.setupCanvas();
        this.measureCharWidth();
    }

    setTheme(theme: Theme | string): void {
        if (typeof theme === 'string') {
            const themeObj = getTheme(theme);
            if (themeObj) {
                this.theme = themeObj;
            } else {
                console.warn(`Theme '${theme}' not found, using default theme`);
                this.theme = defaultTheme;
            }
        } else {
            this.theme = theme;
        }
    }

    getAvailableThemes(): Record<string, ThemeEntry> {
        return themes;
    }

    resize(width: number, height: number): void {
        // Account for device pixel ratio for crisp rendering
        const displayWidth = width;
        const displayHeight = height;
        const scaledWidth = width * this.devicePixelRatio;
        const scaledHeight = height * this.devicePixelRatio;

        this.canvas.style.width = displayWidth + 'px';
        this.canvas.style.height = displayHeight + 'px';
        this.canvas.width = scaledWidth;
        this.canvas.height = scaledHeight;
        
        this.setupCanvas();
    }

    /**
     * Enable or disable subpixel text rendering
     */
    setSubpixelEnabled(enabled: boolean): void {
        this.subpixelEnabled = enabled;
        this.setupCanvas();
    }

    /**
     * Get subpixel rendering status
     */
    isSubpixelEnabled(): boolean {
        return this.subpixelEnabled;
    }

    /**
     * Round coordinates for optimal subpixel positioning
     */
    private subpixelRound(value: number): number {
        if (!this.subpixelEnabled) {
            return Math.round(value);
        }
        
        // For subpixel rendering, round to the nearest half-pixel for crisp lines
        // This helps with text clarity on high-DPI displays
        return Math.round(value * this.devicePixelRatio) / this.devicePixelRatio;
    }

    private setupCanvas(): void {
        // Scale context for device pixel ratio
        this.context.scale(this.devicePixelRatio, this.devicePixelRatio);
        
        // Setup font with subpixel rendering considerations
        const scaledFontSize = this.fontSize;
        this.context.font = `${scaledFontSize}px ${this.fontFamily}`;
        this.context.textBaseline = 'top';
        this.context.textAlign = 'left';
        
        // Configure text rendering for subpixel clarity
        if (this.subpixelEnabled) {
            // Enable font smoothing and subpixel antialiasing
            this.context.imageSmoothingEnabled = true;
            this.context.imageSmoothingQuality = 'high';
            
            // Use canvas context properties for better text rendering
            (this.context as any).textRenderingOptimization = 'optimizeLegibility';
        } else {
            // Disable smoothing for crisp pixel-perfect text
            this.context.imageSmoothingEnabled = false;
        }
        
        // Clear background
        this.context.fillStyle = this.theme.background;
        this.context.fillRect(0, 0, this.canvas.width / this.devicePixelRatio, this.canvas.height / this.devicePixelRatio);
    }

    private measureCharWidth(): void {
        this.context.font = `${this.fontSize}px ${this.fontFamily}`;
        const metrics = this.context.measureText('M');
        this.charWidth = metrics.width;
    }

    private renderToken(token: Token, x: number, y: number): void {
        const color = this.getTokenColor(token.type);
        this.context.fillStyle = color;
        
        // Use subpixel positioning for smoother text rendering
        const subpixelX = this.subpixelRound(x);
        const subpixelY = this.subpixelRound(y);
        
        this.context.fillText(token.value, subpixelX, subpixelY);
    }

    private renderLineNumber(lineNumber: number, y: number): void {
        const text = (lineNumber + 1).toString().padStart(3, ' ');
        this.context.fillStyle = this.theme.lineNumber;
        
        // Use subpixel positioning for line numbers
        const subpixelX = this.subpixelRound(10);
        const subpixelY = this.subpixelRound(y + this.fontSize);
        
        this.context.fillText(text, subpixelX, subpixelY);
    }

    /**
     * Multi-line aware selection renderer with subpixel precision
     */
    private renderSelectionForLine(
        lineNumber: number,
        y: number,
        range: SelectionRange,
        lineText: string
    ): void {
        if (lineNumber < range.startLine || lineNumber > range.endLine) return;

        let startCol = 0;
        let endCol = lineText.length;

        if (lineNumber === range.startLine) startCol = range.startColumn;
        if (lineNumber === range.endLine) endCol = range.endColumn;

        let x = this.getLineNumberWidth();

        for (let i = 0; i < lineText.length; i++) {
            const char = lineText[i];
            const charWidth = this.context.measureText(char ?? '').width;

            if (i >= startCol && i < endCol) {
                this.context.fillStyle = this.theme.selection;
                
                // Use subpixel positioning for selection rectangles
                const subpixelX = this.subpixelRound(x);
                const subpixelY = this.subpixelRound(y);
                const subpixelWidth = this.subpixelEnabled ? charWidth : Math.ceil(charWidth);
                
                this.context.fillRect(
                    subpixelX,
                    subpixelY,
                    subpixelWidth,
                    this.getLineHeight()
                );
            }
            x += charWidth;
        }
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
