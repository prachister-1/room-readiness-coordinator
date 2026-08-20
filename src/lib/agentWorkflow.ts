import type { ReadinessCase } from '../types'
import type { WorkKind } from './workKind'

export const FLOW_PHASES = ['detect', 'reason', 'act', 'verify', 'communicate'] as const
export type FlowPhase = (typeof FLOW_PHASES)[number]

export interface FlowStep {
  id: FlowPhase
  title: string
  agent: string
  kind: WorkKind
  status: 'done' | 'active' | 'waiting'
  work: string
}

export interface CaseWorkflow {
  caseId: string
  useCase: string
  playbook: string
  guestName: string
  phase: FlowPhase
  waitingOnYou?: string
  workingNow: { agent: string; kind: WorkKind; action: string }[]
  steps: FlowStep[]
}

export const DEMO_WORKFLOW_IDS = ['maya', 'sofia', 'daniel', 'olivia', 'kenji', 'priya', 'samira'] as const

const meta: Record<
  string,
  { useCase: string; playbook: string; detect: string; reason: string; act: string; verify: string }
> = {
  maya: {
    useCase: 'UC-002',
    playbook: 'Early arrival · room not ready',
    detect: '412 dirty · 12:00 early · cot required · 418 clean',
    reason: '418 same Deluxe King · cot possible · 92%',
    act: 'Priority clean · cot staged · Front Desk notified · 418 held',
    verify: 'Clean · cot · inspection · payment',
  },
  sofia: {
    useCase: 'UC-003',
    playbook: 'Recover at-risk inspection',
    detect: '14:00 promise · inspection unassigned · 18 min left',
    reason: 'Stay on 225 · Priya S. free on Floor 2 · 13:56',
    act: 'Clean already done · inspection overdue · ready message locked',
    verify: 'Supervisor sign-off on 225',
  },
  daniel: {
    useCase: 'UC-004',
    playbook: 'Blocked room reallocation',
    detect: '507 bathroom leak · will miss 15:00',
    reason: '510 same suite · inspected · no maintenance · 92%',
    act: '507 marked OOO · ready message locked',
    verify: 'Suite handover on 510',
  },
  olivia: {
    useCase: 'UC-005',
    playbook: 'Assign unassigned early arrival',
    detect: '12:30 requested · no room assigned',
    reason: '416 inspected Standard Double · 418 held for Kiara',
    act: 'Early-arrival pack queued · ready message locked',
    verify: 'Turn + inspection on 416',
  },
  kenji: {
    useCase: 'UC-008',
    playbook: 'VIP hard stop',
    detect: '701 turn late after checkout delay',
    reason: 'VIP / suite — no autonomous move',
    act: 'Policy fired · auto-move blocked · message locked',
    verify: 'Duty manager recovery only',
  },
  priya: {
    useCase: 'UC-008',
    playbook: 'Accessible hard stop',
    detect: '105 door operator down',
    reason: 'No inspected accessible king substitute',
    act: 'Search stopped · message locked',
    verify: 'Escalate — do not invent a fit',
  },
  samira: {
    useCase: 'UC-008',
    playbook: 'Accessible move — human only',
    detect: '112 door operator down',
    reason: '214 inspected accessible king — only legal alternative',
    act: 'Automatic move blocked · message locked',
    verify: 'Handover inspection on 214',
  },
}

function movedOffOriginal(c: ReadinessCase) {
  if (c.id === 'maya') return c.roomNumber === '418' || Boolean(c.recommendation?.approved)
  if (c.id === 'daniel') return c.roomNumber === '510' || Boolean(c.recommendation?.approved)
  if (c.id === 'olivia') return Boolean(c.roomNumber) || Boolean(c.recommendation?.approved)
  if (c.id === 'samira') return c.roomNumber === '214' || Boolean(c.recommendation?.approved)
  if (c.id === 'sofia') return Boolean(c.recommendation?.approved)
  return Boolean(c.recommendation?.approved)
}

export function workflowPhase(c: ReadinessCase): FlowPhase {
  if (c.message.status === 'sent') return 'communicate'
  if (c.status === 'ready') return 'communicate'
  if (movedOffOriginal(c)) return 'verify'
  return 'act'
}

function stepStatus(id: FlowPhase, phase: FlowPhase, sent: boolean): FlowStep['status'] {
  const order = FLOW_PHASES
  const i = order.indexOf(id)
  const p = order.indexOf(phase)
  if (sent || i < p) return 'done'
  if (i === p) return 'active'
  return 'waiting'
}

