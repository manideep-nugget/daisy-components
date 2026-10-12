import type { ActivityEvent, ClaimRecord, ClaimStatus, ExplorerFilters, InfoRequest, IntakeTask, NewClaimInput } from './types'

export const initialExplorerFilters: ExplorerFilters = {
  search: '', status: '', risk: '', country: '', type: '', decision: '', provider: '', member: '', currency: '',
  sortColumn: 'claim', sortDirection: 'ascending', page: 0, selectedIds: [], scrollTop: 0,
}

const members = ['Nora Williams', 'Julian Reed', 'Amara Okafor', 'Ethan Brooks', 'Leila Chen', 'Mateo Silva', 'Aisha Khan', 'Owen Clarke', 'Sofia Laurent', 'Noah Walker', 'Mina Park', 'Oliver Grant']
const providers = ['City Hospital', 'Rideau Orthopaedic Centre', 'Northfield Medical', 'Harbour Health', 'Cedar Oncology', 'Valley Diagnostics']
const statuses: ClaimStatus[] = ['Incomplete', 'Clinical review', 'In review', 'Received', 'Approved', 'Paid', 'Incomplete', 'In review', 'Clinical review', 'Approved', 'Received', 'Paid']
const amounts = [9810, 59450, 2620, 1740, 8378, 4590, 1250, 7850, 18400, 279, 3400, 1150]
const scores = [35, 84, 26, 12, 35, 14, 22, 47, 72, 18, 29, 9]

export function createClaimFixture(input: NewClaimInput, id: string, index = 0): ClaimRecord {
  const status = statuses[index % statuses.length]
  const missing = status === 'Incomplete'
  const providerIndex = index % providers.length
  const prefix = id.replaceAll('-', '')
  const time = `2026-10-${String(12 - Math.floor(index / 3)).padStart(2, '0')}T${String(9 + index % 3).padStart(2, '0')}:20:00+05:30`
  const riskScore = scores[index % scores.length]
  const decision = status === 'Approved' || status === 'Paid' ? 'Approve with monitoring' : status === 'Clinical review' ? 'Clinical review required' : 'Pending intake review'
  return {
    id, member: input.member, memberId: `MBR-${String(4201 + index)}`, policyId: `POL-${String(583710 + index)}`,
    provider: input.provider, providerId: `PRV-${String(100 + providerIndex)}`, country: input.country, type: input.type,
    currency: 'USD', billedAmount: input.amount, approvedAmount: status === 'Approved' || status === 'Paid' ? Math.round(input.amount * 0.86 * 100) / 100 : null,
    status, riskScore, riskBand: riskScore >= 70 ? 'High' : riskScore >= 40 ? 'Medium' : 'Low', decision,
    decisionReason: status === 'Clinical review' ? 'A recorded frequency signal needs a reviewer to inspect the supporting evidence.' : missing ? 'Intake is awaiting a referral before the claim can proceed.' : 'Recorded sample assessment; intake verification is separate from the decision.',
    submitted: time, updated: time, intakeStage: missing ? 'documents' : status === 'Received' ? 'received' : status === 'Paid' || status === 'Approved' ? 'handed-off' : 'ready',
    documents: [
      { id: `${prefix}-invoice`, name: 'Itemized invoice', kind: 'Invoice', status: 'Available', uploaded: '12 Oct 2026', content: `Synthetic invoice for ${input.member}. Provider: ${input.provider}. Total billed: USD ${input.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}. Sample service: outpatient consultation and treatment. This is fictional evidence for interface review.` },
      { id: `${prefix}-referral`, name: 'Specialist referral', kind: 'Referral', status: missing ? 'Missing' : 'Available', uploaded: missing ? 'Not received' : '12 Oct 2026', content: missing ? 'The sample referral has not been received. Request it from the provider to complete the intake checklist.' : `Synthetic referral for ${input.member}. Referring clinician: Dr. Avery Morgan. Referral reason: planned outpatient assessment. This is fictional evidence for interface review.` },
      { id: `${prefix}-policy`, name: 'Coverage confirmation', kind: 'Policy', status: 'Available', uploaded: '11 Oct 2026', content: `Synthetic coverage confirmation. Policy POL-${583710 + index} is active through 31 December 2026. Outpatient care is included, subject to a sample USD 250 deductible. This is fictional evidence for interface review.` },
    ],
    diagnoses: [{ code: 'Z51.11', description: 'Encounter for antineoplastic chemotherapy' }],
    procedures: [{ code: '96413', description: 'Chemotherapy administration, initial hour' }],
    serviceLines: [{ code: '96413', description: 'Outpatient administration and care', quantity: 1, unitPrice: input.amount, amount: input.amount }],
    eligibility: { policyActive: true, coverage: 'Outpatient care included', benefit: 'USD 250 deductible; sample annual limit USD 75,000' },
    coding: { recognized: true, consistency: 'Diagnosis and procedure pairing is supported in the sample catalogue.', catalogue: 'Synthetic ICD-10-CM catalogue • 2026 review fixture', carePathway: 'The recorded sample pairing follows an outpatient treatment pathway.' },
    findings: riskScore >= 70 ? [
      { id: `${prefix}-finding1`, title: 'Higher submission frequency', detail: 'Nine sample claims were submitted by this provider in the last 30 days. Review the recorded pattern and supporting documents.', severity: 'warning' },
      { id: `${prefix}-finding2`, title: 'Review supporting evidence', detail: 'The recorded signal is a review prompt. It does not establish fraud or change the claim decision.', severity: 'info' },
    ] : [{ id: `${prefix}-finding1`, title: 'No additional intake hold recorded', detail: 'The sample assessment contains no additional intake findings. Verify completeness before handing off.', severity: 'info' }],
  }
}

