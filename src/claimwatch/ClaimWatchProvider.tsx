import { useState, type ReactNode } from 'react'
import { createClaimFixture, initialClaims, initialEvents, initialExplorerFilters, initialRequests, initialTasks } from './fixtures'
import { ClaimWatchContext } from './useClaimWatch'
import type { ActivityEvent, DaisyMessage, ExplorerFilters, InfoRequest, IntakeTask, NewClaimInput } from './types'

function uniqueId(prefix: string) { return `${prefix}-${crypto.randomUUID().slice(0, 8).toUpperCase()}` }
function now() { return new Date().toISOString() }

export function ClaimWatchProvider({ children }: { children: ReactNode }) {
  const [claims, setClaims] = useState(initialClaims)
  const [tasks, setTasks] = useState(initialTasks)
  const [requests, setRequests] = useState(initialRequests)
  const [events, setEvents] = useState(initialEvents)
  const [messages, setMessages] = useState<Record<string, DaisyMessage[]>>({})
  const [explorerFilters, setFilters] = useState(initialExplorerFilters)

  function addEvent(claimId: string, title: string, detail: string, type: ActivityEvent['type']) {
    setEvents(current => [{ id: uniqueId('EVT'), claimId, title, detail, time: now(), type }, ...current])
  }
  function touchClaim(claimId: string) { setClaims(current => current.map(claim => claim.id === claimId ? { ...claim, updated: now() } : claim)) }
  function assignTask(id: string) {
    const task = tasks.find(item => item.id === id)
    if (!task || task.state !== 'open' || task.owner === 'Maya Patel') return
    setTasks(current => current.map(item => item.id === id ? { ...item, owner: 'Maya Patel' } : item))
    addEvent(task.claimId, 'Task assigned', `${task.title} assigned to Maya Patel.`, 'task')
    touchClaim(task.claimId)
  }
  function completeTask(id: string) {
    const task = tasks.find(item => item.id === id)
    if (!task || task.state !== 'open') return
    setTasks(current => current.map(item => item.id === id ? { ...item, state: 'completed', owner: item.owner || 'Maya Patel', overdue: false } : item))
    addEvent(task.claimId, 'Intake task completed', `${task.title} completed by Maya Patel.`, 'task')
    touchClaim(task.claimId)
  }
  function addNote(claimId: string, note: string) {
    if (!note.trim() || !claims.some(item => item.id === claimId)) return
    addEvent(claimId, 'Note added by Maya Patel', note.trim(), 'note')
    touchClaim(claimId)
  }
  function requestInformation(claimId: string, documents: string[], message: string) {
    if (!claims.some(item => item.id === claimId) || !documents.length || !message.trim()) return
    const request: InfoRequest = { id: uniqueId('REQ'), claimId, documents, message: message.trim(), status: 'Pending', created: now() }
    setRequests(current => [request, ...current])
    setTasks(current => {
      const existing = current.find(task => task.claimId === claimId && task.kind === 'documents' && task.state === 'open')
      const reason = `Awaiting requested information: ${documents.join(', ')}`
      if (existing) return current.map(task => task.id === existing.id ? { ...task, reason, owner: task.owner || 'Maya Patel' } : task)
      const task: IntakeTask = { id: uniqueId('TSK'), claimId, title: 'Follow up on requested information', reason, owner: 'Maya Patel', due: new Date(Date.now() + 86_400_000).toISOString(), overdue: false, priority: 'normal', state: 'open', kind: 'documents' }
      return [task, ...current]
    })
    addEvent(claimId, 'Information requested', `${documents.join(', ')} requested by Maya Patel. ${message.trim()}`, 'request')
    touchClaim(claimId)
  }
  function submitClaim(input: NewClaimInput) {
    const id = uniqueId('CLM')
    const timestamp = now()
    const claim = createClaimFixture(input, id, 3)
    claim.submitted = timestamp
    claim.updated = timestamp
    claim.intakeStage = 'received'
    claim.memberId = uniqueId('MBR')
    claim.policyId = uniqueId('POL')
    claim.providerId = uniqueId('PRV')
    claim.riskScore = 0
    claim.riskBand = 'Low'
    claim.decision = 'Pending intake review'
    claim.decisionReason = 'New sample submission awaiting intake verification; no assessment has been run.'
    claim.findings = [{ id: uniqueId('FND'), title: 'Awaiting initial review', detail: 'This fictional submission has not been assessed. Review the supplied sample documents.', severity: 'info' }]
    claim.documents = claim.documents.map(document => ({ ...document, content: document.content.replace('POL-583713', claim.policyId), uploaded: new Date().toLocaleDateString('en-GB', { timeZone: 'Asia/Kolkata', day: 'numeric', month: 'short', year: 'numeric' }) }))
    const task: IntakeTask = { id: uniqueId('TSK'), claimId: id, title: 'Verify new claim intake', reason: 'New sample claim received', owner: 'Maya Patel', due: new Date(Date.now() + 86_400_000).toISOString(), overdue: false, priority: 'normal', state: 'open', kind: 'review' }
    setClaims(current => [claim, ...current])
    setTasks(current => [task, ...current])
    addEvent(id, 'Sample claim received', `${input.member} · ${input.provider}. Intake task created for Maya Patel.`, 'submission')
    return id
  }
  function passToReview(claimId: string) {
    const claim = claims.find(item => item.id === claimId)
    if (!claim || claim.intakeStage === 'handed-off' || claim.documents.some(document => document.status === 'Missing')) return
    setClaims(current => current.map(item => item.id === claimId ? { ...item, intakeStage: 'handed-off', updated: now() } : item))
    setTasks(current => current.map(item => item.claimId === claimId && item.state === 'open' ? { ...item, state: 'completed', owner: item.owner || 'Maya Patel', overdue: false } : item))
    addEvent(claimId, 'Intake handed off to claims review', 'Maya Patel verified the sample intake checklist and completed the linked intake tasks. Recorded assessment and claim decision are unchanged.', 'handoff')
  }
  function sendDaisy(contextId: string | null, text: string) {
    if (!text.trim()) return
    const key = contextId || 'workspace'
    const query = text.trim().toLowerCase()
    const claim = claims.find(item => item.id === contextId)
    let reply: Omit<DaisyMessage, 'id' | 'role'>
    if (claim && /document|missing|referral|complete|eligib|coverage/.test(query)) {
      const missing = claim.documents.filter(document => document.status === 'Missing')
      const pending = requests.filter(request => request.claimId === claim.id && request.status === 'Pending')
      reply = {
        heading: missing.length ? 'Complete the intake evidence' : 'The sample documents are complete',
        text: missing.length ? `${claim.member}'s claim is awaiting ${missing.map(document => document.name.toLowerCase()).join(', ')}.` : `All ${claim.documents.length} sample documents are available for ${claim.id}. Verify them before the intake handoff.`,
        findings: [missing.length ? `${missing.length} required document${missing.length === 1 ? ' is' : 's are'} missing.` : 'Invoice, referral, and coverage confirmation are available.', claim.eligibility.policyActive ? 'The sample policy is active.' : 'The recorded sample policy is inactive.', pending.length ? `${pending.length} information request${pending.length === 1 ? ' is' : 's are'} pending.` : 'No information requests are pending.'],
        sources: [{ label: 'Documents and completeness checklist', tab: 'documents' }],
        action: missing.length ? 'request-info' : 'documents', actionLabel: missing.length ? 'Request missing information' : 'Review documents',
      }
    } else if (claim && /risk|finding|assessment|coding|signal|why/.test(query)) {
      reply = {
        heading: 'Recorded assessment findings', text: `${claim.id} has a recorded ${claim.riskBand.toLowerCase()} risk score of ${claim.riskScore}/100. The next step is to inspect evidence, not infer a new decision.`,
        findings: claim.findings.map(finding => `${finding.title}: ${finding.detail}`).slice(0, 3),
        sources: [{ label: 'Assessment and coding findings', tab: 'assessment' }], action: 'open-claim', actionLabel: 'Review claim assessment',
      }
    } else if (claim && /status|summar|review|claim|next|attention|task/.test(query)) {
      const openTasks = tasks.filter(task => task.claimId === claim.id && task.state === 'open')
      const missing = claim.documents.filter(document => document.status === 'Missing')
      reply = {
        heading: 'The next intake step', text: claim.intakeStage === 'handed-off' ? `${claim.id} has been handed off. Its recorded status is ${claim.status.toLowerCase()}.` : missing.length ? `Request the missing ${missing.map(document => document.name.toLowerCase()).join(', ')} before handing off ${claim.id}.` : `${claim.id} has complete sample documents. Review the evidence and pass intake to claims review.`,
        findings: [`Recorded status: ${claim.status}.`, `${openTasks.length} open intake task${openTasks.length === 1 ? '' : 's'}.`, `Recorded decision: ${claim.decision}.`],
        sources: [{ label: 'Claim overview', tab: 'overview' }, { label: 'Tasks and handoff history', tab: 'workflow' }],
        action: missing.length ? 'request-info' : 'open-claim', actionLabel: missing.length ? 'Request missing information' : 'Open claim overview',
      }
    } else if (/document|missing|referral/.test(query)) {
      const incomplete = claims.filter(item => item.documents.some(document => document.status === 'Missing'))
      reply = { heading: 'Claims awaiting evidence', text: incomplete.length ? `${incomplete.length} sample claims are awaiting documents. Open your workbench to request the evidence needed for intake.` : 'Every claim in this sample workspace has its required documents available.',
        findings: incomplete.slice(0, 3).map(item => `${item.id}: ${item.documents.filter(document => document.status === 'Missing').map(document => document.name.toLowerCase()).join(', ')} missing.`),
        action: 'open-workbench', actionLabel: 'Review document tasks',
      }
    } else if (/queue|next|attention|workbench|task|priorit|work|summar|focus|today/.test(query)) {
      const open = tasks.filter(task => task.state === 'open')
      const urgent = [...open].sort((a, b) => Number(b.overdue) - Number(a.overdue) || Number(b.priority === 'high') - Number(a.priority === 'high'))
      reply = { heading: 'Start with work that needs attention', text: `${open.length} intake tasks are open. ${urgent[0] ? `Start with ${urgent[0].title.toLowerCase()} for ${urgent[0].claimId}.` : 'There are no open intake tasks in this demo.'}`,
        findings: [`${open.filter(task => task.overdue).length} task${open.filter(task => task.overdue).length === 1 ? ' is' : 's are'} past due.`, `${open.filter(task => !task.owner).length} open tasks need an owner.`, `${requests.filter(request => request.status === 'Pending').length} information requests are pending.`],
        action: 'open-workbench', actionLabel: 'Open my workbench',
      }
    } else {
      reply = { heading: 'Choose a sample question', text: 'I can explain the current sample data. Ask about missing documents, summarize a claim, inspect recorded findings, or prioritize the intake queue.', findings: ['Responses use the fictional data shown in this workspace.', 'Ask “What needs attention?” for an intake queue summary.'], action: claim ? 'open-claim' : 'open-workbench', actionLabel: claim ? 'Open claim overview' : 'Open my workbench' }
    }
    const userMessage: DaisyMessage = { id: uniqueId('MSG'), role: 'user', text: text.trim() }
    const assistantMessage: DaisyMessage = { id: uniqueId('MSG'), role: 'assistant', ...reply }
    setMessages(current => ({ ...current, [key]: [...(current[key] || []), userMessage, assistantMessage] }))
  }
  function resetDaisy(contextId: string | null) { setMessages(current => ({ ...current, [contextId || 'workspace']: [] })) }
  function setExplorerFilters(patch: Partial<ExplorerFilters>) { setFilters(current => ({ ...current, ...patch })) }

  return <ClaimWatchContext.Provider value={{ claims, tasks, requests, events, messages, explorerFilters, setExplorerFilters, assignTask, completeTask, addNote, requestInformation, submitClaim, passToReview, sendDaisy, resetDaisy }}>{children}</ClaimWatchContext.Provider>
}
