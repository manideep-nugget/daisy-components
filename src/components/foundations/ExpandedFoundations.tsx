import { Fragment, useState } from 'react'
import {
  Accordion, AccordionHeader, AccordionItem, AccordionPanel, Avatar, Badge,
  Breadcrumb, BreadcrumbButton, BreadcrumbDivider, BreadcrumbItem, Button,
  Combobox, DrawerBody, DrawerFooter, DrawerHeader, DrawerHeaderTitle,
  Field, Input, Option, OptionGroup, OverlayDrawer, Popover, PopoverSurface,
  PopoverTrigger, ProgressBar, Skeleton, SkeletonItem, Slider, Spinner,
  SpinButton, Switch, Tag, TagGroup, Toolbar, ToolbarButton, ToolbarDivider,
  ToolbarToggleButton, Tree, TreeItem, TreeItemLayout, useId, useRestoreFocusTarget,
} from '@fluentui/react-components'
import {
  Checkmark20Regular, Dismiss20Regular, Document20Regular, Edit20Regular,
  Folder20Regular, FolderOpen20Regular, Info20Regular, LockClosed20Regular,
  Save20Regular, TextBold20Regular, TextItalic20Regular,
} from '@fluentui/react-icons'
import { usePreviewOverlay } from '../usePreviewPageActivity'
import { PreviewTooltip } from '../PreviewPageActivity'
import { PatternSelect, PeoplePicker, type PickerPerson } from '../patterns/PatternPrimitives'
import './ExpandedFoundations.css'

const people: PickerPerson[] = [
  { id: 'maya', name: 'Maya Chen', email: 'maya@northstar.example' },
  { id: 'jordan', name: 'Jordan Ellis', email: 'jordan@northstar.example' },
  { id: 'alex', name: 'Alex Morgan', email: 'alex@northstar.example' },
  { id: 'sam', name: 'Sam Rivera', email: 'sam@northstar.example' },
]

export function AccordionPreview() {
  const [multiple, setMultiple] = useState(false)
  const [openItems, setOpenItems] = useState<string[]>(['access'])
  return <div className="pattern-stack fnd-stack">
    <Switch label="Allow multiple open sections" checked={multiple} onChange={(_, data) => { setMultiple(data.checked); if (!data.checked) setOpenItems(items => items.slice(0, 1)) }} />
    <Accordion collapsible multiple={multiple} openItems={openItems} onToggle={(_, data) => setOpenItems(data.openItems.map(String))}>
      <AccordionItem value="access"><AccordionHeader>Workspace access</AccordionHeader><AccordionPanel><p>Four members can access Product operations. Editors can update resources; viewers can read them.</p></AccordionPanel></AccordionItem>
      <AccordionItem value="retention"><AccordionHeader>Retention policy</AccordionHeader><AccordionPanel><p>Sample documents are kept for 90 days. Archived resources remain available to workspace owners.</p></AccordionPanel></AccordionItem>
      <AccordionItem value="notifications"><AccordionHeader>Notifications</AccordionHeader><AccordionPanel><p>Members receive a daily digest for changes to resources they follow.</p></AccordionPanel></AccordionItem>
    </Accordion>
  </div>
}

const locations = ['Northstar', 'Operations', 'Reports']
export function BreadcrumbPreview() {
  const [depth, setDepth] = useState(2)
  return <div className="pattern-stack fnd-stack">
    <Breadcrumb aria-label="Sample location" className="fnd-breadcrumb">{locations.slice(0, depth + 1).map((location, index) => <Fragment key={location}>{index > 0 && <BreadcrumbDivider />}<BreadcrumbItem><BreadcrumbButton current={index === depth} onClick={() => setDepth(index)}>{location}</BreadcrumbButton></BreadcrumbItem></Fragment>)}</Breadcrumb>
    <div className="fnd-summary" aria-live="polite"><strong>{locations[depth]}</strong><p className="pattern-muted">{depth === 2 ? 'Monthly performance and planning reports.' : depth === 1 ? 'Shared resources for the operations team.' : 'Your sample organization workspaces.'}</p></div>
    <ul className="fnd-simple-list">{depth < 2 ? <li><Folder20Regular /><Button appearance="subtle" onClick={() => setDepth(depth + 1)}>Open {locations[depth + 1]}</Button></li> : <><li><Document20Regular />Monthly performance.pdf</li><li><Document20Regular />Quarterly plan.docx</li></>}</ul>
  </div>
}

