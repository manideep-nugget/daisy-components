import { useRef, useState, type FormEvent, type ReactNode } from 'react'
import {
  Avatar, Button, Checkbox, Dialog, DialogActions, DialogBody, DialogContent, DialogSurface, DialogTitle,
  DrawerBody, DrawerFooter, DrawerHeader, DrawerHeaderTitle, Field, Input, MessageBar, MessageBarBody,
  OverlayDrawer, SearchBox, Switch, Tab, TabList, Textarea, useId,
} from '@fluentui/react-components'
import { ArrowUndo20Regular, Checkmark20Regular, Dismiss20Regular } from '@fluentui/react-icons'
import { FolderExplorer, type ExplorerFolder } from '../patterns/NavigationPatterns'
import {
  AttachmentManager, MemberSharing, NotificationInbox, type CollaborationPerson, type InboxNotification,
  type ManagedAttachment, type SharedMember,
} from '../patterns/CollaborationPatterns'
import { ActivityFeed, type FeedEvent } from '../patterns/GeneralPatterns'
import { RecordEditor, type EditableRecord, type RecordValues, type WorkspacePerson } from '../patterns/CreationPatterns'
import { PatternSelect, PeoplePicker } from '../patterns/PatternPrimitives'
import { FactList, StatusBadge } from '../shared/Shared'
import {
  ContextualAssistant, PriorityTaskList, QueueSummary, RecentRecordList, type AssistantMessage,
  type ContextualAssistantProps, type PriorityTaskItem, type RecentRecordItem,
} from '../shared/DashboardCompositions'
import { usePreviewOverlay } from '../usePreviewPageActivity'
import './ExpandedBlocks.css'

function BlockSurface({ title, description, actions, children, className = '' }: {
  title: string; description: string; actions?: ReactNode; children: ReactNode; className?: string
}) {
  const headingId = useId('block-surface')
  return <div className={`block-panel expanded-block ${className}`}>
    <header className="expanded-block-header"><div><h3 id={headingId}>{title}</h3><p>{description}</p></div>{actions && <div className="expanded-block-actions">{actions}</div>}</header>
    <div className="expanded-block-body" aria-labelledby={headingId}>{children}</div>
  </div>
}

function findFolder(folders: ExplorerFolder[], id: string): ExplorerFolder | undefined {
  for (const folder of folders) {
    if (folder.id === id) return folder
    const child = findFolder(folder.children ?? [], id)
    if (child) return child
  }
}

export type FileWorkspaceProps = {
  workspaceName: string; folders: ExplorerFolder[]; selectedFolderId: string;
  attachmentsByFolder: Record<string, ManagedAttachment[]>;
  onFolderChange: (id: string) => void;
  onFilesChange: (folderId: string, files: ManagedAttachment[]) => void;
  onAddFile: (folderId: string) => void;
}

/** Folder choice and file mutations share caller-owned data. */
export function FileWorkspace({ workspaceName, folders, selectedFolderId, attachmentsByFolder, onFolderChange, onFilesChange, onAddFile }: FileWorkspaceProps) {
  const folder = findFolder(folders, selectedFolderId)
  const files = attachmentsByFolder[selectedFolderId] ?? []
  const updateFolders = (items: ExplorerFolder[]): ExplorerFolder[] => items.map(item => ({
    ...item, documents: (attachmentsByFolder[item.id] ?? []).map(file => ({ id: file.id, name: file.name, type: file.detail.split(' · ')[0], modified: file.state === 'completed' ? 'Ready' : file.state === 'failed' ? 'Needs retry' : 'Queued' })),
    children: item.children ? updateFolders(item.children) : undefined,
  }))
  return <BlockSurface title={`${workspaceName} files`} description="Choose a destination before adding or processing sample files." className="expanded-file-workspace">
    <div className="expanded-file-layout">
      <nav className="expanded-file-navigation" aria-label="Workspace folder navigation"><FolderExplorer folders={updateFolders(folders)} selectedId={selectedFolderId} onSelectionChange={onFolderChange} /></nav>
      <section className="expanded-file-manager" aria-label={`Files in ${folder?.name ?? 'the selected folder'}`}>
        <div className="expanded-section-heading"><h4>{folder?.name ?? 'Choose a folder'}</h4><span>{files.length} {files.length === 1 ? 'file' : 'files'}</span></div>
        {folder ? Object.keys(attachmentsByFolder).map(folderId => <div key={folderId} hidden={folderId !== selectedFolderId} inert={folderId !== selectedFolderId}><AttachmentManager attachments={attachmentsByFolder[folderId]} onAttachmentsChange={next => onFilesChange(folderId, next)} onAddSample={() => onAddFile(folderId)} /></div>) : <p className="expanded-muted">Choose a folder to manage its files.</p>}
      </section>
    </div>
  </BlockSurface>
}

