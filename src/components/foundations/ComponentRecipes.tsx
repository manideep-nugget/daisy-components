import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Avatar, Button, Dialog, DialogActions, DialogBody, DialogContent, DialogSurface, DialogTitle, DialogTrigger, Field, Input, Menu, MenuItem, MenuList, MenuPopover, MenuTrigger, Popover, PopoverSurface, PopoverTrigger, Select, ToggleButton, useId } from '@fluentui/react-components'
import { ArrowLeft20Regular, ArrowRight20Regular, Copy20Regular, Delete20Regular, Document20Regular, Dismiss20Regular, Save20Regular } from '@fluentui/react-icons'
import { usePreviewOverlay, usePreviewPageActivity } from '../usePreviewPageActivity'
import './ComponentRecipes.css'

export function AlertConfirmation({ itemName, onConfirm }: { itemName: string; onConfirm: () => void }) {
  const [open, setOpen] = usePreviewOverlay()
  return <Dialog modalType="alert" open={open} onOpenChange={(_, data) => setOpen(data.open)}>
    <DialogTrigger disableButtonEnhancement><Button icon={<Delete20Regular />}>Remove sample item</Button></DialogTrigger>
    <DialogSurface className="recipe-overlay"><DialogBody><DialogTitle>Remove {itemName}?</DialogTitle><DialogContent>The item will leave this sample list. You can restore it immediately with Undo.</DialogContent><DialogActions><DialogTrigger disableButtonEnhancement><Button>Keep item</Button></DialogTrigger><Button appearance="primary" onClick={() => { onConfirm(); setOpen(false) }}>Remove item</Button></DialogActions></DialogBody></DialogSurface>
  </Dialog>
}
export function AlertConfirmationPreview() {
  const [removed, setRemoved] = useState(false)
  const undo = useRef<HTMLButtonElement>(null)
  return <div className="recipe-stack"><div className="recipe-resource"><Document20Regular /><div><strong>Quarterly review.pdf</strong><span>Document · Shared with your team</span></div></div>{removed ? <div className="recipe-stack"><p role="status">Quarterly review.pdf was removed.</p><Button ref={undo} onClick={() => setRemoved(false)}>Undo removal</Button></div> : <AlertConfirmation itemName="Quarterly review.pdf" onConfirm={() => { setRemoved(true); requestAnimationFrame(() => undo.current?.focus()) }} />}</div>
}

export type GroupAction = { id: string; label: string; disabled?: boolean }
export function ButtonGroup({ actions, selectedId, onChange, label }: { actions: GroupAction[]; selectedId: string; onChange: (id: string) => void; label: string }) {
  return <div className="recipe-button-group" role="group" aria-label={label}>{actions.map(action => <ToggleButton key={action.id} checked={selectedId === action.id} disabled={action.disabled} onClick={() => onChange(action.id)}>{action.label}</ToggleButton>)}</div>
}
export function ButtonGroupPreview() {
  const [mode, setMode] = useState('list')
  return <div className="recipe-stack"><ButtonGroup label="Resource view" selectedId={mode} onChange={setMode} actions={[{ id: 'list', label: 'List' }, { id: 'grid', label: 'Grid' }, { id: 'compare', label: 'Compare', disabled: true }]} /><div className={`recipe-view recipe-view-${mode}`}><span>Research brief</span><span>Quarterly review</span><span>Team handbook</span></div><p className="recipe-muted">{mode === 'list' ? 'Three documents in a compact list.' : 'Three documents in a grid.'}</p></div>
}

