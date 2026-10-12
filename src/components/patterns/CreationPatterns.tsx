import { useId, useState } from 'react'
import {
  Avatar, Badge, Button, Dialog, DialogActions, DialogBody, DialogContent, DialogSurface,
  DialogTitle, DialogTrigger, DrawerBody, DrawerFooter, DrawerHeader, DrawerHeaderTitle,
  Field, Input, OverlayDrawer, Tab, TabList, Textarea, useRestoreFocusTarget,
} from '@fluentui/react-components'
import { Add20Regular, ArrowRight20Regular, Checkmark20Regular, Dismiss20Regular, Edit20Regular, People20Regular } from '@fluentui/react-icons'
import { usePreviewOverlay } from '../usePreviewPageActivity'
import { PatternSelect, PeoplePicker } from './PatternPrimitives'
import './CreationPatterns.css'

export type WorkspacePerson = { id: string; name: string; email: string }
export type WorkspaceDraft = { name: string; description: string; visibility: 'Private' | 'Team'; members: string[] }
export type CreatedWorkspace = WorkspaceDraft & { id: string }

type WorkspaceWizardProps = {
  draft: WorkspaceDraft
  people: WorkspacePerson[]
  onDraftChange: (draft: WorkspaceDraft) => void
  onCreate: (draft: WorkspaceDraft) => void
}

const wizardSteps = ['Details', 'Members', 'Review']

