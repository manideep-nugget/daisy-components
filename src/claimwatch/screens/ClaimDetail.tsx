import { useEffect, useRef, useState, type ReactNode } from 'react'
import {
  Button, Checkbox, Dialog, DialogActions, DialogBody, DialogContent, DialogSurface, DialogTitle,
  Field, MessageBar, MessageBarBody, SearchBox, Tab, TabList, Textarea,
  useRestoreFocusTarget,
} from '@fluentui/react-components'
import {
  ArrowLeft20Regular, ArrowRight20Regular, Checkmark16Regular, CheckmarkCircle20Regular,
  Clock20Regular, Document20Regular, Dismiss20Regular, Person20Regular, ShieldCheckmark20Regular,
  Sparkle20Regular,
} from '@fluentui/react-icons'
import { AttentionCard, EvidenceList, FactList, StatusBadge, WorkflowTimeline } from '../../components/shared/Shared'
import { useClaimWatch } from '../useClaimWatch'
import type { ClaimDocument, ClaimRecord, DetailTab } from '../types'
import './ClaimDetail.css'

export type ClaimDetailProps = {
  claimId: string
  tab: DetailTab
  onTabChange: (tab: DetailTab) => void
  onBack: () => void
  onAskDaisy: (prompt?: string, claimId?: string) => void
  requestInfoSignal?: number
  onRequestInfoHandled?: () => void
}

function money(amount: number | null, currency: string) {
  return amount === null ? 'Not recorded' : new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount)
}

function date(value: string) {
  const parsed = new Date(value)
  return Number.isNaN(parsed.valueOf()) ? value : parsed.toLocaleDateString('en-US', { timeZone: 'Asia/Kolkata', month: 'short', day: 'numeric', year: 'numeric' })
}

function Section({ title, children, aside }: { title: string; children: ReactNode; aside?: ReactNode }) {
  return <section className="detail-section"><div className="detail-section-heading"><h2>{title}</h2>{aside}</div>{children}</section>
}

function ServiceLines({ claim }: { claim: ClaimRecord }) {
  return <div className="detail-table-scroll" tabIndex={0} role="region" aria-label="Service lines; scroll horizontally on a small screen"><table className="detail-service-table"><thead><tr><th scope="col">Service</th><th scope="col">Description</th><th scope="col">Quantity</th><th scope="col">Unit price</th><th scope="col">Amount</th></tr></thead><tbody>{claim.serviceLines.map((line, index) => <tr key={`${line.code}-${index}`}><td>{line.code}</td><td>{line.description}</td><td>{line.quantity}</td><td>{money(line.unitPrice, claim.currency)}</td><td>{money(line.amount, claim.currency)}</td></tr>)}</tbody></table></div>
}

