import { useEffect, useRef, useState } from 'react'
import {
  Avatar,
  Badge,
  Button,
  CompoundButton,
  SplitButton,
  ToggleButton,
  MenuButton,
  Card,
  CardHeader,
  CardPreview,
  CardFooter,
  CounterBadge,
  PresenceBadge,
  Checkbox,
  Dialog,
  DialogActions,
  DialogBody,
  DialogContent,
  DialogSurface,
  DialogTitle,
  DialogTrigger,
  Dropdown,
  Field,
  Input,
  Menu,
  MenuDivider,
  MenuItem,
  MenuList,
  MenuPopover,
  MenuTrigger,
  MessageBar,
  MessageBarBody,
  MessageBarTitle,
  MessageBarActions,
  Option,
  Persona,
  Radio,
  RadioGroup,
  SearchBox,
  Switch,
  Tab,
  TabList,
  Table,
  TableBody,
  TableCell,
  TableCellLayout,
  TableHeader,
  TableHeaderCell,
  TableRow,
  Textarea,
  Toast,
  ToastBody,
  Toaster,
  ToastTitle,
  ToastTrigger,
  useId,
  useToastController,
} from '@fluentui/react-components'
import {
  AddRegular,
  ArrowRightRegular,
  ArrowSortRegular,
  CopyRegular,
  DeleteRegular,
  DocumentRegular,
  EditRegular,
  FolderRegular,
  InfoRegular,
  MailRegular,
  MoreHorizontalRegular,
  SearchRegular,
  DismissRegular,
} from '@fluentui/react-icons'
import '../ComponentGallery.css'
import './FoundationPreviews.css'
import { StatusBadge } from '../shared/Shared'
import { PreviewTooltip } from '../PreviewPageActivity'
import { usePreviewOverlay, usePreviewPageActivity } from '../usePreviewPageActivity'

export function ButtonDemo() {
  const [projects, setProjects] = useState<string[]>(['Product roadmap'])
  const [pinned, setPinned] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [view, setView] = useState<'all' | 'pinned'>('all')
  const [menuOpen, setMenuOpen] = usePreviewOverlay()
  const [splitOpen, setSplitOpen] = usePreviewOverlay()
  const create = (template = 'Untitled project') => {
    const name = `${template} ${projects.length}`
    setProjects(items => [...items, name]); setFeedback(`${name} created.`)
  }
  return <div className="demo-stack demo-button-family">
    <div className="demo-variant"><span className="demo-label">Standard & icon</span><div className="demo-row"><Button appearance="primary" icon={<AddRegular />} onClick={() => create()}>New project</Button><PreviewTooltip content="Add another sample project" relationship="label"><Button appearance="subtle" icon={<AddRegular />} aria-label="Add another sample project" onClick={() => create()} /></PreviewTooltip><Button disabled>Publish</Button></div></div>
    <div className="demo-variant"><span className="demo-label">Compound</span><CompoundButton icon={<FolderRegular />} secondaryContent="Start with owners and milestones" onClick={() => create('Planning project')}>New planning project</CompoundButton></div>
    <div className="demo-variant"><span className="demo-label">Split & menu</span><div className="demo-row">
      <Menu open={splitOpen} onOpenChange={(_, data) => setSplitOpen(data.open)}><MenuTrigger disableButtonEnhancement><SplitButton primaryActionButton={{ onClick: () => create() }} menuButton={{ 'aria-label': 'Choose a project template' }} icon={<AddRegular />}>Create</SplitButton></MenuTrigger><MenuPopover><MenuList><MenuItem onClick={() => create('Research project')}>Research project</MenuItem><MenuItem onClick={() => create('Planning project')}>Planning project</MenuItem></MenuList></MenuPopover></Menu>
      <Menu open={menuOpen} onOpenChange={(_, data) => setMenuOpen(data.open)}><MenuTrigger disableButtonEnhancement><MenuButton>Project view</MenuButton></MenuTrigger><MenuPopover><MenuList><MenuItem onClick={() => { setView('all'); setFeedback(`Showing all ${projects.length} projects.`) }}>All projects</MenuItem><MenuItem onClick={() => { setView('pinned'); setFeedback(pinned ? 'Showing your pinned roadmap.' : 'No projects pinned. Use Pin roadmap to add one.') }}>Pinned projects</MenuItem></MenuList></MenuPopover></Menu>
    </div></div>
    <div className="demo-variant"><span className="demo-label">Toggle</span><ToggleButton checked={pinned} onClick={() => { setPinned(value => !value); setFeedback(pinned ? 'Product roadmap unpinned.' : 'Product roadmap pinned.') }}>{pinned ? 'Roadmap pinned' : 'Pin roadmap'}</ToggleButton></div>
    <ul className="foundation-results" aria-label={view === 'all' ? 'Created projects' : 'Pinned projects'}>{(view === 'all' ? projects : pinned ? projects.slice(0, 1) : []).map(project => <li key={project}><FolderRegular /><span>{project}</span></li>)}</ul>
    {feedback && <span className="demo-caption" role="status">{feedback}</span>}
  </div>
}

