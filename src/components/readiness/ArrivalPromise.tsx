import { useState } from 'react'
import { useStore } from '../../state/Store'
import { confidenceBand, getPromise, promisePhases } from '../../lib/promise'
import type { ReadinessCase } from '../../types'
import { Pill } from '../ui/Badge'

export function ArrivalPromisePanel({ c }: { c: ReadinessCase }) {
  const p = getPromise(c)
  const band = confidenceBand(p.predictedConfidence)
  const [tip, setTip] = useState(false)
  const verified = p.phase === 'verified' && Boolean(p.verifiedReadyAt)

  return (
    <section className="rounded-2xl border border-line p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold">Arrival Promise</h3>
          <p className="mt-0.5 text-xs text-muted">Requested arrival is not a hotel promise.</p>
        </div>
        <div className="relative">
          <button
            className="rounded-full border border-line px-2 py-0.5 text-[11px] font-semibold text-muted"
            onClick={() => setTip((v) => !v)}
            aria-label="Promise explanation"
          >
            Why this matters
          </button>
          {tip && (
            <div className="absolute right-0 z-10 mt-2 w-64 rounded-xl border border-line bg-white p-3 text-xs leading-relaxed shadow-lg">
              Requested arrival is not a promise. The Coordinator only confirms readiness after required room checks are verified.
            </div>
          )}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {promisePhases.map((s) => (
          <span
            key={s.id}
            className={`rounded-full px-2 py-1 text-[11px] font-semibold ${
              p.phase === s.id
                ? s.id === 'at-risk'
                  ? 'bg-blocked text-white'
                  : s.id === 'verified'
                    ? 'bg-ready text-white'
                    : 'bg-navy text-white'
                : 'bg-white text-muted ring-1 ring-line'
            }`}
          >
            {s.label}
          </span>
        ))}
      </div>

      <dl className="mt-4 grid gap-3 sm:grid-cols-2">
        <Row label="Standard hotel check-in" value={p.standardCheckIn} />
        <Row label="Guest requested arrival" value={p.requestedArrival} />
        <Row
          label="Predicted room-ready time"
          value={
            p.predictedReady
              ? `${p.predictedReady}${p.predictedConfidence != null ? ` · ${p.predictedConfidence}%` : ''}`
              : 'Not forecast yet'
          }
        />
        <Row label="Hotel promised readiness" value={p.currentPromise} />
        <Row label="Verified room-ready time" value={p.verifiedReadyAt ?? 'Not yet verified'} />
      </dl>
      {band && (
        <div className="mt-3">
          <Pill tone={band.tone}>
            {band.label}: {p.predictedConfidence}%
          </Pill>
        </div>
      )}

      {c.id === 'olivia' && !verified && <OliviaPromiseCard c={c} />}
      {verified && c.id === 'olivia' && c.message.status !== 'sent' && <OliviaReadySend />}
    </section>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[11px] font-bold tracking-wide text-muted uppercase">{label}</dt>
      <dd className="mt-0.5 text-sm">{value}</dd>
    </div>
  )
}

function OliviaPromiseCard({ c }: { c: ReadinessCase }) {
  const { oliviaPromiseAction, verifyOliviaReady } = useStore()
  const assigned = Boolean(c.roomNumber)
  return (
    <div className="mt-4 rounded-xl border border-risk/30 bg-risk-soft p-4">
      <div className="text-[11px] font-bold tracking-wide text-risk uppercase">Decision</div>
      <h4 className="mt-1 text-sm font-semibold">Can we confirm an early-arrival promise?</h4>
      <p className="mt-2 text-sm leading-relaxed">
        Do not yet promise 12:30 arrival. Room 416 is expected to be ready at 12:15, but final inspection is pending. Send an
        expectation-setting message instead.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button className="rounded-lg bg-navy px-3 py-2 text-sm font-semibold text-white" onClick={() => oliviaPromiseAction('expect')}>
          Approve expectation-setting message
        </button>
        <button className="rounded-lg border border-line bg-white px-3 py-2 text-sm font-medium" onClick={() => oliviaPromiseAction('conditional')}>
          Set a conditional promise
        </button>
        <button className="rounded-lg border border-line bg-white px-3 py-2 text-sm font-medium" onClick={() => oliviaPromiseAction('wait')}>
          Wait for operational confirmation
        </button>
        <button className="rounded-lg border border-line bg-white px-3 py-2 text-sm font-medium" onClick={() => oliviaPromiseAction('escalate')}>
          Escalate to duty manager
        </button>
      </div>
      {assigned && (
        <button className="mt-3 text-sm font-semibold text-info" onClick={verifyOliviaReady}>
          Complete inspection and verify Room 416
        </button>
      )}
    </div>
  )
}

function OliviaReadySend() {
  const { sendReadyMessage } = useStore()
  return (
    <div className="mt-4 rounded-xl border border-ready/30 bg-ready-soft p-4">
      <div className="text-[11px] font-bold tracking-wide text-ready uppercase">Verified outcome</div>
      <h4 className="mt-1 text-sm font-semibold">Verified ready at 12:12</h4>
      <p className="mt-1 text-sm">Required room checks are complete. The room-ready message is now unlocked.</p>
      <button className="mt-3 rounded-full bg-ai px-4 py-2 text-sm font-semibold text-navy" onClick={() => sendReadyMessage('olivia')}>
        Send room ready message
      </button>
    </div>
  )
}

export function EvidencePack({ c }: { c: ReadinessCase }) {
  const evidence = c.checks.map((k) => ({
    label: k.label,
    complete: k.complete,
    proof: k.complete ? 'Recorded on the case audit' : 'Required before a room-ready promise',
  }))
  return (
    <section className="rounded-2xl border border-line p-4">
      <h3 className="text-sm font-semibold">Verification evidence</h3>
      <p className="mt-1 text-xs text-muted">
        Messaging cannot claim the room is ready until every required check has proof. Specialists can attach evidence; only the Coordinator marks verified ready.
      </p>
      <div className="mt-3 space-y-2">
        {evidence.map((e) => (
          <div key={e.label} className="flex items-start justify-between gap-3 rounded-xl bg-canvas px-3 py-2">
            <div>
              <div className="text-sm font-medium">{e.label}</div>
              <div className="text-xs text-muted">{e.proof}</div>
            </div>
            <Pill tone={e.complete ? 'ready' : 'risk'}>{e.complete ? 'Verified' : 'Missing'}</Pill>
          </div>
        ))}
      </div>
    </section>
  )
}
