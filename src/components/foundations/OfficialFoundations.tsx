import { useRef, useState } from 'react'
import {
  Avatar, AvatarGroup, AvatarGroupItem, AvatarGroupPopover, Badge, Button,
  Carousel, CarouselButton, CarouselCard, CarouselNav, CarouselNavButton,
  CarouselSlider, CarouselViewport, ColorArea, ColorPicker, ColorSlider,
  ColorSwatch, createTableColumn, DataGrid, DataGridBody, DataGridCell,
  DataGridHeader, DataGridHeaderCell, DataGridRow, Divider, Field, Image,
  InfoLabel, Input, Label, Link, List, ListItem, Menu, MenuItem, MenuList,
  MenuPopover, MenuTrigger, Nav, NavCategory, NavCategoryItem, NavDivider,
  NavItem, NavSectionHeader, NavSubItem, NavSubItemGroup, Overflow,
  OverflowItem, Popover, PopoverSurface, PopoverTrigger, Portal, Rating,
  RatingDisplay, Select, SwatchPicker, Switch, TeachingPopover,
  TeachingPopoverBody, TeachingPopoverFooter, TeachingPopoverHeader,
  TeachingPopoverSurface, TeachingPopoverTitle, TeachingPopoverTrigger,
  Text, useId, useIsOverflowItemVisible, useOverflowMenu,
  type DataGridProps, type TableColumnDefinition, type TableRowId,
} from '@fluentui/react-components'
import {
  ArrowLeft20Regular, ArrowRight20Regular, Checkmark20Regular,
  Document20Regular, Folder20Regular, Home20Regular,
  Image20Regular, MoreHorizontal20Regular, People20Regular,
  Settings20Regular,
} from '@fluentui/react-icons'
import { useTheme } from '../../theme/useTheme'
import { usePreviewOverlay } from '../usePreviewPageActivity'
import './OfficialFoundations.css'

const reviewers = ['Maya Chen', 'Jordan Ellis', 'Alex Morgan', 'Sam Rivera', 'Taylor Kim']

export function AvatarGroupPreview() {
  const [layout, setLayout] = useState<'spread' | 'stack'>('stack')
  const [open, setOpen] = usePreviewOverlay()
  const [tooltipOpen, setTooltipOpen] = usePreviewOverlay()
  return <div className="official-stack">
    <div className="official-row official-row-between"><strong>Review team</strong><Badge appearance="tint" size="large">5 members</Badge></div>
    <AvatarGroup layout={layout} size={40} aria-label="Review team members">
      {reviewers.slice(0, 3).map(name => <AvatarGroupItem key={name} name={name} />)}
      <AvatarGroupPopover open={open} onOpenChange={(_, data) => setOpen(data.open)} tooltip={{ content: '2 more team members', relationship: 'description', visible: tooltipOpen, onVisibleChange: (_, data) => setTooltipOpen(data.visible) }} triggerButton={{ 'aria-label': 'Show 2 more team members', className: 'official-avatar-trigger' }} popoverSurface={{ className: 'official-surface' }}>
        {reviewers.slice(3).map(name => <AvatarGroupItem key={name} name={name} />)}
      </AvatarGroupPopover>
    </AvatarGroup>
    <Switch label="Spread avatars apart" checked={layout === 'spread'} onChange={(_, data) => setLayout(data.checked ? 'spread' : 'stack')} />
    <p className="official-muted">Maya, Jordan, and Alex are visible. Open the count to inspect the remaining reviewers.</p>
  </div>
}

const carouselItems = [
  { title: 'Prepare the monthly review', detail: 'Confirm the six owner updates before sharing the report.', scope: 'Planning', count: '6 owner updates' },
  { title: 'Review the latest documents', detail: 'Two new documents are ready for the operations team.', scope: 'Documents', count: '2 new documents' },
  { title: 'Share the workspace', detail: 'Choose the members who can help prepare the next release.', scope: 'Team access', count: '5 current members' },
]

