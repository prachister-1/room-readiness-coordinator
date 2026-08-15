import type { ReactNode } from 'react'
import { AlertTriangle, Clock, ShieldAlert, Sparkles } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { forecast } from '../data/mock'
import { useStore } from '../state/Store'
import { GuestCard } from '../components/cases/GuestCard'
import type { ReadinessStatus } from '../types'

const columns: { key: ReadinessStatus; title: string; hint: string }[] = [
  { key: 'ready', title: 'Ready', hint: 'Verified. Safe to message.' },
  { key: 'in-preparation', title: 'In preparation', hint: 'Work in flight' },
  { key: 'at-risk', title: 'At risk', hint: 'Promise under pressure' },
  { key: 'blocked', title: 'Blocked', hint: 'Cannot verify yet' },
]

export function ArrivalReadiness() {
  const { cases, search, select, assignOlivia } = useStore()
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
    { n: '9', l: 'At risk' },
    { n: '3', l: 'Blocked' },
    { n: '82%', l: 'Ready by promised arrival' },
    { n: '52 min', l: 'Average turnaround' },
  ]

  return (
    <div className="space-y-6 pb-16">
      <div>
        <div className="text-[11px] font-bold tracking-[0.14em] text-ready uppercase">Operations</div>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">Arrival Readiness</h1>
        <p className="mt-1 max-w-3xl text-sm text-muted">
            Ensure the right room is ready for the right guest at the right time — then communicate the verified outcome.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {kpis.map((k) => (
          <div key={k.l} className="rounded-2xl border border-line bg-white p-4 shadow-[0_1px_2px_rgba(15,31,61,0.04)]">
            <div className={`text-2xl font-semibold tracking-tight ${k.l.includes('risk') || k.l.includes('Blocked') ? 'text-risk' : 'text-navy'}`}>{k.n}</div>
            <div className="mt-1 text-xs text-muted">{k.l}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.4fr_0.9fr]">
        <section className="rounded-2xl border border-line bg-white p-4">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold">Readiness forecast</h2>
              <p className="text-xs text-muted">Rooms expected ready vs promised arrivals</p>
            </div>
            <span className="rounded-full bg-risk-soft px-2 py-1 text-[11px] font-semibold text-risk">Peak pressure 14:00</span>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={forecast}>
                <CartesianGrid stroke="#e6eaf0" vertical={false} />
                <XAxis dataKey="hour" tick={{ fontSize: 11, fill: '#5b6b82' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#5b6b82' }} axisLine={false} tickLine={false} />
                <Tooltip />
                <Bar dataKey="promised" fill="#c5d0de" radius={[4, 4, 0, 0]} />
                <Bar dataKey="ready" radius={[4, 4, 0, 0]}>
                  {forecast.map((d) => (
                    <Cell key={d.hour} fill={d.hour === '14:00' ? '#c47b12' : '#14805c'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="rounded-2xl border border-line bg-white p-4">
          <div className="mb-3 flex items-center gap-2">
            <Sparkles size={16} className="text-info" />
            <h2 className="text-sm font-semibold">AI recommendations</h2>
          </div>
          <p className="mb-3 text-xs text-muted">Explainable suggestions. Nothing writes until you approve.</p>
          <div className="space-y-3">
            <Rec
              icon={<Clock size={14} />}
              text="Assign Room 416 to Olivia Brown: inspected, matches booking and supports 12:30 arrival"
              onClick={() => {
                assignOlivia()
                select('olivia')
              }}
              action="Assign 416"
            />
            <Rec
              icon={<AlertTriangle size={14} />}
              text="Reassign cleaning trace for Room 225 to available attendant to protect Sofia Garcia’s 14:00 promise"
              onClick={() => select('sofia')}
              action="Open Sofia"
            />
            <Rec
              icon={<ShieldAlert size={14} />}
              text="Escalate Room 507 maintenance; alternative suite 510 is available"
              onClick={() => select('daniel')}
              action="Open Daniel"
            />
          </div>
        </section>
      </div>

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
  icon,
  text,
  action,
  onClick,
}: {
  icon: ReactNode
  text: string
  action: string
  onClick: () => void
}) {
  return (
    <div className="rounded-xl border border-line bg-canvas p-3">
      <div className="mb-2 flex items-center gap-2 text-info">{icon}<span className="text-[11px] font-bold tracking-wide uppercase">Recommendation</span></div>
      <p className="text-sm leading-relaxed">{text}</p>
      <button onClick={onClick} className="mt-2 text-xs font-semibold text-navy underline-offset-2 hover:underline">
        {action}
      </button>
    </div>
  )
}
