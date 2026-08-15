import type { ReadinessStatus, TraceStatus } from '../types'

export const statusLabel: Record<ReadinessStatus, string> = {
  ready: 'Room ready',
  'in-preparation': 'In preparation',
  'at-risk': 'At risk',
  blocked: 'Blocked',
}

export const statusClass: Record<ReadinessStatus, string> = {
  ready: 'bg-ready-soft text-ready',
  'in-preparation': 'bg-info-soft text-info',
  'at-risk': 'bg-risk-soft text-risk',
  blocked: 'bg-blocked-soft text-blocked',
}

export const traceClass: Record<TraceStatus, string> = {
  complete: 'bg-ready-soft text-ready',
  'in-progress': 'bg-info-soft text-info',
  overdue: 'bg-blocked-soft text-blocked',
  cancelled: 'bg-slate-100 text-idle',
  'not-started': 'bg-slate-100 text-idle',
}

export const initials = (name: string) =>
  name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
