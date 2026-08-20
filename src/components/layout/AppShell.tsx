import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  BedDouble,
  BookOpen,
  ChartNoAxesCombined,
  ClipboardCheck,
  GitBranch,
  Handshake,
  Inbox,
  MessageSquare,
  Search,
  Settings,
  Shield,
  Sparkles,
} from 'lucide-react'
import { useStore } from '../../state/Store'
import { ToastStack } from '../ui/ToastStack'
import { CaseDrawer } from '../cases/CaseDrawer'

const nav = [
  { to: '/', label: 'Arrival Readiness', icon: ClipboardCheck, group: 'Operations' },
  { to: '/inbox', label: 'Decision Inbox', icon: Inbox, group: 'Operations' },
  { to: '/orchestration', label: 'Agent Orchestration', icon: GitBranch, group: 'Operations' },
  { to: '/playbooks', label: 'Operational Playbooks', icon: BookOpen, group: 'Operations' },
  { to: '/handover', label: 'Shift Handover', icon: Handshake, group: 'Operations' },
  { to: '/housekeeping', label: 'Housekeeping', icon: Sparkles, group: 'Operations' },
  { to: '/rooms', label: 'Rooms', icon: BedDouble, group: 'Operations' },
  { to: '/messages', label: 'Guest Messages', icon: MessageSquare, group: 'Operations' },
  { to: '/analytics', label: 'Analytics', icon: ChartNoAxesCombined, group: 'Control' },
  { to: '/policies', label: 'Policies & Guardrails', icon: Shield, group: 'Control' },
  { to: '/settings', label: 'Settings', icon: Settings, group: 'Control' },
]

export function AppShell() {
  const { search, setSearch, role, setRole, select, decisions, autonomyMode } = useStore()
  const location = useLocation()
  const navigate = useNavigate()
  const housekeeper = role === 'housekeeper'
  const openDecisions = decisions.filter((d) => d.status === 'open').length
  const criticalDecisions = decisions.filter((d) => d.status === 'open' && d.severity === 'critical').length

  return (
    <div className="min-h-screen bg-canvas text-navy">
      <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b border-line bg-white px-4 md:px-6">
        <div className="flex items-center gap-2.5">
          <div className="grid h-7 w-7 place-items-center bg-navy">
            <span className="h-3 w-3 bg-ai" />
          </div>
          <div className="leading-tight">
            <div className="text-sm font-semibold tracking-tight">Room Readiness Coordinator</div>
            <div className="text-[11px] text-muted">The Hoxton Shoreditch · 15 Aug</div>
          </div>
        </div>
        <div className="relative hidden min-w-[200px] flex-1 max-w-md lg:block">
          <Search size={15} className="absolute top-1/2 left-3 -translate-y-1/2 text-muted" />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              if (location.pathname !== '/') navigate('/')
            }}
            placeholder="Search guest, room or reservation"
            className="w-full rounded-lg border border-line bg-white py-1.5 pr-3 pl-9 text-sm outline-none focus:border-navy"
          />
        </div>
        <div className="ml-auto flex items-center gap-3">
          <button
            onClick={() => navigate('/orchestration')}
            className="hidden items-center gap-2 text-xs lg:flex"
          >
            <span className="text-muted">{autonomyMode === 'bounded' ? 'Auto on' : autonomyMode === 'pause' ? 'Paused' : 'Approve'}</span>
            <span className="font-semibold">{openDecisions} awaiting</span>
            {criticalDecisions > 0 && <span className="text-blocked">{criticalDecisions} critical</span>}
          </button>
          <select
            value={role}
            onChange={(e) => {
              const next = e.target.value as typeof role
              setRole(next)
              if (next === 'housekeeper') navigate('/housekeeping')
            }}
            className="hidden rounded-lg border border-line bg-white px-2 py-1.5 text-xs font-medium md:block"
          >
            <option value="manager">Duty Manager</option>
            <option value="housekeeper">Housekeeping</option>
          </select>
          <div className="grid h-8 w-8 place-items-center rounded-full bg-navy text-[10px] font-bold text-white">AM</div>
        </div>
      </header>

      <div className="flex min-h-[calc(100vh-56px)]">
        <aside className="hidden w-[220px] shrink-0 border-r border-line bg-white p-2 lg:block">
          {['Operations', 'Control'].map((group) => (
            <div key={group}>
              <div className="page-kicker px-3 pt-4 pb-2">{group}</div>
              {nav
                .filter((item) => item.group === group)
                .map((item) => {
                  const Icon = item.icon
                  if (housekeeper && !['/housekeeping', '/settings', '/handover'].includes(item.to)) return null
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end={item.to === '/'}
                      onClick={() => select(null)}
                      className={({ isActive }) =>
                        `mb-0.5 flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${
                          isActive ? 'bg-navy font-medium text-white' : 'text-navy hover:bg-canvas'
                        }`
                      }
                    >
                      <Icon size={16} />
                      {item.label}
                    </NavLink>
                  )
                })}
            </div>
          ))}
          <p className="mt-8 px-3 text-[11px] leading-relaxed text-muted">
            Specialists recommend. The Coordinator owns state. Guests are told only after verification.
          </p>
        </aside>
        <main className="min-w-0 flex-1 p-4 md:p-6">
          <button
            onClick={() => navigate('/inbox')}
            className="mb-3 flex w-full items-center justify-between gap-2 rounded-xl border border-line bg-white px-3 py-2 text-xs lg:hidden"
          >
            <span className="font-bold text-muted uppercase">Decisions</span>
            <span>{openDecisions} awaiting · {criticalDecisions} critical</span>
          </button>
          <Outlet />
        </main>
      </div>
      <nav className="fixed right-0 bottom-0 left-0 z-20 grid grid-cols-5 border-t border-line bg-white lg:hidden">
        {nav
          .filter((i) => ['/', '/inbox', '/handover', '/housekeeping', '/messages'].includes(i.to))
          .map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `flex flex-col items-center gap-1 py-2 text-[10px] ${isActive ? 'text-navy' : 'text-muted'}`
                }
              >
                <Icon size={16} />
                {item.to === '/' ? 'Arrivals' : item.to === '/inbox' ? 'Inbox' : item.to === '/handover' ? 'Handover' : item.label.split(' ')[0]}
              </NavLink>
            )
          })}
      </nav>
      <CaseDrawer />
      <ToastStack />
    </div>
  )
}
