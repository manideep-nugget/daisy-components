import { useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { FluentProvider } from '@fluentui/react-components'
import { createShowcaseTheme } from './themes'
import type { Accent, ThemeMode } from './themes'
import { ThemeContext } from './useTheme'

const storageKey = 'fluent-studio-theme'

function readPreferences(): { mode: ThemeMode; accent: Accent } {
  try {
    const stored: unknown = JSON.parse(localStorage.getItem(storageKey) ?? 'null')
    if (stored && typeof stored === 'object') {
      const candidate = stored as Record<string, unknown>
      return {
        mode: candidate.mode === 'light' || candidate.mode === 'dark' || candidate.mode === 'system' ? candidate.mode : 'system',
        accent: candidate.accent === 'teal' || candidate.accent === 'blue' || candidate.accent === 'purple' ? candidate.accent : 'teal',
      }
    }
  } catch { /* Storage is optional; theme controls still work. */ }
  return { mode: 'system', accent: 'teal' }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState(readPreferences)
  const [systemDark, setSystemDark] = useState(() => window.matchMedia('(prefers-color-scheme: dark)').matches)
  const { mode, accent } = preferences
  const resolvedMode = mode === 'system' ? (systemDark ? 'dark' : 'light') : mode
  const theme = useMemo(() => createShowcaseTheme(resolvedMode, accent), [resolvedMode, accent])

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const update = () => setSystemDark(media.matches)
    update()
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])

  useEffect(() => {
    document.documentElement.style.colorScheme = resolvedMode
    document.documentElement.style.backgroundColor = theme.colorNeutralBackground2
    try { localStorage.setItem(storageKey, JSON.stringify(preferences)) } catch { /* Optional persistence. */ }
  }, [preferences, resolvedMode, theme])

  const context = useMemo(() => ({
    mode, accent, resolvedMode,
    setMode: (next: ThemeMode) => setPreferences((previous) => ({ ...previous, mode: next })),
    setAccent: (next: Accent) => setPreferences((previous) => ({ ...previous, accent: next })),
  }), [mode, accent, resolvedMode])

  return <ThemeContext.Provider value={context}><FluentProvider theme={theme}>{children}</FluentProvider></ThemeContext.Provider>
}
