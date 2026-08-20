import type { ReadinessCase } from '../../types'
import { caseWorkflow, type FlowStep } from '../../lib/agentWorkflow'
import { AgentMark } from '../agents/AgentMark'

export function ExperienceJourney({ c }: { c: ReadinessCase }) {
  const flow = caseWorkflow(c)
  if (!flow) return null
  const communicateDone = c.message.status === 'sent'

  return (
    <section className="border border-line p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <div className="page-kicker">{flow.useCase}</div>
          <h3 className="mt-1 text-sm font-semibold">Workflow</h3>
        </div>
        {flow.waitingOnYou && <span className="text-[11px] font-semibold">{flow.waitingOnYou}</span>}
      </div>
      <div className="mt-3 grid grid-cols-5 gap-1">
        {flow.steps.map((s) => (
          <StepCard key={s.id} step={s} doneOverride={communicateDone} />
        ))}
      </div>
    </section>
  )
}

function StepCard({ step, doneOverride }: { step: FlowStep; doneOverride: boolean }) {
  const done = doneOverride || step.status === 'done'
  const active = !doneOverride && step.status === 'active'
  return (
    <div className={`px-2 py-2 ${done ? 'bg-ready-soft' : active ? 'bg-ai-soft' : 'bg-canvas'}`}>
      <AgentMark agent={step.agent} live={active} size="sm" />
      <div className={`mt-1.5 text-[10px] font-semibold uppercase ${done ? 'text-ready' : active ? 'text-navy' : 'text-muted'}`}>
        {step.title}
      </div>
    </div>
  )
}
