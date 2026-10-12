import { useMemo, useState, type FormEvent, type KeyboardEvent } from 'react'
import {
  Button, Dialog, DialogActions, DialogBody, DialogContent, DialogSurface,
  DialogTitle, Dropdown, Field, Input, MessageBar, MessageBarBody, Option, SearchBox,
  Tab, TabList, createTableColumn, useRestoreFocusTarget,
  type TableColumnDefinition, type TableRowId,
} from '@fluentui/react-components'
import {
  Add20Regular, ArrowRight20Regular, Checkmark20Regular,
  ChevronLeft20Regular, ChevronRight20Regular, Clock20Regular, Dismiss16Regular,
  Filter20Regular, PersonAdd20Regular, Search20Regular, Sparkle20Regular,
} from '@fluentui/react-icons'
import { DataTable, StatusBadge } from '../../components/shared/Shared'
import { PriorityTaskList, QueueSummary, RecentRecordList, type PriorityTaskItem } from '../../components/shared/DashboardCompositions'
import { useClaimWatch } from '../useClaimWatch'
import type { ClaimRecord, DetailTab, ExplorerFilters, IntakeTask, NewClaimInput, ScreenNavigation } from '../types'
import './IntakeScreens.css'

function money(amount: number, currency = 'USD') {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 2 }).format(amount)
}

function claimIntent(claim: ClaimRecord): 'success' | 'warning' | 'danger' | 'info' | 'neutral' {
  if (claim.status === 'Approved' || claim.status === 'Paid') return 'success'
  if (claim.status === 'Incomplete' || claim.status === 'Clinical review') return 'warning'
  return claim.status === 'Received' ? 'info' : 'neutral'
}

function taskAction(task: IntakeTask) {
  return task.kind === 'documents' ? 'Review documents' : task.kind === 'exception' ? 'Review exception' : 'Review claim'
}

function taskTab(task: IntakeTask): DetailTab {
  return task.kind === 'documents' ? 'documents' : task.kind === 'exception' ? 'assessment' : 'overview'
}

function taskOrder(a: IntakeTask, b: IntakeTask) {
  return Number(b.overdue) - Number(a.overdue) || Number(b.priority === 'high') - Number(a.priority === 'high') || new Date(a.due).valueOf() - new Date(b.due).valueOf()
}

function dueLabel(task: IntakeTask) {
  if (task.overdue) return 'Overdue'
  const date = new Date(task.due)
  return Number.isNaN(date.getTime()) ? task.due : `Due ${date.toLocaleString('en-US', { timeZone: 'Asia/Kolkata', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })} IST`
}

function EmptyResult({ title, description, action, onAction }: { title: string; description: string; action?: string; onAction?: () => void }) {
  return <div className="intake-empty"><Search20Regular /><h3>{title}</h3><p>{description}</p>{action && <Button onClick={onAction}>{action}</Button>}</div>
}

