import { caseWorkflow, liveAgentBoard } from '../../lib/agentWorkflow'
import type { ReadinessCase } from '../../types'
import { AgentMark, AgentTag } from './AgentMark'

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
          <div key={a.id} className="flex items-center gap-3 border border-line bg-white px-3 py-2.5">
            <AgentMark agent={a.id} live={a.items.length > 0} size="sm" />
            <div className="min-w-0">
              <div className="text-sm font-semibold">{a.name.replace(' Agent', '')}</div>
              <div className="truncate text-[11px] text-muted">
                {a.items.length ? `${a.items.length} live` : 'Idle'}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="overflow-x-auto border border-line">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="bg-white text-[11px] tracking-wide text-muted uppercase">
            <tr>
              {['Use case', 'Guest', 'Now', 'Waiting on'].map((h) => (
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
                    <button className="font-semibold underline-offset-2 hover:underline" onClick={() => onOpen(w.caseId)}>
                      {w.guestName}
                    </button>
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <AgentMark agent={current.agent} size="sm" />
                      <div>
                        <div className="font-medium">{current.title}</div>
                        <div className="text-[11px] text-muted">{current.agent}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2.5 text-[11px] text-muted">{w.waitingOnYou ?? 'In flight'}</td>
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
    <div className="mt-2 flex flex-wrap items-center gap-2">
      {flow.workingNow.slice(0, 3).map((w) => (
        <AgentTag key={w.agent} agent={w.agent} />
      ))}
    </div>
  )
}
