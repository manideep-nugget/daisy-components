import type { ReactElement } from 'react'
import { Button, Menu, MenuItemRadio, MenuList, MenuPopover, MenuTrigger, Popover, PopoverSurface, PopoverTrigger } from '@fluentui/react-components'
import { Checkmark16Regular, ChevronDown16Regular, DarkTheme20Regular, Desktop20Regular, Settings20Regular, WeatherSunny20Regular } from '@fluentui/react-icons'
import { useTheme } from '../theme/useTheme'
import type { Accent, ThemeMode } from '../theme/themes'
import { PreviewTooltip } from './PreviewPageActivity'
import { usePreviewOverlay } from './usePreviewPageActivity'

const modes: { value: ThemeMode; label: string; icon: ReactElement }[] = [
  { value: 'light', label: 'Light', icon: <WeatherSunny20Regular /> },
  { value: 'dark', label: 'Dark', icon: <DarkTheme20Regular /> },
  { value: 'system', label: 'System', icon: <Desktop20Regular /> },
]
const accents: { value: Accent; label: string }[] = [
  { value: 'teal', label: 'Teal' }, { value: 'blue', label: 'Blue' }, { value: 'purple', label: 'Purple' },
]

export function ThemeControls() {
  const { mode, accent, setMode, setAccent } = useTheme()
  const [menuOpen, setMenuOpen] = usePreviewOverlay()
  const [settingsOpen, setSettingsOpen] = usePreviewOverlay()
  const currentMode = modes.find((entry) => entry.value === mode)!
  return (
    <div className="theme-controls">
      <div className="desktop-theme-controls"><div className="accent-picker" role="group" aria-label="Accent color">
        {accents.map((entry) => (
          <PreviewTooltip key={entry.value} content={`${entry.label} accent`} relationship="label">
            <button type="button" className={`accent-swatch accent-swatch-${entry.value}`} aria-label={`${entry.label} accent`} aria-pressed={accent === entry.value} onClick={() => setAccent(entry.value)}>
              {accent === entry.value && <Checkmark16Regular />}
            </button>
          </PreviewTooltip>
        ))}
      </div>
      <div className="toolbar-divider" />
      <Menu open={menuOpen} onOpenChange={(_, data) => setMenuOpen(data.open)} checkedValues={{ appearance: [mode] }} onCheckedValueChange={(_, data) => { setMode(data.checkedItems[0] as ThemeMode); setMenuOpen(false) }}>
        <MenuTrigger disableButtonEnhancement>
          <Button appearance="subtle" icon={currentMode.icon} aria-label={`Appearance: ${currentMode.label}`}><span className="theme-mode-label">{currentMode.label}</span><ChevronDown16Regular /></Button>
        </MenuTrigger>
        <MenuPopover><MenuList>{modes.map((entry) => <MenuItemRadio key={entry.value} name="appearance" value={entry.value} icon={entry.icon}>{entry.label}</MenuItemRadio>)}</MenuList></MenuPopover>
      </Menu>
      </div>
      <div className="mobile-theme-controls"><Popover open={settingsOpen} onOpenChange={(_, data) => setSettingsOpen(data.open)} trapFocus positioning="below-end">
        <PopoverTrigger disableButtonEnhancement><Button appearance="subtle" icon={<Settings20Regular />} aria-label="Theme settings" /></PopoverTrigger>
        <PopoverSurface className="theme-settings-surface" aria-label="Theme settings">
          <div className="theme-settings-heading"><strong>Theme settings</strong><Button appearance="subtle" onClick={() => setSettingsOpen(false)}>Done</Button></div>
          <div role="group" aria-label="Appearance"><p>Appearance</p>{modes.map(entry => <Button key={entry.value} icon={entry.icon} appearance={mode === entry.value ? 'primary' : 'secondary'} aria-pressed={mode === entry.value} onClick={() => setMode(entry.value)}>{entry.label}</Button>)}</div>
          <div role="group" aria-label="Accent color"><p>Accent color</p>{accents.map(entry => <Button key={entry.value} appearance={accent === entry.value ? 'primary' : 'secondary'} aria-pressed={accent === entry.value} onClick={() => setAccent(entry.value)}>{entry.label}</Button>)}</div>
        </PopoverSurface>
      </Popover></div>
    </div>
  )
}