/** A resumable workflow. The owner supplies the draft and handles creation. */
export function WorkspaceWizard({ draft, people, onDraftChange, onCreate }: WorkspaceWizardProps) {
  const [open, setOpen] = usePreviewOverlay()
  const [step, setStep] = useState(0)
  const [started, setStarted] = useState(false)
  const [errors, setErrors] = useState<{ name?: string; members?: string }>({})
  const titleId = useId()
  const update = (patch: Partial<WorkspaceDraft>) => {
    onDraftChange({ ...draft, ...patch })
    setErrors({})
  }
  const advance = () => {
    if (step === 0 && !draft.name.trim()) {
      setErrors({ name: 'Enter a workspace name to continue.' })
      return
    }
    if (step === 1 && draft.members.length === 0) {
      setErrors({ members: 'Choose at least one member to continue.' })
      return
    }
    if (step < 2) { setStep(step + 1); setErrors({}); return }
    if (!draft.name.trim() || !draft.members.length) {
      setStep(!draft.name.trim() ? 0 : 1)
      setErrors(!draft.name.trim() ? { name: 'Enter a workspace name.' } : { members: 'Choose at least one member.' })
      return
    }
    onCreate({ ...draft, name: draft.name.trim(), description: draft.description.trim() })
    setOpen(false)
    setStarted(false)
    setStep(0)
    setErrors({})
  }

  return <div className="pattern-stack creationpattern-wizard">
    <div className="creationpattern-launch-summary">
      <div className="creationpattern-launch-icon" aria-hidden="true"><People20Regular /></div>
      <div><strong>{started ? draft.name.trim() || 'Untitled workspace draft' : 'A shared space for your team'}</strong>
        <p className="pattern-muted">{started ? `Draft saved · ${wizardSteps[step]} step · ${draft.members.length} ${draft.members.length === 1 ? 'member' : 'members'} selected` : 'Choose details, add members, then review before creating.'}</p>
      </div>
    </div>
    <ol className="creationpattern-steps creationpattern-launch-steps" aria-label="Workspace creation steps">
      {wizardSteps.map((label, index) => <li key={label} className={started && step === index ? 'is-current' : ''}><span>{index + 1}</span>{label}</li>)}
    </ol>
    <Dialog open={open} onOpenChange={(_, data) => { setOpen(data.open); if (data.open) setStarted(true) }}>
      <DialogTrigger disableButtonEnhancement><Button appearance="primary" icon={started ? <ArrowRight20Regular /> : <Add20Regular />}>{started ? 'Resume workspace draft' : 'Create a workspace'}</Button></DialogTrigger>
      <DialogSurface className="creationpattern-wizard-dialog" aria-labelledby={titleId}>
        <form onSubmit={event => { event.preventDefault(); advance() }} noValidate>
          <DialogBody>
            <DialogTitle id={titleId} action={<Button appearance="subtle" icon={<Dismiss20Regular />} aria-label="Close workspace wizard and keep draft" onClick={() => setOpen(false)} />}>Create a workspace</DialogTitle>
            <DialogContent className="creationpattern-wizard-content">
              <ol className="creationpattern-steps" aria-label="Creation progress">
                {wizardSteps.map((label, index) => <li key={label} className={step === index ? 'is-current' : step > index ? 'is-complete' : ''} aria-current={step === index ? 'step' : undefined}><span>{step > index ? <Checkmark20Regular /> : index + 1}</span>{label}</li>)}
              </ol>
              {step === 0 && <div className="pattern-stack">
                <p className="pattern-muted">Give your team a recognizable place to organize their work.</p>
                <Field label="Workspace name" required validationState={errors.name ? 'error' : 'none'} validationMessage={errors.name}><Input autoFocus value={draft.name} maxLength={80} placeholder="e.g. Product operations" onChange={(_, data) => update({ name: data.value })} /></Field>
                <Field label="Description" hint="Help members understand what belongs here."><Textarea value={draft.description} rows={3} maxLength={300} onChange={(_, data) => update({ description: data.value })} /></Field>
                <PatternSelect label="Visibility" value={draft.visibility} options={[{ value: 'Private', label: 'Private — invited members' }, { value: 'Team', label: 'Team — everyone in your organization' }]} onChange={value => update({ visibility: value as WorkspaceDraft['visibility'] })} />
              </div>}
              {step === 1 && <div className="pattern-stack">
                <p className="pattern-muted">Pick the people who will start working in this workspace.</p>
                <PeoplePicker label="Workspace members (required)" people={people} selected={draft.members} onChange={members => update({ members })} />
                {errors.members && <p className="creationpattern-validation" role="alert">{errors.members}</p>}
                <div className="creationpattern-member-summary"><strong>{draft.members.length} {draft.members.length === 1 ? 'member' : 'members'} selected</strong>
                  {draft.members.length ? <ul className="pattern-list">{people.filter(person => draft.members.includes(person.id)).map(person => <li key={person.id} className="pattern-item"><Avatar name={person.name} size={32} /><div><strong>{person.name}</strong><span className="pattern-muted">{person.email}</span></div></li>)}</ul> : <p className="pattern-muted">Search by name or email to add your first member.</p>}
                </div>
              </div>}
              {step === 2 && <div className="pattern-stack">
                <p className="pattern-muted">Review the details. You can go back to make changes.</p>
                <div className="creationpattern-review"><h4>{draft.name}</h4><p>{draft.description || 'No description added.'}</p><dl><div><dt>Visibility</dt><dd>{draft.visibility}</dd></div><div><dt>Members</dt><dd>{people.filter(person => draft.members.includes(person.id)).map(person => person.name).join(', ')}</dd></div></dl></div>
                <p className="pattern-muted">Creates a sample workspace in this preview.</p>
              </div>}
            </DialogContent>
            <DialogActions className="creationpattern-wizard-actions">
              <Button type="button" onClick={() => setOpen(false)}>Save draft & close</Button>
              <div className="pattern-actions">{step > 0 && <Button type="button" onClick={() => { setStep(step - 1); setErrors({}) }}>Back</Button>}<Button type="submit" appearance="primary" icon={step === 2 ? <Checkmark20Regular /> : <ArrowRight20Regular />} iconPosition="after">{step === 2 ? 'Create workspace' : 'Continue'}</Button></div>
            </DialogActions>
          </DialogBody>
        </form>
      </DialogSurface>
    </Dialog>
  </div>
}

const wizardPeople: WorkspacePerson[] = [
  { id: 'maya', name: 'Maya Chen', email: 'maya@northstar.example' },
  { id: 'jordan', name: 'Jordan Ellis', email: 'jordan@northstar.example' },
  { id: 'alex', name: 'Alex Morgan', email: 'alex@northstar.example' },
  { id: 'sam', name: 'Sam Rivera', email: 'sam@northstar.example' },
]
const emptyWorkspace = (): WorkspaceDraft => ({ name: '', description: '', visibility: 'Private', members: [] })

