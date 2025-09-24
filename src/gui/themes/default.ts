import type { Theme } from '../TextRenderer.js';

export const defaultTheme: Theme = {
  background: '#1E1E1E',
  text: '#FFFFFF',
  keyword: '#BCB4FF',
  string: '#71EAFF',
  comment: '#6A9955',
  number: '#FF7B7B',
  operator: '#D4D4D4',
  function: '#71EAFF',
  type: '#BCB4FF',
  identifier: '#FFFFFF',
  punctuation: '#D4D4D4',
  lineNumber: '#858585',
  selection: '#264F78',
  cursor: '#FFFFFF'
};

export const defaultThemeInfo = {
  name: 'Hyperion Theme Default Dark',
  type: 'dark' as const
};