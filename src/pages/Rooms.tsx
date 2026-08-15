import { rooms } from '../data/mock'

const tone: Record<string, string> = {
  ready: 'bg-ready-soft text-ready',
  cleaning: 'bg-info-soft text-info',
  inspection: 'bg-risk-soft text-risk',
  blocked: 'bg-blocked-soft text-blocked',
  occupied: 'bg-slate-100 text-muted',
  vacant: 'bg-slate-100 text-navy',
}

export function Rooms() {
  return (
    <div className="space-y-5 pb-16">
      <div>
        <div className="text-[11px] font-bold tracking-[0.14em] text-ready uppercase">Inventory</div>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">Rooms</h1>
        <p className="mt-1 text-sm text-muted">Live room state feeding readiness cases. The coordinator does not replace the PMS — it reads allocation and writes only approved moves.</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {rooms.map((r) => (
          <div key={r.number} className="rounded-2xl border border-line bg-white p-4">
            <div className="flex items-center justify-between">
              <div className="text-lg font-semibold">{r.number}</div>
              <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${tone[r.status]}`}>{r.status}</span>
            </div>
            <div className="mt-1 text-sm text-muted">{r.type} · Floor {r.floor}</div>
            <p className="mt-3 text-sm">{r.note}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
