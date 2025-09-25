/**
 * Context Menu System with i18n support
 * Pure DOM implementation without frameworks
 */

import type { I18n } from './po-parser.js';

export interface ContextMenuItem {
  id: string;
  label: string;
  labelKey?: string; // i18n key
  icon?: string;
  shortcut?: string;
  disabled?: boolean;
  separator?: boolean;
  submenu?: ContextMenuItem[];
  action?: (item: ContextMenuItem, event: MouseEvent) => void;
}

export interface ContextMenuOptions {
  className?: string;
  theme?: 'light' | 'dark' | 'auto';
  maxHeight?: number;
  showIcons?: boolean;
  showShortcuts?: boolean;
}

export class ContextMenu {
  private element: HTMLElement | null = null;
  private isVisible: boolean = false;
  private i18n: I18n | null = null;
  private options: ContextMenuOptions;
  
  constructor(options: ContextMenuOptions = {}) {
    this.options = {
      className: 'context-menu',
      theme: 'auto',
      maxHeight: 300,
      showIcons: true,
      showShortcuts: true,
      ...options
    };
    
    this.setupStyles();
    this.bindGlobalEvents();
  }
  
  /**
   * Set i18n instance for translations
   */
  setI18n(i18n: I18n): void {
    this.i18n = i18n;
  }
  
  /**
   * Show context menu at specified position
   */
  show(x: number, y: number, items: ContextMenuItem[]): void {
    this.hide(); // Hide any existing menu
    
    this.element = this.createElement(items);
    document.body.appendChild(this.element);
    
    // Position the menu
    this.positionMenu(x, y);
    
    this.isVisible = true;
    
    // Animate in
    requestAnimationFrame(() => {
      if (this.element) {
        this.element.classList.add('context-menu--visible');
      }
    });
  }
  
  /**
   * Hide context menu
   */
  hide(): void {
    if (this.element && this.isVisible) {
      this.element.classList.remove('context-menu--visible');
      
      // Wait for animation to complete
      setTimeout(() => {
        if (this.element && this.element.parentNode) {
          this.element.parentNode.removeChild(this.element);
        }
        this.element = null;
        this.isVisible = false;
      }, 150);
    }
  }
  
  /**
   * Check if menu is visible
   */
  isOpen(): boolean {
    return this.isVisible;
  }
  
  /**
   * Create menu element
   */
  private createElement(items: ContextMenuItem[]): HTMLElement {
    const menu = document.createElement('div');
    menu.className = `${this.options.className} context-menu--${this.options.theme}`;
    menu.setAttribute('role', 'menu');
    menu.setAttribute('tabindex', '-1');
    
    if (this.options.maxHeight) {
      menu.style.maxHeight = `${this.options.maxHeight}px`;
    }
    
    items.forEach((item, index) => {
      if (item.separator) {
        const separator = document.createElement('div');
        separator.className = 'context-menu__separator';
        separator.setAttribute('role', 'separator');
        menu.appendChild(separator);
      } else {
        const menuItem = this.createMenuItem(item);
        menu.appendChild(menuItem);
      }
    });
    
    return menu;
  }
  
  /**
   * Create individual menu item
   */
  private createMenuItem(item: ContextMenuItem): HTMLElement {
    const menuItem = document.createElement('div');
    menuItem.className = 'context-menu__item';
    menuItem.setAttribute('role', 'menuitem');
    menuItem.setAttribute('tabindex', '-1');
    menuItem.setAttribute('data-item-id', item.id);
    
    if (item.disabled) {
      menuItem.classList.add('context-menu__item--disabled');
      menuItem.setAttribute('aria-disabled', 'true');
    }
    
    if (item.submenu && item.submenu.length > 0) {
      menuItem.classList.add('context-menu__item--has-submenu');
      menuItem.setAttribute('aria-haspopup', 'true');
    }
    
    // Icon
    if (this.options.showIcons && item.icon) {
      const icon = document.createElement('span');
      icon.className = 'context-menu__icon';
      icon.innerHTML = item.icon;
      menuItem.appendChild(icon);
    } else if (this.options.showIcons) {
      const iconPlaceholder = document.createElement('span');
      iconPlaceholder.className = 'context-menu__icon context-menu__icon--placeholder';
      menuItem.appendChild(iconPlaceholder);
    }
    
    // Label
    const label = document.createElement('span');
    label.className = 'context-menu__label';
    const labelText = item.labelKey && this.i18n 
      ? this.i18n.t(item.labelKey) 
      : item.label;
    label.textContent = labelText;
    menuItem.appendChild(label);
    
    // Shortcut
    if (this.options.showShortcuts && item.shortcut) {
      const shortcut = document.createElement('span');
      shortcut.className = 'context-menu__shortcut';
      shortcut.textContent = item.shortcut;
      menuItem.appendChild(shortcut);
    }
    
    // Submenu arrow
    if (item.submenu && item.submenu.length > 0) {
      const arrow = document.createElement('span');
      arrow.className = 'context-menu__arrow';
      arrow.innerHTML = '▶';
      menuItem.appendChild(arrow);
    }
    
    // Event listeners
    this.bindItemEvents(menuItem, item);
    
    return menuItem;
  }
  
