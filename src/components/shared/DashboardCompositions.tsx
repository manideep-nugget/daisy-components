import { useEffect, useRef, type RefObject } from 'react'
import { Avatar, Button, Field, Textarea, useId, useRestoreFocusTarget } from '@fluentui/react-components'
import { ArrowRight20Regular, ArrowUp20Regular, CheckmarkCircle20Regular, Dismiss20Regular, Document20Regular, Sparkle20Regular, SquareMultiple20Regular } from '@fluentui/react-icons'
import { StatusBadge } from './Shared'
import './DashboardCompositions.css'

export type DashboardIntent = 'success' | 'warning' | 'danger' | 'info' | 'neutral'
export type PriorityTaskItem = {
  id: string; title: string; reason: string; owner: string; member: string; recordId: string;
  condition: string; conditionIntent: DashboardIntent; deadline: string; deadlineISO?: string;
  overdue?: boolean; priorityExplanation?: string; actionLabel: string; secondaryLabel?: string;
}
export function PriorityTaskList({ items, onAction, onSecondary, emptyTitle = 'No work needs attention', emptyDescription = 'Your priority list is clear.' }: {
  items: PriorityTaskItem[]; onAction: (id: string) => void; onSecondary?: (id: string) => void;
  emptyTitle?: string; emptyDescription?: string;
}) {
  const restoreFocusTarget = useRestoreFocusTarget()
  if (!items.length) return <div className="dashboard-empty"><CheckmarkCircle20Regular /><div><h3>{emptyTitle}</h3><p>{emptyDescription}</p></div></div>
  return <div className="dashboard-priority-list">{items.map((item, index) => <article key={item.id} className={`dashboard-priority-task${index === 0 ? ' is-featured' : ''}`} aria-label={item.title}>
    <div className="dashboard-task-status"><StatusBadge label={item.condition} intent={item.conditionIntent} />{item.overdue && <StatusBadge label="Overdue" intent="danger" />}</div>
    <div className="dashboard-task-body"><h3>{item.title}</h3><p className="dashboard-task-reason">{item.reason}</p>
      <div className="dashboard-task-identity"><strong>{item.member}</strong><span>{item.recordId}</span></div>
      <div className="dashboard-task-meta"><span>Owner: {item.owner}</span><time dateTime={item.deadlineISO}>{item.deadline}</time></div>
      {index === 0 && item.priorityExplanation && <p className="dashboard-task-rationale">{item.priorityExplanation}</p>}
    </div>
    <div className="dashboard-task-actions"><Button {...restoreFocusTarget} appearance={index === 0 ? 'primary' : 'secondary'} aria-label={`${item.actionLabel} for ${item.member}, ${item.recordId}`} onClick={() => onAction(item.id)}>{item.actionLabel}</Button>{index === 0 && item.secondaryLabel && onSecondary && <Button {...restoreFocusTarget} appearance="subtle" aria-label={`${item.secondaryLabel} for ${item.member}, ${item.recordId}`} onClick={() => onSecondary(item.id)}>{item.secondaryLabel}</Button>}</div>
  </article>)}</div>
}

export type RecentRecordItem = { id: string; name: string; status: string; intent?: DashboardIntent; updated: string; updatedISO?: string; openLabel?: string }
export function RecentRecordList({ items, onOpen, emptyDescription = 'No records have been updated yet.' }: {
  items: RecentRecordItem[]; onOpen: (id: string) => void; emptyDescription?: string;
}) {
  if (!items.length) return <p className="dashboard-list-empty">{emptyDescription}</p>
  return <ul className="dashboard-recent-list">{items.map(item => <li key={item.id}>
    <Avatar name={item.name} size={32} color="neutral" />
    <div className="dashboard-record-identity"><strong>{item.name}</strong><time dateTime={item.updatedISO}>Updated {item.updated}</time></div>
    <Button className="dashboard-record-open" appearance="subtle" icon={<ArrowRight20Regular />} aria-label={item.openLabel ?? `Open ${item.name}, ${item.id}`} onClick={() => onOpen(item.id)} />
    <div className="dashboard-record-detail"><span className="dashboard-record-id">{item.id}</span><StatusBadge label={item.status} intent={item.intent} /></div>
  </li>)}</ul>
}

export type QueueMetric = { id: string; label: string; value: number; unit: string }
export function QueueSummary({ items, ariaLabel = 'Queue summary' }: { items: QueueMetric[]; ariaLabel?: string }) {
  return <dl className="dashboard-queue-summary" aria-label={ariaLabel}>{items.map(item => <div key={item.id}><dt>{item.label}</dt><dd><strong>{item.value}</strong><span>{item.value === 1 && ['tasks', 'requests', 'records'].includes(item.unit) ? item.unit.slice(0, -1) : item.unit}</span></dd></div>)}</dl>
}

