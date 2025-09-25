// Main entry point for MikoEditor
export * from './core/index';
export * from './gui/index';

// Re-export commonly used classes for convenience
export { Editor } from './core/Editor';
export { EditorView } from './gui/EditorView';

// Re-export theme system
export * from './gui/themes/index';