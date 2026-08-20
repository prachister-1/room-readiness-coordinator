import type { ReadinessCase } from '../../types'
import { caseWorkflow, type FlowStep } from '../../lib/agentWorkflow'
import { AgentMark, AgentTag } from '../agents/AgentMark'

export function ExperienceJourney({ c }: { c: ReadinessCase }) {
  const flow = caseWorkflow(c)
  if (!flow) return null
  const communicateDone = c.message.status === 'sent'

  return (
    <section className="rounded-2xl border border-line p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <div className="text-[11px] font-bold tracking-[0.08em] text-muted uppercase">
            {flow.useCase} · {flow.playbook}
          </div>
          <h3 className="mt-1 text-sm font-semibold">Agents on this workflow</h3>
        </div>
        {flow.waitingOnYou && (
          <span className="inline-flex items-center gap-2">
            <AgentTag agent="human" live />
            <span className="text-[11px] font-semibold text-navy">{flow.waitingOnYou}</span>
          </span>
        )}
      </div>
      <div className="mt-3 grid grid-cols-5 gap-1.5">
        {flow.steps.map((s) => (
          <StepCard key={s.id} step={s} doneOverride={communicateDone} />
        ))}
      </div>
      <ul className="mt-3 space-y-2">
        {flow.workingNow.map((w) => (
          <li key={w.agent + w.action} className="flex items-start gap-2.5">
            <AgentMark agent={w.agent} live size="sm" />
            <div className="min-w-0 pt-0.5">
              <div className="text-xs font-semibold">{w.agent}</div>
              <div className="text-[11px] leading-snug text-muted">{w.action}</div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}

function StepCard({ step, doneOverride }: { step: FlowStep; doneOverride: boolean }) {
  const done = doneOverride || step.status === 'done'
  const active = !doneOverride && step.status === 'active'
  return (
    <div
      className={`rounded-xl px-2 py-2 ${
        done ? 'bg-ready-soft' : active ? 'bg-ai-soft ring-1 ring-ai/25' : 'bg-canvas'
      }`}
    >
      <AgentMark agent={step.agent} live={active} size="sm" />
      <div className={`mt-1.5 text-[10px] font-bold tracking-wide uppercase ${done ? 'text-ready' : active ? 'text-ai' : 'text-muted'}`}>
        {step.title}
      </div>
      <p className="mt-0.5 hidden text-[10px] leading-snug font-medium sm:block">{step.agent.replace(' Agent', '').replace('Staff evidence', 'You')}</p>
      <p className="mt-0.5 hidden text-[10px] leading-snug text-muted lg:block">{step.work}</p>
    </div>
  )
}