export function InputDemo() {
  const [name, setName] = useState('Quarterly review')
  return <div className="demo-stack"><Field label="Project name" hint="Up to 80 characters."><Input value={name} maxLength={80} onChange={(_, data) => setName(data.value)} contentBefore={<DocumentRegular />} /></Field><div className="demo-tab-panel"><span className="demo-caption">Project preview</span><strong className="demo-block" aria-live="polite">{name.trim() || 'Untitled project'}</strong></div></div>
}

export function SearchBoxDemo() {
  const [query, setQuery] = useState('')
  const matches = ['Quarterly review', 'Customer insights', 'Product roadmap'].filter((item) => item.toLowerCase().includes(query.trim().toLowerCase()))
  return (
    <div className="demo-stack">
      <Field label="Find a project"><SearchBox aria-label="Search example projects" placeholder="Search projects" value={query} onChange={(_, data) => setQuery(data.value)} /></Field>
      <span className="demo-caption" role="status">{matches.length} {matches.length === 1 ? 'project' : 'projects'} found</span>
      <ul className="foundation-results" aria-label="Matching projects">{matches.length ? matches.map(item => <li key={item}><DocumentRegular /><span>{item}</span></li>) : <li>No projects match “{query}”.</li>}</ul>
      {!matches.length && <Button onClick={() => setQuery('')}>Clear search</Button>}
    </div>
  )
}

export function TextareaDemo() {
  const [value, setValue] = useState('A shared space for the ideas that move us forward.')
  return (
    <div className="demo-stack">
      <Field label="Project description" hint="Up to 160 characters."><Textarea value={value} maxLength={160} resize="vertical" onChange={(_, data) => setValue(data.value)} /></Field>
      <span className="demo-caption demo-end" aria-live="polite">{value.length} / 160 characters</span>
    </div>
  )
}

export function FieldDemo() {
  const [email, setEmail] = useState('alex@contoso.com')
  const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  return (
    <div className="demo-stack">
      <Field label="Work email" required validationState={valid ? 'none' : 'error'} validationMessage={valid ? undefined : 'Use an email address with a domain, such as alex@northstar.example.'} hint={valid ? 'We’ll send your project updates here.' : undefined}>
        <Input type="email" value={email} contentBefore={<MailRegular />} onChange={(_, data) => setEmail(data.value)} />
      </Field>
    </div>
  )
}

export function DropdownDemo() {
  const [value, setValue] = useState('Design team')
  const [open, setOpen] = usePreviewOverlay()
  return (
    <div className="demo-stack">
      <Field label="Workspace">
        <Dropdown open={open} onOpenChange={(_, data) => setOpen(data.open)} value={value} selectedOptions={[value]} onOptionSelect={(_, data) => setValue(data.optionValue ?? value)}>
          <Option>Design team</Option>
          <Option>Product team</Option>
          <Option>Engineering</Option>
        </Dropdown>
      </Field>
      <span className="demo-caption" aria-live="polite">Sharing with {value.toLowerCase()}.</span>
    </div>
  )
}

