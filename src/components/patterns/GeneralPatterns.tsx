import { useId, useRef, useState } from 'react'
import {
  Avatar, Breadcrumb, BreadcrumbButton, BreadcrumbDivider, BreadcrumbItem, Button,
  Checkbox, Dialog, DialogActions, DialogBody, DialogContent, DialogSurface, DialogTitle,
  DrawerBody, DrawerHeader, DrawerHeaderTitle, Field, Input, OverlayDrawer, SearchBox,
  Tab, TabList, Textarea, Toolbar, ToolbarButton, ToolbarDivider, useRestoreFocusTarget,
} from '@fluentui/react-components'
import {
  ArrowUndo20Regular, Checkmark20Regular, Comment20Regular, Delete20Regular,
  Dismiss20Regular, Document20Regular, Edit20Regular, Folder20Regular, Grid20Regular,
  Home20Regular, List20Regular, Navigation20Regular, People20Regular,
} from '@fluentui/react-icons'
import { usePreviewOverlay } from '../usePreviewPageActivity'
import { PreviewTooltip } from '../PreviewPageActivity'
import { StatusBadge } from '../shared/Shared'
import { PatternSelect, type PatternOption } from './PatternPrimitives'
import './GeneralPatterns.css'

export type NavigationDestination = {
  id: string; label: string; description: string; icon: 'home' | 'resources' | 'people';
  rows: { id: string; title: string; detail: string }[]
}
export type NavigationWorkspace = { id: string; name: string }
const destinationIcon = (icon: NavigationDestination['icon']) => icon === 'home' ? <Home20Regular /> : icon === 'resources' ? <Folder20Regular /> : <People20Regular />

/** A local application shell. The host owns workspace and destination selection. */
export function ApplicationNavigation({ workspaces, workspaceId, destinations, selectedId, onWorkspaceChange, onSelectionChange }: {
  workspaces: NavigationWorkspace[]; workspaceId: string; destinations: NavigationDestination[];
  selectedId: string; onWorkspaceChange: (id: string) => void; onSelectionChange: (id: string) => void
}) {
  const [open, setOpen] = usePreviewOverlay()
  const restoreFocus = useRestoreFocusTarget()
  const titleId = useId()
  const workspace = workspaces.find(item => item.id === workspaceId)
  const current = destinations.find(item => item.id === selectedId) ?? destinations[0]
  const navigation = <nav aria-label="Sample application navigation" className="general-navigation-items">{destinations.map(item => <Button key={item.id} appearance={item.id === selectedId ? 'secondary' : 'subtle'} icon={destinationIcon(item.icon)} aria-current={item.id === selectedId ? 'page' : undefined} onClick={() => { onSelectionChange(item.id); setOpen(false) }}>{item.label}</Button>)}</nav>
  return <div className="pattern-stack general-navigation">
    <div className="general-navigation-top"><PatternSelect label="Workspace" value={workspaceId} options={workspaces.map(item => ({ value: item.id, label: item.name }))} onChange={onWorkspaceChange} /><Button {...restoreFocus} className="general-navigation-trigger" icon={<Navigation20Regular />} onClick={() => setOpen(true)}>Navigation</Button></div>
    <div className="general-navigation-layout"><aside className="general-navigation-rail">{navigation}</aside>
      <div className="general-navigation-content">
        <Breadcrumb aria-label="Sample application location"><BreadcrumbItem><BreadcrumbButton onClick={() => { if (destinations[0]) onSelectionChange(destinations[0].id) }}>{workspace?.name ?? 'Workspace'}</BreadcrumbButton></BreadcrumbItem>{current && <><BreadcrumbDivider /><BreadcrumbItem><BreadcrumbButton current>{current.label}</BreadcrumbButton></BreadcrumbItem></>}</Breadcrumb>
        {current && <><h4>{current.label}</h4><p className="pattern-muted">{current.description}</p><ul className="pattern-list" aria-label={`${current.label} items`}>{current.rows.map(row => <li className="pattern-item" key={row.id}><Document20Regular aria-hidden="true" /><div><strong>{row.title}</strong><span className="pattern-muted general-block">{row.detail}</span></div></li>)}</ul></>}
      </div>
    </div>
    <OverlayDrawer open={open} onOpenChange={(_, data) => setOpen(data.open)} position="start" size="small" aria-labelledby={titleId} className="general-navigation-drawer">
      <DrawerHeader><DrawerHeaderTitle id={titleId} action={<Button appearance="subtle" icon={<Dismiss20Regular />} aria-label="Close sample navigation" onClick={() => setOpen(false)} />}>{workspace?.name ?? 'Workspace'}</DrawerHeaderTitle></DrawerHeader><DrawerBody>{navigation}</DrawerBody>
    </OverlayDrawer>
  </div>
}

