import { createDarkTheme, createLightTheme } from '@fluentui/react-components'
import type { BrandVariants, Theme } from '@fluentui/react-components'

export type ThemeMode = 'light' | 'dark' | 'system'
export type Accent = 'teal' | 'blue' | 'purple'

// Independently authored palettes, with no product-specific theme dependency.
const palettes: Record<Accent, BrandVariants> = {
  teal: {
    10: '#041c17', 20: '#07352c', 30: '#094b3e', 40: '#0b5a4a',
    50: '#0e6655', 60: '#10705e', 70: '#127764', 80: '#147d6a',
    90: '#32947f', 100: '#53a994', 110: '#75bdaa', 120: '#96cebf',
    130: '#b4dfd3', 140: '#ceebe3', 150: '#e1f3ed', 160: '#f1faf6',
  },
  blue: {
    10: '#08172d', 20: '#102943', 30: '#153b61', 40: '#194b81',
    50: '#1d559a', 60: '#205ba8', 70: '#235fb1', 80: '#2563b8',
    90: '#3e7ac9', 100: '#5991d7', 110: '#79a9e3', 120: '#99bfec',
    130: '#b7d2f2', 140: '#d0e3f7', 150: '#e5effb', 160: '#f3f7fd',
  },
  purple: {
    10: '#1e102f', 20: '#302045', 30: '#432c64', 40: '#523781',
    50: '#604297', 60: '#674aa8', 70: '#6c4eb3', 80: '#7051ba',
    90: '#866acb', 100: '#9b84d8', 110: '#b09ee3', 120: '#c3b6ec',
    130: '#d5ccf2', 140: '#e4def7', 150: '#efebfb', 160: '#f7f5fd',
  },
}

export function createShowcaseTheme(appearance: 'light' | 'dark', accent: Accent): Theme {
  const palette = palettes[accent]
  const theme = appearance === 'dark' ? createDarkTheme(palette) : createLightTheme(palette)
  return {
    ...theme,
    fontFamilyBase: "'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif",
    fontSizeBase100: '14px',
    fontSizeBase200: '14px',
    fontSizeBase300: '14px',
    lineHeightBase100: '20px',
    lineHeightBase200: '20px',
    lineHeightBase300: '20px',
    ...(appearance === 'dark' ? { colorBrandForeground1: palette[110], colorBrandForeground2: palette[120] } : {}),
  }
}
