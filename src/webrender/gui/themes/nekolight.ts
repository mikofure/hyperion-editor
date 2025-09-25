import type { Theme } from '../TextRenderer.js';

export const nekolightTheme: Theme = {
  background: '#FDF6E3',
  text: '#586E75',
  keyword: '#D33682',
  string: '#2AA198',
  comment: '#93A1A1',
  number: '#CB4B16',
  operator: '#859900',
  function: '#268BD2',
  type: '#B58900',
  identifier: '#586E75',
  punctuation: '#859900',
  lineNumber: '#93A1A1',
  selection: '#EEE8D5',
  cursor: '#DC322F'
};

export const nekolightThemeInfo = {
  name: 'Neko Light Theme',
  type: 'light' as const
};