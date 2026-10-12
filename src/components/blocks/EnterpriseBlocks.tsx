import { Suspense, useEffect, useId, useMemo, useRef, useState, type FormEvent } from 'react'
import {
  Avatar,
  Badge,
  Button,
  DataGrid,
  DataGridBody,
  DataGridCell,
  DataGridHeader,
  DataGridHeaderCell,
  DataGridRow,
  Dialog,
  DialogActions,
  DialogBody,
  DialogContent,
  DialogSurface,
  DialogTitle,
  Dropdown,
  Field,
  Input,
  MessageBar,
  MessageBarBody,
  MessageBarTitle,
  Option,
  Radio,
  RadioGroup,
  SearchBox,
  Switch,
  Tab,
  TabList,
  TableCellLayout,
  createTableColumn,
  useRestoreFocusTarget,
  type DataGridProps,
  type TableColumnDefinition,
  type TableRowId,
} from '@fluentui/react-components'
import {
  ArrowTrending20Regular,
  ArrowUpRight16Regular,
  CheckmarkCircle20Regular,
  Clock20Regular,
  Database20Regular,
  Document20Regular,
  Folder20Regular,
  People20Regular,
  Settings20Regular,
  ShieldCheckmark20Regular,
} from '@fluentui/react-icons'
import { usePreviewOverlay, usePreviewPageActivity } from '../usePreviewPageActivity'
import { PreviewPageActivity, PreviewTooltip } from '../PreviewPageActivity'
import { blockCatalogue, blockCounts, filterBlocks, type BlockDefinition } from './blockCatalogue'
import { ArrowCounterclockwiseRegular } from '@fluentui/react-icons'
import './EnterpriseBlocks.css'
import { StatusBadge as SharedStatusBadge } from '../shared/Shared'

type BlockIntroProps = {
  title: string
  description: string
}

function BlockIntro({ title, description }: BlockIntroProps) {
  return (
    <div className="block-intro">
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  )
}

export type MetricRange = '7' | '30' | '90'
export type DashboardMetric = {
  label: string
  value: string
  change: string
  trend: number[]
}
export type DashboardMetrics = Record<MetricRange, DashboardMetric[]>
export type ActivityItem = {
  id: string
  name: string
  action: string
  target: string
  time: string
}
export type MetricsDashboardProps = {
  metrics?: DashboardMetrics
  activity?: ActivityItem[]
  onRangeChange?: (range: MetricRange) => void
  embedded?: boolean
}

const sampleDashboardMetrics: DashboardMetrics = {
  '7': [
    { label: 'Active projects', value: '12', change: '+2', trend: [3, 4, 3, 5, 6, 5, 8, 8, 10, 12] },
    { label: 'Team members', value: '48', change: '+4', trend: [30, 32, 35, 34, 39, 41, 41, 44, 46, 48] },
    { label: 'Data processed', value: '128 GB', change: '+18.2%', trend: [30, 44, 40, 55, 50, 72, 61, 86, 79, 100] },
    { label: 'Success rate', value: '99.4%', change: '+0.8%', trend: [86, 91, 88, 90, 96, 93, 95, 97, 96, 99] },
  ],
  '30': [
    { label: 'Active projects', value: '24', change: '+8', trend: [5, 7, 6, 10, 9, 13, 17, 16, 21, 24] },
    { label: 'Team members', value: '64', change: '+12', trend: [21, 28, 27, 39, 35, 46, 48, 54, 59, 64] },
    { label: 'Data processed', value: '512 GB', change: '+24.6%', trend: [30, 38, 47, 39, 60, 56, 73, 76, 84, 100] },
    { label: 'Success rate', value: '99.8%', change: '+1.2%', trend: [86, 90, 87, 92, 91, 95, 94, 98, 97, 100] },
  ],
  '90': [
    { label: 'Active projects', value: '42', change: '+18', trend: [8, 12, 16, 15, 24, 22, 28, 34, 37, 42] },
    { label: 'Team members', value: '92', change: '+28', trend: [29, 37, 34, 46, 51, 60, 64, 71, 84, 92] },
    { label: 'Data processed', value: '1.8 TB', change: '+32.4%', trend: [16, 26, 21, 39, 46, 42, 65, 72, 83, 100] },
    { label: 'Success rate', value: '99.9%', change: '+1.6%', trend: [76, 85, 82, 89, 86, 92, 95, 93, 99, 100] },
  ],
}

