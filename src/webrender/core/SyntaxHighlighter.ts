/**
 * Token represents a syntax-highlighted segment of text
 */
export interface Token {
  type: TokenType;
  value: string;
  start: number;
  end: number;
}

export enum TokenType {
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

/**
 * Language definition for syntax highlighting
 */
export interface LanguageDefinition {
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

/**
 * SyntaxHighlighter provides syntax highlighting for different programming languages
 */
export class SyntaxHighlighter {
  private languages: Map<string, LanguageDefinition> = new Map();

  constructor() {
    this.registerDefaultLanguages();
  }

  /**
   * Register a language definition
   */
  registerLanguage(language: LanguageDefinition): void {
    this.languages.set(language.name.toLowerCase(), language);
  }

  /**
   * Tokenize a line of text for syntax highlighting
   */
  tokenize(text: string, languageName: string): Token[] {
    const language = this.languages.get(languageName.toLowerCase());
    if (!language) {
      return [{ type: TokenType.TEXT, value: text, start: 0, end: text.length }];
    }

    const tokens: Token[] = [];
    let position = 0;

    while (position < text.length) {
      const char = text[position];
      if (!char) break;

      // Skip whitespace
      if (/\s/.test(char)) {
        const start = position;
        while (position < text.length && text[position] && /\s/.test(text[position]!)) {
          position++;
        }
        tokens.push({
          type: TokenType.WHITESPACE,
          value: text.substring(start, position),
          start,
          end: position
        });
        continue;
      }

      // Check for line comments
      if (language.lineComment && text.substring(position).startsWith(language.lineComment)) {
        tokens.push({
          type: TokenType.COMMENT,
          value: text.substring(position),
          start: position,
          end: text.length
        });
        break;
      }

      // Check for block comments start
      if (language.commentStart && text.substring(position).startsWith(language.commentStart)) {
        const start = position;
        position += language.commentStart.length;
        
        // Find comment end
        if (language.commentEnd) {
          const endIndex = text.indexOf(language.commentEnd, position);
          if (endIndex !== -1) {
            position = endIndex + language.commentEnd.length;
          } else {
            position = text.length;
          }
        } else {
          position = text.length;
        }

        tokens.push({
          type: TokenType.COMMENT,
          value: text.substring(start, position),
          start,
          end: position
        });
        continue;
      }

      // Check for string literals
      let isString = false;
      for (const delimiter of language.stringDelimiters) {
        if (text.substring(position).startsWith(delimiter)) {
          const start = position;
          position += delimiter.length;
          
          // Find string end
          while (position < text.length) {
            if (text.substring(position).startsWith(delimiter)) {
              position += delimiter.length;
              break;
            }
            // Handle escape sequences
            if (text[position] === '\\' && position + 1 < text.length) {
              position += 2;
            } else {
              position++;
            }
          }

          tokens.push({
            type: TokenType.STRING,
            value: text.substring(start, position),
            start,
            end: position
          });
          isString = true;
          break;
        }
      }

      if (isString) continue;

      // Check for numbers
      if (/\d/.test(char)) {
        const start = position;
        while (position < text.length && text[position] && /[\d.]/.test(text[position]!)) {
          position++;
        }
        tokens.push({
          type: TokenType.NUMBER,
          value: text.substring(start, position),
          start,
          end: position
        });
        continue;
      }

      // Check for operators
      let isOperator = false;
      for (const op of language.operators.sort((a, b) => b.length - a.length)) {
        if (text.substring(position).startsWith(op)) {
          tokens.push({
            type: TokenType.OPERATOR,
            value: op,
            start: position,
            end: position + op.length
          });
          position += op.length;
          isOperator = true;
          break;
        }
      }

      if (isOperator) continue;

      // Check for punctuation
      if (/[^\w\s]/.test(char)) {
        tokens.push({
          type: TokenType.PUNCTUATION,
          value: char,
          start: position,
          end: position + 1
        });
        position++;
        continue;
      }

      // Check for identifiers and keywords
      if (language.wordBoundary.test(char)) {
        const start = position;
        while (position < text.length && text[position] && language.wordBoundary.test(text[position]!)) {
          position++;
        }

        const word = text.substring(start, position);
        const wordToCheck = language.caseSensitive ? word : word.toLowerCase();
        
        let tokenType = TokenType.IDENTIFIER;
        if (language.keywords.has(wordToCheck)) {
          tokenType = TokenType.KEYWORD;
        } else if (this.isFunction(text, position)) {
          tokenType = TokenType.FUNCTION;
        } else if (this.isType(word)) {
          tokenType = TokenType.TYPE;
        }

        tokens.push({
          type: tokenType,
          value: word,
          start,
          end: position
        });
        continue;
      }

      // Default: treat as text
      tokens.push({
        type: TokenType.TEXT,
        value: char,
        start: position,
        end: position + 1
      });
      position++;
    }

    return tokens;
  }