export const initialClaims: ClaimRecord[] = members.map((member, index) => createClaimFixture({
  member, provider: providers[index % providers.length], amount: amounts[index],
  type: index % 3 === 0 ? 'Direct billing' : 'Reimbursement', country: index % 4 === 0 ? 'US' : 'CA',
}, `CLM-2026-${1048 + index}`, index))

export const initialTasks: IntakeTask[] = [
  { id: 'TSK-0141', claimId: 'CLM-2026-1048', title: 'Request specialist referral', reason: 'Referral missing; intake cannot proceed', owner: null, due: '2026-10-12T12:00:00+05:30', overdue: true, priority: 'high', state: 'open', kind: 'documents' },
  { id: 'TSK-0142', claimId: 'CLM-2026-1049', title: 'Review recorded frequency signal', reason: 'Higher provider frequency needs review', owner: 'Maya Patel', due: '2026-10-12T16:00:00+05:30', overdue: false, priority: 'high', state: 'open', kind: 'exception' },
  { id: 'TSK-0143', claimId: 'CLM-2026-1050', title: 'Verify intake and hand off', reason: 'Documents complete; ready for review', owner: 'Maya Patel', due: '2026-10-12T17:00:00+05:30', overdue: false, priority: 'normal', state: 'open', kind: 'review' },
  { id: 'TSK-0144', claimId: 'CLM-2026-1051', title: 'Check a new submission', reason: 'New claim received this morning', owner: null, due: '2026-10-13T12:00:00+05:30', overdue: false, priority: 'normal', state: 'open', kind: 'review' },
  { id: 'TSK-0145', claimId: 'CLM-2026-1054', title: 'Collect missing referral', reason: 'Provider referral not yet received', owner: 'Alex Morgan', due: '2026-10-13T15:00:00+05:30', overdue: false, priority: 'normal', state: 'open', kind: 'documents' },
  { id: 'TSK-0146', claimId: 'CLM-2026-1055', title: 'Confirm review requirements', reason: 'A recorded dependency was cleared', owner: null, due: '2026-10-14T11:00:00+05:30', overdue: false, priority: 'normal', state: 'open', kind: 'review' },
  { id: 'TSK-0147', claimId: 'CLM-2026-1052', title: 'Intake verification complete', reason: 'Handed off to claims review', owner: 'Maya Patel', due: '2026-10-11T14:00:00+05:30', overdue: false, priority: 'normal', state: 'completed', kind: 'review' },
  { id: 'TSK-0148', claimId: 'CLM-2026-1053', title: 'Coverage match processed', reason: 'Sample coverage match recorded automatically', owner: null, due: '2026-10-11T10:00:00+05:30', overdue: false, priority: 'normal', state: 'automatic', kind: 'review' },
]

export const initialRequests: InfoRequest[] = [{
  id: 'REQ-0018', claimId: 'CLM-2026-1054', documents: ['Specialist referral'], message: 'Please supply the referral for the recorded outpatient service.',
  status: 'Pending', created: '2026-10-11T14:10:00+05:30',
}]

export const initialEvents: ActivityEvent[] = [...initialClaims.flatMap((claim, index) => [
  { id: `EVT-${index}-received`, claimId: claim.id, title: 'Claim received', detail: `${claim.provider} submitted this fictional claim for intake.`, time: claim.submitted, type: 'submission' as const },
  { id: `EVT-${index}-assessment`, claimId: claim.id, title: 'Sample assessment recorded', detail: `${claim.riskBand} risk (${claim.riskScore}/100). ${claim.decision}.`, time: claim.updated, type: 'assessment' as const },
  ...(claim.intakeStage === 'handed-off' ? [{ id: `EVT-${index}-handoff`, claimId: claim.id, title: 'Intake handed off', detail: 'The sample intake checklist was verified and passed to claims review.', time: claim.updated, type: 'handoff' as const }] : []),
]), ...initialRequests.map(request => ({ id: `EVT-${request.id}`, claimId: request.claimId, title: 'Information requested', detail: `${request.documents.join(', ')} requested. ${request.message}`, time: request.created, type: 'request' as const }))]