const navigationDestinations: NavigationDestination[] = [
  { id: 'overview', label: 'Overview', icon: 'home', description: 'A quick view of the team’s latest work.', rows: [
    { id: 'n1', title: 'Quarterly planning', detail: 'Maya Chen · Updated today' },
    { id: 'n2', title: 'Customer research', detail: 'Jordan Ellis · Updated yesterday' },
    { id: 'n3', title: 'Design review', detail: 'Alex Morgan · Ready for feedback' },
    { id: 'n4', title: 'Team handbook', detail: 'Sam Rivera · Shared with everyone' },
  ] },
  { id: 'resources', label: 'Resources', icon: 'resources', description: 'Documents and reports available in this workspace.', rows: [
    { id: 'r1', title: 'Operations playbook', detail: 'Document · 18 pages' },
    { id: 'r2', title: 'Service quality report', detail: 'Report · October 2026' },
    { id: 'r3', title: 'Research repository', detail: 'Collection · 12 resources' },
    { id: 'r4', title: 'Planning templates', detail: 'Collection · 4 resources' },
  ] },
  { id: 'members', label: 'Members', icon: 'people', description: 'People with access to this workspace.', rows: [
    { id: 'm1', title: 'Maya Chen', detail: 'Owner · Operations' }, { id: 'm2', title: 'Jordan Ellis', detail: 'Editor · Research' },
    { id: 'm3', title: 'Alex Morgan', detail: 'Editor · Design' }, { id: 'm4', title: 'Sam Rivera', detail: 'Viewer · Support' },
  ] },
]
const researchNavigationDestinations: NavigationDestination[] = [
  { id: 'overview', label: 'Overview', icon: 'home', description: 'The research team’s latest studies and findings.', rows: [
    { id: 'study1', title: 'Onboarding study', detail: 'Jordan Ellis · Interviews this week' }, { id: 'study2', title: 'Navigation research', detail: 'Alex Morgan · Findings ready' },
    { id: 'study3', title: 'Customer interview plan', detail: 'Sam Rivera · Updated today' },
  ] },
  { id: 'resources', label: 'Resources', icon: 'resources', description: 'Interview materials and published research.', rows: [
    { id: 'research1', title: 'Interview discussion guide', detail: 'Document · 6 pages' }, { id: 'research2', title: 'Navigation findings', detail: 'Report · October 2026' },
    { id: 'research3', title: 'Research templates', detail: 'Collection · 3 resources' },
  ] },
  { id: 'members', label: 'Members', icon: 'people', description: 'People working in the research workspace.', rows: [
    { id: 'research-m1', title: 'Jordan Ellis', detail: 'Owner · Research' }, { id: 'research-m2', title: 'Alex Morgan', detail: 'Editor · Design' }, { id: 'research-m3', title: 'Sam Rivera', detail: 'Viewer · Support' },
  ] },
]
export function ApplicationNavigationPreview() {
  const [workspaceId, setWorkspaceId] = useState('northstar')
  const [selectedId, setSelectedId] = useState('overview')
  return <ApplicationNavigation workspaces={[{ id: 'northstar', name: 'Northstar' }, { id: 'research', name: 'Research team' }]} workspaceId={workspaceId} destinations={workspaceId === 'research' ? researchNavigationDestinations : navigationDestinations} selectedId={selectedId} onWorkspaceChange={setWorkspaceId} onSelectionChange={setSelectedId} />
}

