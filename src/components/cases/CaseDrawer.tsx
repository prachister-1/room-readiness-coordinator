import { useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, Circle, X } from 'lucide-react'
import { useStore } from '../../state/Store'
import { StatusBadge, Pill } from '../ui/Badge'
import { AutoBullet, KindBadge, MagicBullet } from '../ui/WorkKind'
import { AgentMark } from '../agents/AgentMark'
import { workKindForAgent } from '../../lib/workKind'
import { ArrivalPromisePanel, EvidencePack } from '../readiness/ArrivalPromise'
import { CaseStateMachine } from '../readiness/StateMachine'
import { ExperienceJourney } from '../readiness/ExperienceJourney'
import { caseWorkflow } from '../../lib/agentWorkflow'
import { traceClass } from '../../lib/status'

export function CaseDrawer() {
  const store = useStore()
  const navigate = useNavigate()
  const c = store.selected
  const [tab, setTab] = useState<'case' | 'audit'>('case')
  if (!c) return null

  const allChecks = c.checks.every((k) => k.complete) && c.status === 'ready'
  const canSendReady = allChecks

  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-navy/25" onClick={() => store.select(null)}>
      <aside
        className="flex h-full w-full max-w-[640px] flex-col overflow-y-auto bg-white shadow-[-16px_0_40px_rgba(15,31,61,0.12)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 border-b border-line bg-white px-6 py-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-[11px] font-bold tracking-[0.12em] text-muted uppercase">Readiness Case</div>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight">{c.guestName}</h2>
              <p className="mt-1 text-sm text-muted">
                Reservation #{c.reservationId} · Arrival today, {c.eta} · Promised check-in {c.promisedCheckIn}
              </p>
            </div>
            <button className="rounded-lg p-2 hover:bg-canvas" onClick={() => store.select(null)} aria-label="Close">
              <X size={18} />
            </button>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <StatusBadge status={c.status} />
            <span className="text-sm text-muted">{c.roomNumber ? `Room ${c.roomNumber}, ${c.roomType}` : `Unassigned · ${c.roomType}`}</span>
            <span className="text-sm font-medium">{c.statusDetail}</span>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              className="rounded-lg border border-line px-3 py-2 text-sm font-medium hover:bg-canvas"
              onClick={() => {
                store.select(null)
                navigate('/messages')
              }}
            >
              Message guest
            </button>
            <button className="rounded-lg border border-line px-3 py-2 text-sm font-medium hover:bg-canvas" onClick={() => setTab('audit')}>
              View audit trail
            </button>
            <button className="rounded-lg border border-line px-3 py-2 text-sm font-medium hover:bg-canvas" onClick={() => store.toast('Override logged. Allocation remains operator-owned.')}>
              Override allocation
            </button>
          </div>
          <div className="mt-4 flex gap-2">
            {(['case', 'audit'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium ${tab === t ? 'bg-navy text-white' : 'bg-canvas text-muted'}`}
              >
                {t === 'case' ? 'Case' : 'Audit trail'}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-5 px-6 py-5 pb-24">
          {tab === 'audit' ? (
            <section className="rounded-2xl border border-line">
              {c.audit.map((a) => (
                <div key={a.id} className="grid grid-cols-[64px_1fr] gap-3 border-b border-line px-4 py-3 last:border-0">
                  <div className="text-xs text-muted">{a.time}</div>
                  <div className="flex gap-2.5">
                    <AgentMark agent={a.actor} size="sm" />
                    <div>
                      <div className="text-sm font-medium">{a.action}</div>
                      <div className="mt-1 flex flex-wrap items-center gap-1.5">
                        <KindBadge kind={workKindForAgent(a.actor, a.action, a.reason)} />
                        <span className="text-xs text-muted">{a.actor} · {a.reason}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </section>
          ) : (
            <>
              <CaseStateMachine c={c} />
              {caseWorkflow(c) && <ExperienceJourney c={c} />}
              <CaseActions />
              <ArrivalPromisePanel c={c} />
              <EvidencePack c={c} />
              <Timeline c={c} />

              <section className="rounded-2xl border border-line p-4">
                <h3 className="text-sm font-semibold">Why this room?</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{c.whyThisRoom}</p>
              </section>

              <section>
                <h3 className="mb-2 text-sm font-semibold">Guest requirements</h3>
                <div className="flex flex-wrap gap-2">
                  {c.requirements.map((r) => (
                    <Pill key={r.id} tone={r.met ? 'ready' : 'risk'}>
                      {r.label}
                    </Pill>
                  ))}
                </div>
              </section>

              <section>
                <h3 className="mb-2 text-sm font-semibold">Room readiness checks</h3>
                <div className="rounded-2xl border border-line">
                  {c.checks.map((k) => (
                    <div key={k.id} className="flex items-center gap-3 border-b border-line px-4 py-3 last:border-0">
                      {k.complete ? <Check size={16} className="text-ready" /> : <Circle size={16} className="text-idle" />}
                      <span className="text-sm">{k.label}</span>
                    </div>
                  ))}
                </div>
                {!canSendReady && (
                  <p className="mt-2 text-xs text-muted">Room-ready guest messages stay locked until every check above is complete.</p>
                )}
              </section>

              <section>
                <h3 className="mb-2 text-sm font-semibold">Active and completed traces</h3>
                <div className="overflow-x-auto rounded-2xl border border-line">
                  <table className="w-full min-w-[520px] text-left text-sm">
                    <thead className="bg-canvas text-[11px] tracking-wide text-muted uppercase">
                      <tr>
                        {['Trace', 'Department', 'Owner', 'Status', 'Due', 'Evidence'].map((h) => (
                          <th key={h} className="px-3 py-2 font-semibold">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {c.traces.map((t) => (
                        <tr key={t.id} className="border-t border-line">
                          <td className="px-3 py-2.5">{t.name}</td>
                          <td className="px-3 py-2.5 text-muted">{t.department}</td>
                          <td className="px-3 py-2.5">{t.owner}</td>
                          <td className="px-3 py-2.5">
                            <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${traceClass[t.status]}`}>{t.status}</span>
                          </td>
                          <td className="px-3 py-2.5">{t.dueTime}</td>
                          <td className="px-3 py-2.5 text-muted">{t.evidence}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </>
          )}
        </div>
      </aside>
      {store.chooseRoomFor === 'sofia' && <RoomPicker />}
    </div>
  )
}