export function CarouselPreview() {
  const [index, setIndex] = useState(0)
  const [opened, setOpened] = useState('')
  return <div className="official-stack">
    <Carousel className="official-carousel" activeIndex={index} onActiveIndexChange={(_, data) => setIndex(data.index)} groupSize={1} announcement={(page, total) => `Suggestion ${page + 1} of ${total}`}>
      <CarouselViewport><CarouselSlider>{carouselItems.map(item => <CarouselCard key={item.title} className="official-carousel-card">
        <Badge appearance="outline" size="large">{item.scope}</Badge><strong className="official-group-title">{item.title}</strong><p>{item.detail}</p><p className="official-muted">{item.count}</p><Button onClick={() => setOpened(item.title)}>Open suggestion</Button>
      </CarouselCard>)}</CarouselSlider></CarouselViewport>
      <div className="official-carousel-controls"><CarouselButton navType="prev" aria-label="Previous suggestion" icon={<ArrowLeft20Regular />} /><CarouselNav>{page => <CarouselNavButton aria-label={`Show suggestion ${page + 1}`} />}</CarouselNav><CarouselButton navType="next" aria-label="Next suggestion" icon={<ArrowRight20Regular />} /></div>
    </Carousel>
    <p className="official-muted" aria-live="polite">{opened ? `Opened: ${opened}.` : `Suggestion ${index + 1} of ${carouselItems.length}.`}</p>
  </div>
}

type Hsv = { h: number; s: number; v: number }
function hsvHex(color: Hsv) {
  const component = (n: number) => {
    const k = (n + color.h / 60) % 6
    return Math.round(255 * (color.v - color.v * color.s * Math.max(0, Math.min(k, 4 - k, 1)))).toString(16).padStart(2, '0')
  }
  return `#${component(5)}${component(3)}${component(1)}`.toUpperCase()
}

export function ColorPickerPreview() {
  const [color, setColor] = useState<Hsv>({ h: 169, s: 0.84, v: 0.49 })
  const hex = hsvHex(color)
  return <div className="official-stack">
    <ColorPicker className="official-color-picker" color={color} onColorChange={(_, data) => setColor(data.color)}>
      <ColorArea aria-label="Resource label color" inputX={{ 'aria-label': 'Saturation' }} inputY={{ 'aria-label': 'Brightness' }} />
      <ColorSlider channel="hue" aria-label="Hue" />
    </ColorPicker>
    <div className="official-color-sample"><span className="official-color-chip" style={{ backgroundColor: hex }} aria-hidden="true" /><div><strong>Resource label</strong><p className="official-muted official-numeric">{hex}</p></div></div>
  </div>
}

type GridResource = { id: string; name: string; owner: string; status: string }
const gridResources: GridResource[] = [
  { id: 'r1', name: 'Quarterly review', owner: 'Maya Chen', status: 'Ready' },
  { id: 'r2', name: 'Release checklist', owner: 'Jordan Ellis', status: 'Draft' },
  { id: 'r3', name: 'Customer insights', owner: 'Alex Morgan', status: 'Review' },
  { id: 'r4', name: 'Resource inventory', owner: 'Sam Rivera', status: 'Ready' },
]
const gridColumns: TableColumnDefinition<GridResource>[] = [
  createTableColumn<GridResource>({ columnId: 'name', compare: (a, b) => a.name.localeCompare(b.name), renderHeaderCell: () => 'Resource', renderCell: item => <span className="official-grid-name">{item.name}</span> }),
  createTableColumn<GridResource>({ columnId: 'owner', compare: (a, b) => a.owner.localeCompare(b.owner), renderHeaderCell: () => 'Owner', renderCell: item => item.owner }),
  createTableColumn<GridResource>({ columnId: 'status', compare: (a, b) => a.status.localeCompare(b.status), renderHeaderCell: () => 'Status', renderCell: item => <Badge appearance="tint" color={item.status === 'Ready' ? 'success' : item.status === 'Review' ? 'warning' : 'informative'} size="large">{item.status}</Badge> }),
]

export function DataGridPreview() {
  const [selected, setSelected] = useState(new Set<TableRowId>())
  const [sort, setSort] = useState<DataGridProps['sortState']>({ sortColumn: 'name', sortDirection: 'ascending' })
  return <div className="official-stack">
    <div className="official-table-scroll" role="region" aria-label="Scrollable sample resource grid" tabIndex={0}>
      <DataGrid className="official-data-grid" items={gridResources} columns={gridColumns} getRowId={item => item.id} sortable sortState={sort} onSortChange={(_, data) => setSort(data)} selectionMode="multiselect" selectedItems={selected} onSelectionChange={(_, data) => setSelected(data.selectedItems)} focusMode="composite" aria-label="Sample resource grid">
        <DataGridHeader><DataGridRow selectionCell={{ checkboxIndicator: { 'aria-label': 'Select all sample resources' } }}>{({ renderHeaderCell }) => <DataGridHeaderCell>{renderHeaderCell()}</DataGridHeaderCell>}</DataGridRow></DataGridHeader>
        <DataGridBody<GridResource>>{({ item, rowId }) => <DataGridRow<GridResource> key={rowId} selectionCell={{ checkboxIndicator: { 'aria-label': `Select ${item.name}` } }}>{({ renderCell }) => <DataGridCell>{renderCell(item)}</DataGridCell>}</DataGridRow>}</DataGridBody>
      </DataGrid>
    </div>
    <div className="official-row official-row-between"><span aria-live="polite">{selected.size} of {gridResources.length} selected</span><Button disabled={!selected.size} onClick={() => setSelected(new Set())}>Clear selection</Button></div>
  </div>
}