export function ClaimDetail({ claimId, tab, onTabChange, onBack, onAskDaisy, requestInfoSignal = 0, onRequestInfoHandled }: ClaimDetailProps) {
  const { claims, tasks, requests, events, assignTask, completeTask, addNote, requestInformation, passToReview } = useClaimWatch()
  const claim = claims.find((item) => item.id === claimId)
  const claimTasks = tasks.filter((item) => item.claimId === claimId)
  const claimRequests = requests.filter((item) => item.claimId === claimId)
  const claimEvents = events.filter((item) => item.claimId === claimId)
  const [preview, setPreview] = useState<ClaimDocument | null>(null)
  const [requestOpen, setRequestOpen] = useState(false)
  const [requestedDocs, setRequestedDocs] = useState<string[]>([])
  const [requestMessage, setRequestMessage] = useState('')
  const [requestErrors, setRequestErrors] = useState<{ documents?: string; message?: string }>({})
  const [note, setNote] = useState('')
  const [noteError, setNoteError] = useState('')
  const [feedback, setFeedback] = useState('')
  const [codingFeedback, setCodingFeedback] = useState('')
  const [diagnosisSearch, setDiagnosisSearch] = useState('')
  const messageRef = useRef<HTMLTextAreaElement>(null)
  const requestOptionsRef = useRef<HTMLDivElement>(null)
  const noteRef = useRef<HTMLTextAreaElement>(null)
  const restoreFocusTarget = useRestoreFocusTarget()
  const requestSignalRef = useRef(0)

  useEffect(() => {
    if (claim && requestInfoSignal > requestSignalRef.current) {
      requestSignalRef.current = requestInfoSignal
      setRequestedDocs(claim?.documents.filter((item) => item.status === 'Missing').map((item) => item.name) ?? [])
      setRequestMessage('Please provide the outstanding documents so we can complete intake review.')
      setRequestErrors({})
      setRequestOpen(true)
      onRequestInfoHandled?.()
    }
  }, [requestInfoSignal, claim, onRequestInfoHandled])

  if (!claim) return <div className="cw-page detail-unavailable"><Document20Regular /><h1>Claim unavailable</h1><p>This record is not in the sample workspace. Return to the claims explorer to open an available record.</p><Button appearance="primary" onClick={onBack}>Back to claims</Button></div>

  const missingDocuments = claim.documents.filter((item) => item.status === 'Missing')
  const hasMissing = missingDocuments.length > 0
  const isHandedOff = claim.intakeStage === 'handed-off'
  const stageIndex = ['received', 'documents', 'ready', 'handed-off'].indexOf(claim.intakeStage)
  const primaryLabel = hasMissing ? 'Request missing documents' : isHandedOff ? 'View review workflow' : 'Pass to review'
  const availableCount = claim.documents.filter((item) => item.status === 'Available').length
  const openTasks = claimTasks.filter((item) => item.state === 'open')

  function openRequest() {
    setRequestedDocs(missingDocuments.map((item) => item.name))
    setRequestMessage('Please provide the outstanding documents so we can complete intake review.')
    setRequestErrors({})
    setRequestOpen(true)
  }

  function primaryAction() {
    if (hasMissing) openRequest()
    else if (isHandedOff) onTabChange('workflow')
    else {
      passToReview(claimId)
      setFeedback('Intake handed off to the review team. The workflow and workbench have been updated.')
    }
  }

  function submitRequest() {
    const nextErrors = { documents: requestedDocs.length ? undefined : 'Select at least one document to request.', message: requestMessage.trim() ? undefined : 'Add a message explaining what is needed.' }
    setRequestErrors(nextErrors)
    if (nextErrors.documents || nextErrors.message) {
      if (nextErrors.documents) requestOptionsRef.current?.querySelector('input')?.focus()
      else if (nextErrors.message) messageRef.current?.focus()
      return
    }
    requestInformation(claimId, requestedDocs, requestMessage.trim())
    setRequestOpen(false)
    setFeedback('Information request added. You can track it in Documents & Eligibility and the workbench.')
  }

  const stageLabels = ['Received', 'Documents', 'Ready for review', 'Handed off']
  const statusIntent = claim.status === 'Approved' || claim.status === 'Paid' ? 'success' : claim.status === 'Incomplete' || claim.status === 'Clinical review' ? 'warning' : 'info'
  const diagnoses = [...claim.diagnoses, { code: 'Z00.00', description: 'General adult examination without abnormal findings' }, { code: 'M25.561', description: 'Pain in right knee' }].filter((item, index, all) => all.findIndex((entry) => entry.code === item.code) === index && `${item.code} ${item.description}`.toLowerCase().includes(diagnosisSearch.trim().toLowerCase()))

  return <div className="cw-page claim-detail">
    <div className="detail-identity">
      <Button className="detail-back" appearance="subtle" icon={<ArrowLeft20Regular />} onClick={onBack}>Back to claims</Button>
      <div className="detail-title-row"><div><div className="detail-title-with-status"><h1>{claim.id}</h1><StatusBadge label={claim.status} intent={statusIntent} /></div><p>{claim.member} <span aria-hidden="true">·</span> {claim.provider}</p></div><div className="detail-main-actions"><Button {...restoreFocusTarget} appearance="secondary" icon={<Sparkle20Regular />} onClick={() => onAskDaisy('Summarize this claim and the next intake step', claimId)}>Ask Daisy</Button><Button {...restoreFocusTarget} appearance="primary" icon={<ArrowRight20Regular />} onClick={primaryAction}>{primaryLabel}</Button></div></div>
      <ol className="detail-intake-progress" aria-label="Intake progress">{stageLabels.map((label, index) => <li key={label} className={index < stageIndex ? 'is-complete' : index === stageIndex ? 'is-current' : ''} aria-current={index === stageIndex ? 'step' : undefined}><span className="detail-stage-marker" aria-hidden="true">{index < stageIndex ? <Checkmark16Regular /> : index + 1}</span><span>{label}</span>{index === stageIndex && <span className="detail-current-label">Current</span>}</li>)}</ol>
    </div>
    <div className="detail-body">
      {feedback && <MessageBar intent="success"><MessageBarBody>{feedback}</MessageBarBody></MessageBar>}
      <AttentionCard title={hasMissing ? `${missingDocuments.length} document${missingDocuments.length === 1 ? '' : 's'} needed before review` : isHandedOff ? 'Intake is complete. The review team owns the next step.' : 'This claim is ready for intake handoff'} description={hasMissing ? `${missingDocuments.map((item) => item.name).join(' and ')} ${missingDocuments.length === 1 ? 'is' : 'are'} outstanding. Request them before passing this claim to review.` : isHandedOff ? claim.decisionReason : 'Documents are available and eligibility is recorded. Pass the intake record to the review team; recorded assessment facts remain unchanged.'} secondaryLabel={hasMissing ? 'Review documents' : 'View workflow'} onSecondary={() => onTabChange(hasMissing ? 'documents' : 'workflow')} intent={hasMissing ? 'warning' : 'info'} />
      <TabList className="detail-tabs" selectedValue={tab} onTabSelect={(_, data) => onTabChange(data.value as DetailTab)} aria-label="Claim details"><Tab value="overview" id="detail-tab-overview" aria-controls="detail-panel-overview">Overview</Tab><Tab value="documents" id="detail-tab-documents" aria-controls="detail-panel-documents">Documents & Eligibility</Tab><Tab value="assessment" id="detail-tab-assessment" aria-controls="detail-panel-assessment">Assessment & Coding</Tab><Tab value="workflow" id="detail-tab-workflow" aria-controls="detail-panel-workflow">Workflow & Journey</Tab></TabList>
      <div role="tabpanel" id={`detail-panel-${tab}`} aria-labelledby={`detail-tab-${tab}`} className="detail-tab-content">
        {tab === 'overview' && <>
          <div className="detail-metrics"><div><span>Billed amount</span><strong>{money(claim.billedAmount, claim.currency)}</strong></div><div><span>Approved amount</span><strong>{money(claim.approvedAmount, claim.currency)}</strong></div><div><span>Recorded risk</span><strong>{claim.riskScore}<span className="detail-metric-unit"> / 100</span></strong><StatusBadge label={`${claim.riskBand} risk`} intent={claim.riskBand === 'High' ? 'danger' : claim.riskBand === 'Medium' ? 'warning' : 'success'} /></div><div><span>Recorded decision</span><strong className="detail-decision-value">{claim.decision}</strong></div></div>
          <div className="detail-two-columns"><Section title="Member & policy"><FactList columns={1} items={[{ label: 'Member', value: claim.member }, { label: 'Member ID', value: claim.memberId }, { label: 'Policy', value: claim.policyId }, { label: 'Coverage', value: claim.eligibility.coverage }]} /></Section><Section title="Provider"><FactList columns={1} items={[{ label: 'Provider', value: claim.provider }, { label: 'Provider ID', value: claim.providerId }, { label: 'Country', value: claim.country }, { label: 'Claim type', value: claim.type }]} /></Section></div>
          <Section title="Claim information"><FactList columns={2} items={[{ label: 'Submitted', value: date(claim.submitted) }, { label: 'Last updated', value: date(claim.updated) }, { label: 'Currency', value: claim.currency }, { label: 'Current owner', value: openTasks.find((item) => item.owner)?.owner ?? 'Unassigned' }, { label: 'Decision reason', value: claim.decisionReason }]} /></Section>
          <Section title="Service summary" aside={<Button appearance="subtle" onClick={() => onTabChange('assessment')}>View coding details</Button>}><ServiceLines claim={claim} /></Section>
        </>}
        {tab === 'documents' && <>
          <div className="detail-two-columns"><Section title="Documents" aside={<span className="detail-muted">{availableCount} of {claim.documents.length} available</span>}><EvidenceList documents={claim.documents} onPreview={setPreview} /><div className="detail-section-action"><Button {...restoreFocusTarget} appearance="secondary" icon={<Document20Regular />} onClick={openRequest}>Request information</Button></div></Section><Section title="Eligibility"><div className="detail-eligibility-heading"><ShieldCheckmark20Regular /><strong>{claim.eligibility.policyActive ? 'Active policy' : 'Policy requires review'}</strong></div><FactList columns={1} items={[{ label: 'Policy', value: claim.policyId }, { label: 'Coverage', value: claim.eligibility.coverage }, { label: 'Benefit', value: claim.eligibility.benefit }]} /><p className="detail-muted">Recorded sample eligibility. Intake actions do not make a coverage or payment decision.</p></Section></div>
          <Section title="Intake completeness"><ul className="detail-checklist"><li><CheckmarkCircle20Regular /><span>Member and provider information supplied</span><StatusBadge label="Complete" intent="success" /></li><li>{hasMissing ? <Clock20Regular /> : <CheckmarkCircle20Regular />}<span>Required supporting documents</span><StatusBadge label={hasMissing ? `${missingDocuments.length} missing` : 'Complete'} intent={hasMissing ? 'warning' : 'success'} /></li><li><ShieldCheckmark20Regular /><span>Policy eligibility recorded</span><StatusBadge label={claim.eligibility.policyActive ? 'Active policy' : 'Review needed'} intent={claim.eligibility.policyActive ? 'success' : 'warning'} /></li></ul></Section>
          <Section title="Information requests">{claimRequests.length ? <div className="detail-request-list">{claimRequests.map((request) => <article key={request.id}><div className="detail-list-heading"><strong>{request.documents.join(', ')}</strong><StatusBadge label={request.status} intent={request.status === 'Received' ? 'success' : 'warning'} /></div><p>{request.message}</p><span className="detail-muted">Requested {date(request.created)} · {request.id}</span></article>)}</div> : <div className="detail-simple-empty"><Document20Regular /><div><strong>No information requests</strong><p>Request missing documents to keep intake work moving.</p></div></div>}</Section>
        </>}
        {tab === 'assessment' && <>
          <Section title="Recorded assessment"><div className="detail-assessment-summary"><div className="detail-risk-score"><strong>{claim.riskScore}</strong><span>out of 100</span><StatusBadge label={`${claim.riskBand} risk`} intent={claim.riskBand === 'High' ? 'danger' : claim.riskBand === 'Medium' ? 'warning' : 'success'} /></div><div><h3>{claim.decision}</h3><p>{claim.decisionReason}</p><p className="detail-muted">Recorded assessment facts are shown for context. This demo does not calculate clinical risk.</p></div></div>{claim.findings.length > 0 && <div className="detail-findings">{claim.findings.map((finding) => <div key={finding.id}><StatusBadge label={finding.severity === 'danger' ? 'High attention' : finding.severity === 'warning' ? 'Review' : 'Finding'} intent={finding.severity === 'danger' ? 'danger' : finding.severity === 'warning' ? 'warning' : 'info'} /><div><strong>{finding.title}</strong><p>{finding.detail}</p></div></div>)}</div>}</Section>
          <Section title="Clinical codes"><div className="detail-two-columns detail-code-columns"><div><h3>Submitted diagnoses</h3>{claim.diagnoses.map((item) => <p key={item.code}><strong>{item.code}</strong> — {item.description}</p>)}</div><div><h3>Submitted procedures</h3>{claim.procedures.map((item) => <p key={item.code}><strong>{item.code}</strong> — {item.description}</p>)}</div></div><div className="detail-coding-toolbar"><Button appearance="secondary" icon={<CheckmarkCircle20Regular />} onClick={() => setCodingFeedback(`Coding check complete: ${claim.coding.recognized ? 'submitted codes are recognized in the sample catalogue.' : 'one or more submitted codes need review.'}`)}>Check coding</Button><Button appearance="secondary" onClick={() => setCodingFeedback(`Care pathway check complete: ${claim.coding.carePathway}`)}>Check care pathway</Button></div>{codingFeedback && <MessageBar intent="info"><MessageBarBody>{codingFeedback}</MessageBarBody></MessageBar>}<p className="detail-muted">Checks display recorded sample results and do not change codes, eligibility, or clinical decisions.</p><div className="detail-disclosures"><details><summary>Code recognition & pairing details</summary><p>{claim.coding.recognized ? 'The submitted diagnosis and procedure codes are recognized.' : 'The submitted code set needs manual verification.'}</p><p>{claim.coding.consistency}</p></details><details><summary>Catalogue coverage</summary><p>{claim.coding.catalogue}</p><p className="detail-muted">Catalogue details are illustrative and are not a complete clinical reference.</p></details><details><summary>Care pathway result</summary><p>{claim.coding.carePathway}</p></details><details><summary>Look up a diagnosis code</summary><SearchBox aria-label="Search sample diagnosis codes" placeholder="Search code or description" value={diagnosisSearch} onChange={(_, data) => setDiagnosisSearch(data.value)} /><p className="detail-muted">Search a small sample catalogue. Choosing a result does not change the claim.</p><ul className="detail-code-results">{diagnoses.map((item) => <li key={item.code}><strong>{item.code}</strong><span>{item.description}</span></li>)}</ul>{diagnoses.length === 0 && <p>No sample codes match. Try a submitted code or “knee”.</p>}</details></div></Section>
          <Section title="Service lines"><ServiceLines claim={claim} /></Section>
        </>}
        {tab === 'workflow' && <>
          <Section title="Current workflow"><FactList columns={2} items={[{ label: 'Current owner', value: openTasks.find((item) => item.owner)?.owner ?? (isHandedOff ? 'Claims review team' : 'Unassigned') }, { label: 'Review requirement', value: hasMissing ? 'Supporting documents required' : isHandedOff ? 'Intake complete; awaiting reviewer' : 'Ready for intake handoff' }, { label: 'Blocking dependencies', value: hasMissing ? missingDocuments.map((item) => item.name).join(', ') : 'None' }, { label: 'Open tasks', value: String(openTasks.length) }, { label: 'Information requests', value: String(claimRequests.filter((item) => item.status === 'Pending').length) }]} /></Section>
          <Section title="Intake tasks">{claimTasks.length ? <div className="detail-task-list">{claimTasks.map((task) => <article key={task.id}><div className="detail-list-heading"><strong>{task.title}</strong><StatusBadge label={task.state === 'open' ? 'Open' : task.state === 'completed' ? 'Completed' : 'Automatic'} intent={task.state === 'open' ? 'warning' : 'success'} /></div><p>{task.reason}</p><div className="detail-task-bottom"><span className="detail-muted">{task.owner ?? 'Unassigned'} · Due {date(task.due)}</span>{task.state === 'open' && <div>{!task.owner && <Button appearance="secondary" icon={<Person20Regular />} onClick={() => { assignTask(task.id); setFeedback('Task assigned to you.') }}>Assign to me</Button>}<Button appearance="secondary" icon={<Checkmark16Regular />} onClick={() => { completeTask(task.id); setFeedback('Task marked complete. The workbench has been updated.') }}>Mark complete</Button></div>}</div></article>)}</div> : <p className="detail-muted">No intake tasks are linked to this claim.</p>}</Section>
          <div className="detail-two-columns"><Section title="Recorded handoffs">{claimEvents.some((item) => item.type === 'handoff') ? <WorkflowTimeline events={claimEvents.filter((item) => item.type === 'handoff')} /> : <p className="detail-muted">No handoffs yet. Pass the claim to review when intake is complete.</p>}</Section><Section title="Request history">{claimRequests.length ? claimRequests.map((request) => <div className="detail-history-item" key={request.id}><strong>{request.documents.join(', ')}</strong><p>{request.status} · {date(request.created)}</p></div>) : <p className="detail-muted">No information requests have been recorded.</p>}</Section></div>
          <Section title="Add an intake note"><form className="detail-note-form" onSubmit={(event) => { event.preventDefault(); if (!note.trim()) { setNoteError('Write a note before adding it.'); noteRef.current?.focus(); return } addNote(claimId, note.trim()); setNote(''); setNoteError(''); setFeedback('Intake note added to the activity timeline.') }}><Field label="Note" validationState={noteError ? 'error' : 'none'} validationMessage={noteError} hint="Keep notes factual and relevant to the next reviewer."><Textarea ref={noteRef} value={note} resize="vertical" placeholder="Add context for the review team…" onChange={(_, data) => { setNote(data.value); setNoteError('') }} /></Field><Button type="submit" appearance="primary">Add note</Button></form></Section>
          <Section title="Activity timeline"><WorkflowTimeline events={claimEvents} /></Section>
        </>}
      </div>
    </div>
    <Dialog open={preview !== null} onOpenChange={(_, data) => { if (!data.open) setPreview(null) }}><DialogSurface className="detail-document-dialog"><DialogBody><DialogTitle action={<Button appearance="subtle" icon={<Dismiss20Regular />} aria-label="Close document preview" onClick={() => setPreview(null)} />}>{preview?.name}</DialogTitle><DialogContent>{preview && <><div className="detail-document-meta"><StatusBadge label="Synthetic document" intent="info" /><span>{preview.kind}</span></div><div className="detail-document-sheet"><Document20Regular /><h3>{preview.name}</h3><p>{preview.content}</p><FactList columns={1} items={[{ label: 'Claim', value: claim.id }, { label: 'Member', value: claim.member }, { label: 'Provider', value: claim.provider }, { label: 'Uploaded', value: date(preview.uploaded) }]} /></div><p className="detail-muted">Illustrative sample content for this prototype.</p></>}</DialogContent><DialogActions><Button appearance="primary" onClick={() => setPreview(null)}>Done</Button></DialogActions></DialogBody></DialogSurface></Dialog>
    <Dialog open={requestOpen} onOpenChange={(_, data) => setRequestOpen(data.open)}>
      <DialogSurface className="detail-request-dialog"><DialogBody>
        <DialogTitle action={<Button appearance="subtle" icon={<Dismiss20Regular />} aria-label="Close information request" onClick={() => setRequestOpen(false)} />}>Request information</DialogTitle>
        <DialogContent>
          <p>Select documents and add a clear message for {claim.provider}.</p>
          <fieldset className="detail-request-fieldset" aria-describedby={requestErrors.documents ? `request-documents-error-${claimId}` : undefined}>
            <legend>Documents to request <span aria-hidden="true">*</span></legend>
            <div ref={requestOptionsRef} className="detail-request-options">{claim.documents.map((document) => <Checkbox key={document.id} id={`request-${document.id}`} label={`${document.name}${document.status === 'Missing' ? ' (missing)' : ''}`} checked={requestedDocs.includes(document.name)} onChange={(_, data) => { setRequestedDocs((current) => data.checked ? [...current, document.name] : current.filter((name) => name !== document.name)); setRequestErrors((current) => ({ ...current, documents: undefined })) }} />)}</div>
            {requestErrors.documents && <p className="detail-request-error" id={`request-documents-error-${claimId}`} role="alert">{requestErrors.documents}</p>}
          </fieldset>
          <Field label="Message to provider" required validationState={requestErrors.message ? 'error' : 'none'} validationMessage={requestErrors.message}><Textarea ref={messageRef} value={requestMessage} resize="vertical" onChange={(_, data) => { setRequestMessage(data.value); setRequestErrors((current) => ({ ...current, message: undefined })) }} /></Field>
          <p className="detail-muted">This adds an in-memory request and intake task. No message is sent outside the sample workspace.</p>
        </DialogContent>
        <DialogActions><Button appearance="secondary" onClick={() => setRequestOpen(false)}>Cancel</Button><Button appearance="primary" onClick={submitRequest}>Create information request</Button></DialogActions>
      </DialogBody></DialogSurface>
    </Dialog>
  </div>
}
