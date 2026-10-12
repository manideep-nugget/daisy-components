import { useRef, useState } from 'react'
import { Button } from '@fluentui/react-components'
import { ContextualAssistant, PriorityTaskList, QueueSummary, RecentRecordList, type AssistantMessage, type PriorityTaskItem, type RecentRecordItem } from '../shared/DashboardCompositions'
import './DashboardPreviews.css'

const initialTasks: PriorityTaskItem[] = [
  { id: 'task-1', title: 'Check the missing project brief', reason: 'The scope needs confirmation before the design review.', owner: 'Unassigned', member: 'Northstar refresh', recordId: 'PRJ-2048', condition: 'Missing evidence', conditionIntent: 'warning', overdue: true, deadline: 'Due 12 Oct, 12:00 PM IST', priorityExplanation: 'Start here: this overdue item blocks the next review.', actionLabel: 'Review brief', secondaryLabel: 'Ask about the brief' },
  { id: 'task-2', title: 'Review accessibility findings', reason: 'Two recorded findings need a design response.', owner: 'Maya Patel', member: 'Customer portal', recordId: 'PRJ-2049', condition: 'Review required', conditionIntent: 'warning', deadline: 'Due 12 Oct, 4:00 PM IST', actionLabel: 'Review findings' },
  { id: 'task-3', title: 'Inspect the handoff package', reason: 'Design files are complete and ready to inspect.', owner: 'Maya Patel', member: 'Reporting workspace', recordId: 'PRJ-2050', condition: 'Ready for review', conditionIntent: 'info', deadline: 'Due 12 Oct, 5:00 PM IST', actionLabel: 'Open package' },
]
export function PriorityTasksPreview() {
  const [items, setItems] = useState(initialTasks)
  const [selected, setSelected] = useState('')
  const [asking, setAsking] = useState(false)
  const [dismissed, setDismissed] = useState<{ task: PriorityTaskItem; index: number } | null>(null)
  const task = items.find(item => item.id === selected)
  return <div className="dashboard-composition-preview"><PriorityTaskList items={items} onAction={id => { setSelected(id); setAsking(false) }} onSecondary={id => { setSelected(id); setAsking(true) }} />{task && <div className="pattern-detail-result" aria-live="polite"><h4>{asking ? 'About the missing brief' : task.member}</h4><p>{asking ? 'Confirm the project’s scope, review owner, and intended outcome. The design files are ready; the agreed scope is still missing.' : `${task.reason} Owner: ${task.owner}.`}</p><div className="pattern-row"><Button onClick={() => setSelected('')}>Close {asking ? 'guidance' : 'summary'}</Button>{!asking && <Button onClick={() => { setDismissed({ task, index: items.findIndex(item => item.id === task.id) }); setItems(current => current.filter(item => item.id !== selected)); setSelected('') }}>Dismiss from priority list</Button>}</div></div>}{dismissed && <div className="dashboard-preview-feedback"><span>{dismissed.task.member} dismissed.</span><Button onClick={() => { setItems(current => { const restored = [...current]; restored.splice(Math.min(dismissed.index, restored.length), 0, dismissed.task); return restored }); setDismissed(null) }}>Undo dismissal</Button></div>}</div>
}

const initialRecords: RecentRecordItem[] = [
  { id: 'PRJ-2048', name: 'Northstar refresh', status: 'In review', intent: 'info', updated: '12 Oct, 3:42 PM IST' },
  { id: 'PRJ-2049', name: 'Customer portal', status: 'Needs attention', intent: 'warning', updated: '12 Oct, 2:15 PM IST' },
  { id: 'PRJ-2050', name: 'Reporting workspace', status: 'Ready', intent: 'success', updated: '12 Oct, 11:30 AM IST' },
  { id: 'PRJ-2051', name: 'Partner onboarding', status: 'Draft', intent: 'neutral', updated: '11 Oct, 4:20 PM IST' },
]
export function RecentRecordsPreview() {
  const [selected, setSelected] = useState('')
  const record = initialRecords.find(item => item.id === selected)
  return <div className="dashboard-composition-preview"><RecentRecordList items={initialRecords} onOpen={setSelected} />{record && <div className="pattern-detail-result" aria-live="polite"><h4>{record.name}</h4><p>{record.id} · {record.status}. Updated {record.updated}.</p><Button onClick={() => setSelected('')}>Close summary</Button></div>}</div>
}

export function QueueSummaryPreview() {
  const [open, setOpen] = useState(6)
  const [completed, setCompleted] = useState(2)
  return <div className="dashboard-composition-preview"><QueueSummary ariaLabel="Team queue snapshot" items={[
    { id: 'open', label: 'Open tasks', value: open, unit: 'tasks' }, { id: 'requests', label: 'Pending requests', value: 3, unit: 'requests' },
    { id: 'complete', label: 'Completed tasks', value: completed, unit: 'tasks' }, { id: 'automatic', label: 'Automatic tasks', value: 4, unit: 'tasks' },
  ]} /><div className="pattern-actions"><Button disabled={!open} onClick={() => { setOpen(value => value - 1); setCompleted(value => value + 1) }}>Complete a sample task</Button></div><p className="dashboard-preview-feedback" aria-live="polite">{open} open {open === 1 ? 'task' : 'tasks'} across the sample team.</p></div>
}

export function ContextualAssistantPreview() {
  const [messages, setMessages] = useState<AssistantMessage[]>([])
  const [text, setText] = useState('')
  const [error, setError] = useState('')
  const [feedback, setFeedback] = useState('')
  const inputRef = useRef<HTMLTextAreaElement>(null)
  function send(prompt: string) {
    if (!prompt.trim()) { setError('Enter a question or choose a suggestion.'); inputRef.current?.focus(); return }
    const supported = /brief|review|next|missing|evidence/i.test(prompt)
    const id = String(messages.length)
    setMessages(current => [...current, { id: `user-${id}`, role: 'user', text: prompt.trim() }, { id: `assistant-${id}`, role: 'assistant', heading: supported ? 'Review the project brief' : 'Try a sample question', text: supported ? 'The design review is waiting for an agreed project scope.' : 'This preview has prepared answers about the brief and review readiness. Choose a suggested question to continue.', findings: supported ? ['The project brief is missing.', 'Design files are available.', 'The review is scheduled for tomorrow.'] : undefined, evidence: supported ? [{ id: 'brief', label: 'Project brief checklist' }, { id: 'files', label: 'Available design files' }] : undefined, action: supported ? { id: 'review', label: 'Review checklist' } : undefined }])
    setText(''); setError(''); inputRef.current?.focus()
  }
  return <div className="dashboard-composition-preview"><div className="dashboard-assistant-preview"><ContextualAssistant title="Design assistant" subtitle="Project context" context="PRJ-2048 · Northstar refresh" contextDescription="Design review preparation" messages={messages} suggestions={['What should I review next?', 'Which evidence is missing?']} composerText={text} composerLabel="Ask about this project" composerPlaceholder="What is needed for review?" error={error} onComposerChange={value => { setText(value); setError('') }} onSend={send} inputRef={inputRef} onEvidence={(_, id) => setFeedback(id === 'brief' ? 'Brief checklist: scope confirmation is missing.' : 'Available files: design exploration and screen specifications.')} onAction={() => setFeedback('Review checklist: confirm the scope, then inspect the available design files.')} onReset={() => { setMessages([]); setText(''); setError(''); setFeedback('') }} /></div>{feedback && <p className="dashboard-preview-feedback" role="status">{feedback}</p>}</div>
}
