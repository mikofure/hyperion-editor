/**
 * Main i18n integration for MikoEditor
 * Combines PO parser, context menu, and editor integration
 */

export * from './po-parser.js';
export * from './context-menu.js';

import { I18n } from './po-parser.js';
import { ContextMenuManager } from './context-menu.js';
import type { ContextMenuItem } from './context-menu.js';

/**
 * Global i18n manager for MikoEditor
 */
export class MikoEditorI18n {
  private i18n: I18n;
  private contextMenuManager: ContextMenuManager;
  private availableLocales: string[] = ['en', 'es', 'fr', 'th'];
  private currentLocale: string = 'en';
  
  constructor(initialLocale: string = 'en') {
    this.currentLocale = initialLocale;
    this.i18n = new I18n(initialLocale);
    this.contextMenuManager = new ContextMenuManager();
    this.contextMenuManager.setI18n(this.i18n);
  }
  
  /**
   * Load locale from PO file URL
   */
  async loadLocale(locale: string, url?: string): Promise<void> {
    try {
      const poUrl = url || `./locales/${locale}.po`;
      await this.i18n.loadPOFromUrl(poUrl);
      this.i18n.setLocale(locale);
      this.currentLocale = locale;
      
      // Update all context menus
      this.contextMenuManager.setI18n(this.i18n);
      
      console.log(`Locale ${locale} loaded successfully`);
    } catch (error) {
      console.error(`Failed to load locale ${locale}:`, error);
    }
  }
  
  /**
   * Get available locales
   */
  getAvailableLocales(): string[] {
    return [...this.availableLocales];
  }
  
  /**
   * Get current locale
   */
  getCurrentLocale(): string {
    return this.currentLocale;
  }
  
  /**
   * Get i18n instance
   */
  getI18n(): I18n {
    return this.i18n;
  }
  
  /**
   * Set current locale
   */
  setLocale(locale: string): void {
    if (this.availableLocales.includes(locale)) {
      this.i18n.setLocale(locale);
      this.currentLocale = locale;
      this.contextMenuManager.setI18n(this.i18n);
    }
  }
  
  /**
   * Translate text
   */
  t(key: string, context?: string): string {
    return this.i18n.t(key, context);
  }
  
  /**
   * Translate with plurals
   */
  tn(singular: string, plural: string, count: number, context?: string): string {
    return this.i18n.tn(singular, plural, count, context);
  }
  
  /**
   * Get context menu manager
   */
  getContextMenuManager(): ContextMenuManager {
    return this.contextMenuManager;
  }
  
  /**
   * Create standard editor context menu items
   */
  createEditorContextMenu(): ContextMenuItem[] {
    return [
      {
        id: 'undo',
        labelKey: 'undo',
        label: 'Undo',
        icon: '↶',
        shortcut: 'Ctrl+Z',
        action: (item, event) => {
          console.log('Undo action');
          // Will be connected to editor instance
        }
      },
      {
        id: 'redo',
        labelKey: 'redo',
        label: 'Redo',
        icon: '↷',
        shortcut: 'Ctrl+Y',
        action: (item, event) => {
          console.log('Redo action');
          // Will be connected to editor instance
        }
      },
      { id: 'sep1', label: '', separator: true },
      {
        id: 'cut',
        labelKey: 'cut',
        label: 'Cut',
        icon: '✂',
        shortcut: 'Ctrl+X',
        action: (item, event) => {
          console.log('Cut action');
          // Will be connected to editor instance
        }
      },
      {
        id: 'copy',
        labelKey: 'copy',
        label: 'Copy',
        icon: '📋',
        shortcut: 'Ctrl+C',
        action: (item, event) => {
          console.log('Copy action');
          // Will be connected to editor instance
        }
      },
      {
        id: 'paste',
        labelKey: 'paste',
        label: 'Paste',
        icon: '📄',
        shortcut: 'Ctrl+V',
        action: (item, event) => {
          console.log('Paste action');
          // Will be connected to editor instance
        }
      },
      { id: 'sep2', label: '', separator: true },
      {
        id: 'select_all',
        labelKey: 'select_all',
        label: 'Select All',
        icon: '⬜',
        shortcut: 'Ctrl+A',
        action: (item, event) => {
          console.log('Select all action');
          // Will be connected to editor instance
        }
      },
      { id: 'sep3', label: '', separator: true },
      {
        id: 'find',
        labelKey: 'find',
        label: 'Find',
        icon: '🔍',
        shortcut: 'Ctrl+F',
        action: (item, event) => {
          console.log('Find action');
          // Will be connected to editor instance
        }
      },
      {
        id: 'find_replace',
        labelKey: 'find_replace',
        label: 'Find and Replace',
        icon: '🔄',
        shortcut: 'Ctrl+H',
        action: (item, event) => {
          console.log('Find and replace action');
          // Will be connected to editor instance
        }
      }
    ];
  }
  
