import { Fragment, useEffect, useRef, useState, type KeyboardEvent } from 'react'
import {
  Badge, Breadcrumb, BreadcrumbButton, BreadcrumbDivider, BreadcrumbItem, Button,
  Dialog, DialogActions, DialogBody, DialogContent, DialogSurface, DialogTitle, DialogTrigger,
  Field, SearchBox, Tree, TreeItem, TreeItemLayout, useId,
} from '@fluentui/react-components'
import {
  AddRegular, ArrowRightRegular, DismissRegular, DocumentRegular, FilterRegular,
  FolderOpenRegular, FolderRegular, SearchRegular,
} from '@fluentui/react-icons'
import { PatternSelect } from './PatternPrimitives'
import { usePreviewOverlay, usePreviewPageActivity } from '../usePreviewPageActivity'
import './NavigationPatterns.css'

export type CommandResource = { id: string; name: string; category: string; description: string; modified: string }
export type CommandAction = { id: string; label: string; description: string }
export type CommandSearchProps = {
  resources: CommandResource[]
  actions: CommandAction[]
  selectedResource: CommandResource | null
  onSelect: (resource: CommandResource) => void
  onAction: (action: CommandAction) => void
}

/** Search and keyboard navigation over caller-owned resources and actions. */
export function CommandSearch({ resources, actions, selectedResource, onSelect, onAction }: CommandSearchProps) {
  const [open, setOpen] = usePreviewOverlay()
  const { active } = usePreviewPageActivity()
  const [query, setQuery] = useState('')
  const resultRef = useRef<HTMLDivElement>(null)
  const launcherRef = useRef<HTMLButtonElement>(null)
  const needle = query.trim().toLowerCase()
  const matchingResources = resources.filter((item) => `${item.name} ${item.category} ${item.description}`.toLowerCase().includes(needle))
  const matchingActions = actions.filter((item) => `${item.label} ${item.description}`.toLowerCase().includes(needle))
  const count = matchingResources.length + matchingActions.length

  useEffect(() => {
    if (!active) return
    const onShortcut = (event: globalThis.KeyboardEvent) => {
      if (!(event.metaKey || event.ctrlKey) || event.key.toLowerCase() !== 'k' || event.altKey) return
      if (document.querySelector('[aria-modal="true"]')) return
      event.preventDefault()
      launcherRef.current?.focus()
      setOpen(true)
    }
    document.addEventListener('keydown', onShortcut)
    return () => document.removeEventListener('keydown', onShortcut)
  }, [active, setOpen])

  function chooseFirst() {
    if (matchingResources[0]) onSelect(matchingResources[0])
    else if (matchingActions[0]) onAction(matchingActions[0])
    else return
    setOpen(false)
  }

  function navigateResults(event: KeyboardEvent<HTMLDivElement>) {
    if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return
    const options = Array.from(resultRef.current?.querySelectorAll<HTMLButtonElement>('[data-command-option]') ?? [])
    if (!options.length) return
    event.preventDefault()
    const current = options.indexOf(document.activeElement as HTMLButtonElement)
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? options.length - 1 :
      event.key === 'ArrowDown' ? (current + 1) % options.length : (current - 1 + options.length) % options.length
    options[next]?.focus()
  }

  return <div className="pattern-stack">
    <div className="pattern-row navpattern-command-launch">
      <Dialog open={open} onOpenChange={(_, data) => setOpen(data.open)}>
        <DialogTrigger disableButtonEnhancement>
          <Button ref={launcherRef} icon={<SearchRegular />} appearance="primary">Search resources</Button>
        </DialogTrigger>
        <DialogSurface className="pattern-overlay navpattern-command-dialog">
          <DialogBody>
            <DialogTitle>Find a resource or action</DialogTitle>
            <DialogContent>
              <div className="pattern-stack">
                <SearchBox input={{ autoFocus: true }} aria-label="Search resources and actions" placeholder="Search by name, type, or action" value={query}
                  onChange={(_, data) => setQuery(data.value)} onKeyDown={(event) => {
                    if (event.key === 'ArrowDown') { event.preventDefault(); resultRef.current?.querySelector<HTMLButtonElement>('[data-command-option]')?.focus() }
                    if (event.key === 'Enter') { event.preventDefault(); chooseFirst() }
                  }} />
                <span className="pattern-muted" role="status">{count} {count === 1 ? 'result' : 'results'} · Use arrow keys, then Enter</span>
                <div ref={resultRef} className="navpattern-command-results" onKeyDown={navigateResults}>
                  {matchingResources.length > 0 && <section aria-label="Recent resources"><h4>Recent resources</h4>
                    {matchingResources.map((item) => <Button key={item.id} data-command-option appearance="subtle" className="navpattern-command-option" icon={<DocumentRegular />}
                      onClick={() => { onSelect(item); setOpen(false) }}><span><strong>{item.name}</strong><span className="pattern-muted">{item.category} · {item.modified}</span></span><ArrowRightRegular /></Button>)}
                  </section>}
                  {matchingActions.length > 0 && <section aria-label="Actions"><h4>Actions</h4>
                    {matchingActions.map((item) => <Button key={item.id} data-command-option appearance="subtle" className="navpattern-command-option" icon={<AddRegular />}
                      onClick={() => { onAction(item); setOpen(false) }}><span><strong>{item.label}</strong><span className="pattern-muted">{item.description}</span></span><ArrowRightRegular /></Button>)}
                  </section>}
                  {!count && <div className="pattern-empty"><strong>No matching resources</strong><p>Try a project name or search for “create”.</p><Button onClick={() => setQuery('')}>Clear search</Button></div>}
                </div>
              </div>
            </DialogContent>
            <DialogActions><Button appearance="subtle" icon={<DismissRegular />} aria-label="Close command search" onClick={() => setOpen(false)}>Close search</Button></DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>
      <span className="pattern-muted">Ctrl / ⌘ K</span>
    </div>
    <div className="pattern-summary" aria-live="polite">
      <strong>{selectedResource ? selectedResource.name : 'Northstar workspace'}</strong>
      <p className="pattern-muted">{selectedResource ? selectedResource.description : `${resources.length} resources available. Find a project, report, or create a sample project.`}</p>
      {selectedResource && <Badge appearance="tint">{selectedResource.category}</Badge>}
    </div>
    <ul className="pattern-list" aria-label="Recent resources">{resources.slice(0, 4).map((resource) => <li key={resource.id} className="pattern-item navpattern-resource-row">
      <DocumentRegular /><div><strong>{resource.name}</strong><span className="pattern-muted">{resource.category} · {resource.modified}</span></div>
      <Button appearance="subtle" aria-label={`Open ${resource.name}`} icon={<ArrowRightRegular />} onClick={() => onSelect(resource)} />
    </li>)}</ul>
  </div>
}

