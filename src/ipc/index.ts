/**
 * IPC (Inter-Process Communication) support for MikoEditor
 * Supports both Electron and CEF (Chromium Embedded Framework)
 */

export * from './electronipc.js';
export * from './chromeipc.js';

// Common IPC interface
export interface IPCMessage {
  id: string;
  channel: string;
  data: any;
  timestamp: number;
}

export interface IPCResponse {
  id: string;
  success: boolean;
  data?: any;
  error?: string;
  timestamp: number;
}

export interface IPCHandler {
  (data: any): Promise<any> | any;
}

export interface IPCProvider {
  /**
   * Send a message to the main process
   */
  send(channel: string, data: any): Promise<any>;
  
  /**
   * Register a handler for incoming messages
   */
  on(channel: string, handler: IPCHandler): void;
  
  /**
   * Remove a handler for a channel
   */
  off(channel: string, handler: IPCHandler): void;
  
  /**
   * Check if IPC is available in current environment
   */
  isAvailable(): boolean;
  
  /**
   * Get the provider type
   */
  getType(): 'electron' | 'cef' | 'none';
}

export interface EditorIPCAPI {
  // File operations
  openFile(): Promise<{ path: string; content: string } | null>;
  saveFile(path: string, content: string): Promise<boolean>;
  saveAsFile(content: string): Promise<{ path: string; saved: boolean } | null>;
  
  // Recent files
  getRecentFiles(): Promise<string[]>;
  addRecentFile(path: string): Promise<void>;
  
  // Theme and settings
  getTheme(): Promise<'light' | 'dark' | 'auto'>;
  setTheme(theme: 'light' | 'dark' | 'auto'): Promise<void>;
  getSettings(): Promise<any>;
  setSettings(settings: any): Promise<void>;
  
  // Window operations
  minimize(): Promise<void>;
  maximize(): Promise<void>;
  close(): Promise<void>;
  setTitle(title: string): Promise<void>;
  
  // System integration
  showNotification(title: string, body: string): Promise<void>;
  showErrorDialog(title: string, message: string): Promise<void>;
  showInfoDialog(title: string, message: string): Promise<void>;
  
  // Development
  openDevTools(): Promise<void>;
  reload(): Promise<void>;
}

/**
 * Create IPC provider based on available environment
 */
export function createIPCProvider(): IPCProvider {
  // Check for Electron
  if (typeof window !== 'undefined' && window.electronAPI) {
    const { ElectronIPCProvider } = require('./electronipc.js');
    return new ElectronIPCProvider();
  }
  
  // Check for CEF
  if (typeof window !== 'undefined' && window.cefQuery) {
    const { ChromeIPCProvider } = require('./chromeipc.js');
    return new ChromeIPCProvider();
  }
  
  // Fallback - no IPC available
  return new NoIPCProvider();
}

/**
 * Fallback provider when no IPC is available
 */
class NoIPCProvider implements IPCProvider {
  async send(channel: string, data: any): Promise<any> {
    console.warn('IPC not available - cannot send message to channel:', channel);
    return null;
  }
  
  on(channel: string, handler: IPCHandler): void {
    console.warn('IPC not available - cannot register handler for channel:', channel);
  }
  
  off(channel: string, handler: IPCHandler): void {
    console.warn('IPC not available - cannot remove handler for channel:', channel);
  }
  
  isAvailable(): boolean {
    return false;
  }
  
  getType(): 'none' {
    return 'none';
  }
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    electronAPI?: any;
    cefQuery?: (request: any) => void;
    cefQueryCancel?: (id: number) => void;
  }
}