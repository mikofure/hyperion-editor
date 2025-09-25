/**
 * PO (Portable Object) file parser and translator
 * Implements GNU gettext .po file format without external dependencies
 */

export interface POEntry {
  msgid: string;
  msgstr: string;
  msgctxt?: string;
  msgid_plural?: string;
  msgstr_plural?: string[];
  comments?: string[];
  references?: string[];
  flags?: string[];
}

export interface POData {
  headers: Record<string, string>;
  entries: Map<string, POEntry>;
}

export class POParser {
  /**
   * Parse a .po file content string
   */
  static parse(content: string): POData {
    const lines = content.split('\n');
    const entries = new Map<string, POEntry>();
    const headers: Record<string, string> = {};
    
    let currentEntry: Partial<POEntry> | null = null;
    let currentField: string | null = null;
    let isHeader = true;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]?.trim() || '';
      
      // Skip empty lines and comments that don't belong to an entry
      if (!line) {
        if (currentEntry && currentEntry.msgid !== undefined) {
          this.finalizeEntry(currentEntry, entries);
          currentEntry = null;
        }
        continue;
      }
      
      // Handle comments
      if (line.startsWith('#')) {
        if (!currentEntry) currentEntry = {};
        
        if (line.startsWith('#.')) {
          // Extracted comment
          if (!currentEntry.comments) currentEntry.comments = [];
          currentEntry.comments.push(line.substring(2).trim());
        } else if (line.startsWith('#:')) {
          // Reference
          if (!currentEntry.references) currentEntry.references = [];
          currentEntry.references.push(line.substring(2).trim());
        } else if (line.startsWith('#,')) {
          // Flag
          if (!currentEntry.flags) currentEntry.flags = [];
          currentEntry.flags.push(...line.substring(2).trim().split(',').map(f => f.trim()));
        }
        continue;
      }
      
      // Handle msgctxt
      if (line.startsWith('msgctxt ')) {
        if (currentEntry && currentEntry.msgid !== undefined) {
          this.finalizeEntry(currentEntry, entries);
        }
        currentEntry = {};
        currentEntry.msgctxt = this.parseQuotedString(line.substring(8));
        currentField = 'msgctxt';
        isHeader = false;
        continue;
      }
      
      // Handle msgid
      if (line.startsWith('msgid ')) {
        if (currentEntry && currentEntry.msgid !== undefined) {
          this.finalizeEntry(currentEntry, entries);
        }
        if (!currentEntry) currentEntry = {};
        currentEntry.msgid = this.parseQuotedString(line.substring(6));
        currentField = 'msgid';
        isHeader = currentEntry.msgid === '';
        continue;
      }
      
      // Handle msgid_plural
      if (line.startsWith('msgid_plural ')) {
        if (!currentEntry) continue;
        currentEntry.msgid_plural = this.parseQuotedString(line.substring(13));
        currentField = 'msgid_plural';
        continue;
      }
      
      // Handle msgstr
      if (line.startsWith('msgstr ')) {
        if (!currentEntry) continue;
        const msgstr = this.parseQuotedString(line.substring(7));
        
        if (isHeader && currentEntry.msgid === '') {
          // Parse headers from empty msgid
          this.parseHeaders(msgstr, headers);
        } else {
          currentEntry.msgstr = msgstr;
        }
        currentField = 'msgstr';
        continue;
      }
      
      // Handle msgstr[n]
      if (line.match(/^msgstr\[\d+\] /)) {
        if (!currentEntry) continue;
        const match = line.match(/^msgstr\[(\d+)\] (.*)$/);
        if (match && match[1] && match[2] !== undefined) {
          const index = parseInt(match[1]);
          const value = this.parseQuotedString(match[2]);
          if (!currentEntry.msgstr_plural) currentEntry.msgstr_plural = [];
          currentEntry.msgstr_plural[index] = value;
          currentField = `msgstr[${index}]`;
        }
        continue;
      }
      