const resources = [
  { id: 'product', name: 'Product operations', group: 'Workspaces' },
  { id: 'customer', name: 'Customer success', group: 'Workspaces' },
  { id: 'revenue', name: 'Revenue overview', group: 'Reports' },
  { id: 'quality', name: 'Service quality', group: 'Reports' },
]
export function ComboboxPreview() {
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState('')
  const [open, setOpen] = usePreviewOverlay()
  const matches = resources.filter(resource => resource.name.toLowerCase().includes(query.trim().toLowerCase()))
  return <div className="pattern-stack fnd-stack">
    <Field label="Resource"><Combobox listbox={{ className: 'pattern-options' }} placeholder="Find a workspace or report" value={query} selectedOptions={selected ? [selected] : []} open={open} onOpenChange={(_, data) => setOpen(data.open)} onChange={event => { setQuery(event.target.value); setSelected('') }} onOptionSelect={(_, data) => { setSelected(data.optionValue ?? ''); setQuery(data.optionText ?? ''); setOpen(false) }}>
      {['Workspaces', 'Reports'].map(group => { const options = matches.filter(resource => resource.group === group); return options.length ? <OptionGroup key={group} label={group}>{options.map(resource => <Option key={resource.id} value={resource.id} text={resource.name}>{resource.name}</Option>)}</OptionGroup> : null })}
      {!matches.length && <Option disabled value="no-results">No resources match your search</Option>}
    </Combobox></Field>
    <div className="fnd-summary" aria-live="polite">{selected ? <><strong>{resources.find(resource => resource.id === selected)?.name}</strong><p className="pattern-muted">Selected resource · {resources.find(resource => resource.id === selected)?.group}</p></> : <p className="pattern-muted">{query ? `${matches.length} ${matches.length === 1 ? 'resource matches' : 'resources match'}. Choose a result to select it.` : 'Search across two groups, then choose a resource.'}</p>}</div>
    {query && <Button onClick={() => { setQuery(''); setSelected('') }}>{selected ? 'Clear selection' : 'Clear search'}</Button>}
  </div>
}

export function TagPickerPreview() {
  const [selected, setSelected] = useState<string[]>(['maya'])
  return <div className="pattern-stack fnd-stack">
    <PeoplePicker label="Reviewers" people={people} selected={selected} onChange={setSelected} />
    <div className="fnd-summary" aria-live="polite"><strong>{selected.length} {selected.length === 1 ? 'reviewer' : 'reviewers'} selected</strong><p className="pattern-muted">{selected.length ? people.filter(person => selected.includes(person.id)).map(person => person.name).join(', ') : 'Search a name or email to add a reviewer.'}</p></div>
  </div>
}

export function TagGroupPreview() {
  const [tags, setTags] = useState(['Operations', 'North America', 'Quarterly review'])
  return <div className="pattern-stack fnd-stack">
    <div><h4 className="fnd-heading">Information</h4><TagGroup aria-label="Resource labels"><Tag icon={<Document20Regular />}>Report</Tag><Tag icon={<LockClosed20Regular />}>Private</Tag></TagGroup></div>
    <div><h4 className="fnd-heading">Selected categories</h4><TagGroup aria-label="Selected categories" onDismiss={(_, data) => setTags(items => items.filter(tag => tag !== data.value))}>{tags.map(tag => <Tag key={tag} value={tag} dismissible dismissIcon={{ 'aria-label': `Remove ${tag}` }}>{tag}</Tag>)}</TagGroup></div>
    <p className="pattern-muted" role="status">{tags.length ? `${tags.length} ${tags.length === 1 ? 'category' : 'categories'} selected.` : 'No categories selected.'}</p>
    <div className="pattern-row">{['Operations', 'North America', 'Quarterly review'].filter(tag => !tags.includes(tag)).map(tag => <Button key={tag} onClick={() => setTags(items => [...items, tag])}>Add {tag}</Button>)}</div>
  </div>
}

