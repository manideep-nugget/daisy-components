import { useId, type CSSProperties, type ReactNode } from 'react'
import {
  Badge, Button, DataGrid, DataGridBody, DataGridCell, DataGridHeader, DataGridHeaderCell, DataGridRow,
  useRestoreFocusTarget, type DataGridProps, type TableColumnDefinition, type TableRowId,
} from '@fluentui/react-components'
import { CheckmarkCircle20Regular, Document20Regular, Info20Regular, Sparkle20Regular, Warning20Regular } from '@fluentui/react-icons'
import type { ActivityEvent, ClaimDocument, DaisyAction, DaisyMessage, DaisySource } from '../../claimwatch/types'
import './Shared.css'

type Intent = 'success' | 'warning' | 'danger' | 'info' | 'neutral'
const badgeColors = { success: 'success', warning: 'warning', danger: 'danger', info: 'informative', neutral: 'subtle' } as const

export function StatusBadge({ label, intent = 'neutral' }: { label: string; intent?: Intent }) {
  return <Badge className="shared-status-badge" size="large" shape="rounded" appearance="tint" color={badgeColors[intent]}>{label}</Badge>
}

export function AttentionCard({ title, description, actionLabel, actionAppearance = 'primary', onAction, secondaryLabel, onSecondary, intent = 'info', children }: {
  title: string; description: string; actionLabel?: string; onAction?: () => void; secondaryLabel?: string;
  actionAppearance?: 'primary' | 'secondary'; onSecondary?: () => void; intent?: Intent; children?: ReactNode;
}) {
  const headingId = useId()
  const restoreFocusTarget = useRestoreFocusTarget()
  const Icon = intent === 'success' ? CheckmarkCircle20Regular : intent === 'warning' || intent === 'danger' ? Warning20Regular : Info20Regular
  return <article className={`shared-attention shared-attention-${intent}`} aria-labelledby={headingId}>
    <span className="shared-attention-icon"><Icon /></span>
    <div className="shared-attention-content"><h3 id={headingId}>{title}</h3><p>{description}</p>{children}
      {(actionLabel || secondaryLabel) && <div className="shared-attention-actions">
        {actionLabel && <Button {...restoreFocusTarget} appearance={actionAppearance} onClick={onAction}>{actionLabel}</Button>}
        {secondaryLabel && <Button {...restoreFocusTarget} appearance="subtle" onClick={onSecondary}>{secondaryLabel}</Button>}
      </div>}
    </div>
  </article>
}

export function FactList({ items, columns = 1 }: { items: { label: string; value: ReactNode }[]; columns?: 1 | 2 }) {
  return <dl className="shared-facts" data-columns={columns}>{items.map(item => <div className="shared-fact" key={item.label}>
    <dt>{item.label}</dt><dd>{item.value}</dd>
  </div>)}</dl>
}

export function EvidenceList({ documents, onPreview }: { documents: ClaimDocument[]; onPreview: (document: ClaimDocument) => void }) {
  const restoreFocusTarget = useRestoreFocusTarget()
  return <ul className="shared-evidence-list">{documents.map(document => <li key={document.id}>
    <span className={`shared-document-icon ${document.status === 'Missing' ? 'shared-document-missing' : ''}`}><Document20Regular /></span>
    <div className="shared-document-description"><strong>{document.name}</strong><span>{document.kind} · {document.uploaded}</span></div>
    <StatusBadge label={document.status} intent={document.status === 'Missing' ? 'warning' : 'success'} />
    {document.status === 'Available' && <Button {...restoreFocusTarget} appearance="secondary" onClick={() => onPreview(document)} aria-label={`Preview ${document.name}`}>Preview</Button>}
  </li>)}</ul>
}

