import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, Building2, Landmark,
  FlaskConical, Briefcase, BarChart3, Settings2, X
} from 'lucide-react'

const activeRings = {
  purple: 'ring-[var(--accent-purple)]/40 shadow-[var(--accent-purple)]/15',
  blue: 'ring-blue-400/40 shadow-blue-400/15',
  emerald: 'ring-emerald-400/40 shadow-emerald-400/15',
  gold: 'ring-amber-400/40 shadow-amber-400/15',
} as const

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Overview', color: 'text-slate-600', accent: 'purple' },
  { to: '/incubation', icon: FlaskConical, label: 'Incubation Hub', color: 'text-blue-600', accent: 'blue' },
  { to: '/msme', icon: Briefcase, label: 'MSME', color: 'text-brand', accent: 'purple' },
  { to: '/college-outreach', icon: Building2, label: 'College Outreach', color: 'text-emerald-600', accent: 'emerald' },
  { to: '/finance', icon: Landmark, label: 'Finance', color: 'text-amber-600', accent: 'gold' },
  { to: '/admin', icon: Settings2, label: 'Demo Admin', color: 'text-brand', accent: 'purple' },
] as const

interface Props {
  open: boolean
  onClose: () => void
}

export default function Sidebar({ open, onClose }: Props) {
  const location = useLocation()

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 lg:hidden backdrop-blur-sm bg-[var(--text-primary)]/10"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          w-24 lg:w-28 shrink-0 bg-[var(--glass-surface-1)] border-r border-[var(--glass-border)] shadow-sm
          transform transition-transform duration-300 ease-in-out
          ${open ? 'visible translate-x-0' : 'invisible -translate-x-full lg:visible lg:translate-x-0'}
          flex flex-col items-center pt-11 lg:pt-4 pb-4
        `}
      >
        {/* Logo */}
        <div className="mb-4 flex flex-col items-center text-center px-1">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand to-brand-900 flex items-center justify-center text-white shadow-lg shadow-brand/20">
            <BarChart3 size={28} aria-hidden="true" />
          </div>
          <p className="mt-2 text-xs font-bold text-brand-900 leading-tight">Startup<br />Operations</p>
        </div>

        <button type="button" aria-label="Close navigation" onClick={onClose} className="lg:hidden absolute top-4 right-4 text-[var(--text-muted)] hover:text-[var(--text-primary)]">
          <X size={18} />
        </button>

        {/* Nav Icons */}
        <nav aria-label="Dashboard sections" className="flex-1 flex flex-col items-center gap-2 w-full px-2 overflow-y-auto thin-scrollbar">
          {navItems.map((item) => {
            const isActive = location.pathname === item.to || (item.to !== '/' && location.pathname.startsWith(item.to + '/'))
            const Icon = item.icon
            const ringColor = isActive
              ? activeRings[item.accent]
              : ''
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                title={item.label}
                className="flex flex-col items-center gap-1.5 py-2 px-1 w-full group"
              >
                <div className={`
                  w-11 h-11 rounded-2xl flex items-center justify-center
                  glass-2 transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)]
                  ${isActive
                    ? `ring-2 ${ringColor} scale-105 shadow-lg`
                    : 'hover:scale-110 hover:shadow-lg hover:shadow-black/5'}
                `}>
                  <Icon size={20} strokeWidth={isActive ? 2.5 : 1.5} className={`${item.color} transition-transform duration-300 ${isActive ? '' : 'group-hover:scale-110'}`} />
                </div>
                <span className={`text-[10px] font-medium text-center leading-tight ${isActive ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)]'}`}>
                  {item.label}
                </span>
              </NavLink>
            )
          })}
        </nav>

      </aside>
    </>
  )
}
