import { useEffect, useState } from 'react'
import { coordinatorStats, specialistAgents } from '../data/agents'
import { simulations } from '../data/simulations'
import { workKindForAgent } from '../lib/workKind'
import { KindBadge, WorkKindLegend } from '../components/ui/WorkKind'
import { useStore } from '../state/Store'

const demoSims = ['special', 'blocked', 'inspection', 'early'] as const

export function AgentOrchestration() {
  const { automatedToday, decisions } = useStore()
  const awaiting = decisions.filter((d) => d.status === 'open').length
  const [openId, setOpenId] = useState<string | null>('allocation')
  const [sim, setSim] = useState<(typeof demoSims)[number]>('special')
  const [step, setStep] = useState(-1)
  const [running, setRunning] = useState(false)
  const agent = specialistAgents.find((a) => a.id === openId)
  const steps = simulations[sim].steps
  const visible = step < 0 ? [] : steps.slice(0, step + 1)

  useEffect(() => {
    if (!running) return
    if (step >= steps.length - 1) {
      setRunning(false)
      return
    }
    const t = window.setTimeout(() => setStep((s) => s + 1), 850)
    return () => window.clearTimeout(t)
  }, [running, step, steps.length])

  return (
    <div className="space-y-5 pb-16">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="text-[11px] font-bold tracking-[0.14em] text-ready uppercase">Control plane</div>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">Agent Orchestration</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted">
            AI ranks and flags. Automation creates tasks and locks ready messages. You approve room changes.
          </p>
        </div>
        <WorkKindLegend />
      </div>

      <section className="rounded-2xl border border-line bg-white p-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
          <div>
            <div className="text-[11px] font-bold tracking-[0.12em] text-ready uppercase">Parent</div>
            <h2 className="text-lg font-semibold">Room Readiness Coordinator</h2>
            <p className="text-sm text-muted">Owns state. Specialists cannot mark ready or message the guest.</p>
          </div>
          <div className="flex gap-4 text-center">
            {[
              [coordinatorStats.atRisk, 'At risk'],
              [automatedToday, 'Automated today'],
              [awaiting, 'Awaiting you'],
            ].map(([n, l]) => (
              <div key={String(l)}>
                <div className="text-xl font-semibold">{n}</div>
                <div className="text-[11px] text-muted">{l}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
          {specialistAgents.map((a) => (
            <button
              key={a.id}
              onClick={() => setOpenId(a.id)}
              className={`rounded-xl border p-3 text-left ${
                openId === a.id ? 'border-ai bg-ai-soft/60' : 'border-line hover:border-ai/40'
              }`}
            >
              <KindBadge kind={a.kind} />
              <div className="mt-2 text-sm font-semibold">{a.name}</div>
              <p className="mt-1 line-clamp-2 text-xs text-muted">{a.currentActions[0]}</p>
            </button>
          ))}
        </div>

        {agent && (
          <div className="mt-4 rounded-xl bg-canvas p-4">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm font-semibold">{agent.name}</h3>
              <KindBadge kind={agent.kind} showHint />
            </div>
            <p className="mt-2 text-sm">{agent.example}</p>
            <p className="mt-2 text-xs text-muted">
              Guardrails: {agent.guardrails.join(' · ')}
            </p>
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-line bg-white p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold">Watch the flow</h2>
            <p className="text-xs text-muted">Storyboard only — does not change live cases.</p>
          </div>
          <button
            className="rounded-lg bg-navy px-3 py-2 text-sm font-semibold text-white"
            onClick={() => {
              setStep(0)
              setRunning(true)
            }}
          >
            Run
          </button>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {demoSims.map((k) => (
            <button
              key={k}
              onClick={() => {
                setSim(k)
                setStep(-1)
                setRunning(false)
              }}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold ${sim === k ? 'bg-navy text-white' : 'bg-canvas text-muted'}`}
            >
              {simulations[k].label}
            </button>
          ))}
        </div>
        <ol className="mt-4 space-y-2">
          {visible.length === 0 && (
            <p className="text-sm text-muted">Run to see each step tagged AI, Automation, or Human.</p>
          )}
          {visible.map((s, i) => {
            const kind = workKindForAgent(s.agent, s.event, s.action)
            const active = i === visible.length - 1
            return (
              <li
                key={s.time + s.event}
                className={`flex gap-3 rounded-xl border px-3 py-2.5 ${
                  active
                    ? kind === 'ai'
                      ? 'border-ai/30 bg-ai-soft'
                      : kind === 'human'
                        ? 'border-navy/20 bg-navy/5'
                        : 'border-ready/30 bg-ready-soft'
                    : 'border-line'
                }`}
              >
                <div className="w-10 shrink-0 pt-0.5 text-xs font-semibold text-muted">{s.time}</div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <KindBadge kind={kind} />
                    <span className="text-sm font-medium">{s.event}</span>
                    <span className="text-xs text-muted">{s.agent}</span>
                  </div>
                  <p className="mt-0.5 text-sm text-muted">{s.action}</p>
                </div>
              </li>
            )
          })}
        </ol>
      </section>
    </div>
  )
}