export function DividerPreview() {
  const [labels, setLabels] = useState(true)
  return <div className="official-stack">
    <div><strong>Workspace access</strong><p className="official-muted">Members can inspect and edit shared resources.</p></div>
    <Divider>{labels ? 'Notifications' : null}</Divider>
    <p>Important changes appear in the workspace inbox.</p>
    <Divider appearance="subtle">{labels ? 'Preferences' : null}</Divider>
    <Switch label="Show section labels" checked={labels} onChange={(_, data) => setLabels(data.checked)} />
  </div>
}

export function FluentProviderPreview() {
  const { mode, resolvedMode, accent } = useTheme()
  const [open, setOpen] = usePreviewOverlay()
  const titleCase = (value: string) => value.charAt(0).toUpperCase() + value.slice(1)
  return <div className="official-stack">
    <dl className="official-facts"><div><dt>Appearance</dt><dd>{titleCase(mode)}{mode === 'system' ? ` (${resolvedMode})` : ''}</dd></div><div><dt>Accent</dt><dd>{titleCase(accent)}</dd></div><div><dt>Scope</dt><dd>Page and overlays</dd></div></dl>
    <Popover open={open} onOpenChange={(_, data) => setOpen(data.open)}><PopoverTrigger disableButtonEnhancement><Button appearance="primary">Inspect themed surface</Button></PopoverTrigger><PopoverSurface className="official-surface"><div className="official-stack"><strong>One shared theme</strong><p>This surface inherits the same neutral, accent, and typography tokens as the page.</p><Button onClick={() => setOpen(false)}>Close inspection</Button></div></PopoverSurface></Popover>
  </div>
}

const chartArtwork = `data:image/svg+xml;charset=utf-8,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 300"><rect width="640" height="300" fill="#edf5f2"/><rect x="64" y="64" width="512" height="172" rx="8" fill="#ffffff"/><path d="M94 204H546" stroke="#cfded8" stroke-width="2"/><rect x="112" y="160" width="56" height="44" rx="3" fill="#82b7a8"/><rect x="204" y="130" width="56" height="74" rx="3" fill="#63a390"/><rect x="296" y="106" width="56" height="98" rx="3" fill="#42977f"/><rect x="388" y="122" width="56" height="82" rx="3" fill="#278b72"/><rect x="480" y="84" width="56" height="120" rx="3" fill="#147d6a"/></svg>')}`

export function ImagePreview() {
  const [unavailable, setUnavailable] = useState(false)
  return <div className="official-stack">
    <div className="official-image-frame">{unavailable ? <div className="official-image-fallback" role="img" aria-label="Image preview unavailable"><Image20Regular /><strong>Preview unavailable</strong><span className="official-muted">The resource is still available.</span></div> : <Image src={chartArtwork} alt="Five columns showing a synthetic resource activity trend" fit="contain" block />}</div>
    <div><strong>Resource activity overview</strong><p className="official-muted">Locally authored sample chart artwork.</p></div>
    <Button onClick={() => setUnavailable(value => !value)}>{unavailable ? 'Restore image preview' : 'Show unavailable image'}</Button>
  </div>
}

export function InfoLabelPreview() {
  const [cadence, setCadence] = useState('daily')
  const [open, setOpen] = usePreviewOverlay()
  const id = useId('info-label-cadence')
  return <div className="official-stack">
    <InfoLabel htmlFor={id} infoButton={{ 'aria-label': 'About summary frequency', popover: { open, onOpenChange: (_, data) => setOpen(data.open) } }} info={{ className: 'official-surface', children: 'Daily summaries group changes from the previous day. Weekly summaries combine changes into one update.' }}>Summary frequency</InfoLabel>
    <Select id={id} value={cadence} onChange={(_, data) => setCadence(data.value)}><option value="daily">Daily summary</option><option value="weekly">Weekly summary</option></Select>
    <p className="official-muted" aria-live="polite">{cadence === 'daily' ? 'A summary is prepared each morning.' : 'A summary is prepared every Monday.'}</p>
  </div>
}

