import { useEffect, useState } from 'react'
import { Flag, Play, Check } from 'lucide-react'
import { useStore } from '../state/Store'

export function Housekeeping() {
  const { hkTasks, startTask, completeTask, submitFlag } = useStore()
  const [activeId, setActiveId] = useState(hkTasks[1]?.id ?? hkTasks[0].id)
  const [sheet, setSheet] = useState(false)
  const active = hkTasks.find((t) => t.id === activeId) ?? hkTasks[0]
  const done = hkTasks.filter((t) => t.status === 'complete').length
  const dispatched = hkTasks.filter((t) => t.source === 'coordinator' && t.status !== 'complete')
  const dispatchedKey = dispatched.map((t) => t.id).join('|')

  useEffect(() => {
    const first = dispatchedKey.split('|')[0]
    if (first) setActiveId(first)
  }, [dispatchedKey])

  return (
    <div className="mx-auto max-w-[430px] pb-20">
      <div className="mb-4 text-center md:mb-6">
        <p className="text-[11px] font-bold tracking-[0.12em] text-muted uppercase">Housekeeping staff view</p>
        <p className="text-xs text-muted">Only the next room, the due time, and why it matters.</p>
      </div>
      <div className="overflow-hidden rounded-lg border border-line bg-white">
        <div className="bg-navy px-5 pt-6 pb-5 text-white">
          <div className="text-[11px] tracking-wide text-white/70 uppercase">My tasks</div>
          <div className="mt-1 text-xl font-semibold">Anna K. — Floor 4</div>
          <div className="mt-2 text-sm text-white/80">Today’s progress: {done} of {hkTasks.length} complete</div>
          <div className="mt-3 h-1.5 overflow-hidden bg-white/15">
            <div className="h-full bg-lime" style={{ width: `${(done / hkTasks.length) * 100}%` }} />
          </div>
        </div>
        <div className="grid gap-0 sm:grid-cols-1">
          <ul className="max-h-[280px] overflow-y-auto border-b border-line">
            {hkTasks.map((t) => (
              <li key={t.id}>
                <button
                  onClick={() => setActiveId(t.id)}
                  className={`flex w-full items-center justify-between px-5 py-3 text-left ${activeId === t.id ? 'bg-canvas' : ''}`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="text-sm font-semibold">Room {t.roomNumber}</div>
                      {t.source === 'coordinator' && t.status !== 'complete' && (
                        <span className="rounded-full bg-info-soft px-1.5 py-0.5 text-[9px] font-bold tracking-wide text-info uppercase">New</span>
                      )}
                    </div>
                    <div className="text-xs text-muted">{t.title}</div>
                  </div>
                  <span className={`text-[11px] font-bold ${t.status === 'complete' ? 'text-ready' : t.status === 'blocked' ? 'text-blocked' : 'text-risk'}`}>
                    {t.status === 'complete' ? 'Complete' : t.status === 'blocked' ? 'Blocked' : `Due ${t.dueTime}`}
                  </span>
                </button>
              </li>
            ))}
          </ul>
          <div className="p-5">
            <div className="text-[11px] font-bold tracking-wide text-muted uppercase">Task detail</div>
            <h2 className="mt-1 text-2xl font-semibold">Room {active.roomNumber}</h2>
            <p className="mt-1 text-sm font-medium">{active.action}</p>
            <p className="mt-1 text-xs text-muted">
              Due {active.dueTime}
              {active.source === 'coordinator' ? ' · Dispatched by Coordinator' : ''}
            </p>
            <div className="mt-4 rounded-2xl bg-canvas p-3">
              <div className="text-[11px] font-bold text-muted uppercase">Why it matters</div>
              <p className="mt-1 text-sm leading-relaxed">{active.why}</p>
            </div>
            <div className="mt-4">
              <div className="text-[11px] font-bold text-muted uppercase">Required items</div>
              <ul className="mt-1 list-disc pl-4 text-sm">
                {active.items.map((i) => (
                  <li key={i}>{i}</li>
                ))}
              </ul>
            </div>
            <div className="mt-4">
              <div className="text-[11px] font-bold text-muted uppercase">Completion checklist</div>
              <div className="mt-2 space-y-2">
                {active.checklist.map((c) => (
                  <div key={c.id} className="flex items-center gap-2 text-sm">
                    <span className={`grid h-4 w-4 place-items-center rounded border ${c.complete ? 'border-ready bg-ready text-white' : 'border-line'}`}>
                      {c.complete && <Check size={10} />}
                    </span>
                    {c.label}
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-5 grid grid-cols-3 gap-2">
              <button className="rounded-xl border border-line py-2 text-xs font-semibold" onClick={() => startTask(active.id)}>
                <Play size={12} className="mr-1 inline" /> Start
              </button>
              <button className="rounded-xl bg-ready py-2 text-xs font-semibold text-white" onClick={() => completeTask(active.id)}>
                Mark complete
              </button>
              <button className="rounded-xl border border-blocked/30 bg-blocked-soft py-2 text-xs font-semibold text-blocked" onClick={() => setSheet(true)}>
                <Flag size={12} className="mr-1 inline" /> Flag
              </button>
            </div>
          </div>
        </div>
      </div>

      {sheet && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-navy/40 p-4" onClick={() => setSheet(false)}>
          <div className="w-full max-w-[430px] rounded-t-3xl bg-white p-5" onClick={(e) => e.stopPropagation()}>
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-line" />
            <h3 className="text-lg font-semibold">Flag a problem</h3>
            <p className="mb-3 text-sm text-muted">Room {active.roomNumber}. Coordinator will re-evaluate the readiness plan.</p>
            {['Maintenance issue', 'Room not vacated', 'Missing item', 'Cannot complete', 'Other'].map((reason) => (
              <button
                key={reason}
                className="mb-2 w-full rounded-xl border border-line px-4 py-3 text-left text-sm font-medium hover:bg-canvas"
                onClick={() => {
                  submitFlag(reason)
                  setSheet(false)
                }}
              >
                {reason}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
