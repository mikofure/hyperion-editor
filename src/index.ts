// Main entry point for MikoEditor
export * from './core/index.js';
export * from './gui/index.js';

// Re-export commonly used classes for convenience
export { Editor } from './core/Editor.js';
export { EditorView } from './gui/EditorView.js';
export { defaultTheme, lightTheme } from './gui/TextRenderer.js';