  /**
   * Create language selection submenu
   */
  createLanguageMenu(): ContextMenuItem[] {
    const localeNames: Record<string, string> = {
      'en': 'English',
      'es': 'Español',
      'fr': 'Français'
    };
    
    return this.availableLocales.map(locale => ({
      id: `lang_${locale}`,
      label: localeNames[locale] || locale,
      icon: this.currentLocale === locale ? '✓' : '',
      action: (item, event) => {
        this.loadLocale(locale);
      }
    }));
  }
  
  /**
   * Create theme selection submenu
   */
  createThemeMenu(): ContextMenuItem[] {
    return [
      {
        id: 'theme_light',
        labelKey: 'light_theme',
        label: 'Light Theme',
        icon: '☀️',
        action: (item, event) => {
          console.log('Set light theme');
          // Will be connected to editor instance
        }
      },
      {
        id: 'theme_dark',
        labelKey: 'dark_theme',
        label: 'Dark Theme',
        icon: '🌙',
        action: (item, event) => {
          console.log('Set dark theme');
          // Will be connected to editor instance
        }
      },
      {
        id: 'theme_auto',
        labelKey: 'auto_theme',
        label: 'Auto Theme',
        icon: '🔄',
        action: (item, event) => {
          console.log('Set auto theme');
          // Will be connected to editor instance
        }
      }
    ];
  }
  
  /**
   * Create cursor animation submenu
   */
  createCursorAnimationMenu(): ContextMenuItem[] {
    return [
      {
        id: 'cursor_blink',
        labelKey: 'cursor_blink',
        label: 'Blink',
        icon: '👁️',
        action: (item, event) => {
          console.log('Set cursor blink animation');
          // Will be connected to editor instance
        }
      },
      {
        id: 'cursor_fade',
        labelKey: 'cursor_fade',
        label: 'Fade',
        icon: '🌅',
        action: (item, event) => {
          console.log('Set cursor fade animation');
          // Will be connected to editor instance
        }
      },
      {
        id: 'cursor_pulse',
        labelKey: 'cursor_pulse',
        label: 'Pulse',
        icon: '💓',
        action: (item, event) => {
          console.log('Set cursor pulse animation');
          // Will be connected to editor instance
        }
      }
    ];
  }
  
  /**
   * Create full editor context menu with submenus
   */
  createFullEditorContextMenu(): ContextMenuItem[] {
    const baseMenu = this.createEditorContextMenu();
    
    // Add submenus
    baseMenu.push(
      { id: 'sep4', label: '', separator: true },
      {
        id: 'language_menu',
        labelKey: 'set_language',
        label: 'Set Language',
        icon: '🌐',
        submenu: this.createLanguageMenu()
      },
      {
        id: 'theme_menu',
        labelKey: 'set_theme',
        label: 'Set Theme',
        icon: '🎨',
        submenu: this.createThemeMenu()
      },
      {
        id: 'cursor_menu',
        labelKey: 'cursor_animation',
        label: 'Cursor Animation',
        icon: '↕️',
        submenu: this.createCursorAnimationMenu()
      }
    );
    
    return baseMenu;
  }
  
  /**
   * Auto-detect browser language
   */
  detectBrowserLanguage(): string {
    const browserLang = navigator.language?.split('-')[0] || 'en';
    return this.availableLocales.includes(browserLang) ? browserLang : 'en';
  }
  
  /**
   * Initialize with browser language detection
   */
  async initialize(): Promise<void> {
    const detectedLang = this.detectBrowserLanguage();
    await this.loadLocale(detectedLang);
  }
}

// Create global instance
export const mikoEditorI18n = new MikoEditorI18n();

/**
 * Helper functions for easy access
 */
export const t = (key: string, context?: string): string => {
  return mikoEditorI18n.t(key, context);
};

export const tn = (singular: string, plural: string, count: number, context?: string): string => {
  return mikoEditorI18n.tn(singular, plural, count, context);
};