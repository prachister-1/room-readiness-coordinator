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
  early: {
    label: 'Early arrival',
    steps: [
      { time: '11:02', event: 'Guest message: arrive 12:30, early check-in?', agent: 'Coordinator', action: 'Opened Readiness Case · Olivia Brown', confidence: '—', approval: 'Not required', state: 'Monitoring → Allocation proposed', policy: 'Early-arrival SOP', outcome: 'Case created, unassigned' },
      { time: '11:03', event: 'Context refresh', agent: 'Insights Agent', action: 'Predicted a Standard Double can be ready by 12:15', confidence: '84%', approval: 'Advisory', state: 'Allocation proposed', policy: 'Do not steal inspected rooms from 12:00 promises', outcome: '416 marked candidate' },
      { time: '11:04', event: 'Inventory ranked', agent: 'Allocation Agent', action: 'Recommended Room 416', confidence: 'High 92%', approval: 'Awaiting duty manager', state: 'Allocation proposed', policy: 'Same category · inspected', outcome: '416, 418 ranked' },
      { time: '11:06', event: 'Approval', agent: 'Duty manager', action: 'Approved allocation to 416', confidence: '—', approval: 'Approved', state: 'Allocation confirmed', policy: 'Approve-to-execute', outcome: 'Room 416 assigned' },
      { time: '11:07', event: 'Plan traces', agent: 'Trace Agent', action: 'Created priority turn + inspection on 416', confidence: '91%', approval: 'Auto within SOP', state: 'Preparation planned', policy: 'Early-arrival trace pack', outcome: 'Two traces dispatched to Floor 4' },
      { time: '12:18', event: 'Inspection passed', agent: 'Coordinator', action: 'Verified mandatory checks', confidence: '—', approval: 'Verified', state: 'Room ready', policy: 'Ready only after checks', outcome: 'Messaging unlocked' },
      { time: '12:19', event: 'Guest update', agent: 'Messaging Agent', action: 'Sent verified room-ready message', confidence: 'Policy-gated', approval: 'Allowed', state: 'Guest notified', policy: 'Ready template', outcome: 'Olivia notified' },
    ],
  },
  special: {
    label: 'Special request',
    steps: [
      { time: '10:12', event: 'Guest: cot + feather allergy', agent: 'Trace Agent', action: 'Extracted cot and feather-free intents', confidence: '94%', approval: 'SOP check', state: 'Preparation planned', policy: 'Allergy SOP · approved amenities', outcome: 'Structured requests, no medical record stored' },
      { time: '10:13', event: 'Policy', agent: 'Coordinator', action: 'Blocked Ready until four traces verify', confidence: '—', approval: 'Hard gate', state: 'In preparation', policy: 'Special-request pack', outcome: 'Ready state locked' },
      { time: '10:16', event: 'Allocation', agent: 'Allocation Agent', action: 'Kept Room 412 · quiet floor, can take cot', confidence: 'High', approval: 'Confirmed', state: 'Allocation confirmed', policy: 'Deluxe King match', outcome: '412 locked' },
      { time: '11:39', event: 'Inspection', agent: 'Supervisor', action: 'Passed feather-free and cot setup', confidence: '—', approval: 'Evidence attached', state: 'Room ready', policy: 'Proof required', outcome: 'All traces complete' },
      { time: '11:43', event: 'Notify', agent: 'Messaging Agent', action: 'Sent ready message with feather-free confirmation', confidence: 'Policy-gated', approval: 'Allowed', state: 'Guest notified', policy: 'Verified-only ready copy', outcome: 'Kiara Garcia notified' },
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
      { time: '14:07', event: 'New traces', agent: 'Trace Agent', action: 'Creates 510 inspection and amenity checks', confidence: '90%', approval: 'Auto within SOP', state: 'In preparation', policy: 'Copy relevant traces only', outcome: '507 traces cancelled' },
      { time: '14:22', event: 'Housekeeping', agent: 'Housekeeping', action: 'Inspection complete', confidence: '—', approval: 'Evidence', state: 'Awaiting inspection → Room ready', policy: 'Proof of completion', outcome: '510 inspected' },
      { time: '14:23', event: 'Verify', agent: 'Coordinator', action: 'Verifies mandatory checks', confidence: '—', approval: 'Coordinator only', state: 'Room ready', policy: 'Only Coordinator changes overall state', outcome: 'Ready unlocked' },
      { time: '14:24', event: 'Draft', agent: 'Messaging Agent', action: 'Drafts room-ready message', confidence: 'Policy-gated', approval: 'Allowed after verify', state: 'Room ready', policy: 'No premature ready claim', outcome: 'Draft queued' },
      { time: '14:25', event: 'Send', agent: 'Messaging Agent', action: 'Guest message sent', confidence: '—', approval: 'Sent', state: 'Guest notified', policy: 'Ready template', outcome: 'Your suite is ready for check-in' },
    ],
  },
  checkout: {
    label: 'Late checkout',
    steps: [
      { time: '13:05', event: 'Occupancy collision', agent: 'Insights Agent', action: '318 late checkout vs James 13:45 ETA', confidence: '81%', approval: 'Advisory', state: 'At risk', policy: 'Departure/arrival collision', outcome: 'Risk flagged' },
      { time: '13:06', event: 'Alternates', agent: 'Allocation Agent', action: 'Room 322 same category, inspected, free', confidence: '88%', approval: 'Awaiting', state: 'Re-planning required', policy: 'Superior Double match', outcome: '322 recommended' },
      { time: '13:08', event: 'Approval', agent: 'Duty manager', action: 'Approved move to 322', confidence: '—', approval: 'Approved', state: 'Allocation confirmed', policy: 'Front-desk decision allowed', outcome: 'James → 322' },
      { time: '13:09', event: 'Trace adjust', agent: 'Trace Agent', action: 'Cancelled 318 turn; no new clean needed on 322', confidence: '—', approval: 'Auto', state: 'In preparation', policy: 'Change only affected traces', outcome: 'Duplicate work avoided' },
      { time: '13:20', event: 'Verify', agent: 'Coordinator', action: '322 already inspected', confidence: '—', approval: 'Verified', state: 'Room ready', policy: 'Coordinator state owner', outcome: 'Messaging unlocked' },
    ],
  },
  group: {
    label: 'Group arrival',
    steps: [
      { time: '09:10', event: 'Group block', agent: 'Coordinator', action: 'Opened Northstar Design Team · 12 arrivals 15:00', confidence: '—', approval: 'Not required', state: 'Monitoring', policy: 'Group proximity preference', outcome: '12 Readiness Cases linked' },
      { time: '09:12', event: 'Cluster rooms', agent: 'Allocation Agent', action: 'Floors 4–5 preferred', confidence: '86%', approval: 'Recommend', state: 'Allocation proposed', policy: 'Proximity, not guaranteed', outcome: '11 on 4–5, 1 on 6' },
      { time: '12:40', event: 'Forecast', agent: 'Insights Agent', action: '9 ready, 2 in prep, 1 at risk', confidence: '79%', approval: 'Advisory', state: 'At risk', policy: 'Group together by 15:00', outcome: 'Floor 6 room flagged' },
      { time: '12:42', event: 'Recovery', agent: 'Exception Agent', action: 'Reassign one room from 6 to 5', confidence: '74%', approval: 'Awaiting', state: 'Re-planning required', policy: 'Keep group together if inventory allows', outcome: 'Recommendation queued' },
      { time: '15:01', event: 'Organiser update', agent: 'Messaging Agent', action: 'Single status to group organiser after verification', confidence: 'Policy-gated', approval: 'Configured', state: 'Guest notified', policy: 'One organiser message', outcome: 'No 12 duplicate SMS' },
    ],
  },
  inspection: {
    label: 'Failed inspection',
    steps: [
      { time: '13:18', event: 'Inspection fail', agent: 'Trace Agent', action: 'Room 225 failed: minibar + bathroom', confidence: '—', approval: 'Evidence', state: 'At risk', policy: 'Fail creates rework traces', outcome: 'Rework traces opened' },
      { time: '13:19', event: 'Impact', agent: 'Exception Agent', action: 'Predicted miss on Sofia 14:00 unless recovered', confidence: '76%', approval: 'Advisory', state: 'At risk', policy: 'Arrival promise', outcome: 'Recovery options ranked' },
      { time: '13:20', event: 'Alternates checked', agent: 'Allocation Agent', action: 'Same-category inspected rooms limited', confidence: '70%', approval: 'Advisory', state: 'At risk', policy: 'No downgrade', outcome: 'Rework preferred to move' },
      { time: '13:21', event: 'Plan', agent: 'Coordinator', action: 'Recommend reassign inspection to Priya S. + minibar trace', confidence: 'Medium', approval: 'Awaiting', state: 'Re-planning required', policy: 'Approve-to-execute', outcome: 'ETA 13:56' },
      { time: '13:22', event: 'Approve', agent: 'Duty manager', action: 'Approved recovery plan', confidence: '—', approval: 'Approved', state: 'In preparation', policy: 'Human owns write', outcome: 'Priya S. assigned' },
      { time: '13:56', event: 'Verify', agent: 'Coordinator', action: 'Mandatory checks complete', confidence: '—', approval: 'Coordinator only', state: 'Room ready', policy: 'Messaging still locked until this step', outcome: 'Ready' },
    ],
  },
}
