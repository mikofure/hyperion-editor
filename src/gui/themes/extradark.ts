import type { Theme } from '../TextRenderer.js';

export const extradarkTheme: Theme = {
  background: '#0D1117',
  text: '#FFA198',
  keyword: '#FF7B72',
  string: '#A5C261',
  comment: '#8B949E',
  number: '#79C0FF',
  operator: '#FF7B72',
  function: '#D2A8FF',
  type: '#FFA657',
  identifier: '#FFA198',
  punctuation: '#FF7B72',
  lineNumber: '#7D8590',
  selection: '#264F78',
  cursor: '#58A6FF'
};

export const extradarkThemeInfo = {
  name: 'Extra Dark Theme',
  type: 'dark' as const
};