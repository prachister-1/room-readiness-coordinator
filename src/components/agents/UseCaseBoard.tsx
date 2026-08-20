import { caseWorkflow, liveAgentBoard } from '../../lib/agentWorkflow'
import type { ReadinessCase } from '../../types'
import { AgentIdentity, AgentMark, AgentTag } from './AgentMark'

export function UseCaseBoard({
  cases,
  onOpen,
}: {
  cases: ReadinessCase[]
  onOpen: (id: string) => void
}) {
  const { workflows, byAgent } = liveAgentBoard(cases)

  return (
    <div className="space-y-4">
      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
        {byAgent.map((a) => (
          <div key={a.id} className="rounded-2xl border border-line bg-white p-3">
            <AgentIdentity
              agent={a.id}
              live={a.items.length > 0}
              detail={a.items.length ? `${a.items.length} live use cases` : 'Idle on open use cases'}
            />
            <ul className="mt-3 space-y-1.5">
              {a.items.slice(0, 3).map((item) => (
                <li key={item.caseId}>
                  <button onClick={() => onOpen(item.caseId)} className="w-full rounded-lg bg-canvas px-2 py-1.5 text-left hover:bg-ai-soft/50">
                    <div className="text-xs font-semibold">{item.guest}</div>
                    <div className="line-clamp-2 text-[11px] text-muted">{item.action}</div>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="overflow-x-auto rounded-2xl border border-line">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="bg-canvas text-[11px] tracking-wide text-muted uppercase">
            <tr>
              {['Use case', 'Guest', 'Now', 'Crew'].map((h) => (
                <th key={h} className="px-3 py-2 font-semibold">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {workflows.map((w) => {
              const current = w.steps.find((s) => s.status === 'active') ?? w.steps[w.steps.length - 1]
              return (
                <tr key={w.caseId} className="border-t border-line">
                  <td className="px-3 py-2.5">
                    <div className="font-medium">{w.playbook}</div>
                    <div className="text-[11px] text-muted">{w.useCase}</div>
                  </td>
                  <td className="px-3 py-2.5">
                    <button className="font-semibold text-navy underline-offset-2 hover:underline" onClick={() => onOpen(w.caseId)}>
                      {w.guestName}
                    </button>
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <AgentMark agent={current.agent} live size="sm" />
                      <div>
                        <div className="font-medium">{current.title}</div>
                        <div className="text-[11px] text-muted">{current.agent}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex -space-x-1.5">
                      {w.workingNow.map((n) => (
                        <AgentMark key={n.agent} agent={n.agent} live={n.kind !== 'human'} size="sm" className="ring-2 ring-white" />
                      ))}
                    </div>
                    <div className="mt-1 text-[11px] text-muted">{w.waitingOnYou ?? 'In flight'}</div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function WorkflowChips({ c }: { c: ReadinessCase }) {
  const flow = caseWorkflow(c)
  if (!flow) return null
  return (
    <div className="mt-2 flex flex-wrap items-center gap-1">
      {flow.workingNow.slice(0, 3).map((w) => (
        <AgentTag key={w.agent} agent={w.agent} live={w.kind !== 'human'} />
      ))}
    </div>
  )
}