export type TeamAccessProps = {
  workspaceName: string; people: CollaborationPerson[]; members: SharedMember[]; visibility: 'private' | 'organization';
  onMembersChange: (members: SharedMember[]) => void;
  onVisibilityChange: (visibility: 'private' | 'organization') => void;
}

export function TeamAccess({ workspaceName, people, members, visibility, onMembersChange, onVisibilityChange }: TeamAccessProps) {
  const [query, setQuery] = useState('')
  const [feedback, setFeedback] = useState('')
  const directoryHeading = useId('team-directory')
  const directory = people.filter(person => `${person.name} ${person.email}`.toLowerCase().includes(query.trim().toLowerCase()))
  return <BlockSurface title={`${workspaceName} access`} description="Roles control editing; visibility controls who can discover this workspace." actions={<StatusBadge label={visibility === 'private' ? 'Private workspace' : 'Organization visible'} intent="neutral" />}>
    <div className="expanded-access-layout">
      <section aria-label="Workspace membership"><MemberSharing workspaceLabel={workspaceName} people={people} members={members} onMembersChange={onMembersChange} /></section>
      <section className="expanded-access-policy" aria-labelledby={directoryHeading}><h4 id={directoryHeading}>Sample team directory</h4><SearchBox aria-label="Search sample team directory" placeholder="Search name or email" value={query} onChange={(_, data) => setQuery(data.value)} />
        <p className="expanded-muted" role="status">{directory.length} of {people.length} people shown. Add people using the sharing picker.</p>
        <ul className="expanded-directory">{directory.map(person => { const membership = members.find(member => member.personId === person.id); return <li key={person.id}><Avatar name={person.name} size={32} /><div><strong>{person.name}</strong><span className="expanded-muted">{person.email}</span></div><StatusBadge label={membership ? membership.access === 'editor' ? 'Editor' : 'Viewer' : 'Not added'} intent="neutral" /></li> })}</ul>
        {!directory.length && <div className="expanded-directory-empty"><p>No people match this search.</p><Button onClick={() => setQuery('')}>Clear directory search</Button></div>}
        <PatternSelect label="Workspace visibility" value={visibility} options={[{ value: 'private', label: 'Private — invited members' }, { value: 'organization', label: 'Organization — sample team' }]} onChange={value => { onVisibilityChange(value as typeof visibility); setFeedback('Sample workspace visibility updated. No invitations are sent.') }} />
        <FactList items={[{ label: 'Members', value: `${members.length} people` }, { label: 'Editors', value: `${members.filter(member => member.access === 'editor').length} people` }, { label: 'Viewers', value: `${members.filter(member => member.access === 'viewer').length} people` }]} />
      </section>
    </div>
    {feedback && <p className="expanded-feedback" role="status">{feedback}</p>}
  </BlockSurface>
}

export type ActivityCentreProps = {
  workspaceName: string; notifications: InboxNotification[]; events: FeedEvent[]; filter: 'all' | 'comment' | 'update';
  onNotificationsChange: (notifications: InboxNotification[]) => void;
  onFilterChange: (filter: 'all' | 'comment' | 'update') => void;
}

