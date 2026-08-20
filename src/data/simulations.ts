export interface SimStep {
  time: string
  event: string
  agent: string
  action: string
  confidence: string
  approval: string
  state: string
  policy: string
  outcome: string
}

export const simulations: Record<string, { label: string; steps: SimStep[] }> = {
  special: {
    label: 'Early arrival · 412 → 418',
    steps: [
      { time: '10:58', event: 'Detect', agent: 'Coordinator', action: 'Guest arriving early · Room 412 dirty · cot required · HK capacity available · 418 clean and unassigned', confidence: '—', approval: 'Not required', state: 'At risk', policy: 'Arrival readiness', outcome: 'Kiara Garcia case flagged' },
      { time: '11:00', event: 'Reason', agent: 'Allocation Agent', action: 'Best option: move guest to Room 418', confidence: 'High 92%', approval: 'Awaiting duty manager', state: 'Allocation proposed', policy: 'Same Deluxe King · ready now · cot possible · no downstream conflict', outcome: '418 ranked first' },
      { time: '11:01', event: 'Act', agent: 'Task Agent', action: 'Created priority HK task, cot task, notified Front Desk, held 418', confidence: '91%', approval: 'Auto within SOP', state: 'Preparation planned', policy: 'Agents may prepare work; they may not change assignment', outcome: '412 turning · 418 held' },
      { time: '11:02', event: 'Act', agent: 'Coordinator', action: 'Requested approval to change room', confidence: '92%', approval: 'Required', state: 'Escalated', policy: 'Room assignment changes need duty manager', outcome: 'Decision inbox card opened' },
      { time: '11:03', event: 'Human decision', agent: 'Duty manager', action: 'Approved move to 418', confidence: '—', approval: 'Approved', state: 'Allocation confirmed', policy: 'Approve-to-execute', outcome: '412 → 418' },
      { time: '11:20', event: 'Verify', agent: 'Housekeeping', action: 'Cot installed on 418; cleaning already complete', confidence: '—', approval: 'Evidence', state: 'Awaiting inspection', policy: 'Proof of completion', outcome: 'Cot photo attached' },
      { time: '11:22', event: 'Verify', agent: 'Coordinator', action: 'Cleaning, cot, inspection, payment all passed', confidence: '—', approval: 'Coordinator only', state: 'Room ready', policy: 'Ready only after checks', outcome: 'Guest message unlocked' },
      { time: '11:23', event: 'Communicate', agent: 'Guest Messaging', action: 'Sent verified ready message for Room 418', confidence: 'Policy-gated', approval: 'Allowed after verify', state: 'Guest notified', policy: 'Never claim ready early', outcome: 'Great news! Your room is ready earlier.' },
    ],
  },
  early: {
    label: 'Early arrival',
    steps: [
      { time: '11:02', event: 'Guest message: arrive 12:30, early check-in?', agent: 'Coordinator', action: 'Opened Readiness Case · Olivia Brown', confidence: '—', approval: 'Not required', state: 'Monitoring → Allocation proposed', policy: 'Early-arrival SOP', outcome: 'Case created, unassigned' },
      { time: '11:03', event: 'Context refresh', agent: 'Exception Agent', action: 'Predicted a Standard Double can be ready by 12:15', confidence: '84%', approval: 'Advisory', state: 'Allocation proposed', policy: 'Do not steal inspected rooms from 12:00 promises', outcome: '416 marked candidate' },
      { time: '11:04', event: 'Inventory ranked', agent: 'Allocation Agent', action: 'Recommended Room 416', confidence: 'High 92%', approval: 'Awaiting duty manager', state: 'Allocation proposed', policy: 'Same category · inspected', outcome: '416 ranked. 418 held for 12:00 recovery' },
      { time: '11:06', event: 'Approval', agent: 'Duty manager', action: 'Approved allocation to 416', confidence: '—', approval: 'Approved', state: 'Allocation confirmed', policy: 'Approve-to-execute', outcome: 'Room 416 assigned' },
      { time: '11:07', event: 'Plan tasks', agent: 'Task Agent', action: 'Created priority turn + inspection on 416', confidence: '91%', approval: 'Auto within SOP', state: 'Preparation planned', policy: 'Early-arrival task pack', outcome: 'Two tasks dispatched to Floor 4' },
      { time: '12:18', event: 'Inspection passed', agent: 'Coordinator', action: 'Verified mandatory checks', confidence: '—', approval: 'Verified', state: 'Room ready', policy: 'Ready only after checks', outcome: 'Messaging unlocked' },
      { time: '12:19', event: 'Guest update', agent: 'Guest Messaging', action: 'Sent verified room-ready message', confidence: 'Policy-gated', approval: 'Allowed', state: 'Guest notified', policy: 'Ready template', outcome: 'Olivia notified' },
    ],
  },
  blocked: {
    label: 'Blocked room',
    steps: [
      { time: '14:02', event: 'Maintenance event received', agent: 'Coordinator', action: 'Room 507 marked blocked', confidence: '—', approval: 'Deterministic', state: 'Blocked', policy: 'OOO not sellable', outcome: 'Daniel Kim case blocked' },
      { time: '14:03', event: 'Recovery search', agent: 'Exception Agent', action: 'Finds recovery paths', confidence: '—', approval: 'Advisory', state: 'Re-planning required', policy: 'Exception pack', outcome: 'Alternative suite search started' },
      { time: '14:04', event: 'Rank suites', agent: 'Allocation Agent', action: 'Recommends Room 510', confidence: '92%', approval: 'Awaiting duty manager', state: 'Re-planning required', policy: 'Same category · inspected', outcome: '510 scored first' },
      { time: '14:05', event: 'Approval request', agent: 'Coordinator', action: 'Requests approval', confidence: '—', approval: 'Required', state: 'Escalated', policy: 'Suite moves need duty manager', outcome: 'Reallocation requires confirmation' },
      { time: '14:06', event: 'Human decision', agent: 'Duty manager', action: 'Approves reallocation', confidence: '—', approval: 'Approved', state: 'Allocation confirmed', policy: 'Approve-to-execute', outcome: '507 → 510' },
      { time: '14:07', event: 'New traces', agent: 'Task Agent', action: 'Creates 510 inspection and amenity checks', confidence: '90%', approval: 'Auto within SOP', state: 'In preparation', policy: 'Copy relevant traces only', outcome: '507 traces cancelled' },
      { time: '14:22', event: 'Housekeeping', agent: 'Housekeeping', action: 'Inspection complete', confidence: '—', approval: 'Evidence', state: 'Awaiting inspection → Room ready', policy: 'Proof of completion', outcome: '510 inspected' },
      { time: '14:23', event: 'Verify', agent: 'Coordinator', action: 'Verifies mandatory checks', confidence: '—', approval: 'Coordinator only', state: 'Room ready', policy: 'Only Coordinator changes overall state', outcome: 'Ready unlocked' },
      { time: '14:24', event: 'Draft', agent: 'Guest Messaging', action: 'Drafts room-ready message', confidence: 'Policy-gated', approval: 'Allowed after verify', state: 'Room ready', policy: 'No premature ready claim', outcome: 'Draft queued' },
      { time: '14:25', event: 'Send', agent: 'Guest Messaging', action: 'Guest message sent', confidence: '—', approval: 'Sent', state: 'Guest notified', policy: 'Ready template', outcome: 'Your suite is ready for check-in' },
    ],
  },
  checkout: {
    label: 'Late checkout',
    steps: [
      { time: '13:05', event: 'Occupancy collision', agent: 'Exception Agent', action: '318 late checkout vs James 13:45 ETA', confidence: '81%', approval: 'Advisory', state: 'At risk', policy: 'Departure/arrival collision', outcome: 'Risk flagged' },
      { time: '13:06', event: 'Alternates', agent: 'Allocation Agent', action: 'Room 322 same category, inspected, free', confidence: '88%', approval: 'Awaiting', state: 'Re-planning required', policy: 'Superior Double match', outcome: '322 recommended' },
      { time: '13:08', event: 'Approval', agent: 'Duty manager', action: 'Approved move to 322', confidence: '—', approval: 'Approved', state: 'Allocation confirmed', policy: 'Front-desk decision allowed', outcome: 'James → 322' },
      { time: '13:09', event: 'Trace adjust', agent: 'Task Agent', action: 'Cancelled 318 turn; no new clean needed on 322', confidence: '—', approval: 'Auto', state: 'In preparation', policy: 'Change only affected traces', outcome: 'Duplicate work avoided' },
      { time: '13:20', event: 'Verify', agent: 'Coordinator', action: '322 already inspected', confidence: '—', approval: 'Verified', state: 'Room ready', policy: 'Coordinator state owner', outcome: 'Messaging unlocked' },
    ],
  },
  group: {
    label: 'Group arrival',
    steps: [
      { time: '09:10', event: 'Group block', agent: 'Coordinator', action: 'Opened Northstar Design Team · 12 arrivals 15:00', confidence: '—', approval: 'Not required', state: 'Monitoring', policy: 'Group proximity preference', outcome: '12 Readiness Cases linked' },
      { time: '09:12', event: 'Cluster rooms', agent: 'Allocation Agent', action: 'Floors 4–5 preferred', confidence: '86%', approval: 'Recommend', state: 'Allocation proposed', policy: 'Proximity, not guaranteed', outcome: '11 on 4–5, 1 on 6' },
      { time: '12:40', event: 'Forecast', agent: 'Exception Agent', action: '9 ready, 2 in prep, 1 at risk', confidence: '79%', approval: 'Advisory', state: 'At risk', policy: 'Group together by 15:00', outcome: 'Floor 6 room flagged' },
      { time: '12:42', event: 'Recovery', agent: 'Exception Agent', action: 'Reassign one room from 6 to 5', confidence: '74%', approval: 'Awaiting', state: 'Re-planning required', policy: 'Keep group together if inventory allows', outcome: 'Recommendation queued' },
      { time: '15:01', event: 'Organiser update', agent: 'Guest Messaging', action: 'Single status to group organiser after verification', confidence: 'Policy-gated', approval: 'Configured', state: 'Guest notified', policy: 'One organiser message', outcome: 'No 12 duplicate SMS' },
    ],
  },
  inspection: {
    label: 'Failed inspection',
    steps: [
      { time: '13:18', event: 'Inspection fail', agent: 'Task Agent', action: 'Room 225 failed: minibar + bathroom', confidence: '—', approval: 'Evidence', state: 'At risk', policy: 'Fail creates rework traces', outcome: 'Rework traces opened' },
      { time: '13:19', event: 'Impact', agent: 'Exception Agent', action: 'Predicted miss on Sofia 14:00 unless recovered', confidence: '76%', approval: 'Advisory', state: 'At risk', policy: 'Arrival promise', outcome: 'Recovery options ranked' },
      { time: '13:20', event: 'Alternates checked', agent: 'Allocation Agent', action: 'Same-category inspected rooms limited', confidence: '70%', approval: 'Advisory', state: 'At risk', policy: 'No downgrade', outcome: 'Rework preferred to move' },
      { time: '13:21', event: 'Plan', agent: 'Coordinator', action: 'Recommend reassign inspection to Priya S. + minibar trace', confidence: 'Medium', approval: 'Awaiting', state: 'Re-planning required', policy: 'Approve-to-execute', outcome: 'ETA 13:56' },
      { time: '13:22', event: 'Approve', agent: 'Duty manager', action: 'Approved recovery plan', confidence: '—', approval: 'Approved', state: 'In preparation', policy: 'Human owns write', outcome: 'Priya S. assigned' },
      { time: '13:56', event: 'Verify', agent: 'Coordinator', action: 'Mandatory checks complete', confidence: '—', approval: 'Coordinator only', state: 'Room ready', policy: 'Messaging still locked until this step', outcome: 'Ready' },
    ],
  },
}
