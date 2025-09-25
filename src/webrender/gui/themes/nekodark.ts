import type { Theme } from '../TextRenderer.js';

export const nekodarkTheme: Theme = {
  background: '#1A1A2E',
  text: '#ECF0F1',
  keyword: '#9B59B6',
  string: '#F39C12',
  comment: '#7F8C8D',
  number: '#E74C3C',
  operator: '#E67E22',
  function: '#F39C12',
  type: '#8E44AD',
  identifier: '#ECF0F1',
  punctuation: '#E67E22',
  lineNumber: '#BDC3C7',
  selection: '#533483',
  cursor: '#FF6B6B'
};

export const nekodarkThemeInfo = {
  name: 'Neko Dark Theme',
  type: 'dark' as const
};