export function ActivityCentre({ workspaceName, notifications, events, filter, onNotificationsChange, onFilterChange }: ActivityCentreProps) {
  const [view, setView] = useState<'inbox' | 'timeline'>('inbox')
  const prefix = useId('activity-centre')
  const unread = notifications.filter(notification => !notification.read).length
  return <BlockSurface title={`${workspaceName} activity`} description="Separate messages that need attention from the team’s recorded history." actions={<span className="expanded-muted" role="status">{unread} unread {unread === 1 ? 'notification' : 'notifications'}</span>}>
    <TabList selectedValue={view} aria-label="Activity centre views" onTabSelect={(_, data) => setView(data.value as typeof view)}><Tab id={`${prefix}-inbox`} aria-controls={`${prefix}-inbox-panel`} value="inbox">Inbox</Tab><Tab id={`${prefix}-timeline`} aria-controls={`${prefix}-timeline-panel`} value="timeline">Timeline</Tab></TabList>
    <div id={`${prefix}-inbox-panel`} role="tabpanel" aria-labelledby={`${prefix}-inbox`} className="expanded-tab-panel" hidden={view !== 'inbox'} inert={view !== 'inbox'}><NotificationInbox notifications={notifications} onNotificationsChange={onNotificationsChange} /></div>
    <div id={`${prefix}-timeline-panel`} role="tabpanel" aria-labelledby={`${prefix}-timeline`} className="expanded-tab-panel" hidden={view !== 'timeline'} inert={view !== 'timeline'}><ActivityFeed events={events} filter={filter} onFilterChange={onFilterChange} /></div>
  </BlockSurface>
}

export type RecordInspectorProps = {
  workspaceName: string; records: EditableRecord[]; people: WorkspacePerson[]; selectedId: string;
  onSelectionChange: (id: string) => void;
  onSave: (id: string, values: RecordValues) => void;
}

export function RecordInspector({ workspaceName, records, people, selectedId, onSelectionChange, onSave }: RecordInspectorProps) {
  const record = records.find(item => item.id === selectedId)
  const [filter, setFilter] = useState<'all' | 'comment' | 'update'>('all')
  const events: FeedEvent[] = record?.activity.map(item => ({ id: `${record.id}-${item.id}`, actor: people.find(person => person.id === record.owner)?.name ?? 'Unassigned', kind: 'update', event: item.message, when: item.when, group: 'Record history' })) ?? []
  return <BlockSurface title={`${workspaceName} records`} description="Inspect a record alongside the list. Saved edits update both its summary and history.">
    <div className="expanded-record-layout">
      <section aria-label="Editable record list"><RecordEditor records={records} people={people} onSave={onSave} /></section>
      <section className="expanded-record-summary" aria-label="Record inspection"><PatternSelect label="Inspect record" value={selectedId} options={records.map(item => ({ value: item.id, label: item.name }))} onChange={onSelectionChange} />
        {record ? <><div className="expanded-section-heading"><h4>{record.name}</h4><StatusBadge label={record.status} intent={record.status === 'Active' ? 'success' : record.status === 'In review' ? 'warning' : 'neutral'} /></div><p className="expanded-muted">{record.description}</p>
          <FactList items={[{ label: 'Record ID', value: record.id }, { label: 'Owner', value: people.find(person => person.id === record.owner)?.name ?? 'Unassigned' }, { label: 'Updates', value: `${record.activity.length} entries` }]} />
          <ActivityFeed events={events} filter={filter} onFilterChange={setFilter} /></> : <p className="expanded-muted">Choose a record to inspect its details and history.</p>}
      </section>
    </div>
  </BlockSurface>
}

export type ProjectConfiguration = {
  name: string; description: string; ownerId: string; contactEmail: string; visibility: 'Private' | 'Team';
  reviewers: string[]; requireApproval: boolean; notifyReviewers: boolean;
}
export type MultiSectionFormProps = {
  value: ProjectConfiguration; savedValue: ProjectConfiguration; people: CollaborationPerson[];
  onChange: (value: ProjectConfiguration) => void;
  onSave: (value: ProjectConfiguration) => void;
}

