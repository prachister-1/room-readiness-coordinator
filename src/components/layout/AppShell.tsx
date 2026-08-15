import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  Bell,
  BedDouble,
  ChartNoAxesCombined,
  ClipboardCheck,
  MessageSquare,
  Search,
  Settings,
  Sparkles,
} from 'lucide-react'
import { useStore } from '../../state/Store'
import { ToastStack } from '../ui/ToastStack'
import { CaseDrawer } from '../cases/CaseDrawer'

const nav = [
  { to: '/', label: 'Arrival Readiness', icon: ClipboardCheck },
  { to: '/housekeeping', label: 'Housekeeping', icon: Sparkles },
  { to: '/rooms', label: 'Rooms', icon: BedDouble },
  { to: '/messages', label: 'Guest Messages', icon: MessageSquare },
  { to: '/analytics', label: 'Analytics', icon: ChartNoAxesCombined },
  { to: '/settings', label: 'Settings', icon: Settings },
]

export function AppShell() {
  const { search, setSearch, role, setRole, select } = useStore()
  const location = useLocation()
  const navigate = useNavigate()
  const housekeeper = role === 'housekeeper'

  return (
    <div className="min-h-screen bg-canvas text-navy">
      <header className="sticky top-0 z-30 flex h-[68px] items-center gap-4 border-b border-line bg-white/95 px-4 backdrop-blur md:px-6">
        <div className="flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-navy text-white">
            <BedDouble size={18} />
          </div>
          <div className="leading-tight">
            <div className="text-[15px] font-semibold tracking-tight">Room Readiness Coordinator</div>
            <div className="text-[11px] text-muted">The Hoxton Shoreditch</div>
          </div>
        </div>
        <div className="ml-2 hidden rounded-lg border border-line bg-canvas px-3 py-1.5 text-sm text-navy md:block">
          Today, 15 August
        </div>
        <div className="relative ml-auto hidden min-w-[240px] flex-1 max-w-md md:block">
          <Search size={16} className="absolute top-1/2 left-3 -translate-y-1/2 text-muted" />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              if (location.pathname !== '/') navigate('/')
            }}
            placeholder="Search guest, room or reservation"
            className="w-full rounded-lg border border-line bg-canvas py-2 pr-3 pl-9 text-sm outline-none focus:border-info"
          />
        </div>
        <button className="relative rounded-lg border border-line p-2 text-muted hover:bg-canvas" aria-label="Notifications">
          <Bell size={16} />
          <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-blocked" />
        </button>
        <select
          value={role}
          onChange={(e) => {
            const next = e.target.value as typeof role
            setRole(next)
            if (next === 'housekeeper') navigate('/housekeeping')
          }}
          className="hidden rounded-lg border border-line bg-white px-2 py-2 text-xs font-medium md:block"
        >
          <option value="manager">Duty Manager</option>
          <option value="housekeeper">Housekeeping</option>
        </select>
        <div className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-full bg-navy text-[11px] font-bold text-white">AM</div>
          <div className="hidden leading-tight lg:block">
            <div className="text-sm font-semibold">Alex Morgan</div>
            <div className="text-[11px] text-muted">{housekeeper ? 'Housekeeping · Floor 4' : 'Duty Manager'}</div>
          </div>
        </div>
      </header>

      <div className="flex min-h-[calc(100vh-68px)]">
        <aside className="hidden w-[232px] shrink-0 border-r border-line bg-white p-3 md:block">
          <div className="px-2 pt-2 pb-3 text-[10px] font-bold tracking-[0.12em] text-muted uppercase">Operations</div>
          {nav.map((item) => {
            const Icon = item.icon
            if (housekeeper && item.to !== '/housekeeping' && item.to !== '/settings') return null
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                onClick={() => select(null)}
                className={({ isActive }) =>
                  `mb-0.5 flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm ${
                    isActive ? 'bg-ready-soft font-semibold text-ready' : 'text-navy hover:bg-canvas'
                  }`
                }
              >
                <Icon size={16} />
                {item.label}
              </NavLink>
            )
          })}
          <p className="mt-8 px-3 text-[11px] leading-relaxed text-muted">
            Detect risk, coordinate work, verify the room, then message the guest — never the other way around.
          </p>
        </aside>
        <main className="min-w-0 flex-1 p-4 md:p-6">
          <div className="mb-3 md:hidden">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search guest, room or reservation"
              className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm"
            />
          </div>
          <Outlet />
        </main>
      </div>
      <nav className="fixed right-0 bottom-0 left-0 z-20 grid grid-cols-5 border-t border-line bg-white md:hidden">
        {nav.slice(0, 5).map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 py-2 text-[10px] ${isActive ? 'text-ready' : 'text-muted'}`
              }
            >
              <Icon size={16} />
              {item.label.split(' ')[0]}
            </NavLink>
          )
        })}
      </nav>
      <CaseDrawer />
      <ToastStack />
    </div>
  )
}
