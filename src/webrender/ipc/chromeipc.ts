/**
 * CEF (Chromium Embedded Framework) IPC Provider for MikoEditor
 * Handles communication with native CEF application
 */

import type { IPCProvider, IPCHandler, IPCMessage, IPCResponse, EditorIPCAPI } from './index.js';

export class ChromeIPCProvider implements IPCProvider {
  private handlers: Map<string, Set<IPCHandler>> = new Map();
  private messageId = 0;
  private pendingMessages: Map<string, { resolve: Function; reject: Function; timeout: NodeJS.Timeout }> = new Map();

  constructor() {
    this.setupMessageHandler();
  }

  private setupMessageHandler(): void {
    // CEF can call JavaScript functions from native code
    // Set up global handler for incoming messages
    (window as any).cefIPCHandler = (messageJson: string) => {
      try {
        const message: IPCMessage = JSON.parse(messageJson);
        this.handleIncomingMessage(message);
      } catch (error) {
        console.error('CEF IPC: Failed to parse incoming message:', error);
      }
    };

    // Set up global handler for responses
    (window as any).cefIPCResponseHandler = (responseJson: string) => {
      try {
        const response: IPCResponse = JSON.parse(responseJson);
        this.handleIncomingResponse(response);
      } catch (error) {
        console.error('CEF IPC: Failed to parse incoming response:', error);
      }
    };
  }

  private async handleIncomingMessage(message: IPCMessage): Promise<void> {
    const handlers = this.handlers.get(message.channel);
    if (handlers && handlers.size > 0) {
      // Execute handlers and collect results
      const results = await Promise.allSettled(
        Array.from(handlers).map(handler => handler(message.data))
      );

      // Send response back to native code
      const response: IPCResponse = {
        id: message.id,
        success: results.every(r => r.status === 'fulfilled'),
        data: results.length === 1 
          ? (results[0]?.status === 'fulfilled' ? (results[0] as PromiseFulfilledResult<any>).value : undefined)
          : results.map(r => r.status === 'fulfilled' ? (r as PromiseFulfilledResult<any>).value : undefined),
        error: results.find(r => r.status === 'rejected')?.status === 'rejected' 
          ? (results.find(r => r.status === 'rejected') as PromiseRejectedResult)?.reason?.message 
          : undefined,
        timestamp: Date.now()
      };

      this.sendResponseToCEF(response);
    }
  }

  private handleIncomingResponse(response: IPCResponse): void {
    const pending = this.pendingMessages.get(response.id);
    if (pending) {
      clearTimeout(pending.timeout);
      this.pendingMessages.delete(response.id);
      
      if (response.success) {
        pending.resolve(response.data);
      } else {
        pending.reject(new Error(response.error || 'CEF IPC Error'));
      }
    }
  }

  private sendResponseToCEF(response: IPCResponse): void {
    if (window.cefQuery) {
      window.cefQuery({
        request: JSON.stringify({
          type: 'ipc_response',
          payload: response
        }),
        onSuccess: () => {},
        onFailure: (error_code: number, error_message: string) => {
          console.error('CEF IPC: Failed to send response:', error_code, error_message);
        }
      });
    }
  }

  async send(channel: string, data: any): Promise<any> {
    if (!this.isAvailable()) {
      throw new Error('CEF IPC not available');
    }

    const messageId = `cef_msg_${++this.messageId}_${Date.now()}`;
    const message: IPCMessage = {
      id: messageId,
      channel,
      data,
      timestamp: Date.now()
    };

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        if (this.pendingMessages.has(messageId)) {
          this.pendingMessages.delete(messageId);
          reject(new Error(`CEF IPC timeout for channel: ${channel}`));
        }
      }, 30000); // 30 second timeout

      this.pendingMessages.set(messageId, { resolve, reject, timeout });

      // Send message to CEF native code
      if (window.cefQuery) {
        window.cefQuery({
          request: JSON.stringify({
            type: 'ipc_message',
            payload: message
          }),
          onSuccess: (response: string) => {
            // Response will be handled by cefIPCResponseHandler
            // This success callback is just for the query mechanism
          },
          onFailure: (error_code: number, error_message: string) => {
            if (this.pendingMessages.has(messageId)) {
              const pending = this.pendingMessages.get(messageId)!;
              clearTimeout(pending.timeout);
              this.pendingMessages.delete(messageId);
              pending.reject(new Error(`CEF Query failed: ${error_code} - ${error_message}`));
            }
          }
        });
      } else {
        clearTimeout(timeout);
        this.pendingMessages.delete(messageId);
        reject(new Error('CEF Query function not available'));
      }
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
           typeof window.cefQuery === 'function';
  }

  getType(): 'cef' {
    return 'cef';
  }
}

/**
 * High-level Editor API for CEF
 */
export class ChromeEditorAPI implements EditorIPCAPI {
  private ipc: ChromeIPCProvider;

  constructor(ipc: ChromeIPCProvider) {
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

// Example CEF C++ implementation (for reference)
export const CEFNativeExample = `
// CEF C++ Handler Example:
class MikoEditorIPCHandler : public CefV8Handler {
public:
    virtual bool Execute(const CefString& name,
                        CefRefPtr<CefV8Value> object,
                        const CefV8ValueList& arguments,
                        CefRefPtr<CefV8Value>& retval,
                        CefString& exception) override {
        
        if (name == "cefQuery") {
            if (arguments.size() > 0 && arguments[0]->IsObject()) {
                CefRefPtr<CefV8Value> request = arguments[0]->GetValue("request");
                if (request && request->IsString()) {
                    // Parse JSON request
                    std::string requestStr = request->GetStringValue();
                    // Handle IPC message here
                    HandleIPCMessage(requestStr);
                }
            }
            return true;
        }
        
        return false;
    }
    
private:
    void HandleIPCMessage(const std::string& messageJson) {
        // Parse JSON and route to appropriate handlers
        // Example channels:
        // - editor:openFile -> ShowOpenFileDialog()
        // - editor:saveFile -> SaveFileToPath()
        // - window:minimize -> MinimizeWindow()
        // etc.
    }
    
    void SendResponseToJS(const std::string& responseJson) {
        // Execute JavaScript callback with response
        CefString script = "window.cefIPCResponseHandler('" + responseJson + "')";
        frame_->ExecuteJavaScript(script, "", 0);
    }
    
    IMPLEMENT_REFCOUNTING(MikoEditorIPCHandler);
};

// Register the handler:
void RegisterIPCHandler(CefRefPtr<CefBrowser> browser) {
    CefRefPtr<CefV8Context> context = browser->GetMainFrame()->GetV8Context();
    context->Enter();
    
    CefRefPtr<CefV8Value> global = context->GetGlobal();
    CefRefPtr<MikoEditorIPCHandler> handler = new MikoEditorIPCHandler();
    
    // Create cefQuery function
    CefRefPtr<CefV8Value> queryFunc = CefV8Value::CreateFunction("cefQuery", handler);
    global->SetValue("cefQuery", queryFunc, V8_PROPERTY_ATTRIBUTE_NONE);
    
    context->Exit();
}
`;