export type BrowserResource = { id: string; name: string; category: string; owner: string; updated: string; description: string; status: 'Ready' | 'Draft' }
/** Search and views remain local; the selected resource is controlled by the host. */
export function ResourceBrowser({ resources, selectedId, onSelectionChange }: {
  resources: BrowserResource[]; selectedId: string | null; onSelectionChange: (id: string | null) => void
}) {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('all')
  const [view, setView] = useState<'list' | 'grid'>('list')
  const searchRef = useRef<HTMLInputElement>(null)
  const resourceButtons = useRef(new Map<string, HTMLElement>())
  const categories = [...new Set(resources.map(resource => resource.category))]
  const shown = resources.filter(resource => (category === 'all' || resource.category === category) && `${resource.name} ${resource.owner} ${resource.description}`.toLowerCase().includes(query.trim().toLowerCase()))
  const selected = resources.find(resource => resource.id === selectedId)
  return <div className="pattern-stack general-resource-browser">
    <SearchBox input={{ ref: searchRef }} aria-label="Search sample resources" placeholder="Search resources or owners" value={query} onChange={(_, data) => setQuery(data.value)} />
    <div className="general-resource-controls"><PatternSelect label="Category" value={category} options={[{ value: 'all', label: 'All categories' }, ...categories.map(item => ({ value: item, label: item }))]} onChange={setCategory} />
      <TabList aria-label="Resource display" selectedValue={view} onTabSelect={(_, data) => setView(data.value as typeof view)}><Tab value="list" icon={<List20Regular />}>List</Tab><Tab value="grid" icon={<Grid20Regular />}>Grid</Tab></TabList>
    </div>
    <div className="general-list-heading"><strong>{shown.length} {shown.length === 1 ? 'resource' : 'resources'}</strong><span className="pattern-muted">{category === 'all' ? 'All categories' : category}</span></div>
    {shown.length ? <ul className={`general-resources general-resources-${view}`} aria-label="Sample resources">{shown.map(resource => <li key={resource.id}><Button ref={element => { if (element) resourceButtons.current.set(resource.id, element); else resourceButtons.current.delete(resource.id) }} className={`general-resource-button ${selectedId === resource.id ? 'is-selected' : ''}`} appearance="subtle" onClick={() => onSelectionChange(resource.id)} aria-pressed={selectedId === resource.id}>
      <Document20Regular className="general-resource-icon" aria-hidden="true" /><span className="general-resource-name"><strong>{resource.name}</strong><span className="pattern-muted">{resource.category} · {resource.owner}</span></span><StatusBadge label={resource.status} intent={resource.status === 'Ready' ? 'success' : 'neutral'} />
    </Button></li>)}</ul> : <div className="pattern-empty"><Folder20Regular aria-hidden="true" /><strong>No resources found</strong><p>Try another name or clear the category and search.</p><Button onClick={() => { setQuery(''); setCategory('all') }}>Clear filters</Button></div>}
    {selected && <section className="general-resource-summary" aria-label="Selected resource summary"><div className="general-list-heading"><h4>{selected.name}</h4><Button appearance="subtle" icon={<Dismiss20Regular />} aria-label="Close resource summary" onClick={() => { onSelectionChange(null); requestAnimationFrame(() => (resourceButtons.current.get(selected.id) ?? searchRef.current)?.focus()) }} /></div><p>{selected.description}</p><span className="pattern-muted">{selected.owner} · Updated {selected.updated}</span></section>}
  </div>
}
const resourceFixtures: BrowserResource[] = [
  { id: 'res1', name: 'Operations playbook', category: 'Document', owner: 'Maya Chen', updated: 'today, 10:20 AM', description: 'The team’s shared reference for daily operations and handoffs.', status: 'Ready' },
  { id: 'res2', name: 'Quality dashboard', category: 'Report', owner: 'Alex Morgan', updated: 'today, 9:15 AM', description: 'Review service quality measures and the latest assessment notes.', status: 'Ready' },
  { id: 'res3', name: 'Research findings', category: 'Document', owner: 'Jordan Ellis', updated: 'yesterday, 3:40 PM', description: 'Draft findings from interviews with the operations team.', status: 'Draft' },
  { id: 'res4', name: 'Quarterly plan', category: 'Document', owner: 'Maya Chen', updated: 'yesterday, 1:00 PM', description: 'Goals, owners, and key milestones for the next quarter.', status: 'Ready' },
  { id: 'res5', name: 'Customer insights', category: 'Report', owner: 'Jordan Ellis', updated: 'October 9, 2026', description: 'A summary of customer feedback and emerging themes.', status: 'Ready' },
  { id: 'res6', name: 'Planning templates', category: 'Collection', owner: 'Sam Rivera', updated: 'October 8, 2026', description: 'Reusable outlines for planning, reviews, and team updates.', status: 'Draft' },
]
export function ResourceBrowserPreview() {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  return <ResourceBrowser resources={resourceFixtures} selectedId={selectedId} onSelectionChange={setSelectedId} />
}

