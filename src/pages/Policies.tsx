import { useStore } from '../state/Store'
import type { AutonomyMode } from '../types'

const modes: { id: AutonomyMode; name: string; use: string; note: string }[] = [
  { id: 'recommend', name: 'Recommend only', use: 'Default for new properties', note: 'Agents propose. Staff execute in Mews. No prototype writes.' },
  { id: 'approve', name: 'Approve-to-execute', use: 'This property today', note: 'Same-category inspected moves and trace reassignment after a click.' },
  { id: 'bounded', name: 'Bounded auto-execution', use: 'Eligible SOP work only', note: 'Auto-runs reversible prep. Suite, VIP, accessibility, and room-ready promises stay human-owned.' },
]

export function Policies() {
  const { autonomyMode, setAutonomyMode, runBoundedAutomation, automatedToday } = useStore()

  const matrix = [
    ['Same-category inspected room move', 'Approve-to-execute if already assigned', 'Duty manager'],
    ['Task create / re-priority within SOP', autonomyMode === 'bounded' ? 'Auto' : 'Auto after plan approval', 'Coordinator'],
    ['Suite / VIP / accessibility change', 'Escalate only — never auto', 'Duty manager'],
    ['Payment or rate write', 'Forbidden', 'Front office / finance'],
    ['Room-ready guest message', 'After Coordinator verification', 'Guest Messaging (Mews)'],
    ['Holding / expectation message', autonomyMode === 'bounded' ? 'Auto if approved template' : 'Approved templates', 'Guest Messaging (Mews)'],
  ]

  const stops = [
    'Never assign out-of-order or uninspected rooms',
    'Never downgrade category automatically',
    'Never violate an accessibility requirement',
    'Never autonomously move a VIP',
    'Never claim a room is ready before mandatory checks',
    'Never write payments, rates, or compensation',
  ]

  const sops = [
    ['Early-arrival pack', 'If assigned room is dirty, rank a same-category ready alternative; do not message ready'],
    ['Cot delivery', 'Approved amenity; photo evidence; Ready blocked until complete'],
    ['Room assignment change', 'Duty manager approval; Task Agent may hold the alternative in advance'],
    ['Blocked room', 'OOO flag; Exception + Allocation; copy only relevant tasks'],
    ['Failed inspection', 'Rework tasks with failure reason; Guest Messaging silent unless guest must be told'],
  ]

  return (
    <div className="space-y-6 pb-16">
      <div>
        <div className="page-kicker">Safe operation</div>
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight">Policies & Guardrails</h1>
        <p className="mt-1 max-w-3xl text-sm text-muted">
          Agents automate preparation work to save time. They do not automate guest promises or policy exceptions. Only the Coordinator changes overall readiness state.
        </p>
      </div>

      <section className="grid gap-3 md:grid-cols-3">
        {modes.map((m) => (
          <button
            key={m.id}
            onClick={() => setAutonomyMode(m.id)}
            className={`rounded-2xl border p-5 text-left ${
              autonomyMode === m.id ? 'border-navy bg-canvas' : 'border-line bg-white'
            }`}
          >
            <div className="text-sm font-semibold">{m.name}</div>
            <div className="mt-1 text-xs font-semibold text-muted">{autonomyMode === m.id ? 'Active' : m.use}</div>
            <p className="mt-2 text-sm text-muted">{m.note}</p>
          </button>
        ))}
      </section>

      {autonomyMode === 'bounded' && (
        <section className="border border-line bg-canvas p-5">
          <h2 className="text-sm font-semibold">Run eligible automations</h2>
          <p className="mt-1 text-sm text-muted">
            Will auto-run Olivia’s same-category assignment, an expectation-setting message, and Sofia’s inspection reassignment. Will not move Kiara’s already-assigned room, Daniel’s suite, or Samira’s accessible room.
          </p>
          <button className="mt-3 rounded-full bg-ai px-4 py-2 text-sm font-semibold text-navy" onClick={runBoundedAutomation}>
            Run eligible automations
          </button>
          <p className="mt-2 text-xs text-muted">{automatedToday} automated actions recorded today.</p>
        </section>
      )}

      <section className="overflow-x-auto rounded-2xl border border-line bg-white">
        <div className="px-5 pt-5 text-sm font-semibold">Approval matrix</div>
        <table className="mt-3 w-full min-w-[640px] text-left text-sm">
          <thead className="text-[11px] tracking-wide text-muted uppercase">
            <tr>
              {['Action', 'Mode', 'Owner'].map((h) => (
                <th key={h} className="px-5 py-2">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {matrix.map((r) => (
              <tr key={r[0]} className="border-t border-line">
                {r.map((c) => (
                  <td key={c} className="px-5 py-3">{c}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="rounded-2xl border border-line bg-white p-5">
        <h2 className="text-sm font-semibold">Hard stops</h2>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {stops.map((s) => (
            <li key={s} className="rounded-xl bg-blocked-soft px-3 py-2 text-sm text-blocked">
              {s}
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-2xl border border-line bg-white p-5">
        <h2 className="text-sm font-semibold">Property SOP library</h2>
        <div className="mt-3 space-y-2">
          {sops.map(([n, d]) => (
            <div key={n} className="rounded-xl bg-canvas px-4 py-3">
              <div className="text-sm font-semibold">{n}</div>
              <div className="text-sm text-muted">{d}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-line bg-white p-5">
        <h2 className="text-sm font-semibold">Kill switch</h2>
        <p className="mt-2 text-sm text-muted">
          Switch to Recommend only or Pause without redeploying. Existing Mews records stay the system of record. Override, rollback, and audit remain available.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            onClick={() => setAutonomyMode('pause')}
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              autonomyMode === 'pause' ? 'bg-blocked text-white' : 'bg-canvas'
            }`}
          >
            Pause automation
          </button>
          <span className="rounded-full bg-canvas px-3 py-1 text-xs font-semibold">
            Live: {modes.find((m) => m.id === autonomyMode)?.name}
          </span>
        </div>
      </section>
    </div>
  )
}
