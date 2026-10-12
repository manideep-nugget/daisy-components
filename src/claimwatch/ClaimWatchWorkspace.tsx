import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import {
  Avatar, Badge, Button, DrawerBody, DrawerHeader, DrawerHeaderTitle, OverlayDrawer, useRestoreFocusTarget,
} from '@fluentui/react-components'
import {
  ArrowLeft20Regular, ChevronRight16Regular, ClipboardTask20Regular, Dismiss20Regular,
  DocumentSearch20Regular, Grid20Regular, Home20Regular, Navigation20Regular,
  ShieldCheckmark24Regular, Sparkle20Regular,
} from '@fluentui/react-icons'
import { ThemeControls } from '../components/ThemeControls'
import { useClaimWatch } from './useClaimWatch'
import { ClaimHome, ClaimWorkbench, ClaimsExplorer } from './screens/IntakeScreens'
import { ClaimDetail } from './screens/ClaimDetail'
import { DaisyPanel } from './screens/DaisyPanel'
import type { DetailTab } from './types'
import './ClaimWatchWorkspace.css'

type Route = { view: 'home' | 'workbench' | 'claims' | 'detail'; claimId: string; tab: DetailTab }
const showcasePages = [
  { label: 'Components', target: '/components' },
  { label: 'Blocks', target: '/blocks' },
] as const
function parseRoute(hash: string): Route {
  const [path, query] = hash.replace(/^#/, '').split('?')
  const segments = path.split('/').filter(Boolean)
  const tab = new URLSearchParams(query).get('tab')
  const validTab: DetailTab = tab === 'documents' || tab === 'assessment' || tab === 'workflow' ? tab : 'overview'
  let claimId = ''
  try { claimId = decodeURIComponent(segments[2] ?? '') } catch { /* Unknown records have a recovery screen. */ }
  return {
    view: segments[1] === 'claims' ? (claimId ? 'detail' : 'claims') : segments[1] === 'workbench' ? 'workbench' : 'home',
    claimId, tab: validTab,
  }
}

function go(view: 'home' | 'workbench' | 'claims', id?: string, tab: DetailTab = 'overview') {
  window.location.hash = `/claimwatch/${view}${id ? `/${encodeURIComponent(id)}?tab=${tab}` : ''}`
}

export function ClaimWatchWorkspace({ hash }: { hash: string }) {
  const route = parseRoute(hash)
  const { tasks, explorerFilters, sendDaisy } = useClaimWatch()
  const [navOpen, setNavOpen] = useState(false)
  const returnAfterNavExit = useRef<string | null>(null)
  const [daisyOpen, setDaisyOpen] = useState(false)
  const routeKey = `${route.view}:${route.claimId}`
  const [contextOverride, setContextOverride] = useState<{ routeKey: string; context: string | null } | null>(null)
  const assistantContext = contextOverride?.routeKey === routeKey ? contextOverride.context : route.view === 'detail' ? route.claimId : null
  const [requestInfoSignal, setRequestInfoSignal] = useState(0)
  const [requestTarget, setRequestTarget] = useState<string | null>(null)
  const [wide, setWide] = useState(() => window.matchMedia('(min-width: 1280px)').matches)
  const scrollRef = useRef<HTMLElement>(null)
  const lastOpenedClaim = useRef<string | null>(null)
  const daisyTriggerRef = useRef<HTMLButtonElement>(null)
  const restoreFocusTarget = useRestoreFocusTarget()

  function closeDaisy() {
    setDaisyOpen(false)
    if (wide) requestAnimationFrame(() => daisyTriggerRef.current?.focus())
  }

  useEffect(() => {
    const media = window.matchMedia('(min-width: 1280px)')
    const update = () => setWide(media.matches)
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])

  useLayoutEffect(() => {
    const frame = requestAnimationFrame(() => {
      if (!scrollRef.current) return
      if (route.view === 'claims') {
        scrollRef.current.scrollTop = explorerFilters.scrollTop
        if (lastOpenedClaim.current) {
          const button = scrollRef.current.querySelector<HTMLButtonElement>(`[data-claim-id="${CSS.escape(lastOpenedClaim.current)}"]`)
          button?.focus({ preventScroll: true })
        }
      } else if (route.view !== 'detail' || !hash.includes('?tab=')) {
        scrollRef.current.scrollTop = 0
      }
    })
    return () => cancelAnimationFrame(frame)
  }, [hash, route.view, explorerFilters.scrollTop])

  function openClaim(id: string, tab?: DetailTab) {
    lastOpenedClaim.current = id
    if (!wide) setDaisyOpen(false)
    go('claims', id, tab)
    scrollRef.current?.scrollTo({ top: 0 })
  }

  function askDaisy(prompt?: string, claimId?: string) {
    const context = claimId ?? (route.view === 'detail' ? route.claimId : null)
    setContextOverride({ routeKey, context })
    setDaisyOpen(true)
    if (prompt) sendDaisy(context, prompt)
  }

  function requestInfo(id: string) {
    if (!wide) setDaisyOpen(false)
    go('claims', id, 'documents')
    setRequestTarget(id)
    setRequestInfoSignal((signal) => signal + 1)
  }

  const openCount = tasks.filter((task) => task.state === 'open').length
  const activeNav = route.view === 'detail' ? 'claims' : route.view
  const navigation = [
    { value: 'home' as const, title: 'Home', icon: <Home20Regular /> },
    { value: 'workbench' as const, title: 'My workbench', icon: <ClipboardTask20Regular /> },
    { value: 'claims' as const, title: 'Claims', icon: <DocumentSearch20Regular /> },
  ]
  const nav = (
    <nav className="cw-navigation" aria-label="ClaimWatch navigation">
      {navigation.map((item) => (
        <Button key={item.value} appearance="subtle" icon={item.icon} className={`cw-nav-item${activeNav === item.value ? ' is-active' : ''}`} aria-current={activeNav === item.value ? 'page' : undefined} onClick={() => { go(item.value); setNavOpen(false) }}>
          <span>{item.title}</span>{item.value === 'workbench' && <Badge size="large" appearance="tint" color={activeNav === item.value ? 'brand' : 'informative'}>{openCount}</Badge>}
        </Button>
      ))}
    </nav>
  )
  const screenProps = { onOpenClaim: openClaim, onOpenWorkbench: () => go('workbench'), onAskDaisy: askDaisy }
  const assistant = <DaisyPanel contextId={assistantContext} onClose={closeDaisy} onOpenClaim={openClaim} onOpenWorkbench={() => { go('workbench'); if (!wide) setDaisyOpen(false) }} onRequestInfo={requestInfo} />

  return (
    <div className="cw-workspace">
      <a href={hash} className="skip-link" onClick={(event) => { event.preventDefault(); scrollRef.current?.focus() }}>Skip to workspace content</a>
      <aside className="cw-sidebar">
        <a className="cw-brand" href="#/claimwatch/home"><span className="cw-brand-icon"><ShieldCheckmark24Regular /></span><span>ClaimWatch</span></a>
        <div className="cw-workspace-label">Intake workspace</div>
        {nav}
        <div className="cw-sidebar-bottom">
          <nav className="cw-showcase-links" aria-label="Showcase pages">
            {showcasePages.map((page) => <Button key={page.target} as="a" href={`#${page.target}`} appearance="subtle" icon={<Grid20Regular />}>{page.label}</Button>)}
          </nav>
          <div className="cw-user"><Avatar name="Maya Patel" color="neutral" size={32} /><div><strong>Maya Patel</strong><span>Intake specialist</span></div></div>
        </div>
      </aside>

      <div className="cw-main-column">
        <header className="cw-toolbar">
          <Button {...restoreFocusTarget} className="cw-nav-toggle" appearance="subtle" icon={<Navigation20Regular />} aria-label="Open navigation" onClick={() => setNavOpen(true)} />
          <a className="cw-mobile-brand" href="#/claimwatch/home" aria-label="ClaimWatch home"><ShieldCheckmark24Regular /></a>
          <nav className="cw-breadcrumbs" aria-label="Breadcrumb">
            <a href="#/claimwatch/home">Claims operations</a><ChevronRight16Regular /><span>{route.view === 'home' ? 'Home' : route.view === 'workbench' ? 'My workbench' : 'Claims'}</span>{route.view === 'detail' && <><ChevronRight16Regular /><span className="cw-breadcrumb-id">{route.claimId}</span></>}
          </nav>
          <div className="cw-toolbar-actions"><Badge className="cw-demo-label" appearance="outline" size="large" color="informative">Demo workspace</Badge><ThemeControls /><Button {...restoreFocusTarget} ref={daisyTriggerRef} className="cw-assistant-trigger" appearance={daisyOpen ? 'primary' : 'subtle'} icon={<Sparkle20Regular />} aria-label={daisyOpen ? 'Close Daisy assistant' : 'Open Daisy assistant'} onClick={() => { if (daisyOpen) closeDaisy(); else askDaisy() }}><span className="cw-daisy-label">Daisy</span></Button></div>
        </header>
        <div className={`cw-workarea${daisyOpen && wide ? ' with-assistant' : ''}`}>
          <main ref={scrollRef} data-cw-scroll className="cw-main-scroll" tabIndex={-1} aria-label="ClaimWatch content">
            {route.view === 'home' && <ClaimHome {...screenProps} />}
            {route.view === 'workbench' && <ClaimWorkbench {...screenProps} />}
            {route.view === 'claims' && <ClaimsExplorer {...screenProps} />}
            {route.view === 'detail' && <ClaimDetail key={route.claimId} claimId={route.claimId} tab={route.tab} onTabChange={(tab) => go('claims', route.claimId, tab)} onBack={() => go('claims')} onAskDaisy={askDaisy} requestInfoSignal={requestTarget === route.claimId ? requestInfoSignal : 0} onRequestInfoHandled={() => setRequestTarget(null)} />}
          </main>
          {daisyOpen && wide && <aside className="cw-assistant-aside" aria-label="Daisy contextual assistant">{assistant}</aside>}
        </div>
      </div>

      <OverlayDrawer open={navOpen} onOpenChange={(_, data) => setNavOpen(data.open)} position="start" className="cw-nav-drawer" surfaceMotion={{ onMotionFinish: (_, { direction }) => {
        if (direction === 'exit' && returnAfterNavExit.current) {
          const target = returnAfterNavExit.current
          returnAfterNavExit.current = null
          requestAnimationFrame(() => { window.location.hash = target })
        }
      } }}>
        <DrawerHeader><DrawerHeaderTitle action={<Button appearance="subtle" icon={<Dismiss20Regular />} aria-label="Close navigation" onClick={() => setNavOpen(false)} />}>ClaimWatch</DrawerHeaderTitle></DrawerHeader>
        <DrawerBody>{nav}<nav className="cw-showcase-links" aria-label="Showcase pages">
          {showcasePages.map((page) => <Button key={page.target} as="a" href={`#${page.target}`} appearance="subtle" icon={<ArrowLeft20Regular />} onClick={(event) => { event.preventDefault(); returnAfterNavExit.current = page.target; setNavOpen(false) }}>{page.label}</Button>)}
        </nav></DrawerBody>
      </OverlayDrawer>
      <OverlayDrawer open={daisyOpen && !wide} onOpenChange={(_, data) => setDaisyOpen(data.open)} position="end" className="cw-daisy-drawer" aria-label="Daisy assistant">
        <DrawerBody>{assistant}</DrawerBody>
      </OverlayDrawer>
    </div>
  )
}
