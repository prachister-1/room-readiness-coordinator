import type { ReactNode } from 'react'
import type { ReadinessStatus } from '../../types'
import { statusClass, statusLabel } from '../../lib/status'

export function StatusBadge({ status }: { status: ReadinessStatus }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold tracking-wide ${statusClass[status]}`}>
      {statusLabel[status]}
    </span>
  )
}

export function Pill({
  children,
  tone = 'idle',
}: {
  children: ReactNode
  tone?: 'ready' | 'risk' | 'blocked' | 'info' | 'idle'
}) {
  const map = {
    ready: 'bg-ready-soft text-ready',
    risk: 'bg-risk-soft text-risk',
    blocked: 'bg-blocked-soft text-blocked',
    info: 'bg-info-soft text-info',
    idle: 'bg-slate-100 text-muted',
  }
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${map[tone]}`}>
      {children}
    </span>
  )
}
