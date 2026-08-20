import { Cog, Sparkles, User } from 'lucide-react'
import type { WorkKind } from '../../lib/workKind'

const meta: Record<
  WorkKind,
  { label: string; hint: string; className: string; Icon: typeof Sparkles }
> = {
  ai: {
    label: 'AI',
    hint: 'Reasons across context',
    className: 'bg-ai-soft text-ai ring-1 ring-ai/20',
    Icon: Sparkles,
  },
  auto: {
    label: 'Automation',
    hint: 'SOP / policy execution',
    className: 'bg-ready-soft text-ready ring-1 ring-ready/20',
    Icon: Cog,
  },
  human: {
    label: 'Human',
    hint: 'Approval or staff evidence',
    className: 'bg-navy/5 text-navy ring-1 ring-navy/10',
    Icon: User,
  },
}

export function KindBadge({ kind, showHint = false, live = false }: { kind: WorkKind; showHint?: boolean; live?: boolean }) {
  const m = meta[kind]
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase ${m.className} ${live ? 'outline outline-offset-1 outline-current/25' : ''}`}>
      <m.Icon size={11} className={kind === 'ai' || live ? 'ai-spark' : ''} />
      {m.label}
      {showHint && <span className="font-medium normal-case tracking-normal opacity-80">· {m.hint}</span>}
    </span>
  )
}

export function WorkKindLegend() {
  return (
    <div className="flex flex-wrap gap-2">
      {(Object.keys(meta) as WorkKind[]).map((kind) => (
        <KindBadge key={kind} kind={kind} showHint />
      ))}
    </div>
  )
}

export function MagicBullet({ children }: { children: string }) {
  return (
    <li className="flex gap-2 text-sm leading-relaxed">
      <Sparkles size={14} className="ai-spark mt-0.5 shrink-0 text-ai" />
      <span>{children}</span>
    </li>
  )
}

export function AutoBullet({ children }: { children: string }) {
  return (
    <li className="flex gap-2 text-sm leading-relaxed text-muted">
      <Cog size={14} className="mt-0.5 shrink-0 text-ready" />
      <span>{children}</span>
    </li>
  )
}