export function MultiSectionForm({ value, savedValue, people, onChange, onSave }: MultiSectionFormProps) {
  const [errors, setErrors] = useState<{ name?: string; email?: string; owner?: string }>({})
  const [feedback, setFeedback] = useState('')
  const formId = useId('project-configuration')
  const owner = people.find(person => person.id === value.ownerId)
  const update = (patch: Partial<ProjectConfiguration>) => { onChange({ ...value, ...patch }); setErrors({}); setFeedback('') }
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const nextErrors: typeof errors = {}
    if (!value.name.trim()) nextErrors.name = 'Enter a project name before saving.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.contactEmail.trim())) nextErrors.email = 'Enter an email address with a name and domain.'
    if (!owner) nextErrors.owner = 'Choose an owner from the sample team.'
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) {
      setFeedback('')
      const control = event.currentTarget.querySelector<HTMLElement>(nextErrors.name ? '[name="projectName"]' : nextErrors.email ? '[name="projectContact"]' : '.fui-Dropdown')
      control?.focus()
      return
    }
    const saved = { ...value, name: value.name.trim(), description: value.description.trim(), contactEmail: value.contactEmail.trim(), reviewers: [...new Set(value.reviewers)] }
    onSave(saved)
    setFeedback(`${saved.name} saved. This sample configuration is ready for review.`)
  }
  return <BlockSurface title="Configure a project" description="Complete the project details and access settings, then review before saving.">
    <form id={formId} className="expanded-form-layout" onSubmit={submit} noValidate>
      <div className="expanded-form-sections">
        <section className="expanded-form-section" aria-labelledby={`${formId}-details`}><h4 id={`${formId}-details`}>Project details</h4>
          <Field label="Project name" required validationState={errors.name ? 'error' : 'none'} validationMessage={errors.name}><Input name="projectName" value={value.name} maxLength={80} onChange={(_, data) => update({ name: data.value })} /></Field>
          <Field label="Description" hint="Up to 300 characters."><Textarea value={value.description} maxLength={300} rows={3} onChange={(_, data) => update({ description: data.value })} /></Field>
          <Field label="Contact email" required validationState={errors.email ? 'error' : 'none'} validationMessage={errors.email}><Input name="projectContact" type="email" value={value.contactEmail} onChange={(_, data) => update({ contactEmail: data.value })} /></Field>
        </section>
        <section className="expanded-form-section" aria-labelledby={`${formId}-access`}><h4 id={`${formId}-access`}>Ownership and access</h4>
          <Field validationState={errors.owner ? 'error' : 'none'} validationMessage={errors.owner}><PatternSelect label="Project owner (required)" value={value.ownerId} options={people.map(person => ({ value: person.id, label: person.name }))} onChange={ownerId => update({ ownerId })} /></Field>
          <PatternSelect label="Project visibility" value={value.visibility} options={[{ value: 'Private', label: 'Private — invited reviewers' }, { value: 'Team', label: 'Team — workspace members' }]} onChange={visibility => update({ visibility: visibility as ProjectConfiguration['visibility'] })} />
          <PeoplePicker label="Reviewers" people={people} selected={value.reviewers} onChange={reviewers => update({ reviewers })} />
        </section>
        <section className="expanded-form-section" aria-labelledby={`${formId}-preferences`}><h4 id={`${formId}-preferences`}>Review preferences</h4><Checkbox label="Require approval before publishing" checked={value.requireApproval} onChange={(_, data) => update({ requireApproval: data.checked === true })} /><Switch label="Notify reviewers when this configuration is saved" checked={value.notifyReviewers} onChange={(_, data) => update({ notifyReviewers: data.checked })} /></section>
      </div>
      <aside className="expanded-form-review" aria-labelledby={`${formId}-review`}><h4 id={`${formId}-review`}>Review summary</h4><FactList items={[{ label: 'Project', value: value.name.trim() || 'Name required' }, { label: 'Owner', value: owner?.name ?? 'Owner required' }, { label: 'Visibility', value: value.visibility }, { label: 'Reviewers', value: `${value.reviewers.length} people` }, { label: 'Approval', value: value.requireApproval ? 'Required' : 'Optional' }, { label: 'Notifications', value: value.notifyReviewers ? 'Enabled' : 'Disabled' }]} /><p className="expanded-muted">Changes stay in this synthetic example. Saving updates the values used by Reset draft.</p></aside>
    </form>
    {feedback && <MessageBar className="expanded-form-feedback" intent="success"><MessageBarBody>{feedback}</MessageBarBody></MessageBar>}
    <footer className="expanded-block-footer"><span className="expanded-muted">Review your changes before saving.</span><div className="expanded-block-actions"><Button onClick={() => { onChange({ ...savedValue, reviewers: [...savedValue.reviewers] }); setErrors({}); setFeedback('') }}>Reset draft</Button><Button appearance="primary" type="submit" form={formId}>Save configuration</Button></div></footer>
  </BlockSurface>
}

export type OperationsDashboardProps = {
  workspaceName: string; tasks: PriorityTaskItem[]; records: RecentRecordItem[]; completedCount: number;
  assistant: ContextualAssistantProps;
  onCompleteTask: (id: string) => void; onOpenRecord: (id: string) => void; onUndoCompletion?: () => void;
}

