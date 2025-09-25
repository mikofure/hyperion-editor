import type { Theme } from '../TextRenderer.js';

export const vanillaTheme: Theme = {
  background: '#F8F8FF',
  text: '#2F4F4F',
  keyword: '#8B4513',
  string: '#556B2F',
  comment: '#A0A0A0',
  number: '#B8860B',
  operator: '#8B4513',
  function: '#CD853F',
  type: '#4682B4',
  identifier: '#2F4F4F',
  punctuation: '#8B4513',
  lineNumber: '#A0A0A0',
  selection: '#E6E6FA',
  cursor: '#8B4513'
};

export const vanillaThemeInfo = {
  name: 'Vanilla Theme',
  type: 'light' as const
};