export function CommandSearchPreview() {
  const [resources, setResources] = useState<CommandResource[]>([
    { id: 'roadmap', name: 'Product roadmap', category: 'Project', description: 'Quarterly milestones, owners, and delivery dates for the product team.', modified: 'Updated today' },
    { id: 'revenue', name: 'Revenue overview', category: 'Report', description: 'Sample regional revenue, growth, and performance against targets.', modified: 'Updated yesterday' },
    { id: 'research', name: 'Customer research', category: 'Folder', description: 'Interview notes and research summaries for the next planning cycle.', modified: 'Updated 2 days ago' },
    { id: 'operations', name: 'Operations review', category: 'Project', description: 'Weekly operational checks and outstanding follow-up work.', modified: 'Updated 3 days ago' },
  ])
  const [selected, setSelected] = useState<CommandResource | null>(null)
  return <CommandSearch resources={resources} selectedResource={selected} onSelect={setSelected}
    actions={[{ id: 'create-project', label: 'Create a sample project', description: 'Add a project to this example workspace' }]}
    onAction={() => {
      const sample: CommandResource = { id: `sample-${resources.length}`, name: `Sample project ${resources.filter((item) => item.id.startsWith('sample-')).length + 1}`, category: 'Project', description: 'Your new sample project is ready for planning. This example stays until reload.', modified: 'Created just now' }
      setResources((items) => [sample, ...items]); setSelected(sample)
    }} />
}

