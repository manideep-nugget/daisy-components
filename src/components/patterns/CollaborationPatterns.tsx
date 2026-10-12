import { useRef, useState } from 'react'
import { Avatar, Button, Checkbox, Field, Input, Tab, TabList } from '@fluentui/react-components'
import { AddRegular, ArrowUndoRegular, DeleteRegular, DismissRegular, DocumentRegular, EditRegular } from '@fluentui/react-icons'
import { PatternSelect, PeoplePicker } from './PatternPrimitives'
import { PreviewTooltip } from '../PreviewPageActivity'
import { StatusBadge } from '../shared/Shared'
import './CollaborationPatterns.css'

export type CollaborationPerson = { id: string; name: string; email: string }
export type MemberAccess = 'viewer' | 'editor'
export type SharedMember = { personId: string; access: MemberAccess }

const accessOptions = [{ value: 'viewer', label: 'Viewer' }, { value: 'editor', label: 'Editor' }]

export function MemberSharing({ people, members, onMembersChange, workspaceLabel = 'Northstar' }: {
  people: CollaborationPerson[]; members: SharedMember[]; onMembersChange: (members: SharedMember[]) => void; workspaceLabel?: string
}) {
  const [recipients, setRecipients] = useState<string[]>([])
  const [access, setAccess] = useState<MemberAccess>('viewer')
  const [feedback, setFeedback] = useState('')
  const existingIds = members.map(member => member.personId)
  const availableRecipients = recipients.filter(id => !existingIds.includes(id))

  function addMembers() {
    if (!availableRecipients.length) return
    onMembersChange([...members, ...availableRecipients.map(personId => ({ personId, access }))])
    setRecipients([])
    setFeedback(`${availableRecipients.length} ${availableRecipients.length === 1 ? 'person added' : 'people added'} with ${access} access.`)
  }

  return <div className="pattern-stack collabpattern-sharing">
    <PeoplePicker people={people} selected={recipients} onChange={setRecipients} excluded={existingIds} label={`Add people to ${workspaceLabel}`} />
    <div className="pattern-row collabpattern-share-actions">
      <PatternSelect label="New member access" value={access} options={accessOptions} onChange={value => setAccess(value as MemberAccess)} />
      <Button appearance="primary" icon={<AddRegular />} disabled={!availableRecipients.length} onClick={addMembers}>Add people</Button>
    </div>
    <div className="collabpattern-list-heading"><strong>Workspace members</strong><span className="pattern-muted">{members.length} people</span></div>
    <ul className="pattern-list collabpattern-members" aria-label="Workspace members">{members.map(member => {
      const person = people.find(item => item.id === member.personId)
      if (!person) return null
      return <li className="pattern-item collabpattern-member" key={member.personId}>
        <Avatar name={person.name} size={32} />
        <div className="collabpattern-person"><strong>{person.name}</strong><span className="pattern-muted">{person.email}</span></div>
        <PatternSelect label={`Access for ${person.name}`} value={member.access} options={accessOptions} onChange={value => {
          onMembersChange(members.map(item => item.personId === member.personId ? { ...item, access: value as MemberAccess } : item))
          setFeedback(`${person.name} now has ${value} access.`)
        }} />
      </li>
    })}</ul>
    {feedback && <p className="pattern-result" role="status">{feedback}</p>}
  </div>
}

const samplePeople: CollaborationPerson[] = [
  { id: 'maya', name: 'Maya Chen', email: 'maya@northstar.example' },
  { id: 'alex', name: 'Alex Morgan', email: 'alex@northstar.example' },
  { id: 'sam', name: 'Sam Patel', email: 'sam@northstar.example' },
  { id: 'jordan', name: 'Jordan Lee', email: 'jordan@northstar.example' },
  { id: 'avery', name: 'Avery Brooks', email: 'avery@northstar.example' },
  { id: 'riley', name: 'Riley Adams', email: 'riley@northstar.example' },
]

export function MemberSharingPreview() {
  const [members, setMembers] = useState<SharedMember[]>([
    { personId: 'maya', access: 'editor' }, { personId: 'alex', access: 'editor' },
    { personId: 'sam', access: 'viewer' }, { personId: 'jordan', access: 'viewer' },
  ])
  return <MemberSharing people={samplePeople} members={members} onMembersChange={setMembers} />
}

export type AttachmentState = 'queued' | 'completed' | 'failed'
export type ManagedAttachment = { id: string; name: string; detail: string; state: AttachmentState; failure?: string }
type RemovedAttachment = { attachment: ManagedAttachment; index: number }