const sampleActivity: ActivityItem[] = [
  { id: 'a1', name: 'Olivia Chen', action: 'published a new version of', target: 'Revenue insights', time: '12 min ago' },
  { id: 'a2', name: 'Alex Morgan', action: 'added 3 members to', target: 'Customer analytics', time: '38 min ago' },
  { id: 'a3', name: 'Sam Rivera', action: 'completed the refresh for', target: 'Sales pipeline', time: '1 hour ago' },
]

function Sparkline({ values }: { values: number[] }) {
  const gradientId = useId().replaceAll(':', '')
  const low = Math.min(...values)
  const high = Math.max(...values)
  const points = values.map((value, index) => `${(index / Math.max(values.length - 1, 1)) * 100},${38 - ((value - low) / Math.max(high - low, 1)) * 31}`).join(' ')
  return (
    <svg className="block-sparkline" viewBox="0 0 100 44" aria-hidden="true">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--colorBrandForeground1)" stopOpacity=".18" />
          <stop offset="100%" stopColor="var(--colorBrandForeground1)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={`0,44 ${points} 100,44`} fill={`url(#${gradientId})`} />
      <polyline points={points} fill="none" stroke="var(--colorBrandForeground1)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

const metricIcons = [Folder20Regular, People20Regular, Database20Regular, CheckmarkCircle20Regular]

export function MetricsDashboard({ metrics = sampleDashboardMetrics, activity = sampleActivity, onRangeChange, embedded = false }: MetricsDashboardProps) {
  const [range, setRange] = useState<MetricRange>('30')
  const headingId = useId()
  return (
    <article className="enterprise-block" aria-labelledby={headingId}>
      {!embedded && <BlockIntro title="Project overview" description="A workspace snapshot that turns sample signals into a clear next step." />}
      <div className="block-panel">
        <div className="block-panel-header">
          <div className="block-heading-with-icon">
            <span className="block-app-icon"><ArrowTrending20Regular /></span>
            <div>
              <div className="block-breadcrumb">Northstar workspace</div>
              <h4 id={headingId}>Workspace overview</h4>
            </div>
          </div>
          <TabList className="block-range-tabs" size="small" selectedValue={range} aria-label="Dashboard time range" onTabSelect={(_, data) => {
            const nextRange = data.value as MetricRange
            setRange(nextRange)
            onRangeChange?.(nextRange)
          }}>
            <Tab value="7">7 days</Tab>
            <Tab value="30">30 days</Tab>
            <Tab value="90">90 days</Tab>
          </TabList>
        </div>
        <div className="block-metric-grid" aria-live="polite" aria-atomic="true">
          {metrics[range].map((metric, index) => {
            const Icon = metricIcons[index % metricIcons.length]
            return (
              <div className="block-metric-card" key={metric.label}>
                <div className="block-metric-label"><span>{metric.label}</span><Icon /></div>
                <div className="block-metric-main"><strong>{metric.value}</strong><Sparkline values={metric.trend} /></div>
                <div className="block-metric-change"><ArrowUpRight16Regular /><span>{metric.change}</span><span className="block-muted">vs. previous period</span></div>
              </div>
            )
          })}
        </div>
        <div className="block-dashboard-bottom">
          <div className="block-activity">
            <div className="block-subheading"><h5>Recent activity</h5><Badge size="large" appearance="tint" color="informative">Sample activity</Badge></div>
            <ul>
              {activity.map((item, index) => (
                <li key={item.id}>
                  <Avatar name={item.name} size={32} color={index === 0 ? 'teal' : index === 1 ? 'blue' : 'plum'} />
                  <div className="block-activity-description"><p><strong>{item.name}</strong> {item.action} <strong>{item.target}</strong></p><span>{item.time}</span></div>
                </li>
              ))}
            </ul>
          </div>
          <div className="block-health">
            <div className="block-subheading"><h5>Workspace health</h5><ShieldCheckmark20Regular /></div>
            <div className="block-health-message"><span className="block-health-icon"><CheckmarkCircle20Regular /></span><div><strong>Everything is running smoothly</strong><p>All services are healthy and your data is up to date.</p></div></div>
            <div className="block-health-footer"><Clock20Regular /><span>Last checked just now</span><span className="block-status-dot" /><span>Operational</span></div>
          </div>
        </div>
      </div>
      {!embedded && <p className="block-preview-note">Interactive preview · Change the time range to explore sample workspace metrics.</p>}
    </article>
  )
}

export type ProjectStatus = 'Active' | 'In review' | 'Draft'
export type Project = {
  id: string
  name: string
  description: string
  owner: string
  ownerEmail: string
  status: ProjectStatus
  updated: string
  type: string
}
export type ProjectTableProps = {
  projects?: Project[]
  onSelectionChange?: (ids: TableRowId[]) => void
  onInspectProject?: (project: Project) => void
  embedded?: boolean
}

const sampleProjects: Project[] = [
  { id: 'revenue', name: 'Revenue insights', description: 'A single view of revenue performance across every region and sales channel.', owner: 'Olivia Chen', ownerEmail: 'olivia@northstar.example', status: 'Active', updated: '2026-10-12', type: 'Analytics dashboard' },
  { id: 'customer', name: 'Customer analytics', description: 'Explore customer segments, retention, and the moments that matter.', owner: 'Alex Morgan', ownerEmail: 'alex@northstar.example', status: 'Active', updated: '2026-10-11', type: 'Analytics dashboard' },
  { id: 'sales', name: 'Sales pipeline', description: 'Track opportunities and keep the team aligned on the next quarter.', owner: 'Sam Rivera', ownerEmail: 'sam@northstar.example', status: 'In review', updated: '2026-10-10', type: 'Data pipeline' },
  { id: 'marketing', name: 'Marketing performance', description: 'Compare campaign engagement, attribution, and conversion trends.', owner: 'Jordan Lee', ownerEmail: 'jordan@northstar.example', status: 'Active', updated: '2026-10-09', type: 'Analytics dashboard' },
  { id: 'inventory', name: 'Inventory forecast', description: 'Bring inventory and demand forecasts into one planning workspace.', owner: 'Olivia Chen', ownerEmail: 'olivia@northstar.example', status: 'Draft', updated: '2026-10-08', type: 'Planning model' },
  { id: 'operations', name: 'Operations overview', description: 'Monitor daily throughput and surface operational bottlenecks.', owner: 'Taylor Kim', ownerEmail: 'taylor@northstar.example', status: 'In review', updated: '2026-10-07', type: 'Analytics dashboard' },
]

function StatusBadge({ status }: { status: ProjectStatus }) {
  return <SharedStatusBadge label={status} intent={status === 'Active' ? 'success' : status === 'In review' ? 'warning' : 'neutral'} />
}

function formatProjectDate(date: string) {
  return new Date(`${date}T12:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function ProjectDetailsAction({ project, onOpen }: { project: Project; onOpen: () => void }) {
  const restoreFocusTarget = useRestoreFocusTarget()
  return (
    <PreviewTooltip content={`View ${project.name}`} relationship="label">
      <Button {...restoreFocusTarget} appearance="subtle" size="small" icon={<ArrowUpRight16Regular />} aria-label={`View details for ${project.name}`} onClick={(event) => { event.stopPropagation(); onOpen() }} />
    </PreviewTooltip>
  )
}

export function ProjectTable({ projects = sampleProjects, onSelectionChange, onInspectProject, embedded = false }: ProjectTableProps) {
  const headingId = useId()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('All statuses')
  const [selectedItems, setSelectedItems] = useState<Set<TableRowId>>(new Set())
  const [sortState, setSortState] = useState<DataGridProps['sortState']>({ sortColumn: 'name', sortDirection: 'ascending' })
  const [details, setDetails] = useState<Project | null>(null)
  const [statusFilterOpen, setStatusFilterOpen] = usePreviewOverlay()
  const [detailsOpen, setDetailsOpen] = usePreviewOverlay()
  const filteredProjects = useMemo(() => projects.filter((project) => {
    const matchesSearch = `${project.name} ${project.owner}`.toLowerCase().includes(search.trim().toLowerCase())
    return matchesSearch && (status === 'All statuses' || project.status === status)
  }), [projects, search, status])

  const columns: TableColumnDefinition<Project>[] = [
    createTableColumn<Project>({ columnId: 'name', compare: (a, b) => a.name.localeCompare(b.name), renderHeaderCell: () => 'Project name', renderCell: (item) => <TableCellLayout media={<span className="block-file-icon"><Document20Regular /></span>}><div className="block-project-name">{item.name}</div><div className="block-project-type">{item.type}</div></TableCellLayout> }),
    createTableColumn<Project>({ columnId: 'owner', compare: (a, b) => a.owner.localeCompare(b.owner), renderHeaderCell: () => 'Owner', renderCell: (item) => <TableCellLayout media={<Avatar name={item.owner} size={28} color="neutral" />}>{item.owner}</TableCellLayout> }),
    createTableColumn<Project>({ columnId: 'status', compare: (a, b) => a.status.localeCompare(b.status), renderHeaderCell: () => 'Status', renderCell: (item) => <StatusBadge status={item.status} /> }),
    createTableColumn<Project>({ columnId: 'updated', compare: (a, b) => a.updated.localeCompare(b.updated), renderHeaderCell: () => 'Last updated', renderCell: (item) => <span className="block-date">{formatProjectDate(item.updated)}</span> }),
    createTableColumn<Project>({ columnId: 'details', renderHeaderCell: () => <span className="block-sr-only">Details</span>, renderCell: (item) => <ProjectDetailsAction project={item} onOpen={() => { setDetails(item); setDetailsOpen(true); onInspectProject?.(item) }} /> }),
  ]

  return (
    <article className="enterprise-block" aria-labelledby={headingId}>
      {!embedded && <BlockIntro title="Projects, organized" description="Search, sort, and select your way through a focused workspace table." />}
      <div className="block-panel">
        <div className="block-panel-header">
          <div className="block-heading-with-icon"><span className="block-app-icon"><Folder20Regular /></span><div><div className="block-breadcrumb">Northstar workspace</div><h4 id={headingId}>All projects <span className="block-heading-count">{projects.length}</span></h4></div></div>
          <Badge size="large" appearance="outline" color="subtle">Sample workspace</Badge>
        </div>
        <div className="block-table-toolbar">
          <SearchBox className="block-project-search" placeholder="Search projects or people" aria-label="Search projects or people" value={search} onChange={(_, data) => setSearch(data.value)} />
          <Dropdown className="block-status-filter" aria-label="Filter projects by status" value={status} selectedOptions={[status]} open={statusFilterOpen} onOpenChange={(_, data) => setStatusFilterOpen(data.open)} onOptionSelect={(_, data) => setStatus(data.optionValue ?? 'All statuses')}>
            {['All statuses', 'Active', 'In review', 'Draft'].map((option) => <Option key={option}>{option}</Option>)}
          </Dropdown>
          <span className="block-selection-count" aria-live="polite">{selectedItems.size > 0 ? `${selectedItems.size} selected` : `${filteredProjects.length} project${filteredProjects.length === 1 ? '' : 's'}`}</span>
          {selectedItems.size > 0 && <Button appearance="subtle" size="small" onClick={() => { setSelectedItems(new Set()); onSelectionChange?.([]) }}>Clear selection</Button>}
        </div>
        {filteredProjects.length > 0 ? (
          <div className="block-table-scroll" tabIndex={0} role="region" aria-label="Project table, scroll horizontally on smaller screens">
            <DataGrid className="block-project-grid" items={filteredProjects} columns={columns} sortable sortState={sortState} onSortChange={(_, data) => setSortState(data)} selectionMode="multiselect" selectedItems={selectedItems} onSelectionChange={(_, data) => { setSelectedItems(data.selectedItems); onSelectionChange?.(Array.from(data.selectedItems)) }} getRowId={(item) => item.id} focusMode="composite" aria-label="Workspace projects">
              <DataGridHeader>
                <DataGridRow selectionCell={{ checkboxIndicator: { 'aria-label': 'Select all visible projects' } }}>
                  {({ renderHeaderCell, columnId }) => columnId === 'details'
                    ? <DataGridCell className="block-column-details" role="columnheader" focusMode="none">{renderHeaderCell()}</DataGridCell>
                    : <DataGridHeaderCell className={`block-column-${columnId}`}>{renderHeaderCell()}</DataGridHeaderCell>}
                </DataGridRow>
              </DataGridHeader>
              <DataGridBody<Project>>
                {({ item, rowId }) => <DataGridRow<Project> key={rowId} selectionCell={{ checkboxIndicator: { 'aria-label': `Select ${item.name}` } }}>{({ renderCell, columnId }) => <DataGridCell className={`block-column-${columnId}`}>{renderCell(item)}</DataGridCell>}</DataGridRow>}
              </DataGridBody>
            </DataGrid>
          </div>
        ) : (
          <div className="block-empty-state"><span className="block-empty-icon"><Folder20Regular /></span><h5>No projects found</h5><p>Try another search or clear your status filter.</p><Button appearance="secondary" size="small" onClick={() => { setSearch(''); setStatus('All statuses') }}>Clear filters</Button></div>
        )}
        <div className="block-table-footer"><span>Showing {filteredProjects.length} of {projects.length} projects</span><span>Demo data · Updated October 12, 2026</span></div>
      </div>
      <Dialog open={detailsOpen} onOpenChange={(_, data) => setDetailsOpen(data.open)}>
        <DialogSurface className="block-project-dialog">
          <DialogBody>
            <DialogTitle>{details?.name}</DialogTitle>
            <DialogContent>
              {details && <div className="block-project-details"><p>{details.description}</p><dl><div><dt>Owner</dt><dd>{details.owner}<span>{details.ownerEmail}</span></dd></div><div><dt>Status</dt><dd><StatusBadge status={details.status} /></dd></div><div><dt>Project type</dt><dd>{details.type}</dd></div><div><dt>Last updated</dt><dd>{formatProjectDate(details.updated)}</dd></div></dl></div>}
            </DialogContent>
            <DialogActions><Button appearance="primary" onClick={() => setDetailsOpen(false)}>Done</Button></DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>
      {!embedded && <p className="block-preview-note">Interactive preview · Search, filter, sort columns, select rows, or open a project.</p>}
    </article>
  )
}

export type WorkspaceSettings = {
  workspaceName: string
  contactEmail: string
  visibility: 'private' | 'organization'
  notifyInvites: boolean
  notifyFailures: boolean
  weeklySummary: boolean
}
export type SettingsFormProps = {
  initialSettings?: WorkspaceSettings
  onSave?: (settings: WorkspaceSettings) => void
  embedded?: boolean
}

const defaultWorkspaceSettings: WorkspaceSettings = {
  workspaceName: 'Northstar workspace',
  contactEmail: 'team@northstar.example',
  visibility: 'private',
  notifyInvites: true,
  notifyFailures: true,
  weeklySummary: false,
}

export function SettingsForm({ initialSettings = defaultWorkspaceSettings, onSave, embedded = false }: SettingsFormProps) {
  const headingId = useId()
  const detailsId = useId()
  const notificationsId = useId()
  const [settings, setSettings] = useState<WorkspaceSettings>({ ...initialSettings })
  const [errors, setErrors] = useState<{ workspaceName?: string; contactEmail?: string }>({})
  const [feedback, setFeedback] = useState<'saved' | 'reset' | null>(null)

  function updateSetting<K extends keyof WorkspaceSettings>(key: K, value: WorkspaceSettings[K]) {
    setSettings((current) => ({ ...current, [key]: value }))
    if (key === 'workspaceName' || key === 'contactEmail') setErrors((current) => ({ ...current, [key]: undefined }))
    setFeedback(null)
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const nextErrors: typeof errors = {}
    if (!settings.workspaceName.trim()) nextErrors.workspaceName = 'Enter a workspace name.'
    if (!settings.contactEmail.trim()) nextErrors.contactEmail = 'Enter a contact email.'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(settings.contactEmail.trim())) nextErrors.contactEmail = 'Enter a valid email address.'
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) {
      setFeedback(null)
      const invalidField = event.currentTarget.querySelector<HTMLInputElement>(nextErrors.workspaceName ? '[name="workspaceName"]' : '[name="contactEmail"]')
      invalidField?.focus()
      return
    }
    const savedSettings = { ...settings, workspaceName: settings.workspaceName.trim(), contactEmail: settings.contactEmail.trim() }
    setSettings(savedSettings)
    onSave?.(savedSettings)
    setFeedback('saved')
  }

  return (
    <article className="enterprise-block" aria-labelledby={headingId}>
      {!embedded && <BlockIntro title="Make it your workspace" description="Practical forms with thoughtful defaults, clear feedback, and room to breathe." />}
      <div className="block-panel">
        <div className="block-panel-header"><div className="block-heading-with-icon"><span className="block-app-icon"><Settings20Regular /></span><div><div className="block-breadcrumb">Northstar workspace / Settings</div><h4 id={headingId}>General settings</h4></div></div><Badge size="large" appearance="tint" color="subtle">Workspace admin</Badge></div>
        <form className="block-settings-form" onSubmit={handleSubmit} noValidate>
          <div className="block-settings-grid">
            <section className="block-settings-section" aria-labelledby={detailsId}>
              <h5 id={detailsId}>Workspace details</h5>
              <p className="block-section-description">Give your team a familiar place to work together.</p>
              <Field label="Workspace name" required validationState={errors.workspaceName ? 'error' : 'none'} validationMessage={errors.workspaceName} hint="Shown in navigation and shared project links.">
                <Input name="workspaceName" value={settings.workspaceName} onChange={(_, data) => updateSetting('workspaceName', data.value)} />
              </Field>
              <Field label="Contact email" required validationState={errors.contactEmail ? 'error' : 'none'} validationMessage={errors.contactEmail} hint="Used for important workspace updates.">
                <Input name="contactEmail" type="email" value={settings.contactEmail} onChange={(_, data) => updateSetting('contactEmail', data.value)} />
              </Field>
              <Field label="Workspace visibility">
                <RadioGroup value={settings.visibility} onChange={(_, data) => updateSetting('visibility', data.value as WorkspaceSettings['visibility'])}>
                  <Radio value="private" label={<span className="block-radio-label"><strong>Private</strong><span>Only invited members can access this workspace.</span></span>} />
                  <Radio value="organization" label={<span className="block-radio-label"><strong>Organization</strong><span>Anyone in your organization can discover it.</span></span>} />
                </RadioGroup>
              </Field>
            </section>
            <section className="block-settings-section block-notifications-section" aria-labelledby={notificationsId}>
              <h5 id={notificationsId}>Notifications</h5>
              <p className="block-section-description">Stay informed about the things that matter to you.</p>
              <div className="block-notification-list">
                <div className="block-notification-row"><div><strong>Member invitations</strong><p>When someone joins your workspace.</p></div><Switch aria-label="Member invitation notifications" checked={settings.notifyInvites} onChange={(_, data) => updateSetting('notifyInvites', data.checked)} /></div>
                <div className="block-notification-row"><div><strong>Project alerts</strong><p>When a refresh fails or needs attention.</p></div><Switch aria-label="Project alert notifications" checked={settings.notifyFailures} onChange={(_, data) => updateSetting('notifyFailures', data.checked)} /></div>
                <div className="block-notification-row"><div><strong>Weekly summary</strong><p>A weekly digest of your team's activity.</p></div><Switch aria-label="Weekly summary notifications" checked={settings.weeklySummary} onChange={(_, data) => updateSetting('weeklySummary', data.checked)} /></div>
              </div>
              <div className="block-settings-callout"><ShieldCheckmark20Regular /><p>Your preferences apply to this workspace. You can change them anytime.</p></div>
            </section>
          </div>
          {feedback && <MessageBar className="block-settings-feedback" intent={feedback === 'saved' ? 'success' : 'info'}><MessageBarBody><MessageBarTitle>{feedback === 'saved' ? 'Settings saved.' : 'Defaults restored.'}</MessageBarTitle>{feedback === 'saved' ? 'Your changes are applied to this preview.' : 'The preview has been reset to its starting values.'}</MessageBarBody></MessageBar>}
          <div className="block-settings-footer"><span>Changes are local to this preview.</span><div><Button appearance="secondary" type="button" onClick={() => { setSettings({ ...initialSettings }); setErrors({}); setFeedback('reset') }}>Reset to defaults</Button><Button appearance="primary" type="submit">Save changes</Button></div></div>
        </form>
      </div>
      {!embedded && <p className="block-preview-note">Interactive preview · Edit the form, try validation, save your changes, or reset the defaults.</p>}
    </article>
  )
}

export function MetricsDashboardPreview() { return <MetricsDashboard embedded /> }
export function ProjectTablePreview() { return <ProjectTable embedded /> }
export function SettingsFormPreview() { return <SettingsForm embedded /> }

function BlockFrame({ definition, visible, catalogueRevision }: { definition: BlockDefinition; visible: boolean; catalogueRevision: number }) {
  const { active, revision } = usePreviewPageActivity()
  const [mounted, setMounted] = useState(() => typeof IntersectionObserver === 'undefined')
  const [reset, setReset] = useState(0)
  const frameRef = useRef<HTMLElement>(null)
  const headingId = useId()
  const Preview = definition.Preview
  useEffect(() => {
    if (mounted || !visible || !active || !frameRef.current) return
    if (typeof IntersectionObserver === 'undefined') return
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) { setMounted(true); observer.disconnect() }
    }, { rootMargin: '400px' })
    observer.observe(frameRef.current)
    return () => observer.disconnect()
  }, [active, mounted, visible])
  return <section ref={frameRef} className="block-example" aria-labelledby={headingId} hidden={!visible} inert={!visible}>
    <header className="block-example-heading"><div><h2 id={headingId}>{definition.name}</h2><p>{definition.description}</p></div><Button appearance="subtle" icon={<ArrowCounterclockwiseRegular />} aria-label={`Reset example: ${definition.name}`} onClick={() => { setReset(value => value + 1); setMounted(true) }}>Reset example</Button></header>
    <PreviewPageActivity active={active && visible} revision={`${revision}:${catalogueRevision}:${reset}`}>
      {mounted ? <Suspense fallback={<p className="block-loading" role="status">Loading {definition.name.toLowerCase()} example…</p>}><Preview key={reset} /></Suspense> : <div className="block-unmounted" aria-hidden="true" />}
    </PreviewPageActivity>
    <p className="block-example-note">{definition.notes}</p>
  </section>
}

export function EnterpriseBlocks() {
  const [query, setQuery] = useState('')
  const [catalogueRevision, setCatalogueRevision] = useState(0)
  const matches = filterBlocks(query)
  const matchingIds = new Set(matches.map(block => block.id))
  const changeQuery = (value: string) => { setQuery(value); setCatalogueRevision(revision => revision + 1) }
  return <div className="block-catalogue">
    <div className="block-catalogue-toolbar"><span className="block-catalogue-order">A–Z</span><SearchBox aria-label="Search block catalogue" placeholder="Search blocks or workflows" value={query} onChange={(_, data) => changeQuery(data.value)} /></div>
    <p className="block-catalogue-results" role="status">{query.trim() ? `${matches.length} of ${blockCounts.all} blocks matching “${query.trim()}”` : `${blockCounts.all} working blocks · Synthetic data, changes reset on reload`}</p>
    {!matches.length && <div className="block-catalogue-empty"><h2>No blocks match “{query.trim()}”</h2><p>Try a workflow such as “files”, “team”, or “settings”.</p><Button onClick={() => changeQuery('')}>Clear search</Button></div>}
    <div className="enterprise-blocks">{blockCatalogue.map(definition => <BlockFrame key={definition.id} definition={definition} visible={matchingIds.has(definition.id)} catalogueRevision={catalogueRevision} />)}</div>
  </div>
}