export type FolderDocument = { id: string; name: string; type: string; modified: string }
export type ExplorerFolder = { id: string; name: string; documents: FolderDocument[]; children?: ExplorerFolder[] }
export type FolderExplorerProps = { folders: ExplorerFolder[]; selectedId: string; onSelectionChange: (folderId: string) => void }

function findFolderPath(folders: ExplorerFolder[], selectedId: string, parents: ExplorerFolder[] = []): ExplorerFolder[] {
  for (const folder of folders) {
    const path = [...parents, folder]
    if (folder.id === selectedId) return path
    const descendant = findFolderPath(folder.children ?? [], selectedId, path)
    if (descendant.length) return descendant
  }
  return []
}

/** A caller-owned folder destination with independently retained branch expansion. */
export function FolderExplorer({ folders, selectedId, onSelectionChange }: FolderExplorerProps) {
  const [openItems, setOpenItems] = useState<string[]>(folders.slice(0, 1).map((item) => item.id))
  const path = findFolderPath(folders, selectedId)
  const selected = path.at(-1)
  function renderFolders(items: ExplorerFolder[]) {
    return items.map((folder) => <TreeItem key={folder.id} value={folder.id} itemType={folder.children?.length ? 'branch' : 'leaf'}>
      <TreeItemLayout iconBefore={openItems.includes(folder.id) ? <FolderOpenRegular /> : <FolderRegular />}>{folder.name}</TreeItemLayout>
      {folder.children?.length ? <Tree>{renderFolders(folder.children)}</Tree> : null}
    </TreeItem>)
  }
  return <div className="pattern-stack">
    <Breadcrumb aria-label="Selected folder path" className="navpattern-breadcrumb">{path.map((folder, index) => <Fragment key={folder.id}>
      {index > 0 && <BreadcrumbDivider />}<BreadcrumbItem><BreadcrumbButton current={index === path.length - 1} onClick={() => onSelectionChange(folder.id)}>{folder.name}</BreadcrumbButton></BreadcrumbItem>
    </Fragment>)}</Breadcrumb>
    <div className="navpattern-explorer">
      <Tree aria-label="Choose a folder" selectionMode="single" checkedItems={[selectedId]} openItems={openItems}
        onOpenChange={(_, data) => setOpenItems([...data.openItems].map(String))}
        onCheckedChange={(_, data) => { if (data.checked) onSelectionChange(String(data.value)) }}>
        {renderFolders(folders)}
      </Tree>
      <section className="navpattern-folder-content" aria-label="Selected folder contents">
        <div className="pattern-row"><strong>{selected?.name ?? 'Choose a folder'}</strong><span className="pattern-muted">{selected?.documents.length ?? 0} files</span></div>
        {selected?.documents.length ? <ul className="pattern-list">{selected.documents.map((document) => <li key={document.id} className="pattern-item navpattern-folder-document">
          <DocumentRegular /><div><strong>{document.name}</strong><span className="pattern-muted">{document.type} · {document.modified}</span></div>
        </li>)}</ul> : <div className="pattern-empty"><FolderRegular /><strong>This folder is empty</strong><p>Choose another folder to inspect its files.</p></div>}
      </section>
    </div>
    <div className="pattern-result" role="status">Destination: {path.map((folder) => folder.name).join(' / ') || 'None selected'}</div>
  </div>
}

export function FolderExplorerPreview() {
  const [selectedId, setSelectedId] = useState('planning')
  const folders: ExplorerFolder[] = [
    { id: 'workspace', name: 'Northstar', documents: [{ id: 'readme', name: 'Workspace guide', type: 'Document', modified: 'Today' }], children: [
      { id: 'planning', name: 'Planning', documents: [
        { id: 'roadmap', name: 'Product roadmap', type: 'Spreadsheet', modified: 'Today' },
        { id: 'brief', name: 'Launch brief', type: 'Document', modified: 'Yesterday' },
        { id: 'capacity', name: 'Team capacity', type: 'Spreadsheet', modified: 'Oct 10' },
        { id: 'notes', name: 'Planning notes', type: 'Document', modified: 'Oct 9' },
      ] },
      { id: 'research', name: 'Research', documents: [{ id: 'interviews', name: 'Interview summary', type: 'Document', modified: 'Yesterday' }], children: [
        { id: 'interviews-folder', name: 'Interviews', documents: [{ id: 'session', name: 'Session 01', type: 'Document', modified: 'Oct 8' }] },
      ] },
      { id: 'archive', name: 'Archive', documents: [] },
    ] },
  ]
  return <FolderExplorer folders={folders} selectedId={selectedId} onSelectionChange={setSelectedId} />
}