export function caseWorkflow(c: ReadinessCase): CaseWorkflow | null {
  const m = meta[c.id]
  if (!m) return null
  const phase = workflowPhase(c)
  const sent = c.message.status === 'sent'
  const approved = movedOffOriginal(c)

  const actWork = approved
    ? c.id === 'maya'
      ? 'Move approved · 418 assigned · cot still open'
      : c.id === 'sofia'
        ? 'Priya S. assigned to 225'
        : c.id === 'daniel'
          ? 'Moved to 510 · handover in progress'
          : c.id === 'olivia'
            ? '416 assigned · early-arrival turn in progress'
            : c.id === 'samira'
              ? '214 approved · handover inspection'
              : m.act
    : c.id === 'kenji' || c.id === 'priya'
      ? m.act
      : `${m.act} · awaiting you`

  const verifyWork =
    c.status === 'ready'
      ? 'All checks passed'
      : approved
        ? c.nextAction
        : m.verify

  const communicateWork = sent
    ? 'Guest informed after verified ready'
    : c.status === 'ready'
      ? 'Ready template unlocked — send only now'
      : 'Locked until every check passes'

  const steps: FlowStep[] = [
    { id: 'detect', title: 'Detect', agent: 'Exception Agent', kind: 'ai', status: stepStatus('detect', phase, sent), work: m.detect },
    { id: 'reason', title: 'Reason', agent: 'Allocation Agent', kind: 'ai', status: stepStatus('reason', phase, sent), work: m.reason },
    { id: 'act', title: 'Act', agent: 'Task Agent', kind: 'auto', status: stepStatus('act', phase, sent), work: actWork },
    { id: 'verify', title: 'Verify', agent: 'Staff evidence', kind: 'human', status: stepStatus('verify', phase, sent), work: verifyWork },
    { id: 'communicate', title: 'Communicate', agent: 'Guest Messaging', kind: 'auto', status: stepStatus('communicate', phase, sent), work: communicateWork },
  ]

  const waitingOnYou =
    phase === 'act' && !approved && c.id !== 'kenji' && c.id !== 'priya'
      ? c.nextAction
      : phase === 'act' && (c.id === 'kenji' || c.id === 'priya')
        ? c.nextAction
        : phase === 'communicate' && !sent
          ? 'Send room ready message'
          : phase === 'verify'
            ? c.nextAction
            : undefined

  const workingNow: CaseWorkflow['workingNow'] = []
  if (phase === 'act' && !approved) {
    workingNow.push({ agent: 'Allocation Agent', kind: 'ai', action: m.reason })
    workingNow.push({ agent: 'Task Agent', kind: 'auto', action: m.act })
    workingNow.push({ agent: 'You', kind: 'human', action: c.nextAction })
  } else if (phase === 'verify') {
    workingNow.push({ agent: 'Task Agent', kind: 'auto', action: 'Traces copied · ready message still locked' })
    workingNow.push({ agent: 'You', kind: 'human', action: c.nextAction })
  } else if (phase === 'communicate' && !sent) {
    workingNow.push({ agent: 'Guest Messaging', kind: 'auto', action: 'Ready template unlocked' })
    workingNow.push({ agent: 'You', kind: 'human', action: 'Send room ready message' })
  } else if (sent) {
    workingNow.push({ agent: 'Trace Agent', kind: 'auto', action: 'Outcome logged · no further action' })
  }

  return {
    caseId: c.id,
    useCase: m.useCase,
    playbook: m.playbook,
    guestName: c.guestName,
    phase,
    waitingOnYou,
    workingNow,
    steps,
  }
}

export function liveAgentBoard(cases: ReadinessCase[]) {
  const workflows = cases
    .filter((c) => (DEMO_WORKFLOW_IDS as readonly string[]).includes(c.id))
    .map(caseWorkflow)
    .filter((w): w is CaseWorkflow => Boolean(w))
    .filter((w) => cases.find((c) => c.id === w.caseId)?.message.status !== 'sent')

  const byAgent: { id: string; name: string; kind: WorkKind; items: { guest: string; action: string; caseId: string }[] }[] = [
    { id: 'allocation', name: 'Allocation Agent', kind: 'ai', items: [] },
    { id: 'task', name: 'Task Agent', kind: 'auto', items: [] },
    { id: 'exception', name: 'Exception Agent', kind: 'ai', items: [] },
    { id: 'human', name: 'You', kind: 'human', items: [] },
  ]

  for (const w of workflows) {
    if (w.phase === 'act' || w.phase === 'reason') {
      byAgent[0].items.push({ guest: w.guestName, action: w.steps[1].work, caseId: w.caseId })
      byAgent[1].items.push({ guest: w.guestName, action: w.steps[2].work, caseId: w.caseId })
      byAgent[2].items.push({ guest: w.guestName, action: w.steps[0].work, caseId: w.caseId })
    }
    if (w.phase === 'verify') {
      byAgent[1].items.push({ guest: w.guestName, action: 'Traces in flight · ready message locked', caseId: w.caseId })
    }
    if (w.waitingOnYou) {
      byAgent[3].items.push({ guest: w.guestName, action: w.waitingOnYou, caseId: w.caseId })
    }
  }

  return { workflows, byAgent }
}
