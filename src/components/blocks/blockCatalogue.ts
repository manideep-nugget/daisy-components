import { lazy, type ComponentType, type LazyExoticComponent } from 'react'

export type BlockDefinition = {
  id: string
  name: string
  description: string
  keywords: string[]
  notes: string
  Preview: LazyExoticComponent<ComponentType>
}

// Metadata stays available to the app shell without loading any block implementation.
export const blockCatalogue: BlockDefinition[] = [
  { id: 'activity-centre', name: 'Activity centre', description: 'Notifications and a shared history in one focused workspace.', keywords: ['inbox', 'notifications', 'timeline', 'comments', 'updates'], notes: 'Switch between the inbox and timeline, mark messages read, or dismiss and restore a notification.', Preview: lazy(() => import('./ExpandedBlocks').then(module => ({ default: module.ActivityCentrePreview }))) },
  { id: 'file-workspace', name: 'File workspace', description: 'Navigate folders and manage the files inside each destination.', keywords: ['files', 'folders', 'tree', 'attachments', 'rename', 'retry', 'undo'], notes: 'Choose a folder, add a sample file, process or retry it, and undo a removal. Each folder keeps its own files.', Preview: lazy(() => import('./ExpandedBlocks').then(module => ({ default: module.FileWorkspacePreview }))) },
  { id: 'metrics-dashboard', name: 'Metrics dashboard', description: 'Period comparisons, activity, and service health for a sample workspace.', keywords: ['analytics', 'metrics', 'range', 'overview', 'health'], notes: 'Change the time range to compare sample workspace metrics.', Preview: lazy(() => import('./EnterpriseBlocks').then(module => ({ default: module.MetricsDashboardPreview }))) },
  { id: 'multi-section-form', name: 'Multi-section form', description: 'Project details, access, and preferences with a live review summary.', keywords: ['forms', 'validation', 'members', 'people', 'access', 'configuration'], notes: 'Edit the sections, choose reviewers, and save. Required fields report actionable errors; Reset draft restores the last saved values.', Preview: lazy(() => import('./ExpandedBlocks').then(module => ({ default: module.MultiSectionFormPreview }))) },
  { id: 'operations-dashboard', name: 'Operations dashboard', description: 'A team queue with priority work, recent records, and a contextual assistant.', keywords: ['tasks', 'queue', 'dashboard', 'assistant', 'evidence', 'records'], notes: 'Review a task, complete it, open a recent record, or ask a prepared question and inspect the supporting evidence.', Preview: lazy(() => import('./ExpandedBlocks').then(module => ({ default: module.OperationsDashboardPreview }))) },
  { id: 'project-table', name: 'Project table', description: 'A sortable and selectable project list with search and record details.', keywords: ['data', 'table', 'datagrid', 'selection', 'search', 'filter', 'sort'], notes: 'Search, filter, sort columns, select rows, or open a project.', Preview: lazy(() => import('./EnterpriseBlocks').then(module => ({ default: module.ProjectTablePreview }))) },
  { id: 'record-inspector', name: 'Record inspector', description: 'Record editing, ownership, and a linked history in a two-pane layout.', keywords: ['record', 'drawer', 'inspection', 'details', 'editing', 'draft', 'activity'], notes: 'Choose a record to inspect its details, edit it in a drawer, and compare the updated summary and history. Closing the editor retains its draft.', Preview: lazy(() => import('./ExpandedBlocks').then(module => ({ default: module.RecordInspectorPreview }))) },
  { id: 'settings-form', name: 'Settings form', description: 'Workspace identity, visibility, and notification preferences.', keywords: ['settings', 'forms', 'workspace', 'email', 'notifications', 'validation'], notes: 'Edit the settings, try validation, save your changes, or reset the defaults.', Preview: lazy(() => import('./EnterpriseBlocks').then(module => ({ default: module.SettingsFormPreview }))) },
  { id: 'team-access', name: 'Team access', description: 'A searchable directory, member roles, and workspace visibility.', keywords: ['team', 'people', 'directory', 'sharing', 'members', 'permissions', 'roles', 'access'], notes: 'Search the synthetic directory, add sample members, change their roles, and compare workspace visibility. No real invitations are sent.', Preview: lazy(() => import('./ExpandedBlocks').then(module => ({ default: module.TeamAccessPreview }))) },
].sort((a, b) => a.name.localeCompare(b.name))

export const blockCounts = { all: blockCatalogue.length }

export function filterBlocks(query: string) {
  const search = query.trim().toLowerCase()
  return blockCatalogue.filter(block => `${block.name} ${block.description} ${block.keywords.join(' ')}`.toLowerCase().includes(search))
}