export type AssistantEvidence = { id: string; label: string }
export type AssistantMessage = { id: string; role: 'user' | 'assistant'; text: string; heading?: string; findings?: string[]; evidence?: AssistantEvidence[]; action?: { id: string; label: string } }
export type ContextualAssistantProps = {
  title?: string; subtitle?: string; context: string; contextDescription: string; messages: AssistantMessage[]; suggestions: string[];
  composerText: string; composerLabel: string; composerPlaceholder?: string; error?: string; footer?: string;
  onComposerChange: (text: string) => void; onSend: (text: string) => void; onEvidence: (messageId: string, evidenceId: string) => void;
  onAction: (messageId: string, actionId: string) => void; onClose?: () => void; onReset?: () => void;
  emptyTitle?: string; emptyDescription?: string; inputRef?: RefObject<HTMLTextAreaElement | null>; logRef?: RefObject<HTMLDivElement | null>;
}
export function ContextualAssistant({ title = 'Assistant', subtitle = 'Context and next steps', context, contextDescription, messages, suggestions, composerText, composerLabel, composerPlaceholder, error, footer = 'Prepared sample responses', onComposerChange, onSend, onEvidence, onAction, onClose, onReset, emptyTitle = 'Start with the information in front of you', emptyDescription = 'Choose a suggestion or ask a question to see a concise answer with supporting evidence.', inputRef, logRef }: ContextualAssistantProps) {
  const titleId = useId('assistant-heading')
  const internalInput = useRef<HTMLTextAreaElement>(null)
  const internalLog = useRef<HTMLDivElement>(null)
  const textareaRef = inputRef ?? internalInput
  const messagesRef = logRef ?? internalLog
  const restoreFocusTarget = useRestoreFocusTarget()
  useEffect(() => { messagesRef.current?.lastElementChild?.scrollIntoView({ behavior: 'instant', block: 'start' }) }, [messages.length, context, messagesRef])
  return <section className="dashboard-assistant" aria-labelledby={titleId}>
    <header className="dashboard-assistant-header"><div><Sparkle20Regular /><div><h2 id={titleId}>{title}</h2><p>{subtitle}</p></div></div><div className="dashboard-assistant-header-actions">{onReset && <Button appearance="subtle" icon={<SquareMultiple20Regular />} aria-label={`Start a new ${title} conversation`} onClick={onReset} />}{onClose && <Button appearance="subtle" icon={<Dismiss20Regular />} aria-label={`Close ${title}`} onClick={onClose} />}</div></header>
    <div className="dashboard-assistant-context"><Document20Regular /><div><strong>{context}</strong><span>{contextDescription}</span></div></div>
    <div className="dashboard-assistant-suggestions"><h3>{messages.length ? 'Ask a follow-up' : 'Suggested questions'}</h3><div>{suggestions.map(prompt => <Button key={prompt} appearance="secondary" onClick={() => onSend(prompt)}>{prompt}</Button>)}</div></div>
    <div className="dashboard-assistant-scroll">{!messages.length && <div className="dashboard-assistant-welcome"><h3>{emptyTitle}</h3><p>{emptyDescription}</p></div>}
      <div ref={messagesRef} className="dashboard-assistant-log" role="log" aria-label={`${title} conversation`} aria-live="polite" aria-relevant="additions" aria-atomic="false">{messages.map(message => message.role === 'user' ? <div className="dashboard-assistant-user" key={message.id}><strong>You</strong><p>{message.text}</p></div> : <article className="dashboard-assistant-answer" key={message.id}>
        {message.heading && <h3>{message.heading}</h3>}<p>{message.text}</p>{!!message.findings?.length && <ul>{message.findings.slice(0, 3).map(finding => <li key={finding}>{finding}</li>)}</ul>}
        {!!message.evidence?.length && <details><summary>View supporting evidence</summary><div>{message.evidence.map(source => <Button {...restoreFocusTarget} appearance="subtle" icon={<Document20Regular />} key={source.id} onClick={() => onEvidence(message.id, source.id)}>{source.label}</Button>)}</div></details>}
        {message.action && <Button {...restoreFocusTarget} appearance="primary" onClick={() => onAction(message.id, message.action!.id)}>{message.action.label}</Button>}
      </article>)}</div>
    </div>
    <form className="dashboard-assistant-composer" onSubmit={event => { event.preventDefault(); onSend(composerText) }}><Field label={composerLabel} validationState={error ? 'error' : 'none'} validationMessage={error}><Textarea ref={textareaRef} value={composerText} placeholder={composerPlaceholder} resize="none" onChange={(_, data) => onComposerChange(data.value)} onKeyDown={event => { if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) { event.preventDefault(); onSend(composerText) } }} /></Field><div><span>{footer}</span><Button appearance="primary" icon={<ArrowUp20Regular />} type="submit" aria-label={`Send question to ${title}`} /></div></form>
  </section>
}