const folderNames: Record<string, string> = { operations: 'Operations', reports: 'Reports', planning: 'Planning', research: 'Research', interviews: 'Interviews' }
export function TreePreview() {
  const [expanded, setExpanded] = useState<string[]>(['operations'])
  const [selected, setSelected] = useState('reports')
  return <div className="pattern-stack fnd-stack">
    <Tree aria-label="Select a folder" selectionMode="single" openItems={expanded} onOpenChange={(_, data) => setExpanded(Array.from(data.openItems, String))} checkedItems={[selected]} onCheckedChange={(_, data) => { if (data.checked) setSelected(String(data.value)) }}>
      <TreeItem itemType="branch" value="operations"><TreeItemLayout iconBefore={expanded.includes('operations') ? <FolderOpen20Regular /> : <Folder20Regular />}>Operations</TreeItemLayout><Tree><TreeItem itemType="leaf" value="reports"><TreeItemLayout iconBefore={<Folder20Regular />}>Reports</TreeItemLayout></TreeItem><TreeItem itemType="leaf" value="planning"><TreeItemLayout iconBefore={<Folder20Regular />}>Planning</TreeItemLayout></TreeItem></Tree></TreeItem>
      <TreeItem itemType="branch" value="research"><TreeItemLayout iconBefore={expanded.includes('research') ? <FolderOpen20Regular /> : <Folder20Regular />}>Research</TreeItemLayout><Tree><TreeItem itemType="leaf" value="interviews"><TreeItemLayout iconBefore={<Folder20Regular />}>Interviews</TreeItemLayout></TreeItem></Tree></TreeItem>
    </Tree>
    <div className="fnd-summary" aria-live="polite"><strong>Selected: {folderNames[selected]}</strong><p className="pattern-muted">Folder selection stays in place when you collapse a branch.</p></div>
  </div>
}

export function ToolbarPreview() {
  const [format, setFormat] = useState<string[]>(['bold'])
  const [saved, setSaved] = useState(false)
  return <div className="pattern-stack fnd-stack">
    <Toolbar aria-label="Document formatting" className="fnd-toolbar" checkedValues={{ format }} onCheckedValueChange={(_, data) => { setFormat(data.checkedItems); setSaved(false) }}>
      <PreviewTooltip content="Bold" relationship="label"><ToolbarToggleButton name="format" value="bold" icon={<TextBold20Regular />} aria-label="Bold" /></PreviewTooltip>
      <PreviewTooltip content="Italic" relationship="label"><ToolbarToggleButton name="format" value="italic" icon={<TextItalic20Regular />} aria-label="Italic" /></PreviewTooltip>
      <ToolbarDivider />
      <ToolbarButton icon={<Save20Regular />} onClick={() => setSaved(true)}>Save</ToolbarButton>
      <PreviewTooltip content="You need edit access to publish" relationship="description"><ToolbarButton disabledFocusable icon={<LockClosed20Regular />} aria-label="Publish unavailable">Publish</ToolbarButton></PreviewTooltip>
    </Toolbar>
    <div className="fnd-format-example" style={{ fontWeight: format.includes('bold') ? 600 : 400, fontStyle: format.includes('italic') ? 'italic' : 'normal' }}>Quarterly operations review</div>
    {saved && <p className="pattern-muted" role="status">Formatting saved in this preview.</p>}
  </div>
}

export function PopoverPreview() {
  const [open, setOpen] = usePreviewOverlay()
  const [following, setFollowing] = useState(false)
  const titleId = useId('member-details')
  return <div className="pattern-stack fnd-stack">
    <div className="fnd-person"><Avatar name="Maya Chen" size={40} /><div><strong>Maya Chen</strong><p className="pattern-muted">Workspace owner · Product operations</p></div></div>
    <Popover open={open} onOpenChange={(_, data) => setOpen(data.open)} positioning="below-start" trapFocus>
      <PopoverTrigger disableButtonEnhancement><Button icon={<Info20Regular />}>View member details</Button></PopoverTrigger>
      <PopoverSurface className="fnd-popover" aria-labelledby={titleId}><div className="pattern-stack fnd-stack"><div className="fnd-person"><Avatar name="Maya Chen" size={40} /><div><h4 className="fnd-heading" id={titleId}>Maya Chen</h4><p className="pattern-muted">Operations lead</p></div></div><dl className="fnd-facts"><div><dt>Email</dt><dd>maya@northstar.example</dd></div><div><dt>Access</dt><dd>Workspace owner</dd></div></dl><Button appearance={following ? 'secondary' : 'primary'} onClick={() => setFollowing(value => !value)}>{following ? 'Stop following' : 'Follow updates'}</Button><Button onClick={() => setOpen(false)}>Close details</Button></div></PopoverSurface>
    </Popover>
    {following && <p className="pattern-muted" role="status">Following Maya’s sample workspace updates.</p>}
  </div>
}