  /**
   * Get available language names
   */
  getLanguages(): string[] {
    return Array.from(this.languages.keys());
  }

  /**
   * Check if a language is supported
   */
  isLanguageSupported(languageName: string): boolean {
    return this.languages.has(languageName.toLowerCase());
  }

  private isFunction(text: string, position: number): boolean {
    // Skip whitespace after the identifier
    let i = position;
    while (i < text.length && text[i] && /\s/.test(text[i]!)) {
      i++;
    }
    // Check if followed by opening parenthesis
    return i < text.length && text[i] === '(';
  }

  private isType(word: string): boolean {
    // Simple heuristic: types often start with uppercase
    return /^[A-Z]/.test(word);
  }

  private registerDefaultLanguages(): void {
    // JavaScript/TypeScript
    this.registerLanguage({
      name: 'javascript',
      keywords: new Set([
        'abstract', 'boolean', 'break', 'byte', 'case', 'catch', 'char', 'class',
        'const', 'continue', 'debugger', 'default', 'delete', 'do', 'double',
        'else', 'enum', 'export', 'extends', 'false', 'final', 'finally', 'float',
        'for', 'function', 'goto', 'if', 'implements', 'import', 'in', 'instanceof',
        'int', 'interface', 'let', 'long', 'native', 'new', 'null', 'package',
        'private', 'protected', 'public', 'return', 'short', 'static', 'super',
        'switch', 'synchronized', 'this', 'throw', 'throws', 'transient', 'true',
        'try', 'typeof', 'var', 'void', 'volatile', 'while', 'with', 'yield',
        'async', 'await'
      ]),
      operators: ['===', '!==', '==', '!=', '<=', '>=', '&&', '||', '++', '--', '=>', '...', '+=', '-=', '*=', '/=', '%=', '<', '>', '=', '+', '-', '*', '/', '%', '!', '&', '|', '^', '~', '<<', '>>', '>>>'],
      lineComment: '//',
      commentStart: '/*',
      commentEnd: '*/',
      stringDelimiters: ['"', "'", '`'],
      caseSensitive: true,
      wordBoundary: /[a-zA-Z_$]/
    });

    this.registerLanguage({
      name: 'typescript',
      keywords: new Set([
        'abstract', 'boolean', 'break', 'byte', 'case', 'catch', 'char', 'class',
        'const', 'continue', 'debugger', 'default', 'delete', 'do', 'double',
        'else', 'enum', 'export', 'extends', 'false', 'final', 'finally', 'float',
        'for', 'function', 'goto', 'if', 'implements', 'import', 'in', 'instanceof',
        'int', 'interface', 'let', 'long', 'native', 'new', 'null', 'package',
        'private', 'protected', 'public', 'return', 'short', 'static', 'super',
        'switch', 'synchronized', 'this', 'throw', 'throws', 'transient', 'true',
        'try', 'typeof', 'var', 'void', 'volatile', 'while', 'with', 'yield',
        'async', 'await', 'type', 'namespace', 'module', 'declare', 'readonly',
        'keyof', 'infer', 'is', 'asserts', 'unique', 'symbol', 'never', 'unknown',
        'any', 'string', 'number', 'object', 'undefined'
      ]),
      operators: ['===', '!==', '==', '!=', '<=', '>=', '&&', '||', '++', '--', '=>', '...', '+=', '-=', '*=', '/=', '%=', '<', '>', '=', '+', '-', '*', '/', '%', '!', '&', '|', '^', '~', '<<', '>>', '>>>', ':', '?'],
      lineComment: '//',
      commentStart: '/*',
      commentEnd: '*/',
      stringDelimiters: ['"', "'", '`'],
      caseSensitive: true,
      wordBoundary: /[a-zA-Z_$]/
    });

    // Python
    this.registerLanguage({
      name: 'python',
      keywords: new Set([
        'and', 'as', 'assert', 'break', 'class', 'continue', 'def', 'del', 'elif',
        'else', 'except', 'exec', 'finally', 'for', 'from', 'global', 'if',
        'import', 'in', 'is', 'lambda', 'not', 'or', 'pass', 'print', 'raise',
        'return', 'try', 'while', 'with', 'yield', 'False', 'None', 'True',
        'async', 'await', 'nonlocal'
      ]),
      operators: ['==', '!=', '<=', '>=', '//', '**', '+=', '-=', '*=', '/=', '%=', '//=', '**=', '<', '>', '=', '+', '-', '*', '/', '%', '!', '&', '|', '^', '~', '<<', '>>'],
      lineComment: '#',
      stringDelimiters: ['"', "'", '"""', "'''"],
      caseSensitive: true,
      wordBoundary: /[a-zA-Z_]/
    });

    // JSON
    this.registerLanguage({
      name: 'json',
      keywords: new Set(['true', 'false', 'null']),
      operators: [':'],
      stringDelimiters: ['"'],
      caseSensitive: true,
      wordBoundary: /[a-zA-Z_]/
    });
  }
}