export function ClaimHome({ onOpenClaim, onOpenWorkbench, onAskDaisy }: ScreenNavigation) {
  const { claims, tasks, requests } = useClaimWatch()
  const openTasks = tasks.filter(task => task.state === 'open')
  const personalTasks = openTasks.filter(task => task.owner === 'Maya Patel' || !task.owner)
  const priorityTasks = [...personalTasks].sort(taskOrder).slice(0, 3)
  const recent = [...claims].sort((a, b) => new Date(b.updated).valueOf() - new Date(a.updated).valueOf()).slice(0, 4)
  function timestamp(value: string) {
    const date = new Date(value)
    return Number.isNaN(date.valueOf()) ? value : `${date.toLocaleString('en-US', { timeZone: 'Asia/Kolkata', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })} IST`
  }
  const priorityItems: PriorityTaskItem[] = priorityTasks.map(task => ({
    id: task.id, title: task.title, reason: task.reason, owner: task.owner ? task.owner === 'Maya Patel' ? 'You' : task.owner : 'Unassigned',
    member: claims.find(item => item.id === task.claimId)?.member ?? 'Claim intake', recordId: task.claimId,
    condition: task.kind === 'documents' ? 'Missing documents' : task.kind === 'exception' ? 'Exception to review' : task.reason.toLowerCase().includes('ready') ? 'Ready for review' : 'Intake review',
    conditionIntent: task.kind === 'review' ? 'info' : 'warning', overdue: task.overdue,
    deadline: `Due ${timestamp(task.due)}`, deadlineISO: task.due,
    priorityExplanation: task.overdue ? 'Start here: the deadline has passed and this work needs attention.' : task.priority === 'high' ? 'Start here: this high-priority item is next in the intake queue.' : 'Start here: this is your next task by deadline.',
    actionLabel: taskAction(task), secondaryLabel: task.kind === 'documents' ? 'Ask about missing documents' : task.kind === 'exception' ? 'Ask about this exception' : 'Ask about this intake step',
  }))
  return <div className="cw-page intake-page intake-home-page">
    <div className="cw-page-heading intake-page-heading"><div><h1>Welcome back, Maya</h1><p>Your tasks and unassigned intake work, ordered by urgency.</p></div></div>
    <section className="intake-attention-section" aria-labelledby="home-attention-title">
      <div className="intake-section-heading"><div><h2 id="home-attention-title">Needs your attention</h2><p>{personalTasks.length} open {personalTasks.length === 1 ? 'task' : 'tasks'} assigned to you or awaiting an owner.</p></div><Button appearance="subtle" icon={<ArrowRight20Regular />} iconPosition="after" onClick={onOpenWorkbench}>View workbench</Button></div>
      <PriorityTaskList items={priorityItems} onAction={id => { const task = priorityTasks.find(item => item.id === id); if (task) onOpenClaim(task.claimId, taskTab(task)) }} onSecondary={id => { const task = priorityTasks.find(item => item.id === id); if (task) onAskDaisy('What needs attention on this claim?', task.claimId) }} emptyTitle="You’re up to date" emptyDescription="No open tasks are assigned to you or awaiting an owner. Browse recent claims for more context." />
    </section>
    <section className="intake-home-queue" aria-labelledby="home-queue-title"><div className="intake-section-heading"><h2 id="home-queue-title">Team queue snapshot</h2></div><QueueSummary ariaLabel="Team queue snapshot" items={[
      { id: 'open', label: 'Open tasks', value: openTasks.length, unit: 'tasks' },
      { id: 'requests', label: 'Pending information requests', value: requests.filter(request => request.status === 'Pending').length, unit: 'requests' },
      { id: 'completed', label: 'Completed tasks', value: tasks.filter(task => task.state === 'completed').length, unit: 'tasks' },
      { id: 'automatic', label: 'Automatic tasks', value: tasks.filter(task => task.state === 'automatic').length, unit: 'tasks' },
    ]} /></section>
    <section className="intake-recent" aria-labelledby="recent-claims-title"><div className="intake-section-heading"><h2 id="recent-claims-title">Recent claims</h2><span>Latest updates</span></div><RecentRecordList items={recent.map(claim => ({ id: claim.id, name: claim.member, status: claim.status, intent: claimIntent(claim), updated: timestamp(claim.updated), updatedISO: claim.updated, openLabel: `Open claim ${claim.id} for ${claim.member}` }))} onOpen={id => onOpenClaim(id)} /></section>
  </div>
}

type TaskFilter = 'open' | 'overdue' | 'completed' | 'automatic'

