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
  atRisk: 8,
  automatedToday: 42,
  awaitingApproval: 1,
  lastEvent: 'Held Room 418 and asked for approval to move Kiara Garcia off dirty 412',
}

export const specialistAgents: SpecialistAgent[] = [
  {
    id: 'allocation',
    name: 'Allocation Agent',
    purpose: 'Finds the best room and timing from reservation rules, guest needs, availability, room condition, and property policy.',
    inputs: ['Booked room category', 'Guest preferences', 'Room inventory', 'Room readiness status', 'Arrival ETA', 'Cot / amenity fit'],
    outputs: ['Ranked room recommendations', 'Reason for recommendation', 'Confidence score', 'Alternative room options'],
    guardrails: ['Same category unless upgrade policy allows', 'Never assign OOO or uninspected', 'Room changes require Coordinator + duty-manager approval'],
    example: 'Kiara Garcia — Room 418 over dirty 412. Correct category, ready now, cot possible, no downstream conflict. Confidence 92%.',
    cases: ['Kiara Garcia', 'Olivia Brown', 'Daniel Kim'],
    confidence: 'High · 92%',
    awaitingApproval: true,
    lastAction: 'Ranked 418 for Kiara Garcia',
    currentActions: [
      'Kiara Garcia — recommend 418 (92%) vs rush-clean 412 (61%). Awaiting duty-manager approval.',
      'Olivia Brown — recommend 416. 418 is held for the 12:00 recovery.',
      'Daniel Kim — score Suite 510 as blocked-room recovery.',
    ],
  },
  {
    id: 'task',
    name: 'Task Agent',
    purpose: 'Turns the plan into housekeeping, maintenance, and logistics work with owners, deadlines, and proof.',
    inputs: ['Guest requests', 'Allocated room', 'Hotel SOPs', 'Arrival deadline', 'Room status', 'Staffing capacity'],
    outputs: ['Task list', 'Owner and department', 'Deadline', 'Dependencies', 'Required proof of completion'],
    guardrails: ['Cannot mark a room ready', 'Must attach SOP and proof type', 'Does not message guests'],
    example: 'Kiara Garcia — priority clean on 412, cot staged on Floor 4, hold tag on 418.',
    cases: ['Kiara Garcia', 'Sofia Garcia', 'Olivia Brown'],
    confidence: 'High · 91%',
    awaitingApproval: false,
    lastAction: 'Created priority clean + cot task; held 418',
    currentActions: [
      'Kiara Garcia — priority clean on 412, cot task, 418 hold. Destination pending approval.',
      'Sofia Garcia — inspection still unassigned on 225.',
      'Olivia Brown — early-arrival pack queued pending allocation confirm.',
    ],
  },
  {
    id: 'exception',
    name: 'Exception Agent',
    purpose: 'Detects blocked or late readiness plans and recommends recovery actions.',
    inputs: ['Overdue tasks', 'Dirty assigned rooms', 'Maintenance blockers', 'Changed guest ETA', 'Staffing capacity', 'Available alternative rooms'],
    outputs: ['Reallocation recommendation', 'Re-prioritised task queue', 'Escalation recommendation', 'Updated predicted readiness time'],
    guardrails: ['Cannot send guest messages', 'Cannot violate hard stops', 'Writes only after Coordinator approval'],
    example: 'Kiara’s 412 will not be ready by 12:00. Recommended 418 as same-category recovery.',
    cases: ['Kiara Garcia', 'Daniel Kim', 'Sofia Garcia'],
    confidence: 'High · 92%',
    awaitingApproval: true,
    lastAction: 'Flagged 412 as too late to turn before 12:00',
    currentActions: [
      'Kiara Garcia — 412 dirty vs 12:00 early arrival. Recommend 418. Awaiting approval.',
      'Daniel Kim — 507 blocked (bathroom leak). Recommend 510.',
      'Sofia Garcia — inspection not started; 14:00 promise at risk.',
    ],
  },
  {
    id: 'trace',
    name: 'Trace Agent',
    purpose: 'Keeps an auditable trail of every observation, recommendation, approval, and verification so operators can explain why.',
    inputs: ['Coordinator events', 'Specialist outputs', 'Approvals', 'Housekeeping evidence', 'Policy hits'],
    outputs: ['Audit log', 'Why-this-room explanation', 'Evidence pack', 'Replayable decision trace'],
    guardrails: ['Cannot change rooms', 'Cannot send guest messages', 'Cannot mark ready'],
    example: 'Kiara Garcia — full trace from 10:58 detect through 418 hold, with 92% allocation rationale attached.',
    cases: ['Kiara Garcia', 'Daniel Kim', 'Sofia Garcia'],
    confidence: 'High · complete',
    awaitingApproval: false,
    lastAction: 'Logged 418 hold and room-change approval request',
    currentActions: [
      'Kiara Garcia — detect → reason → act logged. Verify and communicate still open.',
      'Every room change writes actor, reason, policy, and outcome.',
      'Guest-ready claims cannot be sent without a verification trace.',
    ],
  },
]
