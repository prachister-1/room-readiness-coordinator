import { useMemo, useState } from 'react'
import { useStore } from '../state/Store'
import { StatusBadge, Pill } from '../components/ui/Badge'

export function GuestMessages() {
  const { cases, updateMessage, sendDraft, sendReadyMessage } = useStore()
  const [id, setId] = useState('maya')
  const c = cases.find((x) => x.id === id) ?? cases[0]
  const readyLocked = c.status !== 'ready' || !c.checks.every((k) => k.complete)
  const bodyLooksReady = /room is ready/i.test(c.message.body)

  const preview = useMemo(() => c.message.body, [c.message.body])

  return (
    <div className="grid gap-6 pb-16 lg:grid-cols-[280px_1fr]">
      <aside className="rounded-2xl border border-line bg-white">
        <div className="border-b border-line px-4 py-3 text-sm font-semibold">Guest messages</div>
        {cases.map((item) => (
          <button
            key={item.id}
            onClick={() => setId(item.id)}
            className={`flex w-full items-center justify-between border-b border-line px-4 py-3 text-left last:border-0 ${id === item.id ? 'bg-canvas' : ''}`}
          >
            <div>
              <div className="text-sm font-semibold">{item.guestName}</div>
              <div className="text-xs text-muted">{item.message.status === 'sent' ? 'Sent' : item.message.status === 'draft' ? 'Draft' : 'Locked'}</div>
            </div>
            <StatusBadge status={item.status} />
          </button>
        ))}
      </aside>
      <section className="rounded-2xl border border-line bg-white p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{c.guestName}</h1>
            <p className="text-sm text-muted">
              {c.roomNumber ? `Room ${c.roomNumber}` : 'Unassigned'} · {c.roomType} · ETA {c.eta}
            </p>
          </div>
          <Pill tone={c.message.safeToSend && !readyLocked ? 'ready' : 'risk'}>{c.message.approvalLabel}</Pill>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <label className="text-xs font-semibold text-muted">
            Channel
            <select
              className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-sm text-navy"
              value={c.message.channel}
              onChange={(e) => updateMessage(c.id, { channel: e.target.value as typeof c.message.channel })}
            >
              <option>SMS</option>
              <option>WhatsApp</option>
              <option>Email</option>
            </select>
          </label>
          <label className="text-xs font-semibold text-muted">
            Language
            <select
              className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-sm text-navy"
              value={c.message.language}
              onChange={(e) => updateMessage(c.id, { language: e.target.value })}
            >
              <option>English</option>
              <option>Spanish</option>
              <option>French</option>
            </select>
          </label>
          <div className="flex items-end">
            <button
              className="w-full rounded-lg bg-navy py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300"
              disabled={bodyLooksReady && readyLocked}
              onClick={() => (c.status === 'ready' && !readyLocked ? sendReadyMessage(c.id) : sendDraft(c.id))}
            >
              Send now
            </button>
          </div>
        </div>

        <div className="mt-5">
          <div className="mb-2 text-xs font-semibold text-muted">
            {c.message.status === 'sent' ? 'Sent message' : 'Editable draft'}
          </div>
          <textarea
            className="min-h-[160px] w-full rounded-2xl border border-line bg-canvas p-4 text-sm leading-relaxed outline-none focus:border-info"
            value={preview}
            onChange={(e) => updateMessage(c.id, { body: e.target.value })}
          />
        </div>

        {readyLocked && (
          <div className="mt-4 rounded-2xl border border-risk/20 bg-risk-soft p-4 text-sm">
            Room-ready copy cannot be sent until every required readiness check is complete. You may still send a holding update that does not claim the room is ready.
          </div>
        )}
        {c.id === 'maya' && c.message.status === 'sent' && (
          <p className="mt-4 text-sm text-ready">Sent at 11:43 after Room 412 was verified ready. Feather-free preference referenced from the approved SOP.</p>
        )}
      </section>
    </div>
  )
}