export function CheckboxDemo() {
  const [email, setEmail] = useState(true)
  const [digest, setDigest] = useState(false)
  return (
    <div className="demo-stack demo-tight">
      <Checkbox label="Email notifications" checked={email} onChange={(_, data) => setEmail(data.checked === true)} />
      <Checkbox label="Weekly project digest" checked={digest} onChange={(_, data) => setDigest(data.checked === true)} />
      <Checkbox label="Security alerts" checked disabled />
      <span className="demo-caption">Security alerts are required for all members.</span>
      <span className="demo-caption" aria-live="polite">{Number(email) + Number(digest)} optional {Number(email) + Number(digest) === 1 ? 'notification' : 'notifications'} enabled</span>
    </div>
  )
}

export function RadioDemo() {
  const [value, setValue] = useState('team')
  return (
    <div className="demo-stack demo-tight">
      <span className="demo-label" id="demo-access-label">Who can see this project?</span>
      <RadioGroup aria-labelledby="demo-access-label" value={value} onChange={(_, data) => setValue(data.value)}>
        <Radio value="private" label="Only me" />
        <Radio value="team" label="My team" />
        <Radio value="organization" label="Everyone at Northstar" />
      </RadioGroup>
    </div>
  )
}

export function SwitchDemo() {
  const [autosave, setAutosave] = useState(true)
  return (
    <div className="demo-stack">
      <div className="demo-setting-row">
        <div><span className="demo-label">Autosave</span><span className="demo-caption demo-block">Keep your work up to date.</span></div>
        <Switch aria-label="Autosave" checked={autosave} onChange={(_, data) => setAutosave(data.checked)} />
      </div>
      <div className="demo-status-line"><span className={autosave ? 'demo-status-dot demo-status-dot-active' : 'demo-status-dot'} /><span aria-live="polite">{autosave ? 'Changes save automatically' : 'Manual saving enabled'}</span></div>
    </div>
  )
}

export function CardDemo() {
  const [open, setOpen] = useState(false)
  return (
    <Card className="demo-project-card" size="small">
      <CardHeader image={<span className="demo-icon-tile"><FolderRegular /></span>} header={<span className="demo-label">Product roadmap</span>} description={<span className="demo-caption">Updated just now · 8 members</span>} />
      <CardPreview><div className="demo-card-preview"><div><span>Discovery</span><span className="demo-caption">Complete</span></div><div><span>Design review</span><span className="demo-caption">Next milestone</span></div></div></CardPreview>
      <CardFooter className="demo-setting-row">
        <Badge size="large" appearance="tint" color="brand">In progress</Badge>
        <Button appearance="subtle" size="small" icon={<ArrowRightRegular />} iconPosition="after" aria-expanded={open} onClick={() => setOpen((value) => !value)}>{open ? 'Close' : 'Open'}</Button>
      </CardFooter>
      {open && <span className="demo-caption" aria-live="polite">Next milestone: share the first design review.</span>}
    </Card>
  )
}

export function BadgeDemo() {
  const [count, setCount] = useState(3)
  const [available, setAvailable] = useState(true)
  return (
    <div className="demo-stack">
      <div className="demo-variant"><span className="demo-label">Status</span><div className="demo-row">
        <StatusBadge label="Active" intent="success" />
        <StatusBadge label="In review" intent="warning" />
        <Badge size="large" appearance="outline" color="informative">Draft</Badge>
      </div></div>
      <div className="demo-variant"><span className="demo-label">Counter</span><div className="demo-setting-row"><span className="demo-inline">Unread updates <CounterBadge count={count} showZero size="large" aria-label={`${count} unread updates`} /></span><Button size="small" disabled={!count} onClick={() => setCount(value => Math.max(0, value - 1))}>Read one</Button></div></div>
      <div className="demo-variant"><span className="demo-label">Presence</span><div className="demo-setting-row"><span className="demo-inline" role="status"><PresenceBadge status={available ? 'available' : 'busy'} size="large" />{available ? 'Available' : 'Busy'}</span><Button size="small" onClick={() => setAvailable(value => !value)}>{available ? 'Set busy' : 'Set available'}</Button></div></div>
    </div>
  )
}

