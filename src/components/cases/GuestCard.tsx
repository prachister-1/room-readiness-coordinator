import { CheckCircle2, CreditCard, Smartphone, Sparkles } from 'lucide-react'
import type { ReadinessCase } from '../../types'
import { StatusBadge } from '../ui/Badge'
import { useStore } from '../../state/Store'

export function GuestCard({ item }: { item: ReadinessCase }) {
  const { select, selectedCaseId } = useStore()
  const selected = selectedCaseId === item.id
  return (
    <button
      onClick={() => select(item.id)}
      className={`w-full rounded-2xl border bg-white p-3.5 text-left shadow-[0_1px_2px_rgba(15,31,61,0.04)] transition hover:-translate-y-px hover:shadow-[0_10px_24px_rgba(15,31,61,0.08)] ${
        selected ? 'border-ready' : 'border-line'
      }`}
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
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full ${item.status === 'blocked' ? 'bg-blocked' : item.status === 'at-risk' ? 'bg-risk' : item.status === 'ready' ? 'bg-ready' : 'bg-info'}`}
          style={{ width: `${(item.tasksComplete / item.tasksTotal) * 100}%` }}
        />
      </div>
      <p className="mt-2 text-xs text-muted">{item.riskReason}</p>
      <div className="mt-3 flex items-center gap-2 text-muted">
        {item.specialRequest && <Sparkles size={14} className="text-risk" />}
        {item.paymentReady ? <CreditCard size={14} className="text-ready" /> : <CreditCard size={14} className="text-blocked" />}
        {item.checkInReady ? <Smartphone size={14} className="text-ready" /> : <Smartphone size={14} className="text-idle" />}
        {item.status === 'ready' && <CheckCircle2 size={14} className="text-ready" />}
        <span className="ml-auto text-[11px] font-semibold text-navy">{item.nextAction}</span>
      </div>
    </button>
  )
}