export function DrawerPreview() {
  const [open, setOpen] = usePreviewOverlay()
  const [mode, setMode] = useState<'inspect' | 'edit'>('inspect')
  const [name, setName] = useState('Quarterly operations review')
  const [draft, setDraft] = useState(name)
  const [visibility, setVisibility] = useState('Team')
  const [draftVisibility, setDraftVisibility] = useState(visibility)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const titleId = useId('foundation-drawer')
  const restoreFocus = useRestoreFocusTarget()
  const launch = (nextMode: typeof mode) => { setMode(nextMode); setDraft(name); setDraftVisibility(visibility); setError(''); setOpen(true) }
  const save = () => { if (!draft.trim()) { setError('Enter a record name before saving.'); return }; setName(draft.trim()); setVisibility(draftVisibility); setMessage('Changes saved in this preview.'); setOpen(false) }
  return <div className="pattern-stack fnd-stack">
    <div className="fnd-person"><Document20Regular /><div><strong>{name}</strong><p className="pattern-muted">Report · {visibility} access</p></div></div>
    <div className="pattern-row"><Button {...restoreFocus} onClick={() => launch('inspect')}>Inspect record</Button><Button {...restoreFocus} icon={<Edit20Regular />} onClick={() => launch('edit')}>Edit record</Button></div>
    {message && <p className="pattern-muted" role="status">{message}</p>}
    <OverlayDrawer open={open} onOpenChange={(_, data) => setOpen(data.open)} position="end" className="fnd-drawer" aria-labelledby={titleId}>
      <DrawerHeader><DrawerHeaderTitle id={titleId} action={<Button appearance="subtle" icon={<Dismiss20Regular />} aria-label={mode === 'edit' ? 'Close record drawer and discard changes' : 'Close record drawer'} onClick={() => setOpen(false)} />}>{mode === 'edit' ? 'Edit record' : 'Record details'}</DrawerHeaderTitle></DrawerHeader>
      <DrawerBody className="pattern-stack fnd-stack">{mode === 'inspect' ? <><h4 className="fnd-heading">{name}</h4><p>Monthly performance, owners, and planning notes for the operations team.</p><dl className="fnd-facts"><div><dt>Owner</dt><dd>Maya Chen</dd></div><div><dt>Access</dt><dd>{visibility}</dd></div><div><dt>Updated</dt><dd>Today, 9:30 AM</dd></div></dl></> : <><Field label="Record name" required validationState={error ? 'error' : 'none'} validationMessage={error}><Input value={draft} maxLength={100} onChange={(_, data) => { setDraft(data.value); setError('') }} /></Field><PatternSelect label="Access" value={draftVisibility} options={[{ value: 'Team', label: 'Team' }, { value: 'Private', label: 'Private' }]} onChange={setDraftVisibility} /><p className="pattern-muted">Save to update the summary. Cancel or close to discard unsaved changes.</p></>}</DrawerBody>
      <DrawerFooter className="fnd-drawer-footer">{mode === 'inspect' ? <><Button onClick={() => setOpen(false)}>Close</Button><Button appearance="primary" icon={<Edit20Regular />} onClick={() => setMode('edit')}>Edit record</Button></> : <><Button onClick={() => setOpen(false)}>Cancel</Button><Button appearance="primary" onClick={save}>Save changes</Button></>}</DrawerFooter>
    </OverlayDrawer>
  </div>
}

export function ProgressPreview() {
  const [progress, setProgress] = useState(40)
  const [indeterminate, setIndeterminate] = useState(false)
  const complete = !indeterminate && progress === 100
  const labelId = useId('sample-progress')
  return <div className="pattern-stack fnd-stack">
    <Switch checked={indeterminate} label="Unknown duration" onChange={(_, data) => setIndeterminate(data.checked)} />
    <div className="pattern-row"><strong id={labelId}>{complete ? 'Preparation complete' : 'Preparing sample documents'}</strong>{!indeterminate && <span className="fnd-tabular">{progress}%</span>}</div>
    <ProgressBar aria-labelledby={labelId} value={indeterminate ? undefined : progress} max={100} color={complete ? 'success' : 'brand'} />
    {complete ? <div className="pattern-row" role="status"><Checkmark20Regular /><span>Five documents ready for review.</span></div> : <p className="pattern-muted">{indeterminate ? 'Checking document availability.' : `${progress / 20} of 5 documents prepared.`}</p>}
    <div className="pattern-row"><Button disabled={indeterminate || complete} onClick={() => setProgress(value => Math.min(100, value + 20))}>Advance sample</Button><Button onClick={() => { setProgress(0); setIndeterminate(false) }}>Start again</Button></div>
  </div>
}