export function LabelPreview() {
  const [name, setName] = useState('Product operations')
  const id = useId('label-workspace-name')
  const archivedId = useId('label-archived-name')
  return <div className="official-stack">
    <div className="official-field"><Label htmlFor={id} required>Workspace name</Label><Input id={id} value={name} onChange={(_, data) => setName(data.value)} /></div>
    <div className="official-field"><Label htmlFor={archivedId} disabled>Archived workspace</Label><Input id={archivedId} value="Previous quarter" disabled /></div>
    <p className="official-muted" aria-live="polite">{name.trim() ? `Current name: ${name}.` : 'Enter a name for the sample workspace.'}</p>
  </div>
}

export function LinkPreview() {
  const [resource, setResource] = useState('')
  return <div className="official-stack">
    <p>Keep related material near the decision: <Link href="#sample-review-guide" onClick={event => { event.preventDefault(); setResource('Review guide') }}>Review guide</Link>.</p>
    <Link as="button" onClick={() => setResource('Resource activity')}>Inspect resource activity</Link>
    <Link disabled>Archived policy</Link>
    {resource && <div className="official-result" aria-live="polite"><strong>{resource}</strong><p>{resource === 'Review guide' ? 'Confirm resource owners, evidence, and access before publishing the sample review.' : 'Maya updated the review document. Jordan completed the release checklist.'}</p><Button onClick={() => setResource('')}>Close resource</Button></div>}
  </div>
}

const listItems = [
  { id: 'maya', name: 'Maya Chen', role: 'Workspace owner' },
  { id: 'jordan', name: 'Jordan Ellis', role: 'Release editor' },
  { id: 'alex', name: 'Alex Morgan', role: 'Research viewer' },
]

export function ListPreview() {
  const [selected, setSelected] = useState<(string | number)[]>(['maya'])
  const selectedPerson = listItems.find(item => item.id === selected[0])
  return <div className="official-stack">
    <List className="official-member-list" navigationMode="items" selectionMode="single" selectedItems={selected} onSelectionChange={(_, data) => setSelected(data.selectedItems)} aria-label="Workspace members">
      {listItems.map(item => <ListItem key={item.id} value={item.id}><Avatar name={item.name} size={32} /><div><strong>{item.name}</strong><p className="official-muted">{item.role}</p></div></ListItem>)}
    </List>
    <p className="official-muted" aria-live="polite">{selectedPerson ? `${selectedPerson.name} selected · ${selectedPerson.role}.` : 'Choose a member to inspect their workspace role.'}</p>
  </div>
}

const navDescriptions: Record<string, { title: string; detail: string }> = {
  overview: { title: 'Workspace overview', detail: 'A summary of the sample workspace and its recent updates.' },
  members: { title: 'Members', detail: 'Five members have access to Product operations.' },
  monthly: { title: 'Monthly review', detail: 'Six owner updates are ready to inspect.' },
  planning: { title: 'Quarterly planning', detail: 'Three sample milestones are in progress.' },
  settings: { title: 'Settings', detail: 'Manage workspace details and local preferences.' },
}

export function NavPreview() {
  const [selected, setSelected] = useState('overview')
  const [expanded, setExpanded] = useState<string[]>(['reports'])
  const current = navDescriptions[selected]
  return <div className="official-stack">
    <Nav className="official-nav" aria-label="Sample workspace navigation" selectedValue={selected} selectedCategoryValue={['monthly', 'planning'].includes(selected) ? 'reports' : ''} openCategories={expanded} onNavItemSelect={(_, data) => { if (data.value && navDescriptions[data.value]) setSelected(data.value) }} onNavCategoryItemToggle={(_, data) => { if (data.value) setExpanded(items => items.includes(data.value!) ? items.filter(item => item !== data.value) : [...items, data.value!]) }}>
      <NavSectionHeader>Product operations</NavSectionHeader><NavItem icon={<Home20Regular />} value="overview">Overview</NavItem><NavItem icon={<People20Regular />} value="members">Members</NavItem>
      <NavCategory value="reports"><NavCategoryItem icon={<Folder20Regular />}>Reports</NavCategoryItem><NavSubItemGroup><NavSubItem value="monthly">Monthly review</NavSubItem><NavSubItem value="planning">Quarterly planning</NavSubItem></NavSubItemGroup></NavCategory><NavDivider /><NavItem icon={<Settings20Regular />} value="settings">Settings</NavItem>
    </Nav>
    <div className="official-result" aria-live="polite"><strong>{current.title}</strong><p>{current.detail}</p></div>
  </div>
}