export function CreationWizardPreview() {
  const [draft, setDraft] = useState<WorkspaceDraft>(emptyWorkspace)
  const [created, setCreated] = useState<CreatedWorkspace[]>([])
  return <div className="pattern-stack">
    <WorkspaceWizard draft={draft} people={wizardPeople} onDraftChange={setDraft} onCreate={workspace => { setCreated(previous => [{ ...workspace, id: `WS-${1001 + previous.length}` }, ...previous]); setDraft(emptyWorkspace()) }} />
    <div className="creationpattern-created" aria-live="polite">
      {created.length ? <><strong>Created in this preview</strong><ul className="pattern-list">{created.map(workspace => <li className="pattern-item" key={workspace.id}><Checkmark20Regular /><div><strong>{workspace.name}</strong><span className="pattern-muted">{workspace.id} · {workspace.visibility} · {workspace.members.length} {workspace.members.length === 1 ? 'member' : 'members'}</span></div></li>)}</ul></> : <p className="pattern-muted">Your new workspace will appear here after the review step.</p>}
    </div>
  </div>
}

export type EditableRecord = { id: string; name: string; owner: string; status: 'Active' | 'In review' | 'Archived'; description: string; activity: { id: string; message: string; when: string }[] }
export type RecordValues = Pick<EditableRecord, 'name' | 'owner' | 'status'>
type RecordEditorProps = { records: EditableRecord[]; people: WorkspacePerson[]; onSave: (id: string, values: RecordValues) => void }
const recordValues = (record: EditableRecord): RecordValues => ({ name: record.name, owner: record.owner, status: record.status })

/** Edits controlled records while preserving a separate draft for each record. */
export function RecordEditor({ records, people, onSave }: RecordEditorProps) {
  const [open, setOpen] = usePreviewOverlay()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [drafts, setDrafts] = useState<Record<string, RecordValues>>({})
  const [tab, setTab] = useState<'details' | 'activity'>('details')
  const [error, setError] = useState('')
  const [savedMessage, setSavedMessage] = useState('')
  const focusTarget = useRestoreFocusTarget()
  const titleId = useId()
  const record = records.find(item => item.id === selectedId)
  const draft = record ? drafts[record.id] ?? recordValues(record) : undefined
  const dirty = record && draft ? draft.name !== record.name || draft.owner !== record.owner || draft.status !== record.status : false
  const ownerName = (id: string) => people.find(person => person.id === id)?.name ?? 'Unassigned'
  const update = (patch: Partial<RecordValues>) => {
    if (!record || !draft) return
    setDrafts(previous => ({ ...previous, [record.id]: { ...draft, ...patch } }))
    setError('')
  }
  const edit = (item: EditableRecord) => { setSelectedId(item.id); setTab('details'); setError(''); setOpen(true) }
  const save = () => {
    if (!record || !draft) return
    if (!draft.name.trim()) { setTab('details'); setError('Enter a record name before saving.'); return }
    if (!people.some(person => person.id === draft.owner)) { setTab('details'); setError('Choose an owner before saving.'); return }
    const values = { ...draft, name: draft.name.trim() }
    onSave(record.id, values)
    setDrafts(previous => ({ ...previous, [record.id]: values }))
    setSavedMessage(`${values.name} saved. The record summary is up to date.`)
    setOpen(false)
  }
  const cancel = () => {
    if (record) setDrafts(previous => ({ ...previous, [record.id]: recordValues(record) }))
    setError('')
    setOpen(false)
  }
  return <div className="pattern-stack creationpattern-records">
    <div className="pattern-row"><strong>Workspace records</strong><span className="pattern-muted">{records.length} records</span></div>
    <ul className="pattern-list creationpattern-record-list">{records.map(item => {
      const pending = drafts[item.id]
      const hasDraft = pending && (pending.name !== item.name || pending.owner !== item.owner || pending.status !== item.status)
      return <li key={item.id} className="pattern-item creationpattern-record-item"><div><strong>{item.name}</strong><span className="pattern-muted">{item.id} · {ownerName(item.owner)}</span><div className="creationpattern-record-meta"><Badge appearance="tint" color={item.status === 'Active' ? 'success' : item.status === 'In review' ? 'warning' : 'subtle'}>{item.status}</Badge>{hasDraft && <span className="pattern-muted">Unsaved draft</span>}</div></div><Button {...focusTarget} icon={<Edit20Regular />} aria-label={`${hasDraft ? 'Resume editing' : 'Edit'} ${item.name}`} onClick={() => edit(item)}>{hasDraft ? 'Resume' : 'Edit'}</Button></li>
    })}</ul>
    <p className="pattern-muted creationpattern-save-status" role="status">{savedMessage || 'Open a record to edit its details or inspect recent activity.'}</p>
    <OverlayDrawer open={open && !!record} onOpenChange={(_, data) => setOpen(data.open)} position="end" className="creationpattern-editor-drawer" aria-labelledby={titleId}>
      <DrawerHeader><DrawerHeaderTitle id={titleId} action={<Button appearance="subtle" icon={<Dismiss20Regular />} aria-label="Close record editor and keep draft" onClick={() => setOpen(false)} />}>Edit record</DrawerHeaderTitle>{record && <p className="pattern-muted">{record.id} · {record.name}</p>}</DrawerHeader>
      <DrawerBody className="creationpattern-editor-body">
        <TabList selectedValue={tab} onTabSelect={(_, data) => setTab(data.value as typeof tab)} aria-label="Record editor sections"><Tab value="details">Details</Tab><Tab value="activity">Activity</Tab></TabList>
        {record && draft && <div className="creationpattern-editor-content">
          {tab === 'details' ? <form id={`${titleId}-form`} className="pattern-stack" onSubmit={event => { event.preventDefault(); save() }} noValidate>
            <p className="pattern-muted">{record.description}</p>
            <Field label="Record name" required validationState={error ? 'error' : 'none'} validationMessage={error}><Input value={draft.name} maxLength={100} onChange={(_, data) => update({ name: data.value })} /></Field>
            <PatternSelect label="Owner" value={draft.owner} options={people.map(person => ({ value: person.id, label: person.name }))} onChange={owner => update({ owner })} />
            <PatternSelect label="Status" value={draft.status} options={['Active', 'In review', 'Archived'].map(status => ({ value: status, label: status }))} onChange={status => update({ status: status as EditableRecord['status'] })} />
            <p className="pattern-muted">{dirty ? 'You have unsaved changes. Closing keeps this draft.' : 'Changes appear in the record list after saving.'}</p>
          </form> : <section aria-label="Record activity"><h4>Recent activity</h4><ol className="creationpattern-activity">{record.activity.map(item => <li key={item.id}><span className="creationpattern-activity-marker" aria-hidden="true" /><div><strong>{item.message}</strong><span className="pattern-muted">{item.when}</span></div></li>)}</ol></section>}
        </div>}
      </DrawerBody>
      <DrawerFooter className="creationpattern-editor-footer"><Button onClick={cancel}>Cancel editing</Button><Button appearance="primary" onClick={save} disabled={!dirty}>Save changes</Button></DrawerFooter>
    </OverlayDrawer>
  </div>
}

