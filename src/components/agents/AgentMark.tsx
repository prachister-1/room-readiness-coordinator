import {
  Bot,
  GitBranch,
  ListChecks,
  MessageSquare,
  Radar,
  ScrollText,
  User,
  Waypoints,
  type LucideIcon,
} from 'lucide-react'
import type { WorkKind } from '../../lib/workKind'
import { KindBadge } from '../ui/WorkKind'

export type AgentLookId =
  | 'allocation'
  | 'exception'
  | 'task'
  | 'trace'
  | 'messaging'
  | 'coordinator'
  | 'human'

export interface AgentLook {
  id: AgentLookId
  name: string
  short: string
  kind: WorkKind
  Icon: LucideIcon
}

export const AGENT_LOOK: Record<AgentLookId, AgentLook> = {
  allocation: { id: 'allocation', name: 'Allocation Agent', short: 'Allocation', kind: 'ai', Icon: Waypoints },
  exception: { id: 'exception', name: 'Exception Agent', short: 'Exception', kind: 'ai', Icon: Radar },
  task: { id: 'task', name: 'Task Agent', short: 'Task', kind: 'auto', Icon: ListChecks },
  trace: { id: 'trace', name: 'Trace Agent', short: 'Trace', kind: 'auto', Icon: ScrollText },
  messaging: { id: 'messaging', name: 'Guest Messaging', short: 'Messaging', kind: 'auto', Icon: MessageSquare },
  coordinator: { id: 'coordinator', name: 'Coordinator', short: 'Coordinator', kind: 'auto', Icon: GitBranch },
  human: { id: 'human', name: 'Duty manager', short: 'You', kind: 'human', Icon: User },
}

export function lookForAgent(name: string): AgentLook {
  const n = name.toLowerCase()
  if (n.includes('allocation')) return AGENT_LOOK.allocation
  if (n.includes('exception')) return AGENT_LOOK.exception
  if (n.includes('task')) return AGENT_LOOK.task
  if (n.includes('trace')) return AGENT_LOOK.trace
  if (n.includes('messag')) return AGENT_LOOK.messaging
  if (n.includes('coordinator')) return AGENT_LOOK.coordinator
  return AGENT_LOOK.human
}

const sizeClass = {
  sm: 'h-7 w-7',
  md: 'h-10 w-10',
  lg: 'h-12 w-12',
}

const iconSize = { sm: 13, md: 18, lg: 20 }

export function AgentMark({
  agent,
  live = false,
  size = 'md',
  className = '',
}: {
  agent: string | AgentLookId
  live?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}) {
  const look = typeof agent === 'string' && agent in AGENT_LOOK ? AGENT_LOOK[agent as AgentLookId] : lookForAgent(String(agent))
  const Icon = look.Icon
  const tone =
    look.kind === 'ai' ? 'agent-orb-ai' : look.kind === 'human' ? 'agent-orb-human' : 'agent-orb-auto'

  return (
    <span className={`agent-orb ${sizeClass[size]} ${tone} ${live ? 'agent-orb-live' : ''} ${className}`} title={look.name}>
      {live && <span className="agent-ring" aria-hidden />}
      <Icon size={iconSize[size]} strokeWidth={2.2} />
      {look.kind === 'ai' && (
        <span className="agent-bot">
          <Bot size={size === 'sm' ? 8 : 10} />
        </span>
      )}
    </span>
  )
}

export function AgentTag({
  agent,
  live = false,
  size = 'sm',
}: {
  agent: string | AgentLookId
  live?: boolean
  size?: 'sm' | 'md'
}) {
  const look = typeof agent === 'string' && agent in AGENT_LOOK ? AGENT_LOOK[agent as AgentLookId] : lookForAgent(String(agent))
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-white py-0.5 pr-2 pl-0.5 ring-1 ring-line">
      <AgentMark agent={look.id} live={live} size={size} />
      <span className="text-[11px] font-semibold">{look.short}</span>
    </span>
  )
}

export function AgentIdentity({
  agent,
  live = false,
  detail,
}: {
  agent: string | AgentLookId
  live?: boolean
  detail?: string
}) {
  const look = typeof agent === 'string' && agent in AGENT_LOOK ? AGENT_LOOK[agent as AgentLookId] : lookForAgent(String(agent))
  return (
    <div className="flex items-center gap-3">
      <AgentMark agent={look.id} live={live} size="lg" />
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-sm font-semibold">{look.name}</span>
          <KindBadge kind={look.kind} live={live} />
        </div>
        {detail && <p className="mt-0.5 line-clamp-2 text-xs text-muted">{detail}</p>}
      </div>
    </div>
  )
}
