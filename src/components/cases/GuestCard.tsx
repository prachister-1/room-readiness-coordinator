import type { ReadinessCase } from '../../types'
import { StatusBadge } from '../ui/Badge'
import { WorkflowChips } from '../agents/UseCaseBoard'
import { useStore } from '../../state/Store'

export function GuestCard({ item }: { item: ReadinessCase }) {
  const { select, selectedCaseId } = useStore()
  const selected = selectedCaseId === item.id
  return (
    <button
      onClick={() => select(item.id)}
      className={`w-full border bg-white p-3.5 text-left ${selected ? 'border-navy' : 'border-line hover:border-navy/40'}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="text-sm font-semibold tracking-tight">{item.guestName}</div>
          <div className="mt-0.5 text-xs text-muted">ETA {item.eta} · {item.roomType}</div>
        </div>
        <StatusBadge status={item.status} />
      </div>
      <div className="mt-3 flex items-center justify-between text-xs">
        <span className="font-medium">{item.roomNumber ? `Room ${item.roomNumber}` : 'Unassigned'}</span>
        <span className="text-muted">{item.tasksComplete}/{item.tasksTotal} tasks</span>
      </div>
      <div className="mt-2 h-1 overflow-hidden bg-line">
        <div
          className={`h-full ${item.status === 'blocked' ? 'bg-blocked' : item.status === 'at-risk' ? 'bg-risk' : item.status === 'ready' ? 'bg-ready' : 'bg-navy'}`}
          style={{ width: `${(item.tasksComplete / item.tasksTotal) * 100}%` }}
        />
      </div>
      <p className="mt-2 text-xs text-muted">{item.riskReason}</p>
      <WorkflowChips c={item} />
      <div className="mt-2 text-[11px] font-semibold">{item.nextAction}</div>
    </button>
  )
}
