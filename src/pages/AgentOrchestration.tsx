import { useEffect, useState } from 'react'
import { coordinatorStats, specialistAgents } from '../data/agents'
import { simulations } from '../data/simulations'
import { StateMachine } from '../components/readiness/StateMachine'
import { Pill } from '../components/ui/Badge'
import { useStore } from '../state/Store'

const simKeys = Object.keys(simulations) as Array<keyof typeof simulations>

export function AgentOrchestration() {
  const { automatedToday, decisions, autonomyMode, runBoundedAutomation } = useStore()
  const awaiting = decisions.filter((d) => d.status === 'open').length
  const [openId, setOpenId] = useState<string | null>(null)
  const [sim, setSim] = useState<keyof typeof simulations>('blocked')
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
    const t = window.setTimeout(() => setStep((s) => s + 1), 900)
    return () => window.clearTimeout(t)
  }, [running, step, steps.length])

  const run = () => {
    setStep(0)
    setRunning(true)
  }

  return (
    <div className="space-y-6 pb-16">
      <div>
        <div className="text-[11px] font-bold tracking-[0.14em] text-ready uppercase">Control plane</div>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">Agent Orchestration</h1>
        <p className="mt-1 max-w-3xl text-sm text-muted">
          The Room Readiness Coordinator is the parent agent. Specialists recommend or produce evidence. Only the Coordinator changes overall readiness state — and only then may Messaging speak to the guest.
        </p>
      </div>

      <div className="relative overflow-hidden rounded-[28px] border border-line bg-white p-5 md:p-8">
        <div className="pointer-events-none absolute inset-0 opacity-70">
          <div className="agent-pulse absolute top-1/2 left-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full bg-ready-soft" />
        </div>
        <div className="relative mx-auto max-w-xl rounded-3xl border-2 border-ready bg-ready-soft p-5 text-center shadow-[0_12px_40px_rgba(20,128,92,0.12)]">
          <div className="text-[11px] font-bold tracking-[0.14em] text-ready uppercase">Parent orchestrator</div>
          <h2 className="mt-1 text-2xl font-semibold">Room Readiness Coordinator</h2>
          <p className="mt-2 text-sm text-muted">Coordinates the right room, right preparation, verified readiness, and guest communication.</p>
          <div className="mt-4 grid grid-cols-2 gap-2 text-left sm:grid-cols-4">
            {[
              [coordinatorStats.cases, 'Current Readiness Cases'],
              [coordinatorStats.atRisk, 'At-risk cases'],
              [automatedToday, 'Automated actions today'],
              [awaiting, 'Awaiting approval'],
            ].map(([n, l]) => (
              <div key={String(l)} className="rounded-2xl bg-white p-3">
                <div className="text-xl font-semibold">{n}</div>
                <div className="text-[11px] text-muted">{l}</div>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-ready">Last orchestration event: {coordinatorStats.lastEvent}</p>
          {autonomyMode === 'bounded' && (
            <button className="mt-3 rounded-lg bg-ready px-4 py-2 text-sm font-semibold text-white" onClick={runBoundedAutomation}>
              Run eligible automations
            </button>
          )}
        </div>

        <div className="relative mx-auto mt-1 hidden h-10 max-w-5xl xl:block" aria-hidden>
          <svg className="h-full w-full" viewBox="0 0 1000 40" preserveAspectRatio="none">
            {[100, 300, 500, 700, 900].map((x) => (
              <g key={x}>
                <line x1="500" y1="0" x2={x} y2="40" stroke="#14805c" strokeWidth="1.5" strokeDasharray="4 4" />
                <circle cx={x} cy="40" r="3" fill="#14805c" />
              </g>
            ))}
          </svg>
        </div>

        <div className="relative mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          {specialistAgents.map((a) => (
            <button
              key={a.id}
              onClick={() => setOpenId(a.id)}
              className={`rounded-2xl border bg-white p-4 text-left transition hover:-translate-y-0.5 ${
                openId === a.id ? 'border-ready shadow-md' : 'border-line'
              }`}
            >
              <div className="mb-2 h-px w-8 bg-ready" />
              <div className="text-sm font-semibold">{a.name}</div>
              <p className="mt-2 line-clamp-3 text-xs text-muted">{a.purpose}</p>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-[11px] font-semibold text-info">{a.confidence}</span>
                {a.awaitingApproval && <Pill tone="risk">Approval</Pill>}
              </div>
            </button>
          ))}
        </div>
      </div>

      {agent && (
        <section className="rounded-2xl border border-line bg-white p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold">{agent.name}</h2>
              <p className="mt-1 max-w-2xl text-sm text-muted">{agent.purpose}</p>
            </div>
            <button className="text-sm text-muted" onClick={() => setOpenId(null)}>
              Close
            </button>
          </div>
          <p className="mt-3 rounded-xl bg-canvas p-3 text-sm">{agent.example}</p>
          <div className="mt-3 text-sm">
            <span className="font-semibold">Confidence: </span>
            {agent.confidence}
            {agent.awaitingApproval && <span className="ml-2 text-risk">· 1 action awaiting approval</span>}
          </div>
          <div className="mt-4">
            <List title="Current actions" items={agent.currentActions} />
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <List title="Inputs" items={agent.inputs} />
            <List title="Outputs" items={agent.outputs} />
            <List title="Guardrails" items={agent.guardrails} />
          </div>
          <div className="mt-4 text-sm">
            <span className="font-semibold">Linked Readiness Cases: </span>
            {agent.cases.join(' · ')}
          </div>
          <p className="mt-2 text-xs text-muted">Last action: {agent.lastAction}. This agent cannot independently promise a room to a guest.</p>
        </section>
      )}

      <section className="rounded-2xl border border-line bg-white p-5">
        <StateMachine />
      </section>

      <section className="grid gap-4 xl:grid-cols-[1fr_320px]">
        <div className="rounded-2xl border border-line bg-white p-5">
          <h2 className="text-sm font-semibold">Run simulation</h2>
          <p className="mt-1 text-sm text-muted">Watch the Coordinator call specialists. Approval steps stay visible.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {simKeys.map((k) => (
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
          <button className="mt-4 rounded-lg bg-ready px-4 py-2 text-sm font-semibold text-white" onClick={run}>
            Run workflow
          </button>
          <ol className="mt-5 space-y-3">
            {visible.map((s, i) => (
              <li key={s.time + s.event} className={`rounded-xl border p-3 ${i === visible.length - 1 ? 'border-ready bg-ready-soft' : 'border-line'}`}>
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="font-semibold">{s.time}</span>
                  <Pill tone="info">{s.agent}</Pill>
                  <span className="text-muted">{s.approval}</span>
                </div>
                <div className="mt-1 text-sm font-medium">{s.event}</div>
                <div className="text-sm text-muted">{s.action}</div>
                <div className="mt-1 text-xs text-muted">
                  Confidence {s.confidence} · State: {s.state}
                </div>
              </li>
            ))}
          </ol>
        </div>
        <aside className="rounded-2xl border border-line bg-white p-5">
          <h2 className="text-sm font-semibold">Audit trail</h2>
          <p className="mb-3 text-xs text-muted">Timestamp, actor, action, reason, policy, outcome.</p>
          {visible.length === 0 && <p className="text-sm text-muted">Run a workflow to fill the log.</p>}
          <div className="space-y-3">
            {visible.map((s) => (
              <div key={s.time + s.action} className="border-b border-line pb-3 text-xs last:border-0">
                <div className="font-semibold">{s.time} · {s.agent}</div>
                <div>{s.action}</div>
                <div className="text-muted">{s.event}</div>
                <div className="mt-1 text-ready">{s.policy}</div>
                <div className="text-muted">{s.outcome}</div>
              </div>
            ))}
          </div>
        </aside>
      </section>
    </div>
  )
}

function List({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <div className="text-[11px] font-bold tracking-wide text-muted uppercase">{title}</div>
      <ul className="mt-2 list-disc space-y-1 pl-4 text-sm">
        {items.map((i) => (
          <li key={i}>{i}</li>
        ))}
      </ul>
    </div>
  )
}