export function OperationsDashboard({ workspaceName, tasks, records, completedCount, assistant, onCompleteTask, onOpenRecord, onUndoCompletion }: OperationsDashboardProps) {
  const [taskId, setTaskId] = useState<string | null>(null)
  const [taskOpen, setTaskOpen] = usePreviewOverlay()
  const drawerTitleId = useId('operation-task')
  const task = tasks.find(item => item.id === taskId)
  const openTask = (id: string) => { setTaskId(id); setTaskOpen(true) }
  return <BlockSurface title={`${workspaceName} operations`} description="Resolve priority work with the record and evidence that explain it." actions={onUndoCompletion && <Button icon={<ArrowUndo20Regular />} onClick={onUndoCompletion}>Undo completion</Button>}>
    <div aria-live="polite" aria-atomic="true"><QueueSummary ariaLabel="Sample operations queue" items={[{ id: 'open', label: 'Open work', value: tasks.length, unit: 'tasks' }, { id: 'overdue', label: 'Overdue', value: tasks.filter(item => item.overdue).length, unit: 'tasks' }, { id: 'completed', label: 'Completed here', value: completedCount, unit: 'tasks' }, { id: 'records', label: 'Recent records', value: records.length, unit: 'records' }]} /></div>
    <div className="expanded-operations-layout"><div className="expanded-operations-main"><section aria-label="Priority work"><h4>Needs attention</h4><PriorityTaskList items={tasks} onAction={openTask} onSecondary={openTask} emptyTitle="Priority work is complete" emptyDescription="You completed every sample task. Use Undo completion or Reset example to bring one back." /></section><section aria-label="Recently updated records"><h4>Recent records</h4><RecentRecordList items={records} onOpen={onOpenRecord} /></section></div><aside className="expanded-operations-assistant" aria-label="Workspace assistant"><ContextualAssistant {...assistant} /></aside></div>
    <OverlayDrawer open={taskOpen && !!task} onOpenChange={(_, data) => setTaskOpen(data.open)} position="end" className="expanded-block-drawer" aria-labelledby={drawerTitleId}>
      <DrawerHeader><DrawerHeaderTitle id={drawerTitleId} action={<Button appearance="subtle" icon={<Dismiss20Regular />} aria-label="Close task review" onClick={() => setTaskOpen(false)} />}>Review task</DrawerHeaderTitle></DrawerHeader>
      <DrawerBody>{task && <div className="expanded-drawer-content"><h3>{task.title}</h3><StatusBadge label={task.condition} intent={task.conditionIntent} /><p>{task.reason}</p><FactList items={[{ label: 'Workspace', value: task.member }, { label: 'Record', value: task.recordId }, { label: 'Owner', value: task.owner }, { label: 'Due', value: task.deadline }]} /><p className="expanded-muted">Completing this task updates the sample queue. Undo completion restores the latest completed task.</p></div>}</DrawerBody>
      <DrawerFooter className="expanded-block-actions"><Button onClick={() => setTaskOpen(false)}>Close review</Button><Button appearance="primary" icon={<Checkmark20Regular />} disabled={!task} onClick={() => { if (task) onCompleteTask(task.id); setTaskOpen(false) }}>Complete task</Button></DrawerFooter>
    </OverlayDrawer>
  </BlockSurface>
}

const teamPeople: CollaborationPerson[] = [
  { id: 'block-maya', name: 'Maya Chen', email: 'maya@northstar.example' }, { id: 'block-alex', name: 'Alex Morgan', email: 'alex@northstar.example' },
  { id: 'block-sam', name: 'Sam Rivera', email: 'sam@northstar.example' }, { id: 'block-jordan', name: 'Jordan Ellis', email: 'jordan@northstar.example' },
  { id: 'block-avery', name: 'Avery Brooks', email: 'avery@northstar.example' }, { id: 'block-riley', name: 'Riley Adams', email: 'riley@northstar.example' },
]

