/**
 * Electron IPC Provider for MikoEditor
 * Handles communication between renderer and main process
 */

import type { IPCProvider, IPCHandler, IPCMessage, IPCResponse, EditorIPCAPI } from './index.js';

export class ElectronIPCProvider implements IPCProvider {
  private handlers: Map<string, Set<IPCHandler>> = new Map();
  private messageId = 0;
  private pendingMessages: Map<string, { resolve: Function; reject: Function }> = new Map();

  constructor() {
    this.setupResponseHandler();
  }

  private setupResponseHandler(): void {
    if (window.electronAPI?.onIPCResponse) {
      window.electronAPI.onIPCResponse((response: IPCResponse) => {
        const pending = this.pendingMessages.get(response.id);
        if (pending) {
          this.pendingMessages.delete(response.id);
          if (response.success) {
            pending.resolve(response.data);
          } else {
            pending.reject(new Error(response.error || 'IPC Error'));
          }
        }
      });
    }

    // Setup incoming message handler
    if (window.electronAPI?.onIPCMessage) {
      window.electronAPI.onIPCMessage((message: IPCMessage) => {
        const handlers = this.handlers.get(message.channel);
        if (handlers) {
          handlers.forEach(async (handler) => {
            try {
              const result = await handler(message.data);
              // Send response back to main process
              window.electronAPI?.sendIPCResponse({
                id: message.id,
                success: true,
                data: result,
                timestamp: Date.now()
              });
            } catch (error) {
              window.electronAPI?.sendIPCResponse({
                id: message.id,
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                timestamp: Date.now()
              });
            }
          });
        }
      });
    }
  }

  async send(channel: string, data: any): Promise<any> {
    if (!this.isAvailable()) {
      throw new Error('Electron IPC not available');
    }

    const messageId = `msg_${++this.messageId}_${Date.now()}`;
    const message: IPCMessage = {
      id: messageId,
      channel,
      data,
      timestamp: Date.now()
    };

    return new Promise((resolve, reject) => {
      this.pendingMessages.set(messageId, { resolve, reject });
      
      // Set timeout for message
      setTimeout(() => {
        if (this.pendingMessages.has(messageId)) {
          this.pendingMessages.delete(messageId);
          reject(new Error(`IPC timeout for channel: ${channel}`));
        }
      }, 30000); // 30 second timeout

      window.electronAPI.sendIPCMessage(message);
    });
  }

  on(channel: string, handler: IPCHandler): void {
    if (!this.handlers.has(channel)) {
      this.handlers.set(channel, new Set());
    }
    this.handlers.get(channel)!.add(handler);
  }

  off(channel: string, handler: IPCHandler): void {
    const handlers = this.handlers.get(channel);
    if (handlers) {
      handlers.delete(handler);
      if (handlers.size === 0) {
        this.handlers.delete(channel);
      }
    }
  }

  isAvailable(): boolean {
    return typeof window !== 'undefined' && 
           window.electronAPI && 
           typeof window.electronAPI.sendIPCMessage === 'function';
  }

  getType(): 'electron' {
    return 'electron';
  }
}

/**
 * High-level Editor API for Electron
 */
export class ElectronEditorAPI implements EditorIPCAPI {
  private ipc: ElectronIPCProvider;

  constructor(ipc: ElectronIPCProvider) {
    this.ipc = ipc;
  }

  async openFile(): Promise<{ path: string; content: string } | null> {
    return this.ipc.send('editor:openFile', {});
  }

  async saveFile(path: string, content: string): Promise<boolean> {
    return this.ipc.send('editor:saveFile', { path, content });
  }

  async saveAsFile(content: string): Promise<{ path: string; saved: boolean } | null> {
    return this.ipc.send('editor:saveAsFile', { content });
  }

  async getRecentFiles(): Promise<string[]> {
    return this.ipc.send('editor:getRecentFiles', {});
  }