export function ClaimWorkbench({ onOpenClaim, onAskDaisy }: ScreenNavigation) {
  const { claims, tasks, assignTask, completeTask } = useClaimWatch()
  const restoreFocusTarget = useRestoreFocusTarget()
  const [queue, setQueue] = useState<TaskFilter>('open')
  const [search, setSearch] = useState('')
  const [feedback, setFeedback] = useState('')
  const counts = { open: tasks.filter(task => task.state === 'open').length, overdue: tasks.filter(task => task.state === 'open' && task.overdue).length, completed: tasks.filter(task => task.state === 'completed').length, automatic: tasks.filter(task => task.state === 'automatic').length }
  const visible = tasks.filter(task => {
    const claim = claims.find(item => item.id === task.claimId)
    return (queue === 'overdue' ? task.state === 'open' && task.overdue : task.state === queue) && `${task.title} ${task.reason} ${task.claimId} ${task.owner ?? 'unassigned'} ${claim?.member ?? ''}`.toLowerCase().includes(search.trim().toLowerCase())
  }).sort(taskOrder)
  return <div className="cw-page intake-page">
    <div className="cw-page-heading intake-page-heading"><div><h1>My workbench</h1><p>Review what needs attention, assign an owner, and move the next claim forward.</p></div><Button {...restoreFocusTarget} icon={<Sparkle20Regular />} onClick={() => onAskDaisy('Summarize the intake queue')}>Queue summary</Button></div>
    <div className="intake-workbench-tabs"><TabList selectedValue={queue} onTabSelect={(_, data) => { setQueue(data.value as TaskFilter); setFeedback('') }} aria-label="Task queue"><Tab value="open">Needs attention <span className="intake-tab-count">{counts.open}</span></Tab><Tab value="overdue">Overdue <span className="intake-tab-count">{counts.overdue}</span></Tab><Tab value="completed">Completed <span className="intake-tab-count">{counts.completed}</span></Tab><Tab value="automatic">Automatic <span className="intake-tab-count">{counts.automatic}</span></Tab></TabList></div>
    <div className="intake-list-toolbar"><SearchBox value={search} onChange={(_, data) => setSearch(data.value)} placeholder="Search task, claim, or member" aria-label="Search intake tasks" /><span aria-live="polite">{visible.length} task{visible.length === 1 ? '' : 's'}</span></div>
    {feedback && <MessageBar intent="success"><MessageBarBody>{feedback}</MessageBarBody></MessageBar>}
    {visible.length ? <section className="intake-task-list" aria-label="Intake tasks">{visible.map(task => {
      const claim = claims.find(item => item.id === task.claimId)
      const isOpen = task.state === 'open'
      return <article className={`intake-task-row ${task.overdue && isOpen ? 'intake-task-row-overdue' : ''}`} key={task.id}>
        <div className="intake-task-main"><div className="intake-task-top"><StatusBadge label={isOpen ? task.kind === 'documents' ? 'Missing documents' : task.kind === 'exception' ? 'Exception' : 'Intake review' : task.state === 'automatic' ? 'Auto done' : 'Completed'} intent={isOpen ? task.kind === 'exception' ? 'danger' : 'warning' : 'success'} />{isOpen && <span className={`intake-due ${task.overdue ? 'intake-due-overdue' : ''}`}><Clock20Regular />{dueLabel(task)}</span>}</div><h2>{task.title}</h2><p>{task.reason}</p><div className="intake-task-meta"><button className="intake-record-link" onClick={() => onOpenClaim(task.claimId)}>{task.claimId}</button><span>{claim?.member ?? 'Sample member'}</span><span className="intake-task-id">{task.id}</span></div></div>
        <div className="intake-task-owner"><span>Owner</span><strong>{task.owner ?? 'Unassigned'}</strong>{isOpen && task.owner !== 'Maya Patel' && <Button appearance="subtle" icon={<PersonAdd20Regular />} onClick={() => { assignTask(task.id); setFeedback(`${task.title} assigned to you.`) }}>Assign to me</Button>}</div>
        <div className="intake-task-actions"><Button appearance={isOpen ? 'primary' : 'secondary'} onClick={() => onOpenClaim(task.claimId, taskTab(task))}>{isOpen ? taskAction(task) : 'Open claim'}</Button>{isOpen && <Button appearance="subtle" icon={<Checkmark20Regular />} onClick={() => { completeTask(task.id); setFeedback(`${task.title} completed. The claim’s recorded decision is unchanged.`) }}>Complete task</Button>}</div>
      </article>
    })}</section> : <EmptyResult title={search ? 'No matching tasks' : queue === 'open' ? 'No tasks need your attention' : `No ${queue} tasks`} description={search ? 'Try a different claim ID, member name, or task keyword.' : queue === 'open' ? 'Your intake queue is clear. Completed work is available in the Completed tab.' : 'Select another queue to see the sample intake work.'} action={search ? 'Clear search' : 'View open tasks'} onAction={() => { setSearch(''); setQueue('open') }} />}
    <p className="intake-list-note">Completing an intake task records your work. Approval, payment, and clinical decisions remain as recorded.</p>
  </div>
}