export type FilterField = 'status' | 'owner' | 'priority'
export type FilterCondition = { id: string; field: FilterField; operator: 'is' | 'is-not'; value: string }
export type FilterConfiguration = { matching: 'all' | 'any'; conditions: FilterCondition[] }
export type FilterRecord = { id: string; name: string; status: string; owner: string; priority: string }
export type FilterBuilderProps = { records: FilterRecord[]; value: FilterConfiguration; onChange: (configuration: FilterConfiguration) => void }

function matchesFilter(record: FilterRecord, filter: FilterConfiguration) {
  if (!filter.conditions.length) return true
  const matches = filter.conditions.map((condition) => condition.operator === 'is' ? record[condition.field] === condition.value : record[condition.field] !== condition.value)
  return filter.matching === 'all' ? matches.every(Boolean) : matches.some(Boolean)
}

const fieldLabels: Record<FilterField, string> = { status: 'Status', owner: 'Owner', priority: 'Priority' }

/** Draft and applied filters remain separate; callers own the applied configuration. */
export function FilterBuilder({ records, value, onChange }: FilterBuilderProps) {
  const [open, setOpen] = usePreviewOverlay()
  const [draft, setDraft] = useState(value)
  const [showErrors, setShowErrors] = useState(false)
  const ruleSequence = useRef(1)
  const rulePrefix = useId('filter-rule')
  const results = records.filter((record) => matchesFilter(record, value))
  const draftCount = records.filter((record) => matchesFilter(record, draft)).length
  function startEditing() { setDraft(value); setShowErrors(false); setOpen(true) }
  function updateCondition(id: string, change: Partial<FilterCondition>) {
    setDraft((current) => ({ ...current, conditions: current.conditions.map((condition) => condition.id === id ? { ...condition, ...change } : condition) }))
  }
  function cancel() { setDraft(value); setShowErrors(false); setOpen(false) }
  function apply() {
    if (draft.conditions.some((condition) => !condition.value)) { setShowErrors(true); return }
    onChange(draft); setOpen(false)
  }
  return <div className="pattern-stack">
    <div className="pattern-row">
      <Dialog open={open} onOpenChange={(_, data) => { if (data.open) startEditing(); else cancel() }}>
        <DialogTrigger disableButtonEnhancement><Button icon={<FilterRegular />} onClick={startEditing}>Edit filters{value.conditions.length ? ` (${value.conditions.length})` : ''}</Button></DialogTrigger>
        <DialogSurface className="pattern-overlay navpattern-filter-dialog"><DialogBody>
          <DialogTitle action={<Button appearance="subtle" icon={<DismissRegular />} aria-label="Close filter builder" onClick={cancel} />}>Filter projects</DialogTitle>
          <DialogContent><div className="pattern-stack">
            <PatternSelect label="Match conditions" value={draft.matching} options={[{ value: 'all', label: 'All conditions' }, { value: 'any', label: 'Any condition' }]}
              onChange={(matching) => setDraft((current) => ({ ...current, matching: matching as FilterConfiguration['matching'] }))} />
            {!draft.conditions.length && <p className="pattern-muted">No conditions yet. All projects will be included.</p>}
            {draft.conditions.map((condition, index) => <div className="navpattern-filter-condition" key={condition.id}>
              <div className="navpattern-rule-title"><strong>Condition {index + 1}</strong><Button appearance="subtle" icon={<DismissRegular />} aria-label={`Remove condition ${index + 1}`}
                onClick={() => setDraft((current) => ({ ...current, conditions: current.conditions.filter((item) => item.id !== condition.id) }))} /></div>
              <div className="navpattern-rule-fields">
                <PatternSelect label={`Field ${index + 1}`} value={condition.field} options={Object.entries(fieldLabels).map(([field, label]) => ({ value: field, label }))}
                  onChange={(field) => updateCondition(condition.id, { field: field as FilterField, value: '' })} />
                <PatternSelect label={`Operator ${index + 1}`} value={condition.operator} options={[{ value: 'is', label: 'is' }, { value: 'is-not', label: 'is not' }]}
                  onChange={(operator) => updateCondition(condition.id, { operator: operator as FilterCondition['operator'] })} />
                <Field validationState={showErrors && !condition.value ? 'error' : 'none'} validationMessage={showErrors && !condition.value ? 'Choose a value for this condition.' : undefined}>
                  <PatternSelect label={`Value ${index + 1}`} value={condition.value} options={[{ value: '', label: 'Choose a value' }, ...[...new Set(records.map((record) => record[condition.field]))].map((item) => ({ value: item, label: item }))]}
                    onChange={(nextValue) => updateCondition(condition.id, { value: nextValue })} />
                </Field>
              </div>
            </div>)}
            <div className="pattern-row"><Button icon={<AddRegular />} disabled={draft.conditions.length >= 4}
              onClick={() => {
                const id = `${rulePrefix}-${ruleSequence.current++}`
                setDraft((current) => ({ ...current, conditions: [...current.conditions, { id, field: 'status', operator: 'is', value: '' }] }))
              }}>Add condition</Button>
              <span className="pattern-muted">{draft.conditions.length}/4 conditions</span></div>
            <p className="pattern-muted" role="status">{draft.conditions.some((condition) => !condition.value) ? 'Choose each value to preview matches.' : `${draftCount} ${draftCount === 1 ? 'project matches' : 'projects match'} these conditions.`}</p>
          </div></DialogContent>
          <DialogActions><Button onClick={cancel}>Cancel</Button><Button appearance="primary" onClick={apply}>Apply filters</Button></DialogActions>
        </DialogBody></DialogSurface>
      </Dialog>
      <Button appearance="subtle" disabled={!value.conditions.length} onClick={() => onChange({ matching: 'all', conditions: [] })}>Clear filters</Button>
    </div>
    {!!value.conditions.length && <div className="navpattern-filter-chips" aria-label="Applied filters">
      <span className="pattern-muted">Match {value.matching}</span>
      {value.conditions.map((condition) => <Button key={condition.id} appearance="secondary" icon={<DismissRegular />} iconPosition="after"
        aria-label={`Remove ${fieldLabels[condition.field]} ${condition.operator === 'is' ? 'is' : 'is not'} ${condition.value} filter`}
        onClick={() => onChange({ ...value, conditions: value.conditions.filter((item) => item.id !== condition.id) })}>
        {fieldLabels[condition.field]} {condition.operator === 'is' ? 'is' : 'is not'} {condition.value}
      </Button>)}
    </div>}
    <div className="pattern-row"><strong>Projects</strong><span className="pattern-muted" role="status">{results.length} of {records.length} shown</span></div>
    {results.length ? <ul className="pattern-list" aria-label="Filtered projects">{results.map((record) => <li key={record.id} className="pattern-item navpattern-project-row">
      <div><strong>{record.name}</strong><span className="pattern-muted">{record.owner} · {record.priority} priority</span></div><Badge appearance="tint">{record.status}</Badge>
    </li>)}</ul> : <div className="pattern-empty"><FilterRegular /><strong>No projects match</strong><p>Change your conditions or clear the filters to see every project.</p><Button onClick={() => onChange({ matching: 'all', conditions: [] })}>Clear filters</Button></div>}
  </div>
}

export function FilterBuilderPreview() {
  const [value, setValue] = useState<FilterConfiguration>({ matching: 'all', conditions: [] })
  return <FilterBuilder value={value} onChange={setValue} records={[
    { id: 'roadmap', name: 'Product roadmap', status: 'Active', owner: 'Avery Chen', priority: 'High' },
    { id: 'launch', name: 'Autumn launch', status: 'In review', owner: 'Morgan Lee', priority: 'High' },
    { id: 'research', name: 'Customer research', status: 'Active', owner: 'Sam Rivera', priority: 'Medium' },
    { id: 'operations', name: 'Operations review', status: 'Planned', owner: 'Morgan Lee', priority: 'Low' },
    { id: 'archive', name: 'Archive cleanup', status: 'Complete', owner: 'Avery Chen', priority: 'Low' },
  ]} />
}