      // Handle continuation lines (quoted strings)
      if (line.startsWith('"') && currentField && currentEntry) {
        const value = this.parseQuotedString(line);
        
        if (currentField === 'msgid') {
          currentEntry.msgid = (currentEntry.msgid || '') + value;
        } else if (currentField === 'msgstr') {
          if (isHeader && currentEntry.msgid === '') {
            this.parseHeaders(value, headers);
          } else {
            currentEntry.msgstr = (currentEntry.msgstr || '') + value;
          }
        } else if (currentField === 'msgctxt') {
          currentEntry.msgctxt = (currentEntry.msgctxt || '') + value;
        } else if (currentField === 'msgid_plural') {
          currentEntry.msgid_plural = (currentEntry.msgid_plural || '') + value;
        } else if (currentField.startsWith('msgstr[')) {
          const match = currentField.match(/msgstr\[(\d+)\]/);
          if (match && match[1] && currentEntry.msgstr_plural) {
            const index = parseInt(match[1]);
            currentEntry.msgstr_plural[index] = (currentEntry.msgstr_plural[index] || '') + value;
          }
        }
      }
    }
    
    // Finalize last entry
    if (currentEntry && currentEntry.msgid !== undefined) {
      this.finalizeEntry(currentEntry, entries);
    }
    
    return { headers, entries };
  }
  
  private static parseQuotedString(str: string): string {
    // Remove surrounding quotes and unescape
    if (str.startsWith('"') && str.endsWith('"')) {
      str = str.slice(1, -1);
    }
    
    return str
      .replace(/\\n/g, '\n')
      .replace(/\\t/g, '\t')
      .replace(/\\r/g, '\r')
      .replace(/\\"/g, '"')
      .replace(/\\\\/g, '\\');
  }
  
  private static parseHeaders(headerString: string, headers: Record<string, string>): void {
    const lines = headerString.split('\\n');
    for (const line of lines) {
      const colonIndex = line.indexOf(':');
      if (colonIndex > 0) {
        const key = line.substring(0, colonIndex).trim();
        const value = line.substring(colonIndex + 1).trim();
        headers[key] = value;
      }
    }
  }
  
  private static finalizeEntry(entry: Partial<POEntry>, entries: Map<string, POEntry>): void {
    if (!entry.msgid) return;
    
    const key = entry.msgctxt ? `${entry.msgctxt}\x04${entry.msgid}` : entry.msgid;
    
    entries.set(key, {
      msgid: entry.msgid,
      msgstr: entry.msgstr || '',
      msgctxt: entry.msgctxt,
      msgid_plural: entry.msgid_plural,
      msgstr_plural: entry.msgstr_plural,
      comments: entry.comments,
      references: entry.references,
      flags: entry.flags
    });
  }
}

/**
 * Simple internationalization class
 */
export class I18n {
  private data: POData | null = null;
  private locale: string = 'en';
  private fallbackLocale: string = 'en';
  
  constructor(locale: string = 'en', fallbackLocale: string = 'en') {
    this.locale = locale;
    this.fallbackLocale = fallbackLocale;
  }
  
  /**
   * Load translations from PO file content
   */
  loadPO(content: string): void {
    this.data = POParser.parse(content);
  }
  
  /**
   * Load translations from PO file URL
   */
  async loadPOFromUrl(url: string): Promise<void> {
    try {
      const response = await fetch(url);
      const content = await response.text();
      this.loadPO(content);
    } catch (error) {
      console.error('Failed to load PO file:', error);
    }
  }
  
  /**
   * Translate a message
   */
  t(msgid: string, context?: string): string {
    if (!this.data) return msgid;
    
    const key = context ? `${context}\x04${msgid}` : msgid;
    const entry = this.data.entries.get(key);
    
    if (entry && entry.msgstr) {
      return entry.msgstr;
    }
    
    // Fallback to original message
    return msgid;
  }
  
  /**
   * Translate a message with plural forms
   */
  tn(msgid: string, msgidPlural: string, count: number, context?: string): string {
    if (!this.data) return count === 1 ? msgid : msgidPlural;
    
    const key = context ? `${context}\x04${msgid}` : msgid;
    const entry = this.data.entries.get(key);
    
    if (entry && entry.msgstr_plural) {
      const pluralIndex = this.getPluralIndex(count);
      return entry.msgstr_plural[pluralIndex] || (count === 1 ? msgid : msgidPlural);
    }
    
    // Fallback
    return count === 1 ? msgid : msgidPlural;
  }
  
  /**
   * Get current locale
   */
  getLocale(): string {
    return this.locale;
  }
  
  /**
   * Set current locale
   */
  setLocale(locale: string): void {
    this.locale = locale;
  }
  
  /**
   * Get plural index for a given count (English rules by default)
   */
  private getPluralIndex(count: number): number {
    // Simple English plural rules (n != 1)
    // More complex rules should be parsed from PO headers
    return count === 1 ? 0 : 1;
  }
  
  /**
   * Get available locales info
   */
  getInfo(): { locale: string; headers: Record<string, string> } {
    return {
      locale: this.locale,
      headers: this.data?.headers || {}
    };
  }
}