function eventDate(value: string) {
  const date = new Date(value)
  return Number.isNaN(date.valueOf()) ? value : date.toLocaleString('en-GB', { timeZone: 'Asia/Kolkata', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit', hour12: true })
}

export function WorkflowTimeline({ events }: { events: ActivityEvent[] }) {
  if (!events.length) return <p className="shared-empty-timeline">No activity recorded. Add a note to start the claim history.</p>
  return <ol className="shared-timeline">{[...events].sort((a, b) => new Date(b.time).valueOf() - new Date(a.time).valueOf()).map(event => <li key={event.id}>
    <span className={`shared-timeline-marker shared-timeline-marker-${event.type}`} aria-hidden="true" />
    <div><div className="shared-timeline-heading"><strong>{event.title}</strong><time dateTime={event.time}>{eventDate(event.time)} IST</time></div><p>{event.detail}</p></div>
  </li>)}</ol>
}

export function DaisyAnswerCard({ message, onSource, onAction }: { message: DaisyMessage; onSource: (source: DaisySource) => void; onAction: (action: DaisyAction) => void }) {
  const restoreFocusTarget = useRestoreFocusTarget()
  if (message.role === 'user') return <div className="shared-daisy-user"><strong>You</strong><p>{message.text}</p></div>
  return <article className="shared-daisy-answer">
    <div className="shared-daisy-answer-label"><span className="shared-daisy-mark" aria-hidden="true"><Sparkle20Regular /></span><strong>Daisy</strong></div>
    {message.heading && <h3>{message.heading}</h3>}<p>{message.text}</p>
    {!!message.findings?.length && <ul className="shared-daisy-findings">{message.findings.slice(0, 3).map(finding => <li key={finding}>{finding}</li>)}</ul>}
    {!!message.sources?.length && <details className="shared-daisy-evidence"><summary>View supporting evidence</summary><div>
      {message.sources.map(source => <Button {...restoreFocusTarget} appearance="subtle" key={`${source.tab}-${source.label}`} onClick={() => onSource(source)} icon={<Document20Regular />}>{source.label}</Button>)}
    </div></details>}
    {message.action && message.actionLabel && <Button {...restoreFocusTarget} className="shared-daisy-answer-action" appearance="primary" onClick={() => onAction(message.action!)}>{message.actionLabel}</Button>}
  </article>
}

export type DataTableProps<T> = {
  items: T[]; columns: TableColumnDefinition<T>[]; getRowId: (item: T) => TableRowId; ariaLabel: string;
  getRowLabel?: (item: T) => string; selectedItems?: Set<TableRowId>; onSelectionChange?: (ids: Set<TableRowId>) => void;
  sortState?: DataGridProps['sortState']; onSortChange?: (state: NonNullable<DataGridProps['sortState']>) => void;
}

export function DataTable<T>({ items, columns, getRowId, ariaLabel, getRowLabel, selectedItems, onSelectionChange, sortState, onSortChange }: DataTableProps<T>) {
  const selectable = !!onSelectionChange
  const gridWidth = Math.max(520, columns.length * 165)
  return <div className="shared-table-scroll" role="region" aria-label={`${ariaLabel}; scroll horizontally if needed`} tabIndex={0} style={{ '--shared-grid-width': `${gridWidth}px` } as CSSProperties}>
    <DataGrid className="shared-data-grid" items={items} columns={columns} getRowId={getRowId} sortable={!!onSortChange}
      sortState={sortState} onSortChange={(_, state) => onSortChange?.(state)}
      selectionMode={selectable ? 'multiselect' : undefined} selectedItems={selectedItems}
      onSelectionChange={(_, data) => onSelectionChange?.(new Set(data.selectedItems))} focusMode="composite" aria-label={ariaLabel}>
      <DataGridHeader><DataGridRow className="shared-data-header" selectionCell={selectable ? { checkboxIndicator: { 'aria-label': 'Select all visible records' } } : undefined}>
        {({ renderHeaderCell, columnId }) => ['actions', 'action', 'details'].includes(String(columnId))
          ? <DataGridCell className={`shared-column-${String(columnId)}`} role="columnheader" focusMode="none">{renderHeaderCell()}</DataGridCell>
          : <DataGridHeaderCell className={`shared-column-${String(columnId)}`}>{renderHeaderCell()}</DataGridHeaderCell>}
      </DataGridRow></DataGridHeader>
      <DataGridBody<T>>{({ item, rowId }) => <DataGridRow<T> key={rowId} className="shared-data-row" selectionCell={selectable ? { checkboxIndicator: { 'aria-label': `Select ${getRowLabel?.(item) || String(rowId)}` } } : undefined}>
        {({ renderCell, columnId }) => <DataGridCell className={`shared-column-${String(columnId)}`}>{renderCell(item)}</DataGridCell>}
      </DataGridRow>}</DataGridBody>
    </DataGrid>
  </div>
}
