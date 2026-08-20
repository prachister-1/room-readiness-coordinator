import { Cog, Sparkles, User } from 'lucide-react'
import type { WorkKind } from '../../lib/workKind'

const meta: Record<
  WorkKind,
  { label: string; hint: string; className: string; Icon: typeof Sparkles }
> = {
  ai: {
    label: 'AI',
    hint: 'Reasons across context',
    className: 'bg-ai-soft text-navy',
    Icon: Sparkles,
  },
  auto: {
    label: 'Automation',
    hint: 'SOP / policy execution',
    className: 'bg-canvas text-navy',
    Icon: Cog,
  },
  human: {
    label: 'Human',
    hint: 'Approval or staff evidence',
    className: 'bg-white text-navy ring-1 ring-navy/15',
    Icon: User,
  },
}

export function KindBadge({ kind, showHint = false }: { kind: WorkKind; showHint?: boolean; live?: boolean }) {
  const m = meta[kind]
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase ${m.className}`}>
      <m.Icon size={11} />
      {m.label}
      {showHint && <span className="font-medium normal-case tracking-normal text-muted">· {m.hint}</span>}
    </span>
  )
}

export function WorkKindLegend() {
  return (
    <div className="flex flex-wrap gap-1.5">
      {(Object.keys(meta) as WorkKind[]).map((kind) => (
        <KindBadge key={kind} kind={kind} showHint />
      ))}
    </div>
  )
}

export function MagicBullet({ children }: { children: string }) {
  return (
    <li className="flex gap-2 text-sm leading-relaxed">
      <Sparkles size={14} className="mt-0.5 shrink-0 text-ai" />
      <span>{children}</span>
    </li>
  )
}

export function AutoBullet({ children }: { children: string }) {
  return (
    <li className="flex gap-2 text-sm leading-relaxed text-muted">
      <Cog size={14} className="mt-0.5 shrink-0 text-navy" />
      <span>{children}</span>
    </li>
  )
}
