import { Suspense, useState } from 'react'
import { Button, SearchBox, Spinner, Tab, TabList } from '@fluentui/react-components'
import { PreviewCard } from './PreviewCard'
import { PreviewPageActivity } from './PreviewPageActivity'
import { usePreviewPageActivity } from './usePreviewPageActivity'
import { catalogue, catalogueCounts, filterCatalogue, type CatalogueView } from './catalogue'
import './ComponentGallery.css'

export function ComponentGallery() {
  const [view, setView] = useState<CatalogueView>('foundations')
  const [query, setQuery] = useState('')
  const [catalogueRevision, setCatalogueRevision] = useState(0)
  const [visited, setVisited] = useState(() => new Set(filterCatalogue('foundations', '').map(entry => entry.id)))
  const { active, revision } = usePreviewPageActivity()
  const search = query.trim().toLowerCase()
  const matches = filterCatalogue(view, query)
  const visibleIds = new Set(matches.map(entry => entry.id))
  const viewName = view === 'foundations' ? 'Components' : view === 'patterns' ? 'Patterns' : 'All examples'
  const transition = (nextView: CatalogueView, nextQuery = query) => {
    setVisited(previous => new Set([...previous, ...filterCatalogue(nextView, nextQuery).map(entry => entry.id)]))
    setView(nextView); setQuery(nextQuery); setCatalogueRevision(value => value + 1)
  }
  return <div className="component-catalogue">
    <div className="catalogue-toolbar">
      <TabList aria-label="Component catalogue" selectedValue={view} onTabSelect={(_, data) => transition(data.value as CatalogueView)}>
        <Tab value="foundations">Components <span className="catalogue-tab-count">{catalogueCounts.components}</span></Tab><Tab value="patterns">Patterns <span className="catalogue-tab-count">{catalogueCounts.patterns}</span></Tab><Tab value="all">All <span className="catalogue-tab-count">{catalogueCounts.all}</span></Tab>
      </TabList>
      <SearchBox aria-label="Search component catalogue" placeholder={`Search ${view === 'foundations' ? 'components' : view === 'all' ? 'all examples' : 'patterns'}`} value={query} onChange={(_, data) => transition(view, data.value)} />
    </div>
    <p className="catalogue-results" role="status">{search ? `${matches.length} ${matches.length === 1 ? 'example' : 'examples'} matching “${query.trim()}” in ${viewName.toLowerCase()}` : `${matches.length} working examples · A–Z · Changes reset on reload`}</p>
    {!matches.length && <div className="catalogue-empty"><h2>No components match “{query.trim()}”</h2><p>Try a name, category, or keyword such as “data”, “sharing”, or “dialog”.</p><div className="pattern-row"><Button onClick={() => transition(view, '')}>Clear search</Button><Button appearance="primary" onClick={() => transition('all')}>Search all components</Button></div></div>}
    <section className="catalogue-section" hidden={!matches.length} inert={!matches.length} aria-labelledby="catalogue-heading">
      <div className="catalogue-section-heading"><h2 id="catalogue-heading">{viewName}</h2></div>
      <div className={view === 'foundations' ? 'component-grid' : 'pattern-grid'}>{catalogue.filter(entry => visited.has(entry.id)).map(entry => <div key={entry.id} className="catalogue-preview" hidden={!visibleIds.has(entry.id)} inert={!visibleIds.has(entry.id)}>
        <PreviewPageActivity active={active && visibleIds.has(entry.id)} revision={`${revision}:${catalogueRevision}`}><PreviewCard id={entry.id} title={entry.name} kind={entry.kind} source={entry.source} notes={entry.notes} render={() => <Suspense fallback={<Spinner label={`Loading ${entry.name} example`} size="small" />}><entry.Preview /></Suspense>} /></PreviewPageActivity>
      </div>)}</div>
    </section>
  </div>
}