const initialRecords = (): EditableRecord[] => [
  { id: 'REC-1048', name: 'Quarterly performance review', owner: 'maya', status: 'In review', description: 'A shared record for the operations review and supporting materials.', activity: [{ id: 'a1', message: 'Maya requested a review', when: 'Today, 9:30 AM' }, { id: 'a2', message: 'Jordan added the supporting documents', when: 'Yesterday, 2:15 PM' }, { id: 'a3', message: 'Record created by Maya', when: 'Monday, 10:00 AM' }] },
  { id: 'REC-1049', name: 'Customer onboarding', owner: 'jordan', status: 'Active', description: 'Track the owners and readiness of the customer onboarding workflow.', activity: [{ id: 'b1', message: 'Jordan marked the record active', when: 'Today, 8:45 AM' }, { id: 'b2', message: 'Alex updated the onboarding checklist', when: 'Yesterday, 11:20 AM' }] },
  { id: 'REC-1050', name: 'Service quality assessment', owner: 'alex', status: 'Active', description: 'Keep assessment details and team ownership in one place.', activity: [{ id: 'c1', message: 'Alex updated the assessment details', when: 'Today, 10:10 AM' }, { id: 'c2', message: 'Sam added a review note', when: 'Yesterday, 4:00 PM' }] },
  { id: 'REC-1051', name: 'Previous quarter archive', owner: 'sam', status: 'Archived', description: 'An archived record of the completed quarterly review.', activity: [{ id: 'd1', message: 'Sam archived the completed review', when: 'Friday, 3:30 PM' }, { id: 'd2', message: 'Review signed off by Maya', when: 'Friday, 12:00 PM' }] },
]

export function RecordEditingPreview() {
  const [records, setRecords] = useState(initialRecords)
  return <RecordEditor records={records} people={wizardPeople} onSave={(id, values) => setRecords(previous => previous.map(record => record.id === id ? { ...record, ...values, activity: [{ id: `save-${record.activity.length}`, message: 'Record details updated in this preview', when: 'Just now' }, ...record.activity] } : record))} />
}
