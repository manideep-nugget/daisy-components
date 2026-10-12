import { createContext, useContext } from 'react'
import type { Accent, ThemeMode } from './themes'

export type ThemeContextValue = {
  mode: ThemeMode
  resolvedMode: 'light' | 'dark'
  accent: Accent
  setMode: (mode: ThemeMode) => void
  setAccent: (accent: Accent) => void
}

export const ThemeContext = createContext<ThemeContextValue | null>(null)

export function useTheme() {
  const value = useContext(ThemeContext)
  if (!value) throw new Error('useTheme must be used inside ThemeProvider')
  return value
}