export function FileWorkspacePreview() {
  const [folderId, setFolderId] = useState('block-planning')
  const [files, setFiles] = useState<Record<string, ManagedAttachment[]>>({
    'block-workspace': [{ id: 'block-guide', name: 'Workspace guide.pdf', detail: 'PDF · 96 KB', state: 'completed' }],
    'block-planning': [{ id: 'block-brief', name: 'Project brief.pdf', detail: 'PDF · 284 KB', state: 'completed' }, { id: 'block-budget', name: 'Review budget.xlsx', detail: 'Spreadsheet · 96 KB', state: 'queued' }, { id: 'block-research', name: 'Research notes.csv', detail: 'CSV · 1.2 MB', state: 'failed', failure: 'Sample processing paused. Retry this file to complete it.' }],
    'block-research-folder': [{ id: 'block-interviews', name: 'Interview summary.docx', detail: 'Document · 48 KB', state: 'completed' }], 'block-archive': [],
  })
  const sequence = useRef(1)
  const folders: ExplorerFolder[] = [{ id: 'block-workspace', name: 'Northstar', documents: [], children: [{ id: 'block-planning', name: 'Planning', documents: [] }, { id: 'block-research-folder', name: 'Research', documents: [] }, { id: 'block-archive', name: 'Archive', documents: [] }] }]
  return <FileWorkspace workspaceName="Northstar" folders={folders} selectedFolderId={folderId} attachmentsByFolder={files} onFolderChange={setFolderId} onFilesChange={(id, next) => setFiles(previous => ({ ...previous, [id]: next }))} onAddFile={id => { const number = sequence.current++; setFiles(previous => ({ ...previous, [id]: [...(previous[id] ?? []), { id: `block-file-${number}`, name: `Meeting notes ${number}.pdf`, detail: 'PDF · 72 KB', state: 'queued' }] })) }} />
}

export function TeamAccessPreview() {
  const [members, setMembers] = useState<SharedMember[]>([{ personId: 'block-maya', access: 'editor' }, { personId: 'block-alex', access: 'editor' }, { personId: 'block-sam', access: 'viewer' }])
  const [visibility, setVisibility] = useState<TeamAccessProps['visibility']>('private')
  return <TeamAccess workspaceName="Product operations" people={teamPeople} members={members} visibility={visibility} onMembersChange={setMembers} onVisibilityChange={setVisibility} />
}

export function ActivityCentrePreview() {
  const [notifications, setNotifications] = useState<InboxNotification[]>([
    { id: 'block-notice-review', title: 'Maya requested your review', summary: 'Planning brief · Ready for feedback', detail: 'The sample planning brief is ready. Review its scope before the team meeting.', time: '10 minutes ago', read: false, category: 'Review' },
    { id: 'block-notice-file', title: 'Research files processed', summary: 'Research folder · Two documents ready', detail: 'The two sample research documents are ready for the project owner.', time: '35 minutes ago', read: false, category: 'Files' },
    { id: 'block-notice-member', title: 'Sam joined the workspace', summary: 'Product operations · Viewer access', detail: 'Sam Rivera was added with viewer access. Manage editing roles in Team access.', time: '1 hour ago', read: true, category: 'Membership' },
  ])
  const [filter, setFilter] = useState<ActivityCentreProps['filter']>('all')
  const events: FeedEvent[] = [
    { id: 'block-event-review', actor: 'Maya Chen', kind: 'comment', event: 'Requested feedback on the planning brief', detail: 'Please confirm the scope and owners before the review.', when: '10:25 AM', group: 'Today' },
    { id: 'block-event-files', actor: 'Alex Morgan', kind: 'update', event: 'Processed the research documents', when: '9:40 AM', group: 'Today' },
    { id: 'block-event-member', actor: 'Maya Chen', kind: 'update', event: 'Added Sam Rivera with viewer access', when: 'Yesterday, 4:10 PM', group: 'Yesterday' },
  ]
  return <ActivityCentre workspaceName="Product operations" notifications={notifications} events={events} filter={filter} onNotificationsChange={setNotifications} onFilterChange={setFilter} />
}

