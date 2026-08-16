import { canonicalState, exceptionStates, happyPath, type CanonicalState } from '../../lib/readiness'
import type { ReadinessCase } from '../../types'

export function StateMachine({
  current,
  compact = false,
}: {
  current?: CanonicalState
  compact?: boolean
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold">Readiness state</h3>
        <span className="text-[11px] text-muted">Only the Coordinator can change overall state</span>
      </div>
      <div className={`flex flex-wrap gap-1.5 ${compact ? '' : ''}`}>
        {happyPath.map((s, i) => {
          const active = current === s
          return (
            <span key={s} className="flex items-center gap-1.5">
              <span
                className={`rounded-full px-2 py-1 text-[11px] font-semibold ${
                  active ? 'bg-ready text-white' : 'bg-white text-muted ring-1 ring-line'
                }`}
              >
                {s}
              </span>
              {i < happyPath.length - 1 && <span className="text-idle">→</span>}
            </span>
          )
        })}
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        <span className="text-[11px] font-bold tracking-wide text-muted uppercase">At any point</span>
        {exceptionStates.map((s) => (
          <span
            key={s}
            className={`rounded-full px-2 py-1 text-[11px] font-semibold ${
              current === s ? 'bg-blocked text-white' : s === 'At risk' ? 'bg-risk-soft text-risk' : 'bg-blocked-soft text-blocked'
            }`}
          >
            {s}
          </span>
        ))}
      </div>
    </div>
  )
}

export function CaseStateMachine({ c }: { c: ReadinessCase }) {
  const current = canonicalState({
    status: c.status,
    roomNumber: c.roomNumber,
    messageStatus: c.message.status,
    inspectionCompletable: c.inspectionCompletable,
    checks: c.checks,
  })
  return <StateMachine current={current} />
}
