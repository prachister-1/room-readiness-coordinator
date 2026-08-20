import { useNavigate } from 'react-router-dom'
import { useStore } from '../state/Store'
import { getPromise } from '../lib/promise'
import { StatusBadge, Pill } from '../components/ui/Badge'

export function ShiftHandover() {
  const { cases, decisions, handoverAcks, ackHandover, ackAllHandover, select } = useStore()
  const navigate = useNavigate()
  const openCase = (id: string) => {
    navigate('/')
    select(id)
  }
  const pending = handoverAcks.filter((a) => !a.acknowledged).length
  const unresolved = cases.filter((c) => c.status !== 'ready' && ['maya', 'daniel', 'sofia', 'olivia', 'samira'].includes(c.id))
  const maya = cases.find((c) => c.id === 'maya')
  const promises = [
    {
      guest: 'Kiara Garcia',
      text: maya?.message.status === 'sent' ? '“Great news! Your room is ready earlier. Room 418 is ready for you.”' : 'No guest-ready message. Front Desk notified only. 418 held pending approval.',
      sent: maya?.message.status === 'sent' ? 'Sent' : 'Not sent',
      status: maya?.status === 'ready' ? `Verified ready · Room ${maya.roomNumber}` : maya?.roomNumber === '418' ? 'In preparation on 418 · cot / inspection' : 'At risk · 412 dirty · 418 recommended',
      risk: maya?.message.status === 'sent' ? 'Low' : 'High',
    },
    {
      guest: 'Daniel Kim',
      text: 'Holding note — suite being prepared, readiness not claimed',
      sent: cases.find((c) => c.id === 'daniel')?.message.status === 'sent' ? 'Sent' : 'Draft only',
      status: cases.find((c) => c.id === 'daniel')?.roomNumber === '510' ? 'In preparation on 510' : 'Blocked on 507',
      risk: 'Medium',
    },
    {
      guest: 'Olivia Brown',
      text: getPromise(cases.find((c) => c.id === 'olivia')!).currentPromise,
      sent: cases.find((c) => c.id === 'olivia')?.message.status === 'sent' ? 'Sent' : 'Not sent',
      status: getPromise(cases.find((c) => c.id === 'olivia')!).phase,
      risk: getPromise(cases.find((c) => c.id === 'olivia')!).phase === 'verified' ? 'Low' : 'Medium',
    },
  ]
  const watch = unresolved.map((c) => ({
    guest: c.guestName,
    eta: c.eta,
    action: c.nextAction,
    id: c.id,
  }))

  return (
    <div className="space-y-6 pb-16">
      <div className="border border-line bg-white p-6">
        <div className="page-kicker">Knowledge transfer</div>
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight">Evening Shift Handover</h1>
        <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm">
          <span>Outgoing: <strong>Alex Morgan</strong></span>
          <span>Incoming: <strong>Priya Shah</strong></span>
          <span>Shift change: <strong>15:00</strong></span>
        </div>
        <p className="mt-3 text-sm font-medium text-risk">{pending} items require acknowledgement</p>
      </div>

      <section className="overflow-x-auto rounded-2xl border border-line bg-white">
        <div className="px-5 pt-5 text-sm font-semibold">A. Unresolved readiness cases</div>
        <table className="mt-3 w-full min-w-[820px] text-left text-sm">
          <thead className="text-[11px] tracking-wide text-muted uppercase">
            <tr>
              {['Guest', 'Arrival', 'Room', 'Status', 'Blocker', 'Next action', 'Owner'].map((h) => (
                <th key={h} className="px-5 py-2">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {unresolved.map((c) => (
              <tr key={c.id} className="border-t border-line">
                <td className="px-5 py-3">
                  <button className="font-semibold text-ready" onClick={() => openCase(c.id)}>{c.guestName}</button>
                </td>
                <td className="px-5 py-3">{c.eta}</td>
                <td className="px-5 py-3">{c.roomNumber ?? 'Unassigned'}</td>
                <td className="px-5 py-3"><StatusBadge status={c.status} /></td>
                <td className="px-5 py-3 text-muted">{c.riskReason}</td>
                <td className="px-5 py-3">{c.nextAction}</td>
                <td className="px-5 py-3">{c.id === 'olivia' ? 'Front Desk' : 'Priya S.'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="rounded-2xl border border-line bg-white p-5">
        <h2 className="text-sm font-semibold">B. Guest promises already made</h2>
        <p className="mt-1 text-xs text-muted">Incoming staff must know what the guest already believes.</p>
        <div className="mt-3 space-y-3">
          {promises.map((p) => (
            <div key={p.guest} className="rounded-xl bg-canvas px-4 py-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="font-semibold">{p.guest}</div>
                <Pill tone={p.risk === 'Low' ? 'ready' : 'risk'}>{p.risk} risk</Pill>
              </div>
              <p className="mt-1 text-sm">{p.text}</p>
              <p className="mt-1 text-xs text-muted">Sent {p.sent} · {p.status}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-line bg-white p-5">
        <h2 className="text-sm font-semibold">C. Decisions still open</h2>
        <div className="mt-3 space-y-2">
          {decisions.filter((d) => d.status === 'open').map((d) => (
            <div key={d.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-canvas px-4 py-3">
              <div>
                <div className="text-sm font-semibold">{d.title}</div>
                <div className="text-xs text-muted">{d.agents} · {d.confidence}%</div>
              </div>
              <button className="text-sm font-semibold text-ready" onClick={() => navigate('/inbox')}>
                Open inbox
              </button>
            </div>
          ))}
          {decisions.every((d) => d.status !== 'open') && <p className="text-sm text-muted">No open decisions. Inbox is clear.</p>}
        </div>
      </section>

      <section className="rounded-2xl border border-line bg-white p-5">
        <h2 className="text-sm font-semibold">D. Watch items for the next 90 minutes</h2>
        <p className="mt-1 text-xs text-muted">These arrivals can still miss a promise if inspection or allocation stalls.</p>
        <ul className="mt-3 space-y-2">
          {watch.map((w) => (
            <li key={w.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-canvas px-4 py-3 text-sm">
              <span>
                <button className="font-semibold text-ready" onClick={() => openCase(w.id)}>{w.guest}</button>
                {' '}arrives {w.eta} — {w.action}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-2xl border border-line bg-white p-5">
        <h2 className="text-sm font-semibold">E. Acknowledge handover</h2>
        <p className="mt-1 text-sm text-muted">Priya Shah must acknowledge active readiness risks before taking the floor.</p>
        <div className="mt-3 space-y-2">
          {handoverAcks.map((a) => (
            <label key={a.id} className="flex items-start gap-3 rounded-xl bg-canvas px-4 py-3 text-sm">
              <input type="checkbox" checked={a.acknowledged} onChange={() => ackHandover(a.id)} className="mt-1" />
              <span>{a.label}</span>
            </label>
          ))}
        </div>
        <button
          className="mt-4 rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
          disabled={pending === 0}
          onClick={ackAllHandover}
        >
          {pending === 0 ? 'Handover acknowledged' : 'Acknowledge all remaining items'}
        </button>
      </section>
    </div>
  )
}