export function RecordInspectorPreview() {
  const [records, setRecords] = useState<EditableRecord[]>([
    { id: 'REC-2401', name: 'Quarterly operations review', owner: 'block-maya', status: 'In review', description: 'Review the project owners, supporting files, and readiness for the next quarter.', activity: [{ id: 'record-created', message: 'Record created', when: 'Yesterday, 10:00 AM' }, { id: 'record-review', message: 'Review requested', when: 'Today, 9:30 AM' }] },
    { id: 'REC-2402', name: 'Customer research handoff', owner: 'block-jordan', status: 'Active', description: 'Keep the research summary and handoff ownership together.', activity: [{ id: 'record-started', message: 'Research handoff started', when: 'Today, 8:45 AM' }] },
    { id: 'REC-2403', name: 'Previous quarter archive', owner: 'block-sam', status: 'Archived', description: 'The completed review from the previous planning cycle.', activity: [{ id: 'record-archived', message: 'Completed review archived', when: 'Friday, 3:30 PM' }] },
  ])
  const [selectedId, setSelectedId] = useState('REC-2401')
  const sequence = useRef(1)
  return <RecordInspector workspaceName="Northstar" records={records} people={teamPeople} selectedId={selectedId} onSelectionChange={setSelectedId} onSave={(id, values) => { const number = sequence.current++; setRecords(previous => previous.map(record => record.id === id ? { ...record, ...values, activity: [{ id: `block-save-${number}`, message: 'Record details saved in this example', when: 'Just now' }, ...record.activity] } : record)); setSelectedId(id) }} />
}

const initialConfiguration: ProjectConfiguration = { name: 'Quarterly planning', description: 'Coordinate the next quarter’s goals, owners, and milestones.', ownerId: 'block-maya', contactEmail: 'planning@northstar.example', visibility: 'Team', reviewers: ['block-alex'], requireApproval: true, notifyReviewers: true }
export function MultiSectionFormPreview() {
  const [value, setValue] = useState<ProjectConfiguration>({ ...initialConfiguration, reviewers: [...initialConfiguration.reviewers] })
  const [savedValue, setSavedValue] = useState<ProjectConfiguration>({ ...initialConfiguration, reviewers: [...initialConfiguration.reviewers] })
  return <MultiSectionForm value={value} savedValue={savedValue} people={teamPeople} onChange={setValue} onSave={next => { setValue(next); setSavedValue({ ...next, reviewers: [...next.reviewers] }) }} />
}

const operationTasks: PriorityTaskItem[] = [
  { id: 'block-task-brief', title: 'Confirm the planning brief', reason: 'The review needs a clear scope before the next handoff.', owner: 'Maya Chen', member: 'Quarterly planning', recordId: 'REC-2401', condition: 'Review required', conditionIntent: 'warning', deadline: '12 Oct, 12:00 PM IST', overdue: true, priorityExplanation: 'Start here: this overdue review blocks the next handoff.', actionLabel: 'Review brief' },
  { id: 'block-task-owner', title: 'Check the research owner', reason: 'Confirm who will complete the research handoff.', owner: 'Jordan Ellis', member: 'Research handoff', recordId: 'REC-2402', condition: 'Owner review', conditionIntent: 'info', deadline: '12 Oct, 4:00 PM IST', actionLabel: 'Review owner' },
  { id: 'block-task-files', title: 'Inspect the ready documents', reason: 'The supporting files are complete and ready to inspect.', owner: 'Alex Morgan', member: 'Service quality', recordId: 'REC-2404', condition: 'Ready for review', conditionIntent: 'neutral', deadline: '12 Oct, 5:00 PM IST', actionLabel: 'Review files' },
]
const operationRecords: RecentRecordItem[] = [
  { id: 'REC-2401', name: 'Quarterly planning', status: 'In review', intent: 'warning', updated: '12 Oct, 10:25 AM IST', updatedISO: '2026-10-12T10:25:00+05:30' },
  { id: 'REC-2402', name: 'Research handoff', status: 'Active', intent: 'success', updated: '12 Oct, 9:40 AM IST', updatedISO: '2026-10-12T09:40:00+05:30' },
  { id: 'REC-2404', name: 'Service quality', status: 'Ready', intent: 'neutral', updated: '11 Oct, 4:10 PM IST', updatedISO: '2026-10-11T16:10:00+05:30' },
]