export function AttachmentManager({ attachments, onAttachmentsChange, onAddSample }: {
  attachments: ManagedAttachment[]; onAttachmentsChange: (attachments: ManagedAttachment[]) => void; onAddSample: () => void
}) {
  const [selected, setSelected] = useState<string[]>([])
  const [renameId, setRenameId] = useState<string | null>(null)
  const [draftName, setDraftName] = useState('')
  const [renameError, setRenameError] = useState('')
  const [removed, setRemoved] = useState<RemovedAttachment[]>([])
  const [feedback, setFeedback] = useState('')
  const renameButtons = useRef(new Map<string, HTMLElement>())
  const renameTriggerId = useRef<string | null>(null)
  const undoButton = useRef<HTMLButtonElement | null>(null)
  const currentSelected = selected.filter(id => attachments.some(item => item.id === id))
  const completed = attachments.filter(item => item.state === 'completed').length

  function cancelRename() {
    setRenameId(null)
    setRenameError('')
    requestAnimationFrame(() => {
      if (renameTriggerId.current) renameButtons.current.get(renameTriggerId.current)?.focus()
    })
  }

  function saveRename() {
    const name = draftName.trim()
    if (!name) { setRenameError('Enter an attachment name.'); return }
    if (name.length > 100) { setRenameError('Use 100 characters or fewer.'); return }
    onAttachmentsChange(attachments.map(item => item.id === renameId ? { ...item, name } : item))
    setFeedback(`Renamed attachment to ${name}.`)
    cancelRename()
  }

  function removeAttachments(ids: string[]) {
    const removedItems = attachments.flatMap((attachment, index) => ids.includes(attachment.id) ? [{ attachment, index }] : [])
    if (!removedItems.length) return
    setRemoved(removedItems)
    onAttachmentsChange(attachments.filter(item => !ids.includes(item.id)))
    setSelected(selected.filter(id => !ids.includes(id)))
    if (renameId && ids.includes(renameId)) setRenameId(null)
    setFeedback(`${removedItems.length} ${removedItems.length === 1 ? 'attachment removed' : 'attachments removed'}. You can undo this removal.`)
    requestAnimationFrame(() => undoButton.current?.focus())
  }

  function undoRemoval() {
    const restored = [...attachments]
    removed.forEach(({ attachment, index }) => {
      if (!restored.some(item => item.id === attachment.id)) restored.splice(Math.min(index, restored.length), 0, attachment)
    })
    onAttachmentsChange(restored)
    setFeedback(`${removed.length} ${removed.length === 1 ? 'attachment restored' : 'attachments restored'}.`)
    setRemoved([])
  }

  function completeAttachment(attachment: ManagedAttachment) {
    onAttachmentsChange(attachments.map(item => item.id === attachment.id ? { ...item, state: 'completed', failure: undefined } : item))
    setFeedback(`${attachment.name} ${attachment.state === 'failed' ? 'retried successfully' : 'processed'}.`)
  }

  return <div className="pattern-stack collabpattern-attachments">
    <div className="pattern-row collabpattern-toolbar">
      <Button icon={<AddRegular />} onClick={() => { onAddSample(); setFeedback('Added a queued sample attachment. Choose Process to complete it.'); }}>Add sample</Button>
      <Button icon={<DeleteRegular />} disabled={!currentSelected.length} onClick={() => removeAttachments(currentSelected)}>Remove{currentSelected.length ? ` (${currentSelected.length})` : ''}</Button>
      {!!removed.length && <Button ref={undoButton} icon={<ArrowUndoRegular />} onClick={undoRemoval}>Undo removal</Button>}
    </div>
    <div className="collabpattern-list-heading">
      <Checkbox aria-label="Select all attachments" checked={currentSelected.length && currentSelected.length === attachments.length ? true : currentSelected.length ? 'mixed' : false} disabled={!attachments.length} onChange={(_, data) => setSelected(data.checked === true ? attachments.map(item => item.id) : [])} label={`${attachments.length} attachments`} />
      <span className="pattern-muted">{completed} completed</span>
    </div>
    {!attachments.length ? <div className="pattern-empty"><DocumentRegular /><strong>No attachments</strong><p>Add a sample file or undo the latest removal.</p></div> : <ul className="pattern-list" aria-label="Attachments">{attachments.map(attachment => <li className="pattern-item collabpattern-attachment" key={attachment.id}>
      <div className="collabpattern-file-row">
        <Checkbox aria-label={`Select ${attachment.name}`} checked={currentSelected.includes(attachment.id)} onChange={(_, data) => setSelected(data.checked === true ? [...currentSelected, attachment.id] : currentSelected.filter(id => id !== attachment.id))} />
        <DocumentRegular className="collabpattern-file-icon" />
        <div className="collabpattern-file-text"><strong>{attachment.name}</strong><span className="pattern-muted">{attachment.detail}</span></div>
        <StatusBadge label={attachment.state === 'completed' ? 'Completed' : attachment.state === 'failed' ? 'Failed' : 'Queued'} intent={attachment.state === 'completed' ? 'success' : attachment.state === 'failed' ? 'danger' : 'neutral'} />
      </div>
      {attachment.state === 'failed' && <p className="collabpattern-file-failure">{attachment.failure ?? 'Processing failed. Retry this sample attachment.'}</p>}
      {renameId === attachment.id ? <div className="collabpattern-rename" onKeyDown={event => {
        if (event.key === 'Escape') { event.stopPropagation(); cancelRename() }
      }}>
        <Field label="Attachment name" validationState={renameError ? 'error' : 'none'} validationMessage={renameError || undefined}>
          <Input autoFocus value={draftName} maxLength={101} onChange={(_, data) => { setDraftName(data.value); setRenameError('') }} onKeyDown={event => { if (event.key === 'Enter') saveRename() }} />
        </Field>
        <div className="pattern-actions"><Button appearance="primary" onClick={saveRename}>Save name</Button><Button onClick={cancelRename}>Cancel</Button></div>
      </div> : <div className="pattern-actions collabpattern-file-actions">
        {attachment.state !== 'completed' && <Button appearance="primary" onClick={() => completeAttachment(attachment)}>{attachment.state === 'failed' ? 'Retry' : 'Process'}</Button>}
        <Button appearance="subtle" icon={<EditRegular />} ref={element => {
          if (element) renameButtons.current.set(attachment.id, element)
          else renameButtons.current.delete(attachment.id)
        }} onClick={() => {
          renameTriggerId.current = attachment.id
          setRenameId(attachment.id); setDraftName(attachment.name); setRenameError('')
        }}>Rename</Button>
      </div>}
    </li>)}</ul>}
    {feedback && <p className="pattern-result" role="status">{feedback}</p>}
  </div>
}

