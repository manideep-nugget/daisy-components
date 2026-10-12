export type ClaimStatus = 'Received' | 'Incomplete' | 'In review' | 'Clinical review' | 'Approved' | 'Paid'
export type RiskBand = 'Low' | 'Medium' | 'High'
export type DetailTab = 'overview' | 'documents' | 'assessment' | 'workflow'
export type ClaimDocument = { id: string; name: string; kind: string; status: 'Available' | 'Missing'; uploaded: string; content: string }
export type ClaimRecord = {
  id: string; member: string; memberId: string; policyId: string; provider: string; providerId: string;
  country: string; type: string; currency: string; billedAmount: number; approvedAmount: number | null;
  status: ClaimStatus; riskScore: number; riskBand: RiskBand; decision: string; decisionReason: string;
  submitted: string; updated: string; intakeStage: 'received' | 'documents' | 'ready' | 'handed-off';
  documents: ClaimDocument[]; diagnoses: { code: string; description: string }[]; procedures: { code: string; description: string }[];
  serviceLines: { code: string; description: string; quantity: number; unitPrice: number; amount: number }[];
  eligibility: { policyActive: boolean; coverage: string; benefit: string };
  coding: { recognized: boolean; consistency: string; catalogue: string; carePathway: string };
  findings: { id: string; title: string; detail: string; severity: 'info' | 'warning' | 'danger' }[];
}
export type IntakeTask = { id: string; claimId: string; title: string; reason: string; owner: string | null; due: string; overdue: boolean; priority: 'high' | 'normal'; state: 'open' | 'completed' | 'automatic'; kind: 'review' | 'documents' | 'exception' }
export type InfoRequest = { id: string; claimId: string; documents: string[]; message: string; status: 'Pending' | 'Received'; created: string }
export type ActivityEvent = { id: string; claimId: string; title: string; detail: string; time: string; type: 'note' | 'task' | 'request' | 'submission' | 'handoff' | 'assessment' }
export type DaisySource = { label: string; tab: DetailTab }
export type DaisyAction = 'request-info' | 'open-workbench' | 'open-claim' | 'documents'
export type DaisyMessage = { id: string; role: 'user' | 'assistant'; text: string; heading?: string; findings?: string[]; sources?: DaisySource[]; action?: DaisyAction; actionLabel?: string }
export type NewClaimInput = { member: string; provider: string; amount: number; type: string; country: string }
export type ExplorerFilters = { search: string; status: string; risk: string; country: string; type: string; decision: string; provider: string; member: string; currency: string; sortColumn: string; sortDirection: 'ascending' | 'descending'; page: number; selectedIds: string[]; scrollTop: number }
export type ScreenNavigation = { onOpenClaim: (id: string, tab?: DetailTab) => void; onOpenWorkbench: () => void; onAskDaisy: (prompt?: string, claimId?: string) => void }
