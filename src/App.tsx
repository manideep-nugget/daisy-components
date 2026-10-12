import { lazy, Suspense, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Spinner, useRestoreFocusTarget } from '@fluentui/react-components'
import { ComponentGallery } from './components/ComponentGallery'
import { catalogueCounts } from './components/catalogue'
import { blockCounts } from './components/blocks/blockCatalogue'
import { ThemeControls } from './components/ThemeControls'
import { PreviewPageActivity } from './components/PreviewPageActivity'
import './App.css'

type ShowcasePage = 'components' | 'blocks'
type Navigation = { hash: string; revision: number; kind: 'initial' | 'navigate' | 'history' }

function canonicalHash(hash: string) {
  if (hash === '#blocks' || hash === '#/blocks') return '#/blocks'
  if (hash === '#/claimwatch' || hash === '#/claimwatch/') return '#/claimwatch/home'
  if (hash.startsWith('#/claimwatch/')) return hash
  return '#/components'
}

function readHash() {
  const hash = canonicalHash(window.location.hash)
  if (hash !== window.location.hash) window.history.replaceState(window.history.state, '', hash)
  return hash
}

function showcasePage(hash: string): ShowcasePage | null {
  return hash === '#/components' ? 'components' : hash === '#/blocks' ? 'blocks' : null
}

const pageCopy = {
  components: { title: 'Components', description: 'Explore Fluent components, reusable compositions, and enterprise patterns.', count: `${catalogueCounts.components} components · ${catalogueCounts.patterns} patterns` },
  blocks: { title: 'Enterprise blocks', description: 'Working layouts for files, teams, records, forms, and operations.', count: `${blockCounts.all} enterprise blocks` },
}
const EnterpriseBlocks = lazy(() => import('./components/blocks/EnterpriseBlocks').then(module => ({ default: module.EnterpriseBlocks })))

function ShowcaseShell({ page, active, navigation, visited, scrollTop }: {
  page: ShowcasePage; active: boolean; navigation: Navigation; visited: Set<ShowcasePage>; scrollTop: number;
}) {
  const headingRef = useRef<HTMLHeadingElement>(null)
  const mainRef = useRef<HTMLElement>(null)
  const copy = pageCopy[page]

  useLayoutEffect(() => {
    if (!active) return
    let observer: MutationObserver | undefined
    function focusPage() {
      // Native modal exits finish before the next page receives keyboard focus.
      if (document.querySelector('[role="dialog"][aria-modal="true"]') || document.getElementById('root')?.getAttribute('aria-hidden') === 'true') return false
      window.scrollTo({ top: navigation.kind === 'history' ? scrollTop : 0, behavior: 'instant' })
      headingRef.current?.focus({ preventScroll: true })
      observer?.disconnect()
      return true
    }
    const frame = requestAnimationFrame(() => {
      if (!focusPage()) {
        observer = new MutationObserver(focusPage)
        observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['aria-hidden', 'aria-modal'] })
      }
    })
    return () => { cancelAnimationFrame(frame); observer?.disconnect() }
  }, [active, page, navigation.revision, navigation.kind, scrollTop])

  return <PreviewPageActivity active={active} revision={navigation.revision}>
    <div className="showcase-app" hidden={!active} inert={!active}>
      <a href={`#/${page}`} className="skip-link" onClick={(event) => { event.preventDefault(); mainRef.current?.focus(); window.scrollTo({ top: 0, behavior: 'instant' }) }}>Skip to content</a>
      <header className="site-header"><div className="header-inner">
        <a className="wordmark" href="#/components" aria-label="Fluent Studio components"><span className="brand-mark" aria-hidden="true"><span /><span /><span /><span /></span><span>Fluent<span className="wordmark-studio">studio</span></span></a>
        <nav className="header-navigation" aria-label="Showcase pages">
          <a href="#/components" aria-current={page === 'components' ? 'page' : undefined}>Components</a>
          <a href="#/blocks" aria-current={page === 'blocks' ? 'page' : undefined}>Blocks</a>
          <a href="#/claimwatch/home">ClaimWatch demo</a>
        </nav>
        <ThemeControls />
      </div></header>
      <main ref={mainRef} id="showcase-content" className="page-content" tabIndex={-1}>
        <div className="showcase-page-heading"><div><h1 ref={headingRef} tabIndex={-1}>{copy.title}</h1><p>{copy.description}</p></div><span className="section-count">{copy.count}</span></div>
        <section className="showcase-route" aria-label="Component previews" hidden={page !== 'components'} inert={page !== 'components'}>
          <PreviewPageActivity active={active && page === 'components'} revision={navigation.revision}>{visited.has('components') && <ComponentGallery />}</PreviewPageActivity>
        </section>
        <section className="showcase-route" aria-label="Enterprise block previews" hidden={page !== 'blocks'} inert={page !== 'blocks'}>
          <PreviewPageActivity active={active && page === 'blocks'} revision={navigation.revision}>{visited.has('blocks') && <Suspense fallback={<Spinner label="Opening enterprise blocks" />}><EnterpriseBlocks /></Suspense>}</PreviewPageActivity>
        </section>
      </main>
      <footer className="site-footer"><div className="footer-inner"><span>Fluent<span className="wordmark-studio">studio</span></span><p>A visual exploration, built with open-source Fluent UI React.</p><a href={`#/${page}`} onClick={(event) => { event.preventDefault(); window.scrollTo({ top: 0, behavior: 'instant' }); headingRef.current?.focus({ preventScroll: true }) }}>Back to top ↑</a></div></footer>
    </div>
  </PreviewPageActivity>
}