export function SpinnerPreview() {
  const [loading, setLoading] = useState(true)
  const [size, setSize] = useState<'tiny' | 'medium' | 'large'>('medium')
  return <div className="pattern-stack fnd-stack"><PatternSelect label="Indicator size" value={size} options={[{ value: 'tiny', label: 'Tiny' }, { value: 'medium', label: 'Medium' }, { value: 'large', label: 'Large' }]} onChange={value => setSize(value as typeof size)} /><div className="fnd-spinner-stage" aria-busy={loading}>{loading ? <Spinner size={size} label="Checking sample documents" /> : <div className="pattern-row" role="status"><Checkmark20Regular /><span>All sample documents are available.</span></div>}</div><Button onClick={() => setLoading(value => !value)}>{loading ? 'Complete sample check' : 'Check again'}</Button></div>
}

export function SkeletonPreview() {
  const [loading, setLoading] = useState(true)
  return <div className="pattern-stack fnd-stack">
    <Switch checked={loading} label="Show loading state" onChange={(_, data) => setLoading(data.checked)} />
    <div className="fnd-skeleton-layout" aria-busy={loading}>{loading ? <Skeleton aria-label="Loading workspace summary" className="fnd-skeleton"><div className="fnd-skeleton-header"><SkeletonItem shape="circle" size={40} /><div><SkeletonItem size={16} /><SkeletonItem size={16} /></div></div><SkeletonItem size={16} /><SkeletonItem size={16} /><SkeletonItem size={16} /></Skeleton> : <div className="fnd-loaded"><div className="fnd-person"><Avatar name="Maya Chen" size={40} /><div><strong>Product operations</strong><p className="pattern-muted">Owned by Maya Chen</p></div></div><p>Workspace for weekly planning and operational reviews.</p><div className="pattern-row"><Badge appearance="tint">4 members</Badge><span className="pattern-muted">Updated today</span></div><p className="pattern-muted">Three resources ready to review.</p></div>}</div>
    <p className="pattern-muted" role="status">{loading ? 'Placeholder matches the content structure.' : 'The sample summary is loaded.'}</p>
  </div>
}

export function SliderPreview() {
  const [capacity, setCapacity] = useState(40)
  return <div className="pattern-stack fnd-stack"><Field label="Review capacity" hint="0–100 items per day, in steps of 5."><Slider aria-label="Review capacity in items" min={0} max={100} step={5} value={capacity} onChange={(_, data) => setCapacity(data.value)} /></Field><div className="fnd-summary" aria-live="polite"><strong className="fnd-tabular">{capacity} items per day</strong><p className="pattern-muted">{capacity === 0 ? 'Paused. Increase capacity to include this queue.' : `Sample weekly capacity: ${capacity * 5} items.`}</p></div><Field label="Locked threshold" hint="This queue threshold is set by the workspace owner."><Slider aria-label="Locked queue threshold" value={65} disabled /></Field></div>
}

export function SpinButtonPreview() {
  const [capacity, setCapacity] = useState(40)
  const [error, setError] = useState('')
  return <div className="pattern-stack fnd-stack">
    <Field label="Items per day" hint="0–100 items, in steps of 5." validationState={error ? 'error' : 'none'} validationMessage={error}><SpinButton aria-label="Items per day" min={0} max={100} step={5} stepPage={20} value={capacity} onChange={(_, data) => {
      const next = data.displayValue !== undefined ? data.displayValue.trim() ? Number(data.displayValue) : NaN : data.value
      if (typeof next !== 'number' || !Number.isFinite(next) || next < 0 || next > 100 || next % 5 !== 0) { setError('Enter a multiple of 5 from 0 to 100. Your previous value was kept.'); return }
      setCapacity(next); setError('')
    }} /></Field>
    <div className="fnd-summary" aria-live="polite"><strong className="fnd-tabular">{capacity} items per day</strong><p className="pattern-muted">{capacity === 0 ? 'Paused. Increase capacity to include this queue.' : `Sample weekly capacity: ${capacity * 5} items.`}</p></div>
  </div>
}

export function NumericPreview() { return <SpinButtonPreview /> }
