import { useNavigate } from 'react-router-dom'
import { playbooks } from '../data/playbooks'
import { useStore } from '../state/Store'
import { AgentMark } from '../components/agents/AgentMark'

const jump: Record<string, string> = {
  early: 'olivia',
  special: 'maya',
  blocked: 'daniel',
  checkout: 'james',
  inspection: 'sofia',
}

const workflow = [
  { title: 'Detect', kind: 'ai' as const, agent: 'Exception' },
  { title: 'Reason', kind: 'ai' as const, agent: 'Allocation' },
  { title: 'Act', kind: 'auto' as const, agent: 'Task' },
  { title: 'Verify', kind: 'auto' as const, agent: 'Coordinator' },
  { title: 'Communicate', kind: 'auto' as const, agent: 'Mews messaging' },
]

export function Playbooks() {
  const { select } = useStore()
  const navigate = useNavigate()
  return (
    <div className="space-y-6 pb-16">
      <div>
        <div className="text-[11px] font-bold tracking-[0.14em] text-ready uppercase">Reusable workflows</div>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">Operational Playbooks</h1>
        <p className="mt-1 max-w-3xl text-sm text-muted">
          Each playbook uses the same specialists as the architecture slide: Allocation, Task, Exception, Trace. Guest messaging executes in Mews after the Coordinator verifies.
        </p>
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        {playbooks.map((p) => (
          <article key={p.id} className="rounded-2xl border border-line bg-white p-5">
            <h2 className="text-lg font-semibold">{p.title}</h2>
            <div className="mt-3 grid grid-cols-5 gap-1">
              {workflow.map((s) => (
                <div key={s.title} className="rounded-lg bg-canvas px-1.5 py-2 text-center">
                  <AgentMark agent={s.agent} size="sm" />
                  <div className="mt-1 text-[10px] font-bold tracking-wide text-muted uppercase">{s.title}</div>
                  <div className="mt-0.5 hidden text-[10px] text-muted sm:block">{s.agent}</div>
                </div>
              ))}
            </div>
            <Field label="Trigger" value={p.trigger} />
            <Field label="Agents involved" value={p.agents.join(' · ')} />
            <Field label="Automated actions" value={p.automated.join(' · ')} />
            <Field label="Approval points" value={p.approvals.join(' · ')} />
            <Field label="Guest outcome" value={p.outcome} />
            <Field label="Success measure" value={p.measure} />
            <div className="mt-4 rounded-xl bg-canvas p-3">
              <div className="text-[11px] font-bold text-muted uppercase">Example</div>
              <p className="mt-1 text-sm">{p.example}</p>
              <p className="mt-2 text-sm font-medium">{p.recommendation}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {p.actions.map((a) => (
                  <span key={a} className="rounded-full bg-white px-2 py-1 text-[11px] font-semibold ring-1 ring-line">
                    {a}
                  </span>
                ))}
              </div>
              {jump[p.id] && (
                <button
                  className="mt-3 text-sm font-semibold text-ready"
                  onClick={() => {
                    navigate('/')
                    select(jump[p.id])
                  }}
                >
                  Open live case
                </button>
              )}
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="mt-3">
      <div className="text-[11px] font-bold tracking-wide text-muted uppercase">{label}</div>
      <p className="mt-0.5 text-sm">{value}</p>
    </div>
  )
}