export function PersonaDemo() {
  const [available, setAvailable] = useState(true)
  return (
    <div className="demo-stack">
      <Persona name="Alex Morgan" secondaryText="Product designer" tertiaryText={available ? 'Available' : 'Busy'} presence={{ status: available ? 'available' : 'busy' }} avatar={{ color: 'teal' }} />
      <Persona name="Maya Chen" secondaryText="Workspace owner" size="small" avatar={{ color: 'neutral' }} />
      <Button size="small" className="demo-self-start" onClick={() => setAvailable((value) => !value)}>{available ? 'Set Alex busy' : 'Set Alex available'}</Button>
    </div>
  )
}

export function AvatarDemo() {
  const [square, setSquare] = useState(false)
  return <div className="demo-stack"><div className="demo-avatar-sizes"><div><Avatar name="Jamie Chen" size={28} color="colorful" shape={square ? 'square' : 'circular'} /><span>Jamie</span></div><div><Avatar name="Taylor Reed" size={40} color="colorful" shape={square ? 'square' : 'circular'} /><span>Taylor</span></div><div><Avatar name="Sam Patel" size={56} color="colorful" shape={square ? 'square' : 'circular'} /><span>Sam</span></div></div><ToggleButton checked={square} className="demo-self-start" onClick={() => setSquare(value => !value)}>Square avatars</ToggleButton></div>
}

export function TabsDemo() {
  const [tab, setTab] = useState('overview')
  const [digest, setDigest] = useState(true)
  return <div className="demo-stack">
    <TabList selectedValue={tab} onTabSelect={(_, data) => setTab(String(data.value))} size="small" aria-label="Project sections">
      {['overview', 'activity', 'settings'].map(value => <Tab key={value} value={value} id={`demo-tab-${value}`} aria-controls="demo-tab-panel">{value[0].toUpperCase() + value.slice(1)}</Tab>)}
    </TabList>
    <div className="demo-tab-panel" id="demo-tab-panel" role="tabpanel" aria-labelledby={`demo-tab-${tab}`} tabIndex={0}>
      {tab === 'overview' && <div className="demo-stack"><strong>Product roadmap</strong><StatusBadge label="In progress" intent="info" /><span>Owner: Alex Morgan</span><span>Next review: 24 October</span></div>}
      {tab === 'activity' && <ul className="foundation-results"><li>Alex shared the design review · 14:20</li><li>Jamie added a milestone · 11:45</li><li>Sam joined the project · Yesterday</li></ul>}
      {tab === 'settings' && <div className="demo-stack"><Switch label="Weekly digest" checked={digest} onChange={(_, data) => setDigest(data.checked)} /><span className="demo-caption">{digest ? 'Members receive a Friday summary.' : 'Weekly summaries are paused.'}</span></div>}
    </div>
  </div>
}

export function DialogDemo() {
  const [confirmed, setConfirmed] = useState(false)
  const [open, setOpen] = usePreviewOverlay()
  return (
    <div className="demo-stack demo-centered">
      <Dialog open={open} onOpenChange={(_, data) => setOpen(data.open)}>
        <DialogTrigger disableButtonEnhancement><Button icon={<AddRegular />}>Create a workspace</Button></DialogTrigger>
        <DialogSurface>
          <DialogBody>
            <DialogTitle>Create Northstar workspace</DialogTitle>
            <DialogContent>Create a shared workspace for your team. You can invite members and organize projects whenever you’re ready.</DialogContent>
            <DialogActions>
              <DialogTrigger disableButtonEnhancement><Button appearance="secondary">Cancel</Button></DialogTrigger>
              <DialogTrigger disableButtonEnhancement><Button appearance="primary" onClick={() => setConfirmed(true)}>Create workspace</Button></DialogTrigger>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>
      <span className="demo-caption" aria-live="polite">{confirmed ? 'Northstar workspace created · 1 member' : 'Northstar workspace · Private · Alex Morgan'}</span>
    </div>
  )
}