export type ContextAction = { id: string; label: string }
export function ContextMenu({ label, actions, onAction }: { label: string; actions: ContextAction[]; onAction: (id: string) => void }) {
  const [open, setOpen] = usePreviewOverlay()
  return <Menu openOnContext open={open} onOpenChange={(_, data) => setOpen(data.open)}>
    <MenuTrigger disableButtonEnhancement><Button className="recipe-context-target" onClick={() => setOpen(true)} onKeyDown={event => { if (event.key === 'ContextMenu' || (event.shiftKey && event.key === 'F10')) { event.preventDefault(); setOpen(true) } }}><Document20Regular />{label}</Button></MenuTrigger>
    <MenuPopover className="recipe-menu"><MenuList>{actions.map(action => <MenuItem key={action.id} onClick={() => { onAction(action.id); setOpen(false) }}>{action.label}</MenuItem>)}</MenuList></MenuPopover>
  </Menu>
}
export function ContextMenuPreview() {
  const [outcome, setOutcome] = useState('')
  const [archived, setArchived] = useState(false)
  const [copies, setCopies] = useState(0)
  return <div className="recipe-stack"><ContextMenu label="Quarterly review · Actions" actions={[{ id: 'open', label: 'Open summary' }, { id: 'duplicate', label: 'Duplicate sample' }, { id: 'archive', label: 'Archive sample' }]} onAction={id => { if (id === 'archive') setArchived(true); if (id === 'duplicate') setCopies(value => value + 1); setOutcome(id === 'open' ? 'Three sections, owned by Maya Chen.' : id === 'duplicate' ? 'A sample copy was added.' : 'The sample status changed to Archived.') }} /><div className="recipe-resource"><Document20Regular /><div><strong>Quarterly review</strong><span>{archived ? 'Archived' : 'Active'} · {copies} {copies === 1 ? 'copy' : 'copies'}</span></div></div>{outcome && <p role="status" className="recipe-result">{outcome}</p>}</div>
}

export type HoverIdentity = { name: string; role: string; email: string; detail: string }
export function HoverCard({ person }: { person: HoverIdentity }) {
  const [open, setOpen] = usePreviewOverlay()
  const restoringFocus = useRef(false)
  const titleId = useId('hover-identity')
  const changeOpen = (next: boolean) => { if (!next) restoringFocus.current = true; setOpen(next) }
  return <Popover openOnHover unstable_disableAutoFocus open={open} onOpenChange={(_, data) => changeOpen(data.open)} positioning="below-start">
    <PopoverTrigger disableButtonEnhancement><Button onBlur={() => { restoringFocus.current = false }} onFocus={event => { if (restoringFocus.current) { restoringFocus.current = false; return }; if (event.currentTarget.matches(':focus-visible')) setOpen(true) }}><Avatar name={person.name} size={28} />{person.name}</Button></PopoverTrigger>
    <PopoverSurface className="recipe-overlay recipe-hover" aria-labelledby={titleId}><div className="recipe-stack"><div className="recipe-resource"><Avatar name={person.name} size={40} /><div><strong id={titleId}>{person.name}</strong><span>{person.role}</span></div></div><span>{person.email}</span><p>{person.detail}</p><Button appearance="subtle" icon={<Dismiss20Regular />} onClick={() => changeOpen(false)}>Close profile</Button></div></PopoverSurface>
  </Popover>
}
export function HoverCardPreview() {
  return <div className="recipe-stack"><HoverCard person={{ name: 'Maya Chen', role: 'Workspace owner', email: 'maya@northstar.example', detail: 'Coordinates research reviews and keeps the team’s planning documents current.' }} /><p className="recipe-muted">Owner of the Product operations workspace.</p></div>
}

export function InputGroup({ value, error, onChange, onSubmit }: { value: string; error?: string; onChange: (value: string) => void; onSubmit: () => void }) {
  return <form className="recipe-stack" noValidate onSubmit={event => { event.preventDefault(); onSubmit() }}><Field label="Workspace address" required validationState={error ? 'error' : 'none'} validationMessage={error} hint="Use lowercase letters, numbers, and single hyphens."><Input value={value} contentBefore={<span className="recipe-input-prefix">/workspaces/</span>} contentAfter={<Button appearance="transparent" type="submit" aria-label="Check workspace address" icon={<ArrowRight20Regular />} />} onChange={(_, data) => onChange(data.value)} /></Field></form>
}
export function InputGroupPreview() {
  const [value, setValue] = useState('product-operations')
  const [error, setError] = useState('')
  const [result, setResult] = useState('')
  return <div className="recipe-stack"><InputGroup value={value} error={error} onChange={next => { setValue(next); setError(''); setResult('') }} onSubmit={() => { if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)) { setError('Enter a name such as product-operations.'); setResult(''); return }; setResult(`/workspaces/${value} is available in this sample.`) }} />{result && <p className="recipe-result" role="status">{result}</p>}</div>
}