const attachmentFixtures: ManagedAttachment[] = [
  { id: 'brief', name: 'Workspace brief.pdf', detail: 'PDF · 284 KB', state: 'completed' },
  { id: 'budget', name: 'Q4 budget.xlsx', detail: 'Spreadsheet · 96 KB', state: 'queued' },
  { id: 'research', name: 'Customer research.csv', detail: 'CSV · 1.2 MB', state: 'failed', failure: 'Sample processing stopped. Retry to complete this file.' },
  { id: 'notes', name: 'Planning notes.docx', detail: 'Document · 48 KB', state: 'completed' },
]

export function AttachmentManagerPreview() {
  const [attachments, setAttachments] = useState<ManagedAttachment[]>(() => attachmentFixtures.map(item => ({ ...item })))
  const nextSample = useRef(1)
  return <AttachmentManager attachments={attachments} onAttachmentsChange={setAttachments} onAddSample={() => {
    const number = nextSample.current++
    setAttachments(items => [...items, { id: `sample-${number}`, name: `Meeting summary ${number}.pdf`, detail: 'PDF · 72 KB', state: 'queued' }])
  }} />
}

export type InboxNotification = { id: string; title: string; summary: string; detail: string; time: string; read: boolean; category: string }

export function NotificationInbox({ notifications, onNotificationsChange }: {
  notifications: InboxNotification[]; onNotificationsChange: (notifications: InboxNotification[]) => void
}) {
  const [view, setView] = useState<'all' | 'unread'>('all')
  const [inspectedId, setInspectedId] = useState<string | null>(null)
  const [dismissed, setDismissed] = useState<{ notification: InboxNotification; index: number } | null>(null)
  const [feedback, setFeedback] = useState('')
  const itemButtons = useRef(new Map<string, HTMLElement>())
  const undoButton = useRef<HTMLButtonElement | null>(null)
  const allButton = useRef<HTMLButtonElement | null>(null)
  const unreadCount = notifications.filter(item => !item.read).length
  const visible = notifications.filter(item => view === 'all' || !item.read)

  function changeRead(notification: InboxNotification) {
    onNotificationsChange(notifications.map(item => item.id === notification.id ? { ...item, read: !item.read } : item))
    setFeedback(`${notification.title} marked ${notification.read ? 'unread' : 'read'}.`)
    if (view === 'unread' && !notification.read) {
      const next = visible.find(item => item.id !== notification.id)
      requestAnimationFrame(() => next ? itemButtons.current.get(next.id)?.focus() : allButton.current?.focus())
    }
  }

  function dismiss(notification: InboxNotification) {
    setDismissed({ notification, index: notifications.findIndex(item => item.id === notification.id) })
    onNotificationsChange(notifications.filter(item => item.id !== notification.id))
    if (inspectedId === notification.id) setInspectedId(null)
    setFeedback(`Dismissed ${notification.title}. You can undo this dismissal.`)
    const next = visible.find(item => item.id !== notification.id)
    requestAnimationFrame(() => next ? itemButtons.current.get(next.id)?.focus() : undoButton.current?.focus())
  }

  function undoDismissal() {
    if (!dismissed) return
    const restored = [...notifications]
    restored.splice(Math.min(dismissed.index, restored.length), 0, dismissed.notification)
    onNotificationsChange(restored)
    setFeedback(`Restored ${dismissed.notification.title}.`)
    setDismissed(null)
  }

  return <div className="pattern-stack collabpattern-inbox">
    <div className="pattern-row collabpattern-inbox-heading">
      <TabList selectedValue={view} onTabSelect={(_, data) => setView(data.value as 'all' | 'unread')} aria-label="Notification view">
        <Tab value="all">All ({notifications.length})</Tab><Tab value="unread">Unread ({unreadCount})</Tab>
      </TabList>
      <Button appearance="subtle" disabled={!unreadCount} onClick={() => {
        onNotificationsChange(notifications.map(item => ({ ...item, read: true })))
        setFeedback(`${unreadCount} ${unreadCount === 1 ? 'notification' : 'notifications'} marked read.`)
        if (view === 'unread') requestAnimationFrame(() => allButton.current?.focus())
      }}>Mark all read</Button>
    </div>
    {!visible.length ? <div className="pattern-empty"><strong>{view === 'unread' ? 'You’re all caught up' : 'No notifications'}</strong><p>{view === 'unread' ? 'Read notifications are available in All.' : 'All sample notifications have been dismissed.'}</p>{view === 'unread' && <Button ref={allButton} onClick={() => setView('all')}>View all notifications</Button>}</div> : <ul className="pattern-list" aria-label={view === 'unread' ? 'Unread notifications' : 'All notifications'}>{visible.map(notification => <li key={notification.id} className="pattern-item collabpattern-notification">
      <div className="collabpattern-notification-top">
        <Button className="collabpattern-notice-open" appearance="subtle" aria-expanded={inspectedId === notification.id} aria-controls={`notification-detail-${notification.id}`} ref={element => {
          if (element) itemButtons.current.set(notification.id, element)
          else itemButtons.current.delete(notification.id)
        }} onClick={() => setInspectedId(inspectedId === notification.id ? null : notification.id)}>
          <span className="collabpattern-notice-content"><strong>{notification.title}</strong><span className="pattern-muted">{notification.summary}</span></span>
        </Button>
        <PreviewTooltip content={`Dismiss ${notification.title}`} relationship="label"><Button appearance="subtle" icon={<DismissRegular />} aria-label={`Dismiss ${notification.title}`} onClick={() => dismiss(notification)} /></PreviewTooltip>
      </div>
      <div className="collabpattern-notification-bottom"><span className="pattern-muted">{notification.time}</span><StatusBadge label={notification.read ? 'Read' : 'Unread'} intent={notification.read ? 'neutral' : 'info'} /><Button appearance="subtle" onClick={() => changeRead(notification)}>{notification.read ? 'Mark unread' : 'Mark read'}</Button></div>
      <div className="collabpattern-notice-detail" id={`notification-detail-${notification.id}`} hidden={inspectedId !== notification.id}>
        <strong>{notification.category}</strong><p>{notification.detail}</p>
      </div>
    </li>)}</ul>}
    {!!dismissed && <Button ref={undoButton} className="collabpattern-undo" icon={<ArrowUndoRegular />} onClick={undoDismissal}>Undo dismissal</Button>}
    {feedback && <p className="pattern-result" role="status">{feedback}</p>}
  </div>
}