export function MenuDemo() {
  const [action, setAction] = useState('')
  const [open, setOpen] = usePreviewOverlay()
  const [name, setName] = useState('Product roadmap')
  const [draft, setDraft] = useState(name)
  const [renaming, setRenaming] = useState(false)
  const [removed, setRemoved] = useState(false)
  const [copies, setCopies] = useState<string[]>([])
  const [error, setError] = useState('')
  const triggerRef = useRef<HTMLButtonElement>(null)
  const closeRename = () => { setRenaming(false); setError(''); requestAnimationFrame(() => triggerRef.current?.focus()) }
  return (
    <div className="demo-stack">
      <div className="demo-tab-panel"><span className="demo-caption">Project</span><strong className="demo-block">{removed ? 'Moved to trash' : name}</strong>{copies.map(copy => <span className="demo-block" key={copy}>{copy}</span>)}</div>
      <Menu open={open} onOpenChange={(_, data) => setOpen(data.open)}>
        <MenuTrigger disableButtonEnhancement><Button ref={triggerRef} disabled={removed || renaming} icon={<MoreHorizontalRegular />} iconPosition="after">Project actions</Button></MenuTrigger>
        <MenuPopover>
          <MenuList>
            <MenuItem icon={<EditRegular />} onClick={() => { setDraft(name); setRenaming(true) }}>Rename</MenuItem>
            <MenuItem icon={<CopyRegular />} onClick={() => { const copy = `${name} — Copy ${copies.length + 1}`; setCopies(items => [...items, copy]); setAction(`${copy} created.`) }}>Duplicate</MenuItem>
            <MenuDivider />
            <MenuItem icon={<DeleteRegular />} onClick={() => { setRemoved(true); setAction(`${name} moved to trash. You can undo this.`) }}>Move to trash</MenuItem>
          </MenuList>
        </MenuPopover>
      </Menu>
      {renaming && <form className="demo-stack" onSubmit={event => { event.preventDefault(); if (!draft.trim()) { setError('Enter a project name.'); return }; setName(draft.trim()); setAction(`Renamed project to ${draft.trim()}.`); closeRename() }}><Field label="Project name" required validationState={error ? 'error' : 'none'} validationMessage={error}><Input autoFocus value={draft} maxLength={80} onChange={(_, data) => { setDraft(data.value); setError('') }} /></Field><div className="demo-row"><Button type="submit" appearance="primary">Save name</Button><Button type="button" onClick={closeRename}>Cancel</Button></div></form>}
      {removed && <Button onClick={() => { setRemoved(false); setAction(`${name} restored.`) }}>Undo removal</Button>}
      {action && <span className="demo-caption" role="status">{action}</span>}
    </div>
  )
}

export function TooltipDemo() {
  return <div className="demo-stack">
    <div className="demo-row">
      <PreviewTooltip content="Search matches project names and owners." relationship="description"><Button appearance="subtle" icon={<SearchRegular />}>Search help</Button></PreviewTooltip>
      <PreviewTooltip content="Only members can access a private workspace." relationship="description"><Button appearance="subtle" icon={<InfoRegular />}>Access help</Button></PreviewTooltip>
    </div>
  </div>
}

export function TableDemo() {
  const [ascending, setAscending] = useState(true)
  const [selected, setSelected] = useState<string[]>([])
  const rows = [
    { name: 'Design review', status: 'Active', color: 'success' as const },
    { name: 'Q4 planning', status: 'Draft', color: 'informative' as const },
    { name: 'Team handbook', status: 'Review', color: 'warning' as const },
    { name: 'Customer insights', status: 'Active', color: 'success' as const },
  ].sort((a, b) => ascending ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name))
  return <div className="demo-stack">
    <span className="demo-caption" aria-live="polite">{selected.length} of {rows.length} selected</span>
    <div className="foundation-table-scroll" role="region" aria-label="Scrollable example projects table" tabIndex={0}><Table size="small" aria-label="Example projects" className="demo-table">
      <TableHeader><TableRow><TableHeaderCell className="foundation-selection"><Checkbox aria-label="Select all example projects" checked={selected.length === rows.length ? true : selected.length ? 'mixed' : false} onChange={(_, data) => setSelected(data.checked ? rows.map(row => row.name) : [])} /></TableHeaderCell><TableHeaderCell aria-sort={ascending ? 'ascending' : 'descending'}><Button size="small" appearance="transparent" icon={<ArrowSortRegular />} iconPosition="after" onClick={() => setAscending(value => !value)} aria-label={`Sort project name ${ascending ? 'descending' : 'ascending'}`}>Project</Button></TableHeaderCell><TableHeaderCell>Status</TableHeaderCell></TableRow></TableHeader>
      <TableBody>{rows.map(row => <TableRow key={row.name} aria-selected={selected.includes(row.name)}><TableCell><Checkbox aria-label={`Select ${row.name}`} checked={selected.includes(row.name)} onChange={(_, data) => setSelected(items => data.checked ? [...items, row.name] : items.filter(item => item !== row.name))} /></TableCell><TableCell><TableCellLayout>{row.name}</TableCellLayout></TableCell><TableCell><Badge appearance="tint" size="large" color={row.color}>{row.status}</Badge></TableCell></TableRow>)}</TableBody>
    </Table></div>
  </div>
}

