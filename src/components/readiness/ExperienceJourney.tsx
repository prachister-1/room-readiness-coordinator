import type { ReadinessCase } from '../../types'

const steps = [
  { id: 'detect', n: '1', title: 'Detect', hint: 'Early arrival · 412 dirty · cot required · 418 clean' },
  { id: 'reason', n: '2', title: 'Reason', hint: 'Move to 418 · same category · 92%' },
  { id: 'act', n: '3', title: 'Act', hint: 'Tasks + Front Desk + hold 418 · approval to move' },
  { id: 'verify', n: '4', title: 'Verify', hint: 'Clean · cot · inspection · payment' },
  { id: 'communicate', n: '5', title: 'Communicate', hint: 'Guest message only after verified ready' },
] as const

export function experiencePhase(c: ReadinessCase): (typeof steps)[number]['id'] {
  if (c.message.status === 'sent') return 'communicate'
  if (c.status === 'ready') return 'communicate'
  if (c.roomNumber === '418' || c.recommendation?.approved) return 'verify'
  return 'act'
}

export function ExperienceJourney({ c }: { c: ReadinessCase }) {
  const current = experiencePhase(c)
  const order = steps.map((s) => s.id)
  const currentIdx = order.indexOf(current)
  const communicateDone = c.message.status === 'sent'

  return (
    <section className="rounded-2xl border border-line p-4">
      <div className="mb-1 text-[11px] font-bold tracking-[0.08em] text-muted uppercase">From risk to ready</div>
      <h3 className="text-sm font-semibold">One arrival, orchestrated end-to-end</h3>
      <div className="mt-3 grid grid-cols-5 gap-1.5">
        {steps.map((s, i) => {
          const done = communicateDone || i < currentIdx
          const active = !communicateDone && s.id === current
          return (
            <div
              key={s.id}
              className={`rounded-xl px-2 py-2 ${
                done ? 'bg-ready-soft' : active ? 'bg-info-soft ring-1 ring-info/30' : 'bg-canvas'
              }`}
            >
              <div className={`text-[10px] font-bold tracking-wide uppercase ${done ? 'text-ready' : active ? 'text-info' : 'text-muted'}`}>
                {s.n} {s.title}
              </div>
              <p className="mt-1 hidden text-[10px] leading-snug text-muted sm:block">{s.hint}</p>
            </div>
          )
        })}
      </div>
    </section>
  )
}