  /**
   * Bind events to menu item
   */
  private bindItemEvents(element: HTMLElement, item: ContextMenuItem): void {
    // Click event
    element.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      if (item.disabled) return;
      
      if (item.action) {
        item.action(item, e as MouseEvent);
      }
      
      if (!item.submenu || item.submenu.length === 0) {
        this.hide();
      }
    });
    
    // Hover events for submenu
    if (item.submenu && item.submenu.length > 0) {
      let submenuTimer: number | null = null;
      let submenuElement: HTMLElement | null = null;
      
      element.addEventListener('mouseenter', () => {
        if (submenuTimer) clearTimeout(submenuTimer);
        
        submenuTimer = window.setTimeout(() => {
          if (submenuElement) {
            submenuElement.remove();
          }
          
          submenuElement = this.createElement(item.submenu!);
          submenuElement.classList.add('context-menu--submenu');
          element.appendChild(submenuElement);
          
          // Position submenu
          const rect = element.getBoundingClientRect();
          submenuElement.style.left = `${rect.width - 4}px`;
          submenuElement.style.top = '0px';
          
          requestAnimationFrame(() => {
            if (submenuElement) {
              submenuElement.classList.add('context-menu--visible');
            }
          });
        }, 200);
      });
      
      element.addEventListener('mouseleave', (e) => {
        if (submenuTimer) clearTimeout(submenuTimer);
        
        // Check if mouse is entering submenu
        const relatedTarget = e.relatedTarget as HTMLElement;
        if (submenuElement && submenuElement.contains(relatedTarget)) {
          return;
        }
        
        submenuTimer = window.setTimeout(() => {
          if (submenuElement) {
            submenuElement.classList.remove('context-menu--visible');
            setTimeout(() => {
              if (submenuElement && submenuElement.parentNode) {
                submenuElement.remove();
              }
              submenuElement = null;
            }, 150);
          }
        }, 200);
      });
    }
    
    // Keyboard navigation
    element.addEventListener('keydown', (e) => {
      switch (e.key) {
        case 'Enter':
        case ' ':
          e.preventDefault();
          element.click();
          break;
        case 'ArrowDown':
          e.preventDefault();
          this.focusNextItem(element);
          break;
        case 'ArrowUp':
          e.preventDefault();
          this.focusPreviousItem(element);
          break;
        case 'Escape':
          e.preventDefault();
          this.hide();
          break;
      }
    });
  }
  
  /**
   * Position menu on screen
   */
  private positionMenu(x: number, y: number): void {
    if (!this.element) return;
    
    // Initial positioning
    this.element.style.left = `${x}px`;
    this.element.style.top = `${y}px`;
    
    // Get dimensions after adding to DOM
    const rect = this.element.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // Adjust horizontal position if menu goes off-screen
    if (rect.right > viewportWidth) {
      const newX = Math.max(0, x - rect.width);
      this.element.style.left = `${newX}px`;
    }
    
    // Adjust vertical position if menu goes off-screen
    if (rect.bottom > viewportHeight) {
      const newY = Math.max(0, y - rect.height);
      this.element.style.top = `${newY}px`;
    }
  }
  
  /**
   * Focus next menu item
   */
  private focusNextItem(currentElement: HTMLElement): void {
    if (!this.element) return;
    
    const items = Array.from(this.element.querySelectorAll('.context-menu__item:not(.context-menu__item--disabled)'));
    const currentIndex = items.indexOf(currentElement);
    const nextIndex = (currentIndex + 1) % items.length;
    
    (items[nextIndex] as HTMLElement)?.focus();
  }
  
  /**
   * Focus previous menu item
   */
  private focusPreviousItem(currentElement: HTMLElement): void {
    if (!this.element) return;
    
    const items = Array.from(this.element.querySelectorAll('.context-menu__item:not(.context-menu__item--disabled)'));
    const currentIndex = items.indexOf(currentElement);
    const prevIndex = currentIndex === 0 ? items.length - 1 : currentIndex - 1;
    
    (items[prevIndex] as HTMLElement)?.focus();
  }
  
  /**
   * Bind global events
   */
  private bindGlobalEvents(): void {
    document.addEventListener('click', (e) => {
      if (this.isVisible && this.element && !this.element.contains(e.target as Node)) {
        this.hide();
      }
    });
    
    document.addEventListener('contextmenu', (e) => {
      // Let the application handle context menu events
      // Don't auto-hide here
    });
    
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isVisible) {
        this.hide();
      }
    });
    
    window.addEventListener('resize', () => {
      if (this.isVisible) {
        this.hide();
      }
    });
    
    window.addEventListener('scroll', () => {
      if (this.isVisible) {
        this.hide();
      }
    });
  }
  
  /**
   * Setup default styles
   */
  private setupStyles(): void {
    const styleId = 'context-menu-styles';
    if (document.getElementById(styleId)) return;
    
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      .context-menu {
        position: fixed;
        z-index: 10000;
        min-width: 180px;
        max-width: 300px;
        border-radius: 6px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
        backdrop-filter: blur(8px);
        padding: 4px;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        font-size: 13px;
        line-height: 1.4;
        opacity: 0;
        transform: scale(0.9);
        transition: opacity 150ms ease, transform 150ms ease;
        overflow-y: auto;
        scrollbar-width: thin;
      }
      
      .context-menu--visible {
        opacity: 1;
        transform: scale(1);
      }
      
      .context-menu--light {
        background: rgba(255, 255, 255, 0.95);
        border: 1px solid rgba(0, 0, 0, 0.1);
        color: #333;
      }
      
      .context-menu--dark {
        background: rgba(45, 45, 45, 0.95);
        border: 1px solid rgba(255, 255, 255, 0.1);
        color: #fff;
      }
      
      .context-menu--auto {
        background: rgba(255, 255, 255, 0.95);
        border: 1px solid rgba(0, 0, 0, 0.1);
        color: #333;
      }
      
      @media (prefers-color-scheme: dark) {
        .context-menu--auto {
          background: rgba(45, 45, 45, 0.95);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #fff;
        }
      }
      
      .context-menu__item {
        display: flex;
        align-items: center;
        padding: 8px 12px;
        border-radius: 4px;
        cursor: pointer;
        position: relative;
        outline: none;
        transition: background-color 100ms ease;
        min-height: 28px;
      }
      
      .context-menu__item:hover {
        background: rgba(0, 0, 0, 0.08);
      }
      
      .context-menu--dark .context-menu__item:hover {
        background: rgba(255, 255, 255, 0.08);
      }
      
      @media (prefers-color-scheme: dark) {
        .context-menu--auto .context-menu__item:hover {
          background: rgba(255, 255, 255, 0.08);
        }
      }
      
      .context-menu__item:focus {
        background: rgba(0, 120, 212, 0.1);
        box-shadow: 0 0 0 1px rgba(0, 120, 212, 0.3);
      }
      
      .context-menu__item--disabled {
        opacity: 0.5;
        cursor: not-allowed;
        pointer-events: none;
      }
      
      .context-menu__item--has-submenu::after {
        content: '';
        margin-left: auto;
      }
      
      .context-menu__icon {
        width: 16px;
        height: 16px;
        margin-right: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }
      
      .context-menu__icon--placeholder {
        opacity: 0;
      }
      
      .context-menu__label {
        flex: 1;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      
      .context-menu__shortcut {
        margin-left: auto;
        font-size: 11px;
        opacity: 0.6;
        padding-left: 16px;
      }
      
      .context-menu__arrow {
        margin-left: auto;
        opacity: 0.6;
        font-size: 10px;
      }
      
      .context-menu__separator {
        height: 1px;
        margin: 4px 8px;
        background: rgba(0, 0, 0, 0.1);
      }
      
      .context-menu--dark .context-menu__separator {
        background: rgba(255, 255, 255, 0.1);
      }
      
      @media (prefers-color-scheme: dark) {
        .context-menu--auto .context-menu__separator {
          background: rgba(255, 255, 255, 0.1);
        }
      }
      
      .context-menu--submenu {
        position: absolute;
        margin-left: 0;
      }
      
      /* Scrollbar styles */
      .context-menu::-webkit-scrollbar {
        width: 6px;
      }
      
      .context-menu::-webkit-scrollbar-track {
        background: transparent;
      }
      
      .context-menu::-webkit-scrollbar-thumb {
        background: rgba(0, 0, 0, 0.2);
        border-radius: 3px;
      }
      
      .context-menu--dark::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.2);
      }
    `;
    
    document.head.appendChild(style);
  }
}

/**
 * Context menu manager for handling multiple menus
 */
export class ContextMenuManager {
  private menus: Map<string, ContextMenu> = new Map();
  private i18n: I18n | null = null;
  
  /**
   * Set i18n instance for all menus
   */
  setI18n(i18n: I18n): void {
    this.i18n = i18n;
    this.menus.forEach(menu => menu.setI18n(i18n));
  }
  
  /**
   * Create or get a context menu
   */
  getMenu(id: string, options?: ContextMenuOptions): ContextMenu {
    if (!this.menus.has(id)) {
      const menu = new ContextMenu(options);
      if (this.i18n) {
        menu.setI18n(this.i18n);
      }
      this.menus.set(id, menu);
    }
    return this.menus.get(id)!;
  }
  
  /**
   * Hide all menus
   */
  hideAll(): void {
    this.menus.forEach(menu => menu.hide());
  }
  
  /**
   * Remove a menu
   */
  removeMenu(id: string): void {
    const menu = this.menus.get(id);
    if (menu) {
      menu.hide();
      this.menus.delete(id);
    }
  }
}