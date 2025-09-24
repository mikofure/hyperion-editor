import type { Theme } from '../TextRenderer.js';

export const cutieTheme: Theme = {
  background: '#FFF0F5',
  text: '#9370DB',
  keyword: '#DA70D6',
  string: '#98FB98',
  comment: '#C0C0C0',
  number: '#FFB347',
  operator: '#FF1493',
  function: '#FF91A4',
  type: '#DDA0DD',
  identifier: '#9370DB',
  punctuation: '#FF1493',
  lineNumber: '#C0C0C0',
  selection: '#FFB6C1',
  cursor: '#FF69B4'
};

export const cutieThemeInfo = {
  name: 'Cutie Theme',
  type: 'light' as const
};