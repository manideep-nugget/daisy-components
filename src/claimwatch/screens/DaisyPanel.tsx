import { useEffect, useRef, useState } from 'react'
import { ContextualAssistant, type AssistantMessage } from '../../components/shared/DashboardCompositions'
import { useClaimWatch } from '../useClaimWatch'
import type { DaisyAction, DaisySource, DetailTab } from '../types'
import './DaisyPanel.css'

export type DaisyPanelProps = {
  contextId: string | null
  onClose: () => void
  onOpenClaim: (id: string, tab?: DetailTab) => void
  onOpenWorkbench: () => void
  onRequestInfo: (id: string) => void
}

export function DaisyPanel({ contextId, onClose, onOpenClaim, onOpenWorkbench, onRequestInfo }: DaisyPanelProps) {
  const { claims, messages, sendDaisy, resetDaisy } = useClaimWatch()
  const claim = claims.find((item) => item.id === contextId)
  const conversation = messages[contextId ?? 'workspace'] ?? []
  const [text, setText] = useState('')
  const [error, setError] = useState('')
  const logRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const lastContextRef = useRef(contextId)
  const prompts = claim ? ['What is the next intake step?', 'Which documents are missing?', 'Explain the recorded findings'] : ['What needs my attention?', 'Prioritize my intake queue', 'Summarize open tasks']

  useEffect(() => {
    if (lastContextRef.current !== contextId) {
      setText('')
      setError('')
      lastContextRef.current = contextId
    }
    logRef.current?.lastElementChild?.scrollIntoView({ behavior: 'instant', block: 'start' })
  }, [conversation.length, contextId])

  function send(prompt: string) {
    if (!prompt.trim()) {
      setError('Enter a question or choose a suggestion.')
      inputRef.current?.focus()
      return
    }
    sendDaisy(contextId, prompt.trim())
    setText('')
    setError('')
    inputRef.current?.focus()
  }

  function openSource(source: DaisySource) {
    if (contextId) onOpenClaim(contextId, source.tab)
  }

  function action(actionName: DaisyAction, preferredTab: DetailTab = 'overview') {
    if (actionName === 'open-workbench') onOpenWorkbench()
    else if (contextId) {
      if (actionName === 'request-info') onRequestInfo(contextId)
      else onOpenClaim(contextId, actionName === 'documents' ? 'documents' : preferredTab)
    }
  }

  const presentationMessages: AssistantMessage[] = conversation.map(message => ({
    id: message.id, role: message.role, text: message.text, heading: message.heading, findings: message.findings,
    evidence: message.sources?.map((source, index) => ({ id: String(index), label: source.label })),
    action: message.action && message.actionLabel ? { id: message.action, label: message.actionLabel } : undefined,
  }))
  return <ContextualAssistant title="Daisy" subtitle="Your intake assistant" context={claim ? claim.id : 'Intake workspace'} contextDescription={claim ? claim.member : 'Your current queue and open tasks'} messages={presentationMessages} suggestions={prompts} composerText={text} composerLabel={claim ? 'Ask about this claim' : 'Ask about your work'} composerPlaceholder={claim ? 'What should I review next?' : 'What needs my attention?'} error={error} footer="Sample responses · No live AI" inputRef={inputRef} logRef={logRef} onClose={onClose} onReset={() => { resetDaisy(contextId); setText(''); setError(''); inputRef.current?.focus() }} onComposerChange={value => { setText(value); setError('') }} onSend={send} onEvidence={(messageId, sourceId) => {
    const source = conversation.find(message => message.id === messageId)?.sources?.[Number(sourceId)]
    if (source) openSource(source)
  }} onAction={(messageId, actionName) => {
    const message = conversation.find(item => item.id === messageId)
    action(actionName as DaisyAction, message?.sources?.[0]?.tab)
  }} emptyTitle="Turn claim context into a clear next step" emptyDescription="Ask about evidence, recorded findings, or intake work. Answers link back to the information in this sample workspace." />
}
