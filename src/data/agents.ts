export interface SpecialistAgent {
  id: string
  name: string
  purpose: string
  inputs: string[]
  outputs: string[]
  guardrails: string[]
  example: string
  cases: string[]
  confidence: string
  awaitingApproval: boolean
  lastAction: string
  currentActions: string[]
}

export const coordinatorStats = {
  cases: 86,
  atRisk: 9,
  automatedToday: 42,
  awaitingApproval: 2,
  lastEvent: 'Room 225 inspection reassigned 2 minutes ago',
}

export const specialistAgents: SpecialistAgent[] = [
  {
    id: 'allocation',
    name: 'Allocation Agent',
    purpose: 'Finds and ranks eligible rooms based on reservation rules, guest needs, availability, room condition, and property policy.',
    inputs: ['Booked room category', 'Guest preferences', 'Accessibility needs', 'Room inventory', 'Room readiness status', 'Upgrade rules', 'Arrival ETA'],
    outputs: ['Ranked room recommendations', 'Reason for recommendation', 'Confidence score', 'Alternative room options'],
    guardrails: ['Same category unless upgrade policy allows', 'Never assign OOO or uninspected', 'VIP and accessibility are escalate-only'],
    example: 'Recommended Room 416 for Olivia Brown. Matches room type, is inspected, supports 12:30 early arrival.',
    cases: ['Olivia Brown', 'Daniel Kim', 'James Wilson'],
    confidence: 'High · 92%',
    awaitingApproval: true,
    lastAction: 'Ranked 416, 418 for Olivia Brown',
    currentActions: [
      'Olivia Brown — recommend 416 (92%) vs 418 (81%). Awaiting duty-manager approval.',
      'Daniel Kim — score Suite 510 as blocked-room recovery. Policy: same category, inspected.',
      'James Wilson — 322 available immediately after late checkout on 318.',
    ],
  },
  {
    id: 'trace',
    name: 'Trace Agent',
    purpose: 'Turns guest requests and room requirements into structured, prioritised housekeeping, inspection, and maintenance traces.',
    inputs: ['Guest messages', 'Booking notes', 'Allocated room', 'Hotel SOPs', 'Arrival deadline', 'Room status'],
    outputs: ['Task / trace list', 'Owner and department', 'Deadline', 'Dependencies', 'Required proof of completion'],
    guardrails: ['Cannot mark a room ready', 'Must attach SOP and proof type', 'Does not message guests'],
    example: 'Created three traces for Room 412: priority clean, feather-free bedding, final inspection.',
    cases: ['Maya Patel', 'Sofia Garcia', 'Olivia Brown'],
    confidence: 'High · 91%',
    awaitingApproval: false,
    lastAction: 'Opened minibar replenishment trace on 225',
    currentActions: [
      'Maya Patel — four traces on 412: clean, feather-free, cot, inspection. Ready blocked until verified.',
      'Sofia Garcia — rework traces after failed inspection on 225.',
      'Olivia Brown — early-arrival pack queued pending allocation confirm.',
    ],
  },
  {
    id: 'exception',
    name: 'Exception Agent',
    purpose: 'Detects blocked or late readiness plans and recommends recovery actions.',
    inputs: ['Overdue traces', 'Failed inspections', 'Maintenance blockers', 'Changed guest ETA', 'Staffing capacity', 'Available alternative rooms'],
    outputs: ['Reallocation recommendation', 'Re-prioritised task queue', 'Escalation recommendation', 'Updated predicted readiness time'],
    guardrails: ['Cannot send guest messages', 'Cannot violate hard stops', 'Writes only after Coordinator approval'],
    example: 'Room 507 is blocked. Recommended Suite 510 as alternative for Daniel Kim.',
    cases: ['Daniel Kim', 'Sofia Garcia', 'Elena Rossi'],
    confidence: 'Medium · 78%',
    awaitingApproval: true,
    lastAction: 'Proposed 507 → 510 for Daniel Kim',
    currentActions: [
      'Daniel Kim — 507 blocked (bathroom leak). Recommend 510. Awaiting approval.',
      'Sofia Garcia — rework vs reassign ranked; rework preferred.',
      'Elena Rossi — overdue inspection; escalate if not started by 14:10.',
    ],
  },
  {
    id: 'messaging',
    name: 'Messaging Agent',
    purpose: 'Creates and sends approved guest updates based on verified operational status.',
    inputs: ['Verified room readiness', 'Guest communication preferences', 'Language', 'Channel', 'Consent', 'Hotel message templates', 'Approval policy'],
    outputs: ['Draft or sent guest message', 'Channel recommendation', 'Delivery status', 'Message audit log'],
    guardrails: ['Never claim room ready without verified checks', 'Holding copy only before verification', 'Approved templates only'],
    example: 'Maya Patel notified at 11:43: room verified ready and digital check-in available.',
    cases: ['Maya Patel', 'Sofia Garcia', 'Daniel Kim'],
    confidence: 'High · policy-gated',
    awaitingApproval: false,
    lastAction: 'Held Sofia ready-copy until inspection verifies',
    currentActions: [
      'Maya Patel — ready message sent 11:43 after Coordinator verification.',
      'Sofia Garcia — ready template locked; inspection incomplete.',
      'Daniel Kim — holding copy only; do not claim Suite 510 ready.',
    ],
  },
  {
    id: 'insights',
    name: 'Insights Agent',
    purpose: 'Forecasts readiness risk, turnaround time, staffing pressure, and recurring operational blockers.',
    inputs: ['Historical room turnaround', 'Live task progress', 'Arrival schedule', 'Room status', 'Staffing capacity', 'Maintenance trends'],
    outputs: ['Risk predictions', 'Estimated readiness time', 'Bottleneck alerts', 'Operations recommendations'],
    guardrails: ['Cannot change policy', 'Cannot assign rooms', 'Forecasts are advisory to the Coordinator'],
    example: 'Floor 2 is likely to miss three arrivals between 13:30 and 14:30 unless inspection capacity is reassigned.',
    cases: ['Sofia Garcia', 'James Wilson', 'Northstar Design Team'],
    confidence: 'Medium · calibrated',
    awaitingApproval: false,
    lastAction: 'Flagged 14:00 peak pressure on Floor 2',
    currentActions: [
      'Floor 2 — likely to miss three arrivals 13:30–14:30 without inspection reassignment.',
      'James Wilson — late-checkout collision on 318 vs 13:45 ETA.',
      'Northstar Design Team — 9 ready, 2 in prep, 1 at risk on floor 6.',
    ],
  },
]
