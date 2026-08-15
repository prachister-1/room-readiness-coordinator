import type { ReactNode } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { causeBreakdown, deptCompletion, hourlyReadiness, readinessTrend } from '../data/mock'

export function Analytics() {
  const kpis = [
    { n: '82%', l: 'Verified ready by promised arrival' },
    { n: '64%', l: 'Early-arrival requests fulfilled' },
    { n: '52 min', l: 'Average room turnaround' },
    { n: '7.4', l: 'Manual reallocations per 100 arrivals' },
    { n: '94%', l: 'Inspection pass rate' },
    { n: '31 min', l: 'Average recovery time for blocked rooms' },
  ]

  const trust = [
    { n: '78%', l: 'Allocation recommendations accepted' },
    { n: '91%', l: 'Trace suggestions accepted' },
    { n: '12%', l: 'Staff overrides' },
    { n: '0', l: 'Incorrect room-ready messages' },
    { n: '4.4/5', l: 'Staff trust score' },
  ]

  return (
    <div className="space-y-6 pb-16">
      <div>
        <div className="text-[11px] font-bold tracking-[0.14em] text-ready uppercase">Performance</div>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">Room Readiness Performance</h1>
        <p className="mt-1 text-sm text-muted">
          Success is a verified room at the promised time — not a high automation rate.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {kpis.map((k) => (
          <div key={k.l} className="rounded-2xl border border-line bg-white p-4">
            <div className="text-2xl font-semibold tracking-tight">{k.n}</div>
            <div className="mt-1 text-xs text-muted">{k.l}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <ChartCard title="Readiness rate by hour">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={hourlyReadiness}>
              <CartesianGrid stroke="#e6eaf0" vertical={false} />
              <XAxis dataKey="hour" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} domain={[60, 100]} />
              <Tooltip />
              <Bar dataKey="rate" fill="#14805c" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="At-risk arrival causes">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={causeBreakdown} layout="vertical" margin={{ left: 80 }}>
              <CartesianGrid stroke="#e6eaf0" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="cause" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} width={110} />
              <Tooltip />
              <Bar dataKey="value" fill="#c47b12" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Verified-ready percentage · last 30 days">
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={readinessTrend}>
              <CartesianGrid stroke="#e6eaf0" />
              <XAxis dataKey="day" tick={{ fontSize: 10 }} interval={4} axisLine={false} tickLine={false} />
              <YAxis domain={[70, 90]} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip />
              <Line type="monotone" dataKey="ready" stroke="#2b6cb0" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Trace completion by department">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={deptCompletion}>
              <CartesianGrid stroke="#e6eaf0" vertical={false} />
              <XAxis dataKey="dept" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip />
              <Bar dataKey="complete" fill="#0f1f3d" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <section className="rounded-2xl border border-line bg-white p-5">
        <h2 className="text-sm font-semibold">AI quality and trust</h2>
        <p className="mt-1 mb-4 text-sm text-muted">
          The model proposes. Policy and operators dispose. Incorrect room-ready messages are a hard failure.
        </p>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
          {trust.map((k) => (
            <div key={k.l} className="rounded-xl bg-canvas p-4">
              <div className="text-xl font-semibold">{k.n}</div>
              <div className="mt-1 text-xs text-muted">{k.l}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

function ChartCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-line bg-white p-4">
      <h2 className="mb-3 text-sm font-semibold">{title}</h2>
      {children}
    </section>
  )
}