export type FeedEvent = { id: string; actor: string; kind: 'comment' | 'update'; event: string; detail?: string; when: string; group: string }
export function ActivityFeed({ events, filter, onFilterChange }: {
  events: FeedEvent[]; filter: 'all' | 'comment' | 'update'; onFilterChange: (filter: 'all' | 'comment' | 'update') => void
}) {
  const shown = events.filter(event => filter === 'all' || event.kind === filter)
  const groups = [...new Set(shown.map(event => event.group))]
  return <div className="pattern-stack general-activity-feed">
    <TabList selectedValue={filter} aria-label="Activity type" onTabSelect={(_, data) => onFilterChange(data.value as typeof filter)}><Tab value="all" aria-label="All activity">All</Tab><Tab value="comment">Comments</Tab><Tab value="update">Updates</Tab></TabList>
    {!shown.length ? <div className="pattern-empty"><Comment20Regular /><strong>No activity to show</strong><Button onClick={() => onFilterChange('all')}>Show all activity</Button></div> : groups.map(group => <section key={group} className="general-feed-group"><h4>{group}</h4><ol className="general-feed-events" aria-label={`${group} activity`}>{shown.filter(event => event.group === group).map(event => <li key={event.id}>
      <Avatar name={event.actor} size={32} /><div><div className="general-feed-heading"><strong>{event.actor}</strong><span className="pattern-muted">{event.when}</span></div><p>{event.event}</p>{event.detail && <p className="general-feed-detail">{event.detail}</p>}<span className="pattern-muted general-feed-kind">{event.kind === 'comment' ? <Comment20Regular aria-hidden="true" /> : <Checkmark20Regular aria-hidden="true" />}{event.kind === 'comment' ? 'Comment' : 'Update'}</span></div>
    </li>)}</ol></section>)}
  </div>
}
const activityFixtures: FeedEvent[] = [
  { id: 'ev1', actor: 'Maya Chen', kind: 'comment', event: 'Commented on Quarterly planning', detail: 'The owners are confirmed. Please add your milestones before the review.', when: '10:25 AM', group: 'Today' },
  { id: 'ev2', actor: 'Alex Morgan', kind: 'update', event: 'Marked Design review as ready', when: '9:40 AM', group: 'Today' },
  { id: 'ev3', actor: 'Jordan Ellis', kind: 'comment', event: 'Commented on Customer research', detail: 'Three interview summaries are now available in the research folder.', when: '9:15 AM', group: 'Today' },
  { id: 'ev4', actor: 'Sam Rivera', kind: 'update', event: 'Shared Team handbook with the workspace', when: '4:10 PM', group: 'Yesterday' },
  { id: 'ev5', actor: 'Maya Chen', kind: 'update', event: 'Added Alex Morgan to Service quality', when: '2:30 PM', group: 'Yesterday' },
  { id: 'ev6', actor: 'Jordan Ellis', kind: 'comment', event: 'Commented on Operations playbook', detail: 'I added the handoff checklist to the final section.', when: '11:05 AM', group: 'Yesterday' },
]
export function ActivityFeedPreview() {
  const [filter, setFilter] = useState<'all' | 'comment' | 'update'>('all')
  return <ActivityFeed events={activityFixtures} filter={filter} onFilterChange={setFilter} />
}