export function KeyboardShortcuts({ children, onSave, onCopy }: { children: ReactNode; onSave: () => void; onCopy: () => void }) {
  const host = useRef<HTMLDivElement>(null)
  const { active } = usePreviewPageActivity()
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (!active || !host.current?.contains(document.activeElement) || document.querySelector('[aria-modal="true"]') || !(event.ctrlKey || event.metaKey)) return
      if (event.key === 'Enter') { event.preventDefault(); onSave() }
      if (event.shiftKey && event.key.toLowerCase() === 'c') { event.preventDefault(); onCopy() }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [active, onSave, onCopy])
  return <div ref={host} className="recipe-stack">{children}<div className="recipe-shortcuts"><Button icon={<Save20Regular />} onClick={onSave}>Save sample <kbd>Ctrl/⌘ Enter</kbd></Button><Button icon={<Copy20Regular />} onClick={onCopy}>Copy sample <kbd>Ctrl/⌘ ⇧ C</kbd></Button></div></div>
}
export function KeyboardShortcutsPreview() {
  const [name, setName] = useState('Weekly planning')
  const [message, setMessage] = useState('')
  const [savedName, setSavedName] = useState(name)
  const [copy, setCopy] = useState('')
  const [error, setError] = useState('')
  const valid = () => { if (!name.trim()) { setError('Enter a document title before using an action.'); return false }; setError(''); return true }
  return <KeyboardShortcuts onSave={() => { if (valid()) { setSavedName(name.trim()); setMessage('Sample document saved.') } }} onCopy={() => { if (valid()) { setCopy(`${name.trim()} copy`); setMessage('A sample document copy was created.') } }}><Field label="Document title" required validationState={error ? 'error' : 'none'} validationMessage={error}><Input value={name} onChange={(_, data) => { setName(data.value); setError('') }} /></Field><div className="recipe-resource"><Document20Regular /><div><strong>{savedName}</strong><span>Saved sample document</span>{copy && <span>{copy}</span>}</div></div>{message && <p className="recipe-result" role="status">{message}</p>}</KeyboardShortcuts>
}

export type PaginationProps = { page: number; pageSize: number; total: number; onPageChange: (page: number) => void; onPageSizeChange: (size: number) => void }
export function Pagination({ page, pageSize, total, onPageChange, onPageSizeChange }: PaginationProps) {
  const pages = Math.max(1, Math.ceil(total / pageSize))
  const pageId = useId('page-size')
  return <nav aria-label="Sample pagination" className="recipe-pagination"><div className="recipe-pagination-controls"><Button icon={<ArrowLeft20Regular />} disabled={page === 1} aria-label="Previous page" onClick={() => onPageChange(page - 1)} /><span>Page {page} of {pages}</span><Button icon={<ArrowRight20Regular />} disabled={page === pages} aria-label="Next page" onClick={() => onPageChange(page + 1)} /></div><Field label="Rows per page"><Select id={pageId} value={String(pageSize)} onChange={(_, data) => onPageSizeChange(Number(data.value))}><option value="3">3 rows</option><option value="5">5 rows</option></Select></Field></nav>
}
export function PaginationPreview() {
  const [page, setPage] = useState(1)
  const [size, setSize] = useState(3)
  const records = ['Research brief', 'Quarterly review', 'Team handbook', 'Product roadmap', 'Customer insights', 'Operations notes', 'Planning agenda', 'Review checklist']
  const start = (page - 1) * size
  return <div className="recipe-stack"><ul className="recipe-records">{records.slice(start, start + size).map(record => <li key={record}><Document20Regular /><span>{record}</span></li>)}</ul><Pagination page={page} pageSize={size} total={records.length} onPageChange={setPage} onPageSizeChange={next => { setSize(next); setPage(1) }} /><p className="recipe-muted" role="status">Showing {start + 1}–{Math.min(start + size, records.length)} of {records.length} records.</p></div>
}

export function ScrollArea({ label, children }: { label: string; children: ReactNode }) {
  return <div className="recipe-scroll" role="region" aria-label={label} tabIndex={0}>{children}</div>
}
export function ScrollAreaPreview() {
  const [filter, setFilter] = useState(false)
  const rows = ['Workspace guide', 'Research notes', 'Quarterly review', 'Customer interviews', 'Planning agenda', 'Service catalogue', 'Team handbook', 'Operations checklist']
  return <div className="recipe-stack"><Button aria-pressed={filter} onClick={() => setFilter(value => !value)}>{filter ? 'Show all documents' : 'Show review documents'}</Button><ScrollArea label="Scrollable sample documents"><ul className="recipe-records">{rows.filter(name => !filter || /review|checklist/i.test(name)).map((name, index) => <li key={name}><Document20Regular /><div><strong>{name}</strong><span className="recipe-muted">Document {index + 1} · Product operations</span></div></li>)}</ul></ScrollArea><p className="recipe-muted">{filter ? 'Two review documents shown.' : 'Eight documents in a contained scrolling region.'}</p></div>
}
