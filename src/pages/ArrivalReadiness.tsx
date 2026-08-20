import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { forecast } from '../data/mock'
import { useStore } from '../state/Store'
import { GuestCard } from '../components/cases/GuestCard'
import { WorkflowChips } from '../components/agents/UseCaseBoard'
import type { ReadinessStatus } from '../types'

const columns: { key: ReadinessStatus; title: string; hint: string }[] = [
  { key: 'ready', title: 'Ready', hint: 'Verified. Safe to message.' },
  { key: 'in-preparation', title: 'In preparation', hint: 'Work in flight' },
  { key: 'at-risk', title: 'At risk', hint: 'Promise under pressure' },
  { key: 'blocked', title: 'Blocked', hint: 'Cannot verify yet' },
]

export function ArrivalReadiness() {
  const { cases, search, select, approveMaya } = useStore()
  const q = search.trim().toLowerCase()
  const filtered = cases.filter((c) =>
    !q ||
    c.guestName.toLowerCase().includes(q) ||
    c.reservationId.toLowerCase().includes(q) ||
    (c.roomNumber ?? '').includes(q),
  )

  const kpis = [
    { n: '86', l: 'Arrivals today' },
    { n: '71', l: 'Rooms verified ready' },
    { n: '8', l: 'At risk' },
    { n: '3', l: 'Blocked' },
    { n: '82%', l: 'Ready by promised arrival' },
    { n: '52 min', l: 'Average turnaround' },
  ]

  return (
    <div className="space-y-6 pb-16">
      <div>
        <div className="page-kicker">Operations</div>
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight">Arrival Readiness</h1>
        <p className="mt-1 max-w-3xl text-sm text-muted">
            Ensure the right room is ready for the right guest at the right time — then communicate the verified outcome.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {kpis.map((k) => (
          <div key={k.l} className="border border-line bg-white p-4">
            <div className={`text-2xl font-semibold tracking-tight ${k.l.includes('risk') || k.l.includes('Blocked') ? 'text-risk' : 'text-navy'}`}>{k.n}</div>
            <div className="mt-1 text-xs text-muted">{k.l}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.4fr_0.9fr]">
        <section className="border border-line bg-white p-4">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold">Readiness forecast</h2>
              <p className="text-xs text-muted">Rooms expected ready vs promised arrivals</p>
            </div>
            <span className="rounded-full bg-risk-soft px-2 py-1 text-[11px] font-semibold text-risk">Peak 14:00</span>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={forecast}>
                <CartesianGrid stroke="#e8e4dc" vertical={false} />
                <XAxis dataKey="hour" tick={{ fontSize: 11, fill: '#8c8c8c' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#8c8c8c' }} axisLine={false} tickLine={false} />
                <Tooltip />
                <Bar dataKey="promised" fill="#d6d1c8" radius={0} />
                <Bar dataKey="ready" radius={0}>
                  {forecast.map((d) => (
                    <Cell key={d.hour} fill={d.hour === '14:00' ? '#ff83da' : '#000000'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="border border-line bg-white p-4">
          <h2 className="text-sm font-semibold">AI recommendations</h2>
          <p className="mb-3 text-xs text-muted">Nothing writes until you approve.</p>
          <div className="space-y-3">
            <Rec
              text="Kiara · 418 over dirty 412. Same Deluxe King, already clean, cot possible. 92%. Room change still needs you."
              onClick={() => {
                approveMaya()
                select('maya')
              }}
              action="Approve 418"
            />
            <Rec
              text="Sofia · 14:00 will miss if inspection stays unassigned. Priya S. is free on Floor 2. Ready message already locked."
              onClick={() => select('sofia')}
              action="Open Sofia"
            />
            <Rec
              text="Daniel · 507 will miss 15:00. 510 is an inspected suite. Suite moves never auto-run."
              onClick={() => select('daniel')}
              action="Open Daniel"
            />
          </div>
        </section>
      </div>

      <section className="border border-line bg-white p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold">Next 90 minutes — promise watch</h2>
            <p className="text-xs text-muted">Arrivals that can still miss a verified ready time. Recover here; do not invent a guest promise.</p>
          </div>
        </div>
        <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-4">
            {cases
            .filter((c) => ['maya', 'daniel', 'sofia', 'olivia'].includes(c.id) && c.status !== 'ready')
            .map((c) => (
              <button
                key={c.id}
                onClick={() => select(c.id)}
                className="border border-line p-3 text-left hover:border-navy"
              >
                <div className="text-sm font-semibold">{c.guestName}</div>
                <div className="text-xs text-muted">Arrival {c.eta} · {c.roomNumber ? `Room ${c.roomNumber}` : 'Unassigned'}</div>
                <div className="mt-2 text-xs font-medium text-risk">{c.nextAction}</div>
                <WorkflowChips c={c} />
              </button>
            ))}
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
        {columns.map((col) => {
          const items = filtered.filter((c) => c.status === col.key)
          return (
            <section key={col.key} className="min-h-[280px]">
              <div className="mb-3 flex items-end justify-between">
                <div>
                  <h2 className="text-sm font-semibold">{col.title}</h2>
                  <p className="text-xs text-muted">{col.hint}</p>
                </div>
                <span className="text-xs font-semibold text-muted">{items.length}</span>
              </div>
              <div className="space-y-3">
                {items.map((item) => (
                  <GuestCard key={item.id} item={item} />
                ))}
              </div>
            </section>
          )
        })}
      </div>
    </div>
  )
}

function Rec({
  text,
  action,
  onClick,
}: {
  text: string
  action: string
  onClick: () => void
}) {
  return (
    <div className="border border-line p-3">
      <p className="text-sm leading-relaxed">{text}</p>
      <button onClick={onClick} className="mt-3 rounded-full bg-ai px-3 py-1.5 text-xs font-semibold text-navy">
        {action}
      </button>
    </div>
  )
}
