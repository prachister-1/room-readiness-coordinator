import { useEffect, useRef, useState } from 'react'
import { FilePlus2, Headphones, MessageCircle, Sparkles } from 'lucide-react'
import type { Interaction, ServiceCase } from './types'

export const INTAKE_STEPS = [
  { id: 'inbound', title: 'Inbound contact', icon: MessageCircle },
  { id: 'genesys', title: 'Genesys intake', icon: Headphones },
  { id: 'ava', title: 'Ava attempt', icon: Sparkles },
  { id: 'case', title: 'Case created', icon: FilePlus2 },
] as const

export function useInboundPlayback(interactionId?: string) {
  const [active, setActive] = useState(4)
  const [playing, setPlaying] = useState(false)
  const timers = useRef<number[]>([])

  function clear() {
    timers.current.forEach(clearTimeout)
    timers.current = []
  }

  function play() {
    clear()
    setPlaying(true)
    setActive(0)
    timers.current = [0, 1, 2, 3, 4].map((step, i) =>
      window.setTimeout(() => {
        setActive(step)
        if (step === 4) setPlaying(false)
      }, 750 * i),
    )
  }

  useEffect(() => {
    play()
    return clear
    // Replay when a different inbound is selected.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [interactionId])

  return { active, playing, play }
}

export function GenesysIntakeBar({
  interaction,
  serviceCase,
  active,
  playing,
  onReplay,
}: {
  interaction?: Interaction
  serviceCase?: ServiceCase
  active: number
  playing: boolean
  onReplay: () => void
}) {
  const captions =
    interaction && serviceCase
      ? [
          `${labelChannel(interaction.channel)} from ${interaction.traveller}`,
          `${interaction.genesysId} · ${interaction.routing}`,
          interaction.ava,
          `${serviceCase.caseNumber} created automatically · ${serviceCase.contextCompleteness}% context`,
        ]
      : [
          'WhatsApp, phone, chat or email',
          'Identity, queue and skill captured',
          'Self-serve or escalate with intent',
          'TravelXen case opens with full context',
        ]

  const status =
    active < 1 ? 'Waiting for contact' : active < 4 ? 'Creating case from Genesys inbound…' : 'Case in TravelXen'

  return (
    <section className="mb-5 overflow-hidden rounded-[14px] border border-line bg-white shadow-[0_1px_2px_rgba(21,0,44,0.04),0_10px_28px_rgba(21,0,44,0.04)]">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line bg-ink px-4 py-2.5 text-white">
        <div className="flex items-center gap-2 text-sm">
          <span className="relative flex h-2 w-2">
            <span className={`absolute inline-flex h-full w-full rounded-full bg-teal ${playing ? 'animate-ping' : ''} opacity-70`} />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-teal" />
          </span>
          <span className="font-medium">Genesys inbound</span>
          <span className="text-white/55">→ automatic TravelXen case</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[12px] text-white/70">{status}</span>
          <button type="button" className="rounded-full bg-white/10 px-3 py-1 text-[12px] font-medium hover:bg-white/15" onClick={onReplay}>
            Replay inbound
          </button>
        </div>
      </div>

      <ol className="grid gap-0 sm:grid-cols-4">
        {INTAKE_STEPS.map((step, i) => {
          const Icon = step.icon
          const done = active > i
          const current = active === i
          return (
            <li key={step.id} className={`relative px-4 py-4 ${i < 3 ? 'sm:border-r sm:border-line' : ''}`}>
              <div className="flex items-start gap-3">
                <span
                  className={`grid h-9 w-9 shrink-0 place-items-center rounded-full text-sm ${
                    done || current ? 'bg-purple text-white' : 'bg-canvas text-muted'
                  } ${current ? 'ring-4 ring-purple-soft' : ''}`}
                >
                  <Icon size={16} />
                </span>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-medium tracking-[0.12em] text-muted uppercase">0{i + 1}</span>
                    {current ? <span className="chip bg-amber-soft text-amber">Live</span> : null}
                    {done ? <span className="chip bg-teal-soft text-teal">Done</span> : null}
                  </div>
                  <div className="mt-0.5 text-sm font-medium">{step.title}</div>
                  <p className="mt-0.5 text-[12px] leading-snug text-muted">{captions[i]}</p>
                </div>
              </div>
            </li>
          )
        })}
      </ol>
    </section>
  )
}

function labelChannel(channel: Interaction['channel']) {
  const map = { whatsapp: 'WhatsApp', phone: 'Phone', chat: 'Chat', email: 'Email' }
  return map[channel]
}