  async addRecentFile(path: string): Promise<void> {
    return this.ipc.send('editor:addRecentFile', { path });
  }

  async getTheme(): Promise<'light' | 'dark' | 'auto'> {
    return this.ipc.send('editor:getTheme', {});
  }

  async setTheme(theme: 'light' | 'dark' | 'auto'): Promise<void> {
    return this.ipc.send('editor:setTheme', { theme });
  }

  async getSettings(): Promise<any> {
    return this.ipc.send('editor:getSettings', {});
  }

  async setSettings(settings: any): Promise<void> {
    return this.ipc.send('editor:setSettings', { settings });
  }

  async minimize(): Promise<void> {
    return this.ipc.send('window:minimize', {});
  }

  async maximize(): Promise<void> {
    return this.ipc.send('window:maximize', {});
  }

  async close(): Promise<void> {
    return this.ipc.send('window:close', {});
  }

  async setTitle(title: string): Promise<void> {
    return this.ipc.send('window:setTitle', { title });
  }

  async showNotification(title: string, body: string): Promise<void> {
    return this.ipc.send('system:showNotification', { title, body });
  }

  async showErrorDialog(title: string, message: string): Promise<void> {
    return this.ipc.send('system:showErrorDialog', { title, message });
  }

  async showInfoDialog(title: string, message: string): Promise<void> {
    return this.ipc.send('system:showInfoDialog', { title, message });
  }

  async openDevTools(): Promise<void> {
    return this.ipc.send('dev:openDevTools', {});
  }

  async reload(): Promise<void> {
    return this.ipc.send('dev:reload', {});
  }
}

// Example Electron main process setup (for reference)
export const ElectronMainProcessExample = `
// In your Electron main process (main.js):
const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const fs = require('fs').promises;
const path = require('path');

// IPC handlers
ipcMain.handle('editor:openFile', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [
      { name: 'Text Files', extensions: ['txt', 'js', 'ts', 'json', 'md'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  });
  
  if (!result.canceled && result.filePaths.length > 0) {
    const filePath = result.filePaths[0];
    const content = await fs.readFile(filePath, 'utf8');
    return { path: filePath, content };
  }
  return null;
});

ipcMain.handle('editor:saveFile', async (event, { path, content }) => {
  try {
    await fs.writeFile(path, content, 'utf8');
    return true;
  } catch (error) {
    console.error('Save error:', error);
    return false;
  }
});

ipcMain.handle('editor:saveAsFile', async (event, { content }) => {
  const result = await dialog.showSaveDialog({
    filters: [
      { name: 'Text Files', extensions: ['txt'] },
      { name: 'JavaScript', extensions: ['js'] },
      { name: 'TypeScript', extensions: ['ts'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  });
  
  if (!result.canceled && result.filePath) {
    try {
      await fs.writeFile(result.filePath, content, 'utf8');
      return { path: result.filePath, saved: true };
    } catch (error) {
      console.error('Save as error:', error);
      return { path: result.filePath, saved: false };
    }
  }
  return null;
});

// Window operations
ipcMain.handle('window:minimize', (event) => {
  const window = BrowserWindow.fromWebContents(event.sender);
  window?.minimize();
});

ipcMain.handle('window:maximize', (event) => {
  const window = BrowserWindow.fromWebContents(event.sender);
  if (window?.isMaximized()) {
    window.unmaximize();
  } else {
    window?.maximize();
  }
});

ipcMain.handle('window:close', (event) => {
  const window = BrowserWindow.fromWebContents(event.sender);
  window?.close();
});

// In your preload script (preload.js):
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  sendIPCMessage: (message) => ipcRenderer.invoke('ipc:message', message),
  onIPCResponse: (callback) => ipcRenderer.on('ipc:response', callback),
  onIPCMessage: (callback) => ipcRenderer.on('ipc:message', callback),
  sendIPCResponse: (response) => ipcRenderer.send('ipc:response', response)
});
`;