const ClaimWatchWorkspace = lazy(() => import('./claimwatch/ClaimWatchWorkspace').then((module) => ({ default: module.ClaimWatchWorkspace })))

function ClaimWatchPage({ hash }: { hash: string }) {
  const containerRef = useRef<HTMLDivElement>(null)
  useLayoutEffect(() => {
    let observer: MutationObserver | undefined
    function focusWorkspace() {
      const main = containerRef.current?.querySelector<HTMLElement>('main[data-cw-scroll]')
      if (!main || document.querySelector('[role="dialog"][aria-modal="true"]') || document.getElementById('root')?.getAttribute('aria-hidden') === 'true') return false
      main.focus({ preventScroll: true })
      observer?.disconnect()
      return true
    }
    const frame = requestAnimationFrame(() => {
      if (!focusWorkspace()) {
        observer = new MutationObserver(focusWorkspace)
        observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['aria-hidden', 'aria-modal'] })
      }
    })
    return () => { cancelAnimationFrame(frame); observer?.disconnect() }
  }, [])
  return <div ref={containerRef}><Suspense fallback={<div className="workspace-loading"><Spinner label="Opening ClaimWatch workspace" /></div>}><ClaimWatchWorkspace hash={hash} /></Suspense></div>
}

function App() {
  // Retain Fluent's focus manager while routes replace modal-owning screens.
  useRestoreFocusTarget()
  const [navigation, setNavigation] = useState<Navigation>(() => ({ hash: readHash(), revision: 0, kind: 'initial' }))
  const navigationRef = useRef(navigation)
  const intentRef = useRef(false)
  const positions = useRef<Partial<Record<ShowcasePage, number>>>({})
  const [visited, setVisited] = useState(() => new Set<ShowcasePage>(showcasePage(navigation.hash) ? [showcasePage(navigation.hash)!] : []))
  const page = showcasePage(navigation.hash)
  const [restoreTop, setRestoreTop] = useState(0)

  useEffect(() => {
    document.title = `${page ? pageCopy[page].title : 'ClaimWatch demo'} — Fluent Studio`
  }, [page])

  useEffect(() => {
    const previousRestoration = window.history.scrollRestoration
    window.history.scrollRestoration = 'manual'
    function rememberPosition() {
      const previousPage = showcasePage(navigationRef.current.hash)
      if (previousPage) positions.current[previousPage] = window.scrollY
    }
    function recordLink(event: MouseEvent) {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
      const anchor = (event.target as Element).closest<HTMLAnchorElement>('a[href^="#"]')
      if (anchor && canonicalHash(anchor.hash) !== navigationRef.current.hash) { rememberPosition(); intentRef.current = true }
    }
    function update() {
      const hash = readHash()
      if (hash === navigationRef.current.hash) return
      rememberPosition()
      const nextPage = showcasePage(hash)
      const next: Navigation = { hash, revision: navigationRef.current.revision + 1, kind: intentRef.current ? 'navigate' : 'history' }
      intentRef.current = false
      navigationRef.current = next
      setRestoreTop(nextPage ? positions.current[nextPage] ?? 0 : 0)
      if (nextPage) setVisited((pages) => new Set([...pages, nextPage]))
      setNavigation(next)
      if (!nextPage) window.scrollTo({ top: 0, behavior: 'instant' })
    }
    document.addEventListener('click', recordLink, true)
    window.addEventListener('hashchange', update)
    return () => {
      document.removeEventListener('click', recordLink, true)
      window.removeEventListener('hashchange', update)
      window.history.scrollRestoration = previousRestoration
    }
  }, [])

  return <>
    <ShowcaseShell page={page ?? 'components'} active={page !== null} navigation={navigation} visited={visited} scrollTop={restoreTop} />
    {page === null && <PreviewPageActivity active revision={navigation.revision}><ClaimWatchPage hash={navigation.hash} /></PreviewPageActivity>}
  </>
}

export default App