const notificationFixtures: InboxNotification[] = [
  { id: 'mention', title: 'Maya mentioned you', summary: 'Q4 budget · Planning workspace', detail: 'Maya asked you to review the revised research budget before the planning meeting. The sample budget is ready for your comments.', time: '5 minutes ago', read: false, category: 'Mention' },
  { id: 'refresh', title: 'Customer data refreshed', summary: 'Customer insights · Refresh complete', detail: 'The daily sample refresh completed successfully. All four customer data sources are available in the workspace.', time: '28 minutes ago', read: true, category: 'Data refresh' },
  { id: 'access', title: 'Avery requested access', summary: 'Northstar workspace · Viewer access', detail: 'Avery Brooks requested permission to view the Northstar planning files. This notification is a fixture; role changes are available in the sharing example.', time: '1 hour ago', read: false, category: 'Access request' },
  { id: 'approved', title: 'Workspace review approved', summary: 'Operations · Monthly review', detail: 'The operations review is complete. The review owner approved the sample workspace configuration with no follow-up tasks.', time: '2 hours ago', read: false, category: 'Review update' },
]

export function NotificationInboxPreview() {
  const [notifications, setNotifications] = useState<InboxNotification[]>(() => notificationFixtures.map(item => ({ ...item })))
  return <NotificationInbox notifications={notifications} onNotificationsChange={setNotifications} />
}
