export const happyPath = [
  'Monitoring',
  'Allocation proposed',
  'Allocation confirmed',
  'Preparation planned',
  'In preparation',
  'Awaiting inspection',
  'Room ready',
  'Guest notified',
  'Checked in',
] as const

export const exceptionStates = ['At risk', 'Blocked', 'Re-planning required', 'Escalated'] as const

export type CanonicalState = (typeof happyPath)[number] | (typeof exceptionStates)[number]

export function canonicalState(input: {
  status: 'ready' | 'in-preparation' | 'at-risk' | 'blocked'
  roomNumber: string | null
  messageStatus: 'sent' | 'draft' | 'blocked'
  inspectionCompletable?: boolean
  checks: { id: string; label?: string; complete: boolean }[]
}): CanonicalState {
  if (input.status === 'blocked') return 'Blocked'
  if (input.status === 'at-risk') return 'At risk'
  if (!input.roomNumber) return 'Allocation proposed'
  if (input.status === 'ready' && input.messageStatus === 'sent') return 'Guest notified'
  if (input.status === 'ready') return 'Room ready'
  const inspection = input.checks.find((c) => (c.label ?? c.id).toLowerCase().includes('inspection'))
  if (input.inspectionCompletable || (inspection && !inspection.complete)) return 'Awaiting inspection'
  return 'In preparation'
}
