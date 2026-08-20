import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../state/Store'
import { confidenceBand } from '../lib/promise'
import { Pill } from '../components/ui/Badge'
import { AgentMark } from '../components/agents/AgentMark'
import type { DecisionItem, DecisionStatus } from '../types'

const tabs: { id: string; label: string; match: (d: DecisionItem) => boolean }[] = [
  { id: 'all', label: 'All', match: (d) => d.status === 'open' },
  { id: 'critical', label: 'Critical', match: (d) => d.status === 'open' && d.severity === 'critical' },
  { id: 'arrival-risk', label: 'Arrival risk', match: (d) => d.status === 'open' && d.category === 'arrival-risk' },
  { id: 'room-allocation', label: 'Room allocation', match: (d) => d.status === 'open' && d.category === 'room-allocation' },
  { id: 'guest-communication', label: 'Guest communication', match: (d) => d.status === 'open' && d.category === 'guest-communication' },
  { id: 'policy-exception', label: 'Policy exceptions', match: (d) => d.status === 'open' && d.category === 'policy-exception' },
  { id: 'resolved', label: 'Resolved', match: (d) => d.status !== 'open' },
]

export function DecisionInbox() {
  const { decisions, resolveDecision, select, autonomyMode, runBoundedAutomation, writesAllowed } = useStore()
  const navigate = useNavigate()
  const [tab, setTab] = useState('all')
  const open = decisions.filter((d) => d.status === 'open')
  const visible = decisions.filter(tabs.find((t) => t.id === tab)!.match)

  return (
    <div className="space-y-6 pb-16">
      <div>
        <div className="page-kicker">Human in the loop</div>
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight">Decision Inbox</h1>
        <p className="mt-1 max-w-3xl text-sm text-muted">
          Agents recommend. Staff approve, reject, or escalate. Bounded automation can take reversible SOP work. Suite, accessibility, and room-ready promises never auto-run.
        </p>
      </div>

      {autonomyMode === 'bounded' && (
        <div className="flex flex-wrap items-center justify-between gap-3 border border-line bg-canvas px-4 py-3">
          <p className="text-sm">Bounded auto-execution is on. Eligible cards can run without a click.</p>
          <button className="rounded-full bg-ai px-4 py-2 text-sm font-semibold text-navy" onClick={runBoundedAutomation}>
            Run eligible automations
          </button>
        </div>
      )}
      {!writesAllowed && (
        <div className="rounded-2xl border border-risk bg-risk-soft px-4 py-3 text-sm">
          {autonomyMode === 'pause' ? 'Kill switch on — no writes.' : 'Recommend only — approvals will not write to Mews.'}
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          [String(open.length), 'Decisions awaiting approval'],
          [String(open.filter((d) => d.severity === 'critical').length), 'Critical decision'],
          ['6 min', 'Average decision age'],
          ['14', 'Decisions resolved today'],
        ].map(([n, l]) => (
          <div key={l} className="rounded-2xl border border-line bg-white p-4">
            <div className="text-2xl font-semibold">{n}</div>
            <div className="mt-1 text-xs text-muted">{l}</div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold ${tab === t.id ? 'bg-navy text-white' : 'bg-white text-muted ring-1 ring-line'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {visible.length === 0 && <p className="text-sm text-muted">No decisions in this view.</p>}
        {visible.map((d) => (
          <article key={d.id} className="rounded-2xl border border-line bg-white p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <Severity d={d} />
                  {d.autoEligible ? <Pill tone="ready">Auto-eligible</Pill> : <Pill tone="blocked">Human required</Pill>}
                  <h2 className="text-lg font-semibold">{d.title}</h2>
                </div>
                <p className="mt-1 text-sm text-muted">
                  {d.guestName} · arrival {d.arrival}
                </p>
              </div>
              <StatusPill status={d.status} />
            </div>
            <p className="mt-3 text-sm">
              <span className="font-semibold">Readiness impact: </span>
              {d.impact}
            </p>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <div className="text-sm">
                <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
                  {d.agents.split('+').map((name) => (
                    <AgentMark key={name} agent={name.trim()} size="sm" live />
                  ))}
                  {d.autoEligible ? null : <AgentMark agent="human" size="sm" />}
                </div>
                <span className="font-semibold">Recommended by: </span>
                {d.agents}
              </div>
              <p className="text-sm">
                <span className="font-semibold">Confidence: </span>
                {d.confidence}% · {confidenceBand(d.confidence)?.label}
              </p>
            </div>
            <p className="mt-2 text-sm">
              <span className="font-semibold">Why: </span>
              {d.why}
            </p>
            <p className="mt-2 text-sm">
              <span className="font-semibold">Policy: </span>
              {d.policy}
            </p>
            <p className="mt-2 text-sm">
              <span className="font-semibold">Recommended action: </span>
              {d.recommendation}
            </p>
            <p className="mt-2 text-sm text-muted">
              <span className="font-semibold text-navy">Alternatives: </span>
              {d.alternatives.join(' · ')}
            </p>
            <p className="mt-2 text-sm text-muted">
              <span className="font-semibold text-navy">Automation: </span>
              {d.autoReason}
            </p>
            {d.status === 'open' ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {d.actions.map((a) => (
                  <button
                    key={a.id}
                    onClick={() => resolveDecision(d.id, a.id)}
                    className={`rounded-lg px-3 py-2 text-sm font-semibold ${
                      a.kind === 'approve' ? 'bg-navy text-white' : 'border border-line bg-white'
                    }`}
                  >
                    {a.label}
                  </button>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-sm text-ready">
                {d.resolution} {d.resolvedAt ? `· ${d.resolvedAt}` : ''}
              </p>
            )}
            <button
              className="mt-3 text-sm font-semibold text-ready"
              onClick={() => {
                navigate('/')
                select(d.caseId)
              }}
            >
              Open Readiness Case
            </button>
          </article>
        ))}
      </div>
    </div>
  )
}

function Severity({ d }: { d: DecisionItem }) {
  const tone = d.severity === 'critical' ? 'blocked' : d.severity === 'policy' ? 'info' : 'risk'
  const label = d.severity === 'critical' ? 'Critical' : d.severity === 'policy' ? 'Policy exception' : 'Medium'
  return <Pill tone={tone}>{label}</Pill>
}

function StatusPill({ status }: { status: DecisionStatus }) {
  if (status === 'open') return <Pill tone="risk">Awaiting approval</Pill>
  if (status === 'approved') return <Pill tone="ready">Approved</Pill>
  if (status === 'escalated') return <Pill tone="blocked">Escalated</Pill>
  return <Pill tone="info">Rejected</Pill>
}