const filterLabels: Record<string, string> = { status: 'Status', risk: 'Risk', country: 'Country', type: 'Claim type', decision: 'Decision', provider: 'Provider', member: 'Member', currency: 'Currency' }
const filterEmptyLabels = { risk: 'All risk bands', country: 'All countries', type: 'All claim types', decision: 'All decisions', provider: 'All providers', member: 'All members', currency: 'All currencies' }
const secondaryFilterKeys = ['risk', 'country', 'type', 'decision', 'provider', 'member', 'currency'] as const
const pageSize = 6

export function ClaimsExplorer({ onOpenClaim, onAskDaisy }: ScreenNavigation) {
  const { claims, explorerFilters: filters, setExplorerFilters, submitClaim } = useClaimWatch()
  const [moreOpen, setMoreOpen] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)
  const [lookupMessage, setLookupMessage] = useState('')
  const [form, setForm] = useState({ member: '', provider: '', amount: '', type: 'Reimbursement', country: 'CA' })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const restoreFocusTarget = useRestoreFocusTarget()
  function updateFilters(next: Partial<ExplorerFilters>) { setExplorerFilters({ ...next, page: 0 }); setLookupMessage('') }
  function openClaim(id: string) {
    setExplorerFilters({ scrollTop: document.querySelector<HTMLElement>('[data-cw-scroll]')?.scrollTop ?? 0 })
    onOpenClaim(id)
  }
  function lookup(event: KeyboardEvent) {
    if (event.key !== 'Enter' || !filters.search.trim()) return
    const match = claims.find(claim => claim.id.toLowerCase() === filters.search.trim().toLowerCase())
    if (match) openClaim(match.id)
    else if (/^CLM-/i.test(filters.search.trim())) setLookupMessage('That claim ID is not in this sample workspace. Check the ID or clear the search.')
  }
  const filtered = useMemo(() => claims.filter(claim => {
    if (filters.status && claim.status !== filters.status) return false
    if (filters.risk && claim.riskBand !== filters.risk) return false
    if (filters.country && claim.country !== filters.country) return false
    if (filters.type && claim.type !== filters.type) return false
    if (filters.decision && claim.decision !== filters.decision) return false
    if (filters.provider && claim.provider !== filters.provider) return false
    if (filters.member && claim.member !== filters.member) return false
    if (filters.currency && claim.currency !== filters.currency) return false
    return `${claim.id} ${claim.member} ${claim.memberId} ${claim.provider} ${claim.providerId}`.toLowerCase().includes(filters.search.trim().toLowerCase())
  }).sort((a, b) => {
    const keys: Record<string, keyof ClaimRecord> = { claim: 'id', member: 'member', provider: 'provider', billed: 'billedAmount', status: 'status', risk: 'riskScore' }
    const key = keys[String(filters.sortColumn)] ?? 'id'
    const left = a[key], right = b[key]
    const compared = typeof left === 'number' && typeof right === 'number' ? left - right : String(left).localeCompare(String(right))
    return filters.sortDirection === 'descending' ? -compared : compared
  }), [claims, filters])
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize))
  const currentPage = Math.min(filters.page, pageCount - 1)
  const pageItems = filtered.slice(currentPage * pageSize, currentPage * pageSize + pageSize)
  const selected = new Set<TableRowId>(filters.selectedIds)
  const activeKeys = Object.keys(filterLabels).filter(key => Boolean(filters[key as keyof ExplorerFilters]))
  const statuses = ['Received', 'Incomplete', 'In review', 'Clinical review', 'Approved', 'Paid']
  const columns: TableColumnDefinition<ClaimRecord>[] = [
    createTableColumn({ columnId: 'claim', compare: (a: ClaimRecord, b: ClaimRecord) => a.id.localeCompare(b.id), renderHeaderCell: () => 'Claim', renderCell: (claim: ClaimRecord) => <div className="intake-table-identity"><button className="intake-record-link" data-claim-id={claim.id} onClick={event => { event.stopPropagation(); openClaim(claim.id) }}>{claim.id}</button><span>{claim.type}</span></div> }),
    createTableColumn({ columnId: 'member', compare: (a: ClaimRecord, b: ClaimRecord) => a.member.localeCompare(b.member), renderHeaderCell: () => 'Member', renderCell: (claim: ClaimRecord) => <div className="intake-table-identity"><strong>{claim.member}</strong><span>{claim.memberId}</span></div> }),
    createTableColumn({ columnId: 'provider', compare: (a: ClaimRecord, b: ClaimRecord) => a.provider.localeCompare(b.provider), renderHeaderCell: () => 'Provider', renderCell: (claim: ClaimRecord) => <div className="intake-table-identity"><strong>{claim.provider}</strong><span>{claim.country}</span></div> }),
    createTableColumn({ columnId: 'billed', compare: (a: ClaimRecord, b: ClaimRecord) => a.billedAmount - b.billedAmount, renderHeaderCell: () => 'Billed', renderCell: (claim: ClaimRecord) => <span className="intake-amount">{money(claim.billedAmount, claim.currency)}</span> }),
    createTableColumn({ columnId: 'status', compare: (a: ClaimRecord, b: ClaimRecord) => a.status.localeCompare(b.status), renderHeaderCell: () => 'Status', renderCell: (claim: ClaimRecord) => <StatusBadge label={claim.status} intent={claimIntent(claim)} /> }),
    createTableColumn({ columnId: 'risk', compare: (a: ClaimRecord, b: ClaimRecord) => a.riskScore - b.riskScore, renderHeaderCell: () => 'Recorded risk', renderCell: (claim: ClaimRecord) => <div className="intake-risk-cell"><StatusBadge label={claim.riskBand} intent={claim.riskBand === 'High' ? 'danger' : claim.riskBand === 'Medium' ? 'warning' : 'success'} /><span>{claim.riskScore} / 100</span></div> }),
  ]
  function updateForm(key: keyof typeof form, value: string) { setForm(current => ({ ...current, [key]: value })); setErrors(current => ({ ...current, [key]: '' })) }
  function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const nextErrors: Record<string, string> = {}
    if (!form.member.trim()) nextErrors.member = 'Enter the member’s name.'
    if (!form.provider.trim()) nextErrors.provider = 'Enter the provider’s name.'
    if (!form.amount.trim() || !Number.isFinite(Number(form.amount)) || Number(form.amount) <= 0) nextErrors.amount = 'Enter a billed amount greater than zero.'
    if (!form.type.trim()) nextErrors.type = 'Select a claim type.'
    if (!form.country.trim()) nextErrors.country = 'Select a country.'
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) { event.currentTarget.querySelector<HTMLInputElement>(`[name="${Object.keys(nextErrors)[0]}"]`)?.focus(); return }
    const input: NewClaimInput = { member: form.member.trim(), provider: form.provider.trim(), amount: Number(form.amount), type: form.type, country: form.country }
    const id = submitClaim(input)
    setCreateOpen(false)
    setForm({ member: '', provider: '', amount: '', type: 'Reimbursement', country: 'CA' })
    openClaim(id)
  }
  function clearFilters() { updateFilters({ search: '', status: '', risk: '', country: '', type: '', decision: '', provider: '', member: '', currency: '' }) }
  return <div className="cw-page intake-page">
    <div className="cw-page-heading intake-page-heading"><div><h1>Claims explorer</h1><p>Find a claim, understand its status, and open the next step.</p></div><Button {...restoreFocusTarget} appearance="primary" icon={<Add20Regular />} onClick={() => { setCreateOpen(true); setErrors({}) }}>Create sample claim</Button></div>
    <div className="intake-explorer-search"><SearchBox placeholder="Search by claim ID, member, or provider" value={filters.search} onChange={(_, data) => updateFilters({ search: data.value })} onKeyDown={lookup} aria-label="Search claims by ID, member, or provider" /><Button {...restoreFocusTarget} icon={<Filter20Regular />} onClick={() => setMoreOpen(true)}>More filters{secondaryFilterKeys.some(key => Boolean(filters[key])) ? ` (${secondaryFilterKeys.filter(key => filters[key]).length})` : ''}</Button></div>
    {lookupMessage && <MessageBar intent="warning"><MessageBarBody>{lookupMessage}</MessageBarBody></MessageBar>}
    <div className="intake-status-tabs"><TabList selectedValue={filters.status || 'all'} onTabSelect={(_, data) => updateFilters({ status: data.value === 'all' ? '' : String(data.value) })} aria-label="Filter claims by status"><Tab value="all">All claims <span className="intake-tab-count">{claims.length}</span></Tab>{statuses.map(status => <Tab value={status} key={status}>{status} <span className="intake-tab-count">{claims.filter(claim => claim.status === status).length}</span></Tab>)}</TabList></div>
    {(activeKeys.length > 0 || filters.search) && <div className="intake-active-filters" aria-label="Active claim filters">{filters.search && <Button size="small" appearance="outline" icon={<Dismiss16Regular />} iconPosition="after" onClick={() => updateFilters({ search: '' })}>Search: {filters.search}</Button>}{activeKeys.map(key => <Button key={key} size="small" appearance="outline" icon={<Dismiss16Regular />} iconPosition="after" aria-label={`Remove ${filterLabels[key]} filter: ${String(filters[key as keyof ExplorerFilters])}`} onClick={() => updateFilters({ [key]: '' })}>{filterLabels[key]}: {String(filters[key as keyof ExplorerFilters])}</Button>)}<Button appearance="subtle" onClick={clearFilters}>Clear all</Button></div>}
    <section className="intake-explorer-results" aria-labelledby="claim-results-title"><div className="intake-results-heading"><h2 id="claim-results-title">Claim records</h2><div aria-live="polite"><span>{filtered.length} claim{filtered.length === 1 ? '' : 's'}{selected.size > 0 ? ` · ${selected.size} selected` : ''}</span>{selected.size > 0 && <Button appearance="subtle" onClick={() => setExplorerFilters({ selectedIds: [] })}>Clear selection</Button>}</div></div>
      {filtered.length ? <div className="intake-claims-table"><DataTable items={pageItems} columns={columns} getRowId={claim => claim.id} ariaLabel="Claim records" getRowLabel={claim => `claim ${claim.id} for ${claim.member}`} selectedItems={selected} onSelectionChange={ids => { const visibleIds = new Set(pageItems.map(claim => claim.id)); const retained = filters.selectedIds.filter(id => !visibleIds.has(id)); setExplorerFilters({ selectedIds: Array.from(new Set([...retained, ...Array.from(ids).map(String)])) }) }} sortState={{ sortColumn: filters.sortColumn, sortDirection: filters.sortDirection }} onSortChange={state => setExplorerFilters({ sortColumn: String(state.sortColumn), sortDirection: state.sortDirection, page: 0 })} /></div> : <EmptyResult title="No matching claims" description="Try another search or remove a filter to see more claim records." action="Clear filters" onAction={clearFilters} />}
      <div className="intake-pagination"><span>{filtered.length ? `Showing ${currentPage * pageSize + 1}–${Math.min((currentPage + 1) * pageSize, filtered.length)} of ${filtered.length}` : '0 claims'}</span><div><Button icon={<ChevronLeft20Regular />} aria-label="Previous claims page" disabled={currentPage === 0} onClick={() => setExplorerFilters({ page: currentPage - 1 })} /><span>Page {currentPage + 1} of {pageCount}</span><Button icon={<ChevronRight20Regular />} aria-label="Next claims page" disabled={currentPage >= pageCount - 1} onClick={() => setExplorerFilters({ page: currentPage + 1 })} /></div></div>
    </section>
    <div className="intake-explorer-footnote"><span>Risk scores are recorded sample assessments, from 0 to 100.</span><Button {...restoreFocusTarget} appearance="subtle" icon={<Sparkle20Regular />} onClick={() => onAskDaisy('Summarize the intake queue')}>Ask Daisy about these claims</Button></div>
    <Dialog open={moreOpen} onOpenChange={(_, data) => setMoreOpen(data.open)}><DialogSurface><DialogBody><DialogTitle>Filter claim records</DialogTitle><DialogContent><p className="intake-dialog-description">Narrow the list using recorded claim details.</p><div className="intake-filter-fields">{secondaryFilterKeys.map(key => {
      const values = key === 'risk' ? ['Low', 'Medium', 'High'] : [...new Set(claims.map(claim => String(claim[key])))].sort()
      return <Field key={key} label={filterLabels[key]}><Dropdown aria-label={filterLabels[key]} value={filters[key] || filterEmptyLabels[key]} selectedOptions={[filters[key]]} onOptionSelect={(_, data) => updateFilters({ [key]: data.optionValue ?? '' })}><Option value="">{filterEmptyLabels[key]}</Option>{values.map(value => <Option value={value} key={value}>{value}</Option>)}</Dropdown></Field>
    })}</div></DialogContent><DialogActions><Button onClick={() => updateFilters({ risk: '', country: '', type: '', decision: '', provider: '', member: '', currency: '' })}>Reset filters</Button><Button appearance="primary" onClick={() => setMoreOpen(false)}>Show {filtered.length} claims</Button></DialogActions></DialogBody></DialogSurface></Dialog>
    <Dialog open={createOpen} onOpenChange={(_, data) => setCreateOpen(data.open)}><DialogSurface><form onSubmit={create} noValidate><DialogBody><DialogTitle>Create a sample claim</DialogTitle><DialogContent><p className="intake-dialog-description">Add a received claim and an intake task to this demo. All information stays in this session.</p><div className="intake-create-fields"><Field label="Member name" required validationState={errors.member ? 'error' : 'none'} validationMessage={errors.member}><Input name="member" value={form.member} onChange={(_, data) => updateForm('member', data.value)} placeholder="e.g. Jordan Ellis" /></Field><Field label="Provider name" required validationState={errors.provider ? 'error' : 'none'} validationMessage={errors.provider}><Input name="provider" value={form.provider} onChange={(_, data) => updateForm('provider', data.value)} placeholder="e.g. Lakeside Medical Centre" /></Field><Field label="Billed amount (USD)" required validationState={errors.amount ? 'error' : 'none'} validationMessage={errors.amount}><Input name="amount" inputMode="decimal" value={form.amount} onChange={(_, data) => updateForm('amount', data.value)} placeholder="0.00" /></Field><Field label="Claim type" required><Dropdown name="type" aria-label="Claim type" value={form.type} selectedOptions={[form.type]} onOptionSelect={(_, data) => updateForm('type', data.optionValue ?? '')}>{['Reimbursement', 'Direct billing'].map(value => <Option key={value}>{value}</Option>)}</Dropdown></Field><Field label="Country" required><Dropdown name="country" aria-label="Country" value={form.country === 'CA' ? 'Canada' : 'United States'} selectedOptions={[form.country]} onOptionSelect={(_, data) => updateForm('country', data.optionValue ?? '')}><Option value="CA">Canada</Option><Option value="US">United States</Option></Dropdown></Field></div></DialogContent><DialogActions><Button type="button" onClick={() => setCreateOpen(false)}>Cancel</Button><Button type="submit" appearance="primary">Create claim</Button></DialogActions></DialogBody></form></DialogSurface></Dialog>
  </div>
}