export function OperationsDashboardPreview() {
  const [tasks, setTasks] = useState(operationTasks)
  const [completed, setCompleted] = useState<{ task: PriorityTaskItem; index: number }[]>([])
  const [messages, setMessages] = useState<AssistantMessage[]>([])
  const [composer, setComposer] = useState('')
  const [error, setError] = useState('')
  const [recordOpen, setRecordOpen] = usePreviewOverlay()
  const [evidenceOpen, setEvidenceOpen] = usePreviewOverlay()
  const [recordId, setRecordId] = useState<string | null>(null)
  const [evidence, setEvidence] = useState<{ title: string; description: string } | null>(null)
  const sequence = useRef(1)
  const record = operationRecords.find(item => item.id === recordId)
  const openRecord = (id: string) => { setRecordId(id); setRecordOpen(true) }
  const send = (text: string) => {
    const question = text.trim()
    if (!question) { setError('Enter a question or choose a suggestion.'); return }
    if (question.length > 400) { setError('Use 400 characters or fewer.'); return }
    const number = sequence.current++
    const first = tasks[0]
    setMessages(previous => [...previous, { id: `block-question-${number}`, role: 'user', text: question }, {
      id: `block-answer-${number}`, role: 'assistant', heading: first ? 'Start with the next open task' : 'Your sample queue is clear',
      text: first ? `${tasks.length} sample tasks remain. ${first.title} is the first item in the current queue.` : 'Every sample task has been completed. You can restore the latest one with Undo completion.',
      findings: first ? [first.reason, `Owner: ${first.owner}. Due ${first.deadline}.`] : [`${completed.length} tasks completed in this example.`],
      evidence: first ? [{ id: first.id, label: `${first.recordId} · Task details` }] : undefined,
      action: first ? { id: first.recordId, label: 'Open referenced record' } : undefined,
    }])
    setComposer(''); setError('')
  }
  const assistant: ContextualAssistantProps = {
    title: 'Operations assistant', subtitle: 'Prepared answers from the sample queue', context: 'Northstar operations', contextDescription: `${tasks.length} open tasks · ${operationRecords.length} recent records`,
    messages, suggestions: ['What should I review next?', 'Which task is overdue?'], composerText: composer, composerLabel: 'Ask about the sample queue', composerPlaceholder: 'Ask about tasks, owners, or evidence', error,
    onComposerChange: text => { setComposer(text); setError('') }, onSend: send,
    onEvidence: (_, id) => { const source = operationTasks.find(task => task.id === id); if (source) { setEvidence({ title: source.title, description: `${source.reason} Record ${source.recordId}; owner ${source.owner}; due ${source.deadline}.` }); setEvidenceOpen(true) } },
    onAction: (_, id) => openRecord(id), onReset: () => { setMessages([]); setComposer(''); setError('') },
  }
  return <>
    <OperationsDashboard workspaceName="Northstar" tasks={tasks} records={operationRecords} completedCount={completed.length} assistant={assistant} onOpenRecord={openRecord} onCompleteTask={id => {
      const index = tasks.findIndex(task => task.id === id)
      if (index < 0) return
      setCompleted(previous => [...previous, { task: tasks[index], index }]); setTasks(previous => previous.filter(task => task.id !== id))
    }} onUndoCompletion={completed.length ? () => {
      const latest = completed.at(-1)!
      setTasks(previous => { const restored = [...previous]; restored.splice(Math.min(latest.index, restored.length), 0, latest.task); return restored })
      setCompleted(previous => previous.slice(0, -1))
    } : undefined} />
    <Dialog open={recordOpen && !!record} onOpenChange={(_, data) => setRecordOpen(data.open)}><DialogSurface className="expanded-block-dialog"><DialogBody><DialogTitle>{record?.name ?? 'Record details'}</DialogTitle><DialogContent>{record && <FactList items={[{ label: 'Record', value: record.id }, { label: 'Status', value: <StatusBadge label={record.status} intent={record.intent} /> }, { label: 'Updated', value: record.updated }]} />}</DialogContent><DialogActions><Button appearance="primary" onClick={() => setRecordOpen(false)}>Close record</Button></DialogActions></DialogBody></DialogSurface></Dialog>
    <Dialog open={evidenceOpen && !!evidence} onOpenChange={(_, data) => setEvidenceOpen(data.open)}><DialogSurface className="expanded-block-dialog"><DialogBody><DialogTitle>{evidence?.title ?? 'Supporting evidence'}</DialogTitle><DialogContent><p>{evidence?.description}</p><p className="expanded-muted">This is a prepared source from the synthetic task fixture.</p></DialogContent><DialogActions><Button appearance="primary" onClick={() => setEvidenceOpen(false)}>Close evidence</Button></DialogActions></DialogBody></DialogSurface></Dialog>
  </>
}
