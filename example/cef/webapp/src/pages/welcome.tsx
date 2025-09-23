import React, { useState, useEffect } from 'react';
import { Zap, Radio, Info, TestTube, Volume2, Loader2 } from 'lucide-react';

// Type definitions for the native API
declare global {
  interface Window {
    nativeAPI?: {
      call: (method: string, message?: string) => string;
    };
  }
}

interface TestResult {
  method: string;
  input: string;
  output: string;
  success: boolean;
  timestamp: string;
}

const Welcome: React.FC = () => {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [customMessage, setCustomMessage] = useState('');
  const [apiAvailable, setApiAvailable] = useState(false);
  const [systemInfo, setSystemInfo] = useState<string>('');

  useEffect(() => {
    // Check if native API is available
    const checkAPI = () => {
      setApiAvailable(!!window.nativeAPI);
    };
    
    checkAPI();
    
    // Check periodically in case API loads later
    const interval = setInterval(checkAPI, 1000);
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Fetch system info when API becomes available
    const fetchSystemInfo = async () => {
      if (window.nativeAPI && apiAvailable) {
        try {
          const info = await window.nativeAPI.call('getSystemInfo');
          setSystemInfo(typeof info === 'string' ? info : JSON.stringify(info));
        } catch (error) {
          setSystemInfo('Failed to fetch system info');
        }
      }
    };
    
    fetchSystemInfo();
  }, [apiAvailable]);

  const addTestResult = (method: string, input: string, output: string, success: boolean) => {
    const result: TestResult = {
      method,
      input,
      output,
      success,
      timestamp: new Date().toLocaleTimeString()
    };
    setTestResults(prev => [result, ...prev]);
  };

  const testIPC = async (method: string, message?: string) => {
    if (!window.nativeAPI) {
      addTestResult(method, message || '', 'Native API not available', false);
      return;
    }

    setIsLoading(true);
    try {
      const result = await window.nativeAPI.call(method, message);
      // Convert result to string to avoid React rendering errors
      const resultString = typeof result === 'string' ? result : JSON.stringify(result, null, 2);
      addTestResult(method, message || '', resultString, true);
    } catch (error) {
      addTestResult(method, message || '', `Error: ${error}`, false);
    } finally {
      setIsLoading(false);
    }
  };

  const runAllTests = async () => {
    setTestResults([]);
    await testIPC('ping');
    await new Promise(resolve => setTimeout(resolve, 100));
    await testIPC('getSystemInfo');
    await new Promise(resolve => setTimeout(resolve, 100));
    await testIPC('echo', 'Hello from React!');
  };

  const testCustomMessage = () => {
    if (customMessage.trim()) {
      testIPC('echo', customMessage);
      setCustomMessage('');
    }
  };

  return (
    <div className="h-full pt-6" style={{ backgroundColor: 'var(--vscode-bg-primary)' }}>
      <header className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4 flex items-center justify-center gap-3" style={{ color: 'var(--vscode-fg-primary)' }}>
          <Zap className="w-10 h-10" />
          Welcome to CEF + React App
        </h1>
        <p className="text-lg" style={{ color: 'var(--vscode-fg-muted)' }}>Testing front-to-back communication with Chromium Embedded Framework</p>
      </header>

      <div className="max-w-4xl mx-auto mb-8">
        <div className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium" style={{
          backgroundColor: apiAvailable ? 'var(--vscode-success)' : 'var(--vscode-error)',
          color: 'var(--vscode-bg-primary)',
          border: `1px solid ${apiAvailable ? 'var(--vscode-success)' : 'var(--vscode-error)'}`
        }}>
          <span className={`w-2 h-2 rounded-full mr-2`} style={{
            backgroundColor: 'var(--vscode-bg-primary)'
          }}></span>
          Native API: {apiAvailable ? 'Available' : 'Not Available'}
        </div>
      </div>

      <div className="max-w-4xl mx-auto mb-8">
        <div className="rounded-lg shadow-lg p-6" style={{ backgroundColor: 'var(--vscode-bg-secondary)', border: '1px solid var(--vscode-border)' }}>
          <h2 className="text-2xl font-semibold mb-6" style={{ color: 'var(--vscode-fg-primary)' }}>IPC Test Controls</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <button 
              onClick={() => testIPC('ping')} 
              disabled={!apiAvailable || isLoading}
              className="font-medium py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
              style={{
                backgroundColor: (!apiAvailable || isLoading) ? 'var(--vscode-bg-tertiary)' : 'var(--vscode-button-bg)',
                color: (!apiAvailable || isLoading) ? 'var(--vscode-fg-muted)' : 'var(--vscode-fg-primary)',
                border: '1px solid var(--vscode-border)'
              }}
              onMouseEnter={(e) => {
                if (!(!apiAvailable || isLoading)) {
                  e.currentTarget.style.backgroundColor = 'var(--vscode-button-hover)';
                }
              }}
              onMouseLeave={(e) => {
                if (!(!apiAvailable || isLoading)) {
                  e.currentTarget.style.backgroundColor = 'var(--vscode-button-bg)';
                }
              }}
            >
              <Radio className="w-4 h-4" />
              <span>Test Ping</span>
            </button>
            
            <button 
              onClick={() => testIPC('getSystemInfo')} 
              disabled={!apiAvailable || isLoading}
              className="font-medium py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
              style={{
                backgroundColor: (!apiAvailable || isLoading) ? 'var(--vscode-bg-tertiary)' : 'var(--vscode-button-bg)',
                color: (!apiAvailable || isLoading) ? 'var(--vscode-fg-muted)' : 'var(--vscode-fg-primary)',
                border: '1px solid var(--vscode-border)'
              }}
              onMouseEnter={(e) => {
                if (!(!apiAvailable || isLoading)) {
                  e.currentTarget.style.backgroundColor = 'var(--vscode-button-hover)';
                }
              }}
              onMouseLeave={(e) => {
                if (!(!apiAvailable || isLoading)) {
                  e.currentTarget.style.backgroundColor = 'var(--vscode-button-bg)';
                }
              }}
            >
              <Info className="w-4 h-4" />
              <span>Get System Info</span>
            </button>
            
            <button 
              onClick={runAllTests} 
              disabled={!apiAvailable || isLoading}
              className="font-medium py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
              style={{
                backgroundColor: (!apiAvailable || isLoading) ? 'var(--vscode-bg-tertiary)' : 'var(--vscode-button-bg)',
                color: (!apiAvailable || isLoading) ? 'var(--vscode-fg-muted)' : 'var(--vscode-fg-primary)',
                border: '1px solid var(--vscode-border)'
              }}
              onMouseEnter={(e) => {
                if (!(!apiAvailable || isLoading)) {
                  e.currentTarget.style.backgroundColor = 'var(--vscode-button-hover)';
                }
              }}
              onMouseLeave={(e) => {
                if (!(!apiAvailable || isLoading)) {
                  e.currentTarget.style.backgroundColor = 'var(--vscode-button-bg)';
                }
              }}
            >
              <TestTube className="w-4 h-4" />
              <span>Run All Tests</span>
            </button>
          </div>

          <div className="border-t pt-6" style={{ borderColor: 'var(--vscode-border)' }}>
            <h3 className="text-lg font-medium mb-4" style={{ color: 'var(--vscode-fg-primary)' }}>Custom Echo Test</h3>
            <div className="flex space-x-3">
              <input
                type="text"
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                placeholder="Enter message to echo..."
                disabled={!apiAvailable || isLoading}
                onKeyPress={(e) => e.key === 'Enter' && testCustomMessage()}
                className="flex-1 px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                style={{
                  backgroundColor: (!apiAvailable || isLoading) ? 'var(--vscode-bg-tertiary)' : 'var(--vscode-input-bg)',
                  color: 'var(--vscode-fg-primary)',
                  border: '1px solid var(--vscode-border)'
                }}
              />
              <button 
                onClick={testCustomMessage}
                disabled={!apiAvailable || isLoading || !customMessage.trim()}
                className="font-medium py-2 px-6 rounded-lg transition-colors duration-200 flex items-center space-x-2"
                style={{
                  backgroundColor: (!apiAvailable || isLoading || !customMessage.trim()) ? 'var(--vscode-bg-tertiary)' : 'var(--vscode-button-bg)',
                  color: (!apiAvailable || isLoading || !customMessage.trim()) ? 'var(--vscode-fg-muted)' : 'var(--vscode-fg-primary)',
                  border: '1px solid var(--vscode-border)'
                }}
                onMouseEnter={(e) => {
                  if (!(!apiAvailable || isLoading || !customMessage.trim())) {
                    e.currentTarget.style.backgroundColor = 'var(--vscode-button-hover)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!(!apiAvailable || isLoading || !customMessage.trim())) {
                    e.currentTarget.style.backgroundColor = 'var(--vscode-button-bg)';
                  }
                }}
              >
                <Volume2 className="w-4 h-4" />
                <span>Echo</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto mb-8">
        <div className="rounded-lg shadow-lg p-6" style={{ backgroundColor: 'var(--vscode-bg-secondary)', border: '1px solid var(--vscode-border)' }}>
          <h2 className="text-2xl font-semibold mb-6" style={{ color: 'var(--vscode-fg-primary)' }}>Test Results</h2>
          
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="animate-spin h-8 w-8" style={{ color: 'var(--vscode-accent)' }} />
              <span className="ml-3" style={{ color: 'var(--vscode-fg-muted)' }}>Testing...</span>
            </div>
          )}
          
          {testResults.length === 0 && !isLoading && (
            <div className="text-center py-8" style={{ color: 'var(--vscode-fg-muted)' }}>
              <TestTube className="w-16 h-16 mx-auto mb-2" style={{ color: 'var(--vscode-fg-muted)' }} />
              <p>No tests run yet. Click a test button above!</p>
            </div>
          )}
          
          <div className="space-y-4">
            {testResults.map((result, index) => (
              <div key={index} className="border rounded-lg p-4" style={{
                borderColor: result.success ? 'var(--vscode-success)' : 'var(--vscode-error)',
                backgroundColor: 'var(--vscode-bg-tertiary)'
              }}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <span className="font-mono text-sm px-2 py-1 rounded" style={{
                      backgroundColor: 'var(--vscode-bg-primary)',
                      color: 'var(--vscode-fg-primary)',
                      border: '1px solid var(--vscode-border)'
                    }}>
                      {result.method}
                    </span>
                    <span className="text-xs" style={{ color: 'var(--vscode-fg-muted)' }}>{result.timestamp}</span>
                  </div>
                  <span className="text-lg">
                    {result.success ? '✅' : '❌'}
                  </span>
                </div>
                {result.input && (
                  <div className="mb-2">
                    <span className="font-medium" style={{ color: 'var(--vscode-fg-primary)' }}>Input:</span>
                    <span className="ml-2" style={{ color: 'var(--vscode-fg-muted)' }}>{result.input}</span>
                  </div>
                )}
                <div>
                  <span className="font-medium" style={{ color: 'var(--vscode-fg-primary)' }}>Output:</span>
                  <pre className="mt-1 p-3 rounded text-sm overflow-x-auto" style={{
                    backgroundColor: 'var(--vscode-bg-primary)',
                    color: 'var(--vscode-fg-primary)',
                    border: '1px solid var(--vscode-border)'
                  }}>{result.output}</pre>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <footer className="shadow-lg border-t py-6" style={{ backgroundColor: 'var(--vscode-bg-secondary)', borderColor: 'var(--vscode-border)' }}>
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-4">
            <p className="mb-2" style={{ color: 'var(--vscode-fg-muted)' }}>
              CEF QuickStart - A modern desktop application framework
            </p>
            <code className="text-sm px-2 py-1 rounded" style={{ color: 'var(--vscode-fg-muted)', backgroundColor: 'var(--vscode-bg-tertiary)', border: '1px solid var(--vscode-border)' }}>
              Built with CEF, React, and TypeScript
            </code>
          </div>
          {systemInfo && (
            <div className="border-t pt-4" style={{ borderColor: 'var(--vscode-border)' }}>
              <h4 className="text-sm font-medium mb-2 flex items-center gap-2" style={{ color: 'var(--vscode-fg-primary)' }}>
                <Info className="w-4 h-4" />
                System Information
              </h4>
              <pre className="text-xs p-3 rounded overflow-x-auto" style={{
                backgroundColor: 'var(--vscode-bg-primary)',
                color: 'var(--vscode-fg-muted)',
                border: '1px solid var(--vscode-border)'
              }}>{systemInfo}</pre>
            </div>
          )}
        </div>
      </footer>
    </div>
  );
};

export default Welcome;