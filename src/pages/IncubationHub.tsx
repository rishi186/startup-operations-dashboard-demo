import { Outlet, NavLink, useLocation } from 'react-router-dom'
import { Lightbulb, Rocket, Sparkles, CalendarDays } from 'lucide-react'

const tabs = [
  { path: 'idea-lab', label: 'Idea Lab', icon: Lightbulb, gradient: 'from-amber-500 to-orange-600', text: 'text-amber-600', bg: 'bg-amber-100', ring: 'ring-amber-300' },
  { path: 'founder-cohort', label: 'Founder Cohort', icon: Rocket, gradient: 'from-blue-500 to-blue-600', text: 'text-blue-600', bg: 'bg-blue-100', ring: 'ring-blue-300' },
  { path: 'upcoming', label: 'Upcoming Programs', icon: Sparkles, gradient: 'from-brand to-teal-500', text: 'text-brand', bg: 'bg-brand-50', ring: 'ring-brand-200' },
  { path: 'events', label: 'Events', icon: CalendarDays, gradient: 'from-[#7853A8] to-[#5942A6]', text: 'text-[#7853A8]', bg: 'bg-[#7853A8]/10', ring: 'ring-[#7853A8]/30' },
]

export default function IncubationHub() {
  const location = useLocation()
  const currentPath = location.pathname.replace('/incubation', '').replace(/^\//, '')

  const isActive = (path: string) => {
    if (path === '') return currentPath === ''
    return currentPath === path
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-display font-bold text-[var(--text-primary)]">Incubation Hub</h1>
        <p className="text-sm text-[var(--text-muted)]">Startup ecosystem, mentorship, and funding pipeline</p>
      </div>

      {/* Sub-page Tab Navigation */}
      <div className="flex flex-wrap gap-2">
        {tabs.map((t) => {
          const active = isActive(t.path)
          const Icon = t.icon
          return (
            <NavLink
              key={t.path}
              to={`/incubation/${t.path}`}
              end={t.path === ''}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 active:scale-95
                ${active
                  ? `bg-gradient-to-r ${t.gradient} text-white shadow-lg`
                  : 'glass-2 text-[var(--text-secondary)] hover:glass-3 hover:text-[var(--text-primary)]'
                }`}
            >
              <Icon size={16} strokeWidth={active ? 2.5 : 1.5} />
              {t.label}
            </NavLink>
          )
        })}
      </div>

      {/* Sub-page Content */}
      <Outlet />
    </div>
  )
}