const overflowActions = ['Edit resource', 'Share resource', 'Download copy', 'Archive resource']
function OverflowActionItem({ id, label, onSelect }: { id: string; label: string; onSelect: (label: string) => void }) {
  const visible = useIsOverflowItemVisible(id)
  return visible ? null : <MenuItem onClick={() => onSelect(label)}>{label}</MenuItem>
}
function OverflowActionMenu({ prefix, open, setOpen, onSelect }: { prefix: string; open: boolean; setOpen: (open: boolean) => void; onSelect: (label: string) => void }) {
  const { ref, isOverflowing, overflowCount } = useOverflowMenu<HTMLButtonElement>()
  if (!isOverflowing) return null
  return <Menu open={open} onOpenChange={(_, data) => setOpen(data.open)}><MenuTrigger disableButtonEnhancement><Button ref={ref} aria-label={`${overflowCount} more resource actions`} icon={<MoreHorizontal20Regular />} /></MenuTrigger><MenuPopover className="official-surface"><MenuList>{overflowActions.map((action, index) => <OverflowActionItem key={action} id={`${prefix}-${index}`} label={action} onSelect={label => { onSelect(label); setOpen(false) }} />)}</MenuList></MenuPopover></Menu>
}

export function OverflowPreview() {
  const [compact, setCompact] = useState(true)
  const [result, setResult] = useState('')
  const [open, setOpen] = usePreviewOverlay()
  const prefix = useId('resource-actions')
  return <div className="official-stack">
    <Switch label="Use compact action area" checked={compact} onChange={(_, data) => { setCompact(data.checked); setOpen(false) }} />
    <Overflow minimumVisible={1}><div className="official-overflow" style={{ width: compact ? 'min(100%, 260px)' : '100%' }}>
      {overflowActions.map((action, index) => <OverflowItem key={action} id={`${prefix}-${index}`}><Button onClick={() => setResult(action)}>{action}</Button></OverflowItem>)}
      <OverflowActionMenu prefix={prefix} open={open} setOpen={setOpen} onSelect={setResult} />
    </div></Overflow>
    <p className="official-muted" aria-live="polite">{result ? `${result} selected for Quarterly review.` : 'Actions that do not fit are available in the More menu.'}</p>
  </div>
}

export function PortalPreview() {
  const [open, setOpen] = usePreviewOverlay()
  const [mountNode, setMountNode] = useState<HTMLDivElement | null>(null)
  const trigger = useRef<HTMLButtonElement>(null)
  const close = () => { setOpen(false); trigger.current?.focus() }
  return <div className="official-stack">
    <Button ref={trigger} onClick={() => setOpen(!open)} aria-expanded={open}>{open ? 'Remove portal content' : 'Render portal content'}</Button>
    <div className="official-portal-target" ref={setMountNode} role="region" aria-label="Portal mount target">{!open && <p className="official-muted">Portal mount target</p>}</div>
    {open && mountNode && <Portal mountNode={mountNode}><div className="official-stack" onKeyDown={event => { if (event.key === 'Escape') { event.stopPropagation(); close() } }}><strong>Rendered into the target</strong><p>This content inherits the page theme from its local mount point.</p><Button onClick={close}>Dismiss portal content</Button></div></Portal>}
  </div>
}

export function RatingPreview() {
  const [rating, setRating] = useState(3)
  const [submitted, setSubmitted] = useState<number | null>(null)
  return <div className="official-stack">
    <strong>How useful was this sample review?</strong><Rating aria-label="Review usefulness" value={rating} onChange={(_, data) => { setRating(data.value); setSubmitted(null) }} size="large" color="brand" />
    <div className="official-row official-row-between"><span aria-live="polite">{rating} of 5 stars</span><Button appearance="primary" onClick={() => setSubmitted(rating)}>Submit rating</Button></div>
    {submitted !== null && <p className="official-muted" role="status">Sample feedback saved: {submitted} of 5 stars.</p>}
  </div>
}