function Timeline({ c }: { c: import('../../types').ReadinessCase }) {
  return (
    <section>
      <h3 className="mb-3 text-sm font-semibold">Readiness timeline</h3>
      <div className="space-y-0">
        {c.timeline.map((t, i) => (
          <div key={t.id} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div className={`h-3 w-3 rounded-full ${t.complete ? 'bg-ready' : 'bg-slate-300'}`} />
              {i < c.timeline.length - 1 && <div className={`w-px flex-1 ${t.complete ? 'bg-ready/40' : 'bg-line'}`} />}
            </div>
            <div className="pb-4">
              <div className="text-sm font-medium">{t.label}</div>
              <div className="text-xs text-muted">{t.time}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

function ActionCard({
  title,
  tone,
  children,
}: {
  title: string
  tone: 'ready' | 'risk' | 'info'
  children: ReactNode
}) {
  const border = tone === 'ready' ? 'border-ready/30 bg-ready-soft' : tone === 'risk' ? 'border-risk/30 bg-risk-soft' : 'border-info/30 bg-info-soft'
  return (
    <section className={`rounded-2xl border p-4 ${border}`}>
      <div className="mb-1 text-[11px] font-bold tracking-[0.08em] uppercase">
        {tone === 'ready' ? 'Verified outcome' : 'AI recommendation — not yet executed'}
      </div>
      <h3 className="text-sm font-semibold">{title}</h3>
      <div className="mt-2">{children}</div>
    </section>
  )
}

function SplitWork({
  ai,
  auto,
  human,
}: {
  ai: string[]
  auto: string[]
  human: string
}) {
  return (
    <>
      <p className="text-sm font-semibold text-ai">AI reasoned</p>
      <ul className="mt-2 space-y-1.5">
        {ai.map((item) => (
          <MagicBullet key={item}>{item}</MagicBullet>
        ))}
      </ul>
      <p className="mt-3 text-sm font-semibold text-ready">Already automated</p>
      <ul className="mt-2 space-y-1.5">
        {auto.map((item) => (
          <AutoBullet key={item}>{item}</AutoBullet>
        ))}
      </ul>
      <p className="mt-3 text-xs text-muted">{human}</p>
    </>
  )
}

function MayaRecovery() {
  const { approveMaya, keepMaya } = useStore()
  return (
    <ActionCard tone="risk" title="Move Kiara to Room 418">
      <SplitWork
        ai={[
          '418 is the same Deluxe King, already clean, cot possible, no downstream conflict',
          '92% vs rush-cleaning dirty 412',
        ]}
        auto={['Priority clean on 412', 'Cot staged on Floor 4', 'Front Desk notified · 418 held']}
        human="Human: approve the room change. Agents cannot move an assigned guest."
      />
      <div className="mt-4 flex flex-wrap gap-2">
        <button className="rounded-lg bg-navy px-3 py-2 text-sm font-semibold text-white" onClick={approveMaya}>
          Approve move to 418
        </button>
        <button className="rounded-lg border border-line bg-white px-3 py-2 text-sm font-medium" onClick={keepMaya}>
          Keep Room 412
        </button>
      </div>
    </ActionCard>
  )
}

function SofiaRecovery() {
  const { approveSofia, chooseAnotherRoom, escalateSofia } = useStore()
  return (
    <ActionCard tone="risk" title="Recover Sofia’s 14:00 inspection">
      <SplitWork
        ai={['14:00 promise will miss if inspection stays unassigned', 'Priya S. is free on Floor 2 · expected ready 13:56']}
        auto={['Clean on 225 already complete', 'Inspection marked overdue', 'Ready message locked']}
        human="Human: approve reassignment, pick another room, or escalate. This is reversible SOP work."
      />
      <div className="mt-4 flex flex-wrap gap-2">
        <button className="rounded-lg bg-navy px-3 py-2 text-sm font-semibold text-white" onClick={approveSofia}>
          Approve reassignment
        </button>
        <button className="rounded-lg border border-line bg-white px-3 py-2 text-sm font-medium" onClick={chooseAnotherRoom}>
          Choose another room
        </button>
        <button className="rounded-lg border border-line bg-white px-3 py-2 text-sm font-medium" onClick={escalateSofia}>
          Escalate
        </button>
      </div>
    </ActionCard>
  )
}

function SofiaComplete() {
  const { completeSofiaInspection } = useStore()
  return (
    <ActionCard tone="info" title="Inspection in progress">
      <p className="mb-3 text-sm">Automation assigned Priya S. to 225. Staff evidence still required before any guest-ready message.</p>
      <button className="rounded-lg bg-info px-3 py-2 text-sm font-semibold text-white" onClick={completeSofiaInspection}>
        Mark inspection complete
      </button>
    </ActionCard>
  )
}

function DanielRecovery() {
  const { approveDaniel, keepDaniel, contactDaniel } = useStore()
  return (
    <ActionCard tone="risk" title="Recover Daniel’s suite — 507 blocked">
      <SplitWork
        ai={['507 will miss 15:00', '510 is an inspected suite, no maintenance, predicted ready 14:42 · 92%']}
        auto={['507 marked out of order', 'Bathroom leak flagged overdue', 'Ready message locked']}
        human="Human: suite moves never auto-run. Approve 510, keep 507, or send a holding note."
      />
      <div className="mt-4 flex flex-wrap gap-2">
        <button className="rounded-lg bg-navy px-3 py-2 text-sm font-semibold text-white" onClick={approveDaniel}>
          Approve move to 510
        </button>
        <button className="rounded-lg border border-line bg-white px-3 py-2 text-sm font-medium" onClick={keepDaniel}>
          Keep 507
        </button>
        <button className="rounded-lg border border-line bg-white px-3 py-2 text-sm font-medium" onClick={contactDaniel}>
          Holding note only
        </button>
      </div>
    </ActionCard>
  )
}

function OliviaAssign() {
  const { assignOlivia } = useStore()
  return (
    <ActionCard tone="risk" title="Assign Olivia to Room 416">
      <SplitWork
        ai={['416 is an inspected Standard Double that can take 12:30', '418 is held for Kiara’s 12:00 recovery — do not steal it']}
        auto={['Early-arrival pack queued', 'Ready message locked until inspection']}
        human="Human: first assignment still needs approval unless bounded auto is on."
      />
      <div className="mt-4">
        <button className="rounded-lg bg-navy px-3 py-2 text-sm font-semibold text-white" onClick={assignOlivia}>
          Assign Room 416
        </button>
      </div>
    </ActionCard>
  )
}

function KenjiStop() {
  return (
    <ActionCard tone="risk" title="VIP hard stop — Kenji Tanaka">
      <SplitWork
        ai={['701 turn is late after a checkout delay']}
        auto={['VIP / suite policy fired', 'Automatic room move blocked', 'Ready message locked']}
        human="Human only: duty manager decides recovery. AI does not move a VIP."
      />
    </ActionCard>
  )
}

function PriyaStop() {
  return (
    <ActionCard tone="risk" title="No accessible substitute — Priya Nair">
      <SplitWork
        ai={['105 is the only inspected accessible king', 'A non-accessible room would miss the requirement']}
        auto={['105 on maintenance hold', 'Substitute search stopped', 'Ready message locked']}
        human="Human only: escalate. Policy forbids inventing a fit."
      />
    </ActionCard>
  )
}

function SamiraStop() {
  const { approveSamira } = useStore()
  return (
    <ActionCard tone="risk" title="Accessible move — Samira Khan">
      <SplitWork
        ai={['112 door operator is down', '214 is an inspected accessible king — the only legal alternative']}
        auto={['Automatic move blocked', 'Ready message locked']}
        human="Human only: accessibility bookings never auto-move. Approve 214 or escalate."
      />
      <div className="mt-4">
        <button className="rounded-lg bg-navy px-3 py-2 text-sm font-semibold text-white" onClick={approveSamira}>
          Approve move to 214
        </button>
      </div>
    </ActionCard>
  )
}

function ReadyMessage({ id, body }: { id: string; body: string }) {
  const { sendReadyMessage } = useStore()
  return (
    <ActionCard tone="ready" title="Send room ready message">
      <p className="mb-3 text-sm whitespace-pre-wrap">{body}</p>
      <button className="rounded-lg bg-ready px-3 py-2 text-sm font-semibold text-white" onClick={() => sendReadyMessage(id)}>
        Send room ready message
      </button>
    </ActionCard>
  )
}

function CaseActions() {
  const store = useStore()
  const c = store.selected
  if (!c) return null

  return (
    <>
      {c.id === 'maya' && c.roomNumber === '412' && !c.recommendation?.approved && <MayaRecovery />}
      {c.id === 'maya' && c.roomNumber === '418' && c.status !== 'ready' && !c.checks.find((k) => k.id === 'k2')?.complete && (
        <ActionCard tone="info" title="Verify before communicating">
          <p className="mb-3 text-sm">418 is assigned and already clean. Install the cot, then inspect. Do not tell the guest the room is ready yet.</p>
          <button className="rounded-lg bg-info px-3 py-2 text-sm font-semibold text-white" onClick={store.completeMayaCot}>
            Mark cot installed
          </button>
        </ActionCard>
      )}
      {c.id === 'maya' && c.inspectionCompletable && (
        <ActionCard tone="info" title="Inspection in progress">
          <p className="mb-3 text-sm">Cot is verified on 418. When the supervisor signs off, the guest-ready template unlocks.</p>
          <button className="rounded-lg bg-info px-3 py-2 text-sm font-semibold text-white" onClick={store.completeMayaInspection}>
            Mark inspection complete
          </button>
        </ActionCard>
      )}
      {c.id === 'maya' && c.status === 'ready' && c.message.status !== 'sent' && (
        <ReadyMessage id="maya" body={c.message.body} />
      )}
      {c.id === 'maya' && c.status === 'ready' && c.message.status === 'sent' && (
        <ActionCard tone="ready" title="Verified outcome">
          <p className="text-sm">Guest informed. Room 418 is ready. No further action required.</p>
        </ActionCard>
      )}

      {c.id === 'sofia' && c.status === 'at-risk' && !c.recommendation?.approved && <SofiaRecovery />}
      {c.id === 'sofia' && c.inspectionCompletable && <SofiaComplete />}
      {c.id === 'sofia' && c.status === 'ready' && c.message.status !== 'sent' && (
        <ReadyMessage id="sofia" body="All required checks are complete. The guest-facing room-ready template is now unlocked." />
      )}

      {c.id === 'daniel' && c.roomNumber === '507' && c.status === 'blocked' && <DanielRecovery />}
      {c.id === 'daniel' && c.roomNumber === '510' && (
        <ActionCard tone="info" title="Holding message — do not claim ready">
          <p className="mb-3 text-sm whitespace-pre-wrap">{c.message.body}</p>
          <Pill tone="risk">Awaiting operational confirmation</Pill>
        </ActionCard>
      )}

      {c.id === 'olivia' && !c.roomNumber && <OliviaAssign />}
      {c.id === 'olivia' && c.status === 'ready' && c.message.status !== 'sent' && (
        <ReadyMessage id="olivia" body="Verified ready at 12:12. The guest-facing room-ready template is now unlocked." />
      )}

      {c.id === 'kenji' && c.status === 'blocked' && <KenjiStop />}
      {c.id === 'priya' && c.status === 'blocked' && <PriyaStop />}
      {c.id === 'samira' && c.status === 'blocked' && c.roomNumber === '112' && <SamiraStop />}
    </>
  )
}

function RoomPicker() {
  const { assignSofiaRoom } = useStore()
  const options = [
    { n: '228', note: 'Deluxe King · inspected · Floor 2' },
    { n: '231', note: 'Deluxe King · clean, inspection pending' },
    { n: '414', note: 'Deluxe King · ready · quiet floor (already promised to Luca)' },
  ]
  return (
    <div className="absolute inset-0 z-50 grid place-items-center bg-navy/40 p-4" onClick={(e) => e.stopPropagation()}>
      <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
        <h3 className="text-lg font-semibold">Choose another room</h3>
        <p className="mt-1 text-sm text-muted">Only same-category rooms are shown. A new room still requires verification before any room-ready message.</p>
        <div className="mt-4 space-y-2">
          {options.map((o) => (
            <button
              key={o.n}
              disabled={o.n === '414'}
              onClick={() => assignSofiaRoom(o.n)}
              className="w-full rounded-xl border border-line p-3 text-left hover:border-ready disabled:opacity-40"
            >
              <div className="font-semibold">Room {o.n}</div>
              <div className="text-xs text-muted">{o.note}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
