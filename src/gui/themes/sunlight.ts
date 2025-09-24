import type { Theme } from '../TextRenderer.js';

export const sunlightTheme: Theme = {
  background: '#FFFEF7',
  text: '#2F4F4F',
  keyword: '#FF8C00',
  string: '#228B22',
  comment: '#708090',
  number: '#DC143C',
  operator: '#FF4500',
  function: '#FF6347',
  type: '#4169E1',
  identifier: '#2F4F4F',
  punctuation: '#FF4500',
  lineNumber: '#708090',
  selection: '#FFE4B5',
  cursor: '#FF6347'
};

export const sunlightThemeInfo = {
  name: 'Sunlight Theme',
  type: 'light' as const
};