export function RatingDisplayPreview() {
  const [compact, setCompact] = useState(false)
  return <div className="official-stack"><strong>Workspace review guide</strong><RatingDisplay value={4.5} count={128} compact={compact} color="brand" size="large" aria-label="4.5 out of 5 from 128 sample reviews" /><p className="official-muted">Based on 128 synthetic reviews.</p><Switch label="Use compact display" checked={compact} onChange={(_, data) => setCompact(data.checked)} /></div>
}

export function SelectPreview() {
  const [destination, setDestination] = useState('operations')
  const id = useId('select-destination')
  const labels: Record<string, string> = { operations: 'Product operations', success: 'Customer success', research: 'Research and insights' }
  return <div className="official-stack"><Field label="Destination workspace"><Select id={id} value={destination} onChange={(_, data) => setDestination(data.value)}>{Object.entries(labels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}<option disabled value="archive">Archived workspace (unavailable)</option></Select></Field><div className="official-result" aria-live="polite"><Folder20Regular /><strong>{labels[destination]}</strong><p className="official-muted">Quarterly review will be added to this sample workspace.</p></div></div>
}

const swatches = [
  { value: 'teal', name: 'Teal', color: '#147D6A' },
  { value: 'blue', name: 'Blue', color: '#3267BD' },
  { value: 'purple', name: 'Purple', color: '#7854A8' },
  { value: 'amber', name: 'Amber', color: '#9C6E21' },
  { value: 'slate', name: 'Slate', color: '#616F82' },
]

export function SwatchPickerPreview() {
  const [value, setValue] = useState('teal')
  const selected = swatches.find(swatch => swatch.value === value) ?? swatches[0]
  return <div className="official-stack"><strong>Resource label color</strong><SwatchPicker selectedValue={value} onSelectionChange={(_, data) => setValue(data.selectedValue)} aria-label="Resource label colors" size="large">{swatches.map(swatch => <ColorSwatch key={swatch.value} value={swatch.value} color={swatch.color} aria-label={swatch.name} />)}</SwatchPicker><div className="official-color-sample"><span className="official-color-chip" style={{ backgroundColor: selected.color }} aria-hidden="true" /><div><strong>Quarterly review</strong><p className="official-muted" aria-live="polite">{selected.name} label selected</p></div></div></div>
}

export function TeachingPopoverPreview() {
  const [open, setOpen] = usePreviewOverlay()
  const [learned, setLearned] = useState(false)
  return <div className="official-stack"><div className="official-row"><Document20Regular /><strong>Quarterly review</strong></div><p className="official-muted">Follow a resource to keep its changes in your workspace inbox.</p>
    <TeachingPopover open={open} onOpenChange={(_, data) => setOpen(data.open)}><TeachingPopoverTrigger disableButtonEnhancement><Button>Learn about following</Button></TeachingPopoverTrigger><TeachingPopoverSurface className="official-surface official-teaching"><TeachingPopoverHeader dismissButton={{ 'aria-label': 'Dismiss following guidance' }}>Workspace tip</TeachingPopoverHeader><TeachingPopoverBody><TeachingPopoverTitle>Keep up with a resource</TeachingPopoverTitle><p>Following adds resource changes to your inbox. You can stop following at any time.</p></TeachingPopoverBody><TeachingPopoverFooter primary={{ children: 'Got it', onClick: () => { setLearned(true); setOpen(false) } }} secondary={{ children: 'Maybe later', onClick: () => setOpen(false) }} /></TeachingPopoverSurface></TeachingPopover>
    {learned && <p className="official-muted official-row" role="status"><Checkmark20Regular />Following guidance completed.</p>}
  </div>
}

export function TextPreview() {
  const [long, setLong] = useState(false)
  return <div className="official-stack"><Text as="h4" className="official-text-heading" size={500} weight="semibold">{long ? 'Quarterly operations and customer experience review' : 'Quarterly review'}</Text><Text block>{long ? 'Review updates across teams, confirm resource owners, and prepare a shared summary of the next steps for the regional operations workspace.' : 'Review owner updates and prepare a shared summary of the next steps.'}</Text><Text block weight="semibold">Ready for owner review</Text><Text block className="official-muted">Updated by Maya Chen · 10 minutes ago</Text><Switch label="Show longer sample content" checked={long} onChange={(_, data) => setLong(data.checked)} /></div>
}