export function MessageBarDemo() {
  const [intent, setIntent] = useState<'info' | 'success' | 'warning' | 'error'>('info')
  const [visible, setVisible] = useState(true)
  const messages = {
    info: { title: 'Review scheduled.', body: 'The next workspace review is on 24 October.' },
    success: { title: 'Update complete.', body: 'Your sample workspace is up to date.' },
    warning: { title: 'Review is overdue.', body: 'Confirm the project scope before the next review.' },
    error: { title: 'Refresh could not finish.', body: 'The sample connection stopped. Try the refresh again.' },
  }
  return <div className="demo-stack"><TabList size="small" aria-label="Message intent" selectedValue={intent} onTabSelect={(_, data) => { setIntent(data.value as typeof intent); setVisible(true) }}>{(['info', 'success', 'warning', 'error'] as const).map(value => <Tab key={value} value={value}>{value[0].toUpperCase() + value.slice(1)}</Tab>)}</TabList>{visible ? <MessageBar intent={intent}><MessageBarBody><MessageBarTitle>{messages[intent].title}</MessageBarTitle>{messages[intent].body}</MessageBarBody><MessageBarActions containerAction={<Button appearance="transparent" icon={<DismissRegular />} aria-label="Dismiss sample message" onClick={() => setVisible(false)} />} /></MessageBar> : <Button onClick={() => setVisible(true)}>Show message again</Button>}{intent === 'error' && visible && <Button onClick={() => { setIntent('success'); setVisible(true) }}>Retry sample refresh</Button>}</div>
}

export function ToastDemo() {
  const toasterId = useId('component-toast')
  const { dispatchToast, dismissAllToasts } = useToastController(toasterId)
  const { active, revision } = usePreviewPageActivity()
  const [saves, setSaves] = useState(0)
  useEffect(() => { dismissAllToasts() }, [active, revision, dismissAllToasts])
  return (
    <div className="demo-stack">
      <Button onClick={() => { setSaves(value => value + 1); dispatchToast(<Toast><ToastTitle action={<ToastTrigger><Button appearance="transparent" icon={<DismissRegular />} aria-label="Dismiss save notification" /></ToastTrigger>}>Changes saved</ToastTitle><ToastBody>Your workspace preferences are up to date.</ToastBody></Toast>, { intent: 'success', timeout: 5000 }) }}>Save sample preferences</Button>
      {saves > 0 && <span className="demo-caption" role="status">Preferences saved {saves} {saves === 1 ? 'time' : 'times'} in this preview.</span>}
      {active && <Toaster key={revision} toasterId={toasterId} position="bottom-end" />}
    </div>
  )
}

export function FeedbackDemo() { return <ToastDemo /> }

export function EmptyStateDemo() {
  const [created, setCreated] = useState(false)
  return (
    <div className="demo-stack demo-centered demo-empty">
      <span className="demo-empty-icon">{created ? <DocumentRegular /> : <FolderRegular />}</span>
      <span className="demo-label" aria-live="polite">{created ? 'Your first project is ready' : 'No projects yet'}</span>
      <span className="demo-caption">{created ? 'Product roadmap · Owned by Alex Morgan' : 'Create a project to bring your ideas together.'}</span>
      <Button size="small" appearance={created ? 'subtle' : 'primary'} icon={created ? undefined : <AddRegular />} onClick={() => setCreated((value) => !value)}>{created ? 'Reset preview' : 'Create project'}</Button>
    </div>
  )
}

