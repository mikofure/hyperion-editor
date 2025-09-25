// Theme exports
export { defaultTheme, defaultThemeInfo } from './default.js';
export { nekodarkTheme, nekodarkThemeInfo } from './nekodark.js';
export { sunlightTheme, sunlightThemeInfo } from './sunlight.js';
export { cutieTheme, cutieThemeInfo } from './cutie.js';
export { extradarkTheme, extradarkThemeInfo } from './extradark.js';
export { moondarkTheme, moondarkThemeInfo } from './moondark.js';
export { nekolightTheme, nekolightThemeInfo } from './nekolight.js';
export { vanillaTheme, vanillaThemeInfo } from './vanilla.js';

import type { Theme } from '../TextRenderer.js';
import { defaultTheme, defaultThemeInfo } from './default.js';
import { nekodarkTheme, nekodarkThemeInfo } from './nekodark.js';
import { sunlightTheme, sunlightThemeInfo } from './sunlight.js';
import { cutieTheme, cutieThemeInfo } from './cutie.js';
import { extradarkTheme, extradarkThemeInfo } from './extradark.js';
import { moondarkTheme, moondarkThemeInfo } from './moondark.js';
import { nekolightTheme, nekolightThemeInfo } from './nekolight.js';
import { vanillaTheme, vanillaThemeInfo } from './vanilla.js';

export interface ThemeInfo {
  name: string;
  type: 'light' | 'dark';
}

export interface ThemeEntry {
  theme: Theme;
  info: ThemeInfo;
}

// Theme registry for easy access
export const themes: Record<string, ThemeEntry> = {
  default: { theme: defaultTheme, info: defaultThemeInfo },
  nekodark: { theme: nekodarkTheme, info: nekodarkThemeInfo },
  sunlight: { theme: sunlightTheme, info: sunlightThemeInfo },
  cutie: { theme: cutieTheme, info: cutieThemeInfo },
  extradark: { theme: extradarkTheme, info: extradarkThemeInfo },
  moondark: { theme: moondarkTheme, info: moondarkThemeInfo },
  nekolight: { theme: nekolightTheme, info: nekolightThemeInfo },
  vanilla: { theme: vanillaTheme, info: vanillaThemeInfo }
};

// Helper functions
export function getTheme(name: string): Theme | null {
  return themes[name]?.theme || null;
}

export function getThemeInfo(name: string): ThemeInfo | null {
  return themes[name]?.info || null;
}

export function getAllThemes(): Record<string, ThemeEntry> {
  return themes;
}

export function getThemeNames(): string[] {
  return Object.keys(themes);
}

export function getDarkThemes(): Record<string, ThemeEntry> {
  return Object.fromEntries(
    Object.entries(themes).filter(([_, entry]) => entry.info.type === 'dark')
  );
}

export function getLightThemes(): Record<string, ThemeEntry> {
  return Object.fromEntries(
    Object.entries(themes).filter(([_, entry]) => entry.info.type === 'light')
  );
}