import { EditorView, defaultTheme} from '../index.js';

/**
 * Simple example demonstrating how to use the MikoEditor library
 */
export function createSimpleEditor(container: HTMLElement): EditorView {
  const initialContent = `// Welcome to MikoEditor!
function fibonacci(n: number): number {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

const result = fibonacci(10);
console.log('Fibonacci(10) =', result);

/* 
 * This editor supports:
 * - Syntax highlighting for TypeScript/JavaScript
 * - Cursor movement and text selection
 * - Undo/Redo functionality
 * - Multiple themes
 */
`;

  const editor = new EditorView(container, initialContent, defaultTheme);
  editor.setLanguage('typescript');
  
  return editor;
}

/**
 * Example with light theme
 */
export function createLightThemeEditor(container: HTMLElement): EditorView {
  const content = `# Python Example
def greet(name):
    """Greet someone by name"""
    return f"Hello, {name}!"

# Call the function
message = greet("World")
print(message)
`;

  const editor = new EditorView(container, content);
  editor.setLanguage('python');
  
  return editor;
}

/**
 * Example showing how to handle editor events
 */
export function createEditorWithEventHandling(container: HTMLElement): EditorView {
  const editor = new EditorView(container);
  
  // Add event listener
  editor.getEditor().addListener({
    onEditorChange: (editor) => {
      console.log('Editor content changed:', editor.getContent().length, 'characters');
    }
  });
  
  // Set up some keyboard shortcuts
  editor.getEditor().registerKeyBinding('s', { ctrl: true, shift: false, alt: false }, {
    execute: (editor) => {
      console.log('Save shortcut pressed!');
      // Here you would implement save functionality
    }
  });
  
  return editor;
}

/**
 * HTML page example
 */
export function createHTMLExample(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MikoEditor Example</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f0f0f0;
        }
        
        .editor-container {
            width: 100%;
            height: 500px;
            border: 1px solid #ccc;
            border-radius: 4px;
            overflow: hidden;
            background-color: white;
        }
        
        .controls {
            margin-bottom: 10px;
        }
        
        button {
            margin-right: 10px;
            padding: 5px 10px;
            border: 1px solid #ccc;
            background-color: white;
            cursor: pointer;
        }
        
        button:hover {
            background-color: #f0f0f0;
        }
    </style>
</head>
<body>
    <h1>MikoEditor Demo</h1>
    
    <div class="controls">
        <button onclick="toggleTheme()">Toggle Theme</button>
        <button onclick="changeLanguage('javascript')">JavaScript</button>
        <button onclick="changeLanguage('python')">Python</button>
        <button onclick="changeLanguage('json')">JSON</button>
        <button onclick="insertSample()">Insert Sample</button>
    </div>
    
    <div id="editor-container" class="editor-container"></div>
    
    <script type="module">
        import { createSimpleEditor, createLightThemeEditor } from './example.js';
        import { defaultTheme, lightTheme } from '../index.js';
        
        let editor;
        let isDarkTheme = true;
        
        function initEditor() {
            const container = document.getElementById('editor-container');
            editor = createSimpleEditor(container);
            
            // Make functions available globally for button clicks
            window.toggleTheme = toggleTheme;
            window.changeLanguage = changeLanguage;
            window.insertSample = insertSample;
        }
        
        function toggleTheme() {
            const theme = isDarkTheme ? lightTheme : defaultTheme;
            editor.setTheme(theme);
            isDarkTheme = !isDarkTheme;
        }
        
        function changeLanguage(lang) {
            editor.setLanguage(lang);
        }
        
        function insertSample() {
            const samples = {
                javascript: 'const message = "Hello from JavaScript!";\\nconsole.log(message);',
                python: 'message = "Hello from Python!"\\nprint(message)',
                json: '{\\n  "message": "Hello from JSON!",\\n  "language": "json"\\n}'
            };
            
            const currentLang = editor.getLanguage();
            const sample = samples[currentLang] || samples.javascript;
            
            editor.getEditor().insertText('\\n\\n' + sample);
        }
        
        // Initialize when page loads
        document.addEventListener('DOMContentLoaded', initEditor);
    </script>
</body>
</html>`;
}