export type BulkRecord = { id: string; name: string; owner: string; status: 'In review' | 'Ready' | 'Archived' }
export function BulkSelectionList({ records, selectedIds, onSelectionChange, onStatusChange }: {
  records: BulkRecord[]; selectedIds: string[]; onSelectionChange: (ids: string[]) => void; onStatusChange: (ids: string[], status: BulkRecord['status']) => void
}) {
  const [feedback, setFeedback] = useState('')
  const selectAllRef = useRef<HTMLInputElement>(null)
  const selected = selectedIds.filter(id => records.some(record => record.id === id))
  const allSelected = records.length > 0 && selected.length === records.length
  const applyStatus = (status: BulkRecord['status']) => {
    onStatusChange(selected, status)
    setFeedback(`${selected.length} ${selected.length === 1 ? 'record' : 'records'} marked ${status.toLowerCase()}.`)
    onSelectionChange([])
    requestAnimationFrame(() => selectAllRef.current?.focus())
  }
  return <div className="pattern-stack general-bulk-list">
    <div className="general-list-heading"><Checkbox input={{ ref: selectAllRef }} label={`Select all ${records.length} records`} checked={allSelected ? true : selected.length ? 'mixed' : false} disabled={!records.length} onChange={(_, data) => onSelectionChange(data.checked === true ? records.map(record => record.id) : [])} /><span className="pattern-muted">{selected.length} selected</span></div>
    {selected.length > 0 && <Toolbar aria-label="Selected record actions" className="general-bulk-toolbar"><ToolbarButton icon={<Checkmark20Regular />} onClick={() => applyStatus('Ready')}>Mark ready</ToolbarButton><ToolbarButton icon={<Folder20Regular />} onClick={() => applyStatus('Archived')}>Archive</ToolbarButton><ToolbarDivider /><ToolbarButton onClick={() => { onSelectionChange([]); requestAnimationFrame(() => selectAllRef.current?.focus()) }}>Clear selection</ToolbarButton></Toolbar>}
    <ul className="pattern-list" aria-label="Selectable sample records">{records.map(record => <li key={record.id} className="general-bulk-row"><Checkbox aria-label={`Select ${record.name}`} checked={selected.includes(record.id)} onChange={(_, data) => onSelectionChange(data.checked === true ? [...selected, record.id] : selected.filter(id => id !== record.id))} /><div className="general-bulk-identity"><strong>{record.name}</strong><span className="pattern-muted">{record.id} · {record.owner}</span></div><StatusBadge label={record.status} intent={record.status === 'Ready' ? 'success' : 'neutral'} /></li>)}</ul>
    {feedback && <p className="pattern-result" role="status">{feedback}</p>}
    {!records.length && <div className="pattern-empty"><strong>No records to select</strong><p>Add records to enable bulk actions.</p></div>}
  </div>
}
const bulkFixtures: BulkRecord[] = [
  { id: 'REC-1041', name: 'Quarterly planning', owner: 'Maya Chen', status: 'In review' }, { id: 'REC-1042', name: 'Customer research', owner: 'Jordan Ellis', status: 'In review' },
  { id: 'REC-1043', name: 'Design review', owner: 'Alex Morgan', status: 'Ready' }, { id: 'REC-1044', name: 'Service quality', owner: 'Sam Rivera', status: 'In review' },
  { id: 'REC-1045', name: 'Team handbook', owner: 'Maya Chen', status: 'Ready' },
]
export function BulkSelectionPreview() {
  const [records, setRecords] = useState(bulkFixtures)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [previousRecords, setPreviousRecords] = useState<BulkRecord[] | null>(null)
  return <div className="pattern-stack"><BulkSelectionList records={records} selectedIds={selectedIds} onSelectionChange={setSelectedIds} onStatusChange={(ids, status) => { setPreviousRecords(records); setRecords(previous => previous.map(record => ids.includes(record.id) ? { ...record, status } : record)) }} />{previousRecords && <Button onClick={() => { setRecords(previousRecords); setPreviousRecords(null) }}>Undo latest bulk change</Button>}</div>
}

export type PropertyValues = { name: string; owner: string; visibility: 'Private' | 'Team'; description: string }
export function InlineEditingPanel({ value, owners, onSave }: {
  value: PropertyValues; owners: PatternOption[]; onSave: (value: PropertyValues) => void
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)
  const [errors, setErrors] = useState<{ name?: string; owner?: string }>({})
  const [feedback, setFeedback] = useState('')
  const editRef = useRef<HTMLButtonElement>(null)
  const returnToRead = () => { setEditing(false); setErrors({}); requestAnimationFrame(() => editRef.current?.focus()) }
  const update = (patch: Partial<PropertyValues>) => { setDraft(previous => ({ ...previous, ...patch })); setErrors({}) }
  const save = () => {
    const nextErrors = { ...(!draft.name.trim() ? { name: 'Enter a project name before saving.' } : {}), ...(!owners.some(owner => owner.value === draft.owner) ? { owner: 'Choose an owner before saving.' } : {}) }
    if (Object.keys(nextErrors).length) { setErrors(nextErrors); return }
    onSave({ ...draft, name: draft.name.trim(), description: draft.description.trim() })
    setFeedback('Project details saved. The values below are up to date.')
    returnToRead()
  }
  return <div className="pattern-stack general-inline-editor">
    <div className="general-list-heading"><h4>Project details</h4>{!editing && <Button ref={editRef} icon={<Edit20Regular />} onClick={() => { setDraft(value); setErrors({}); setEditing(true); setFeedback('') }}>Edit details</Button>}</div>
    {editing ? <form className="pattern-stack" noValidate onSubmit={event => { event.preventDefault(); save() }}>
      <Field label="Project name" required validationState={errors.name ? 'error' : 'none'} validationMessage={errors.name}><Input autoFocus value={draft.name} maxLength={80} onChange={(_, data) => update({ name: data.value })} /></Field>
      <PatternSelect label="Owner (required)" value={draft.owner} options={owners} onChange={owner => update({ owner })} />
      {errors.owner && <p role="alert" className="general-validation">{errors.owner}</p>}
      <PatternSelect label="Visibility" value={draft.visibility} options={[{ value: 'Private', label: 'Private — invited members' }, { value: 'Team', label: 'Team — workspace members' }]} onChange={visibility => update({ visibility: visibility as PropertyValues['visibility'] })} />
      <Field label="Description"><Textarea value={draft.description} rows={3} maxLength={300} onChange={(_, data) => update({ description: data.value })} /></Field>
      <div className="pattern-actions"><Button type="button" onClick={() => { setDraft(value); returnToRead() }}>Cancel</Button><Button appearance="primary" type="submit" icon={<Checkmark20Regular />}>Save changes</Button></div>
    </form> : <dl className="general-property-list"><div><dt>Project name</dt><dd>{value.name}</dd></div><div><dt>Owner</dt><dd>{owners.find(owner => owner.value === value.owner)?.label ?? 'Unassigned'}</dd></div><div><dt>Visibility</dt><dd><StatusBadge label={value.visibility} intent="neutral" /></dd></div><div><dt>Description</dt><dd>{value.description || 'No description added.'}</dd></div></dl>}
    {feedback && <p className="pattern-result" role="status">{feedback}</p>}
  </div>
}
export function InlineEditingPreview() {
  const [value, setValue] = useState<PropertyValues>({ name: 'Quarterly planning', owner: 'maya', visibility: 'Team', description: 'Coordinate the next quarter’s goals, owners, and milestones.' })
  return <InlineEditingPanel value={value} owners={[{ value: 'maya', label: 'Maya Chen' }, { value: 'alex', label: 'Alex Morgan' }, { value: 'jordan', label: 'Jordan Ellis' }, { value: 'sam', label: 'Sam Rivera' }]} onSave={setValue} />
}

export type RecoverableItem = { id: string; name: string; detail: string }
/** Confirmation protects removal; the caller owns the collection and undo payload. */
export function ConfirmationRecoveryList({ items, removedItem, onRemove, onRestore }: {
  items: RecoverableItem[]; removedItem: RecoverableItem | null; onRemove: (item: RecoverableItem) => void; onRestore: () => void
}) {
  const [open, setOpen] = usePreviewOverlay()
  const [selected, setSelected] = useState<RecoverableItem | null>(null)
  const [feedback, setFeedback] = useState('')
  const titleId = useId()
  const descriptionId = useId()
  const restoreFocus = useRestoreFocusTarget()
  const undoRef = useRef<HTMLButtonElement>(null)
  const focusUndoAfterExit = useRef(false)
  const removalButtons = useRef(new Map<string, HTMLElement>())
  return <div className="pattern-stack general-recovery">
    <div className="general-list-heading"><strong>Saved resources</strong><span className="pattern-muted">{items.length} {items.length === 1 ? 'resource' : 'resources'}</span></div>
    <ul className="pattern-list">{items.map(item => <li key={item.id} className="pattern-item general-recovery-row"><Document20Regular aria-hidden="true" /><div><strong>{item.name}</strong><span className="pattern-muted general-block">{item.detail}</span></div><PreviewTooltip content={`Remove ${item.name} from this sample collection`} relationship="description"><Button {...restoreFocus} ref={element => { if (element) removalButtons.current.set(item.id, element); else removalButtons.current.delete(item.id) }} icon={<Delete20Regular />} appearance="subtle" aria-label={`Remove ${item.name}`} onClick={() => { setSelected(item); setOpen(true) }}>Remove</Button></PreviewTooltip></li>)}</ul>
    {!items.length && <div className="pattern-empty"><Folder20Regular aria-hidden="true" /><strong>No saved resources</strong><p>Undo the latest removal to restore a resource.</p></div>}
    {removedItem && <div className="general-recovery-feedback" role="status"><span><strong>{removedItem.name}</strong> was removed.</span><Button ref={undoRef} icon={<ArrowUndo20Regular />} onClick={() => { onRestore(); setFeedback(`${removedItem.name} restored.`); requestAnimationFrame(() => removalButtons.current.get(removedItem.id)?.focus()) }}>Undo removal</Button></div>}
    {feedback && !removedItem && <p className="pattern-result" role="status">{feedback}</p>}
    <Dialog modalType="alert" open={open} onOpenChange={(_, data) => setOpen(data.open)} surfaceMotion={{ onMotionFinish: (_, { direction }) => {
      if (direction === 'exit' && focusUndoAfterExit.current) {
        focusUndoAfterExit.current = false
        requestAnimationFrame(() => { if (undoRef.current?.getBoundingClientRect().height) undoRef.current.focus() })
      }
    } }}><DialogSurface className="pattern-overlay general-confirm-dialog" aria-labelledby={titleId} aria-describedby={descriptionId}><DialogBody>
      <DialogTitle id={titleId}>Remove this resource?</DialogTitle><DialogContent><p id={descriptionId}>Remove <strong>{selected?.name}</strong> from this sample collection? You can undo the latest removal.</p></DialogContent><DialogActions>
        <Button appearance="primary" onClick={() => setOpen(false)}>Keep resource</Button><Button icon={<Delete20Regular />} onClick={() => { if (!selected) return; focusUndoAfterExit.current = true; onRemove(selected); setFeedback(''); setOpen(false) }}>Remove resource</Button>
      </DialogActions>
    </DialogBody></DialogSurface></Dialog>
  </div>
}
const recoveryFixtures: RecoverableItem[] = [
  { id: 'save1', name: 'Operations playbook', detail: 'Document · Saved today' }, { id: 'save2', name: 'Quarterly plan', detail: 'Document · Saved yesterday' },
  { id: 'save3', name: 'Customer insights', detail: 'Report · Saved October 9' }, { id: 'save4', name: 'Planning templates', detail: 'Collection · Saved October 8' },
]
export function ConfirmationRecoveryPreview() {
  const [items, setItems] = useState(recoveryFixtures)
  const [removed, setRemoved] = useState<{ item: RecoverableItem; index: number } | null>(null)
  return <ConfirmationRecoveryList items={items} removedItem={removed?.item ?? null} onRemove={item => { setRemoved({ item, index: items.findIndex(current => current.id === item.id) }); setItems(previous => previous.filter(current => current.id !== item.id)) }} onRestore={() => { if (!removed) return; setItems(previous => { const next = [...previous]; next.splice(Math.min(removed.index, next.length), 0, removed.item); return next }); setRemoved(null) }} />
}
