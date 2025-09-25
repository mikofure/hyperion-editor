import type { Theme } from '../TextRenderer.js';

export const moondarkTheme: Theme = {
  background: '#0F1419',
  text: '#D4BFFF',
  keyword: '#5CCFE6',
  string: '#BAE67E',
  comment: '#5C6773',
  number: '#FFAE57',
  operator: '#F29E74',
  function: '#FFD580',
  type: '#5CCFE6',
  identifier: '#D4BFFF',
  punctuation: '#F29E74',
  lineNumber: '#8A9199',
  selection: '#253340',
  cursor: '#FFCC66'
};

export const moondarkThemeInfo = {
  name: 'Moon Dark Theme',
  type: 'dark' as const
};