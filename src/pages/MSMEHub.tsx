import { Outlet, NavLink, useLocation } from 'react-router-dom'
import { Building2, GraduationCap, Lightbulb, Handshake, ClipboardList } from 'lucide-react'

const tabs = [
  { path: 'events', label: 'All Events', icon: ClipboardList, gradient: 'from-[#7853A8] to-[#5942A6]', text: 'text-[#7853A8]', bg: 'bg-[#7853A8]/10', ring: 'ring-[#7853A8]/30' },
  { path: 'registration', label: 'Business Registration', icon: Building2, gradient: 'from-brand to-[#3F2D80]', text: 'text-brand', bg: 'bg-brand-50', ring: 'ring-brand-200' },
  { path: 'skills', label: 'Skills Development', icon: GraduationCap, gradient: 'from-blue-500 to-blue-600', text: 'text-blue-600', bg: 'bg-blue-100', ring: 'ring-blue-300' },
  { path: 'ip', label: 'Intellectual Property', icon: Lightbulb, gradient: 'from-amber-500 to-orange-600', text: 'text-amber-600', bg: 'bg-amber-100', ring: 'ring-amber-300' },
  { path: 'vendors', label: 'Vendor Development', icon: Handshake, gradient: 'from-emerald-500 to-teal-600', text: 'text-emerald-600', bg: 'bg-emerald-100', ring: 'ring-emerald-300' },
]

export default function MSMEHub() {
  const location = useLocation()
  const currentPath = location.pathname.replace('/msme', '').replace(/^\//, '')

  const isActive = (path: string) => currentPath === path

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-display font-bold text-[var(--text-primary)]">MSME</h1>
        <p className="text-sm text-[var(--text-muted)]">Business registration, training, and enterprise development across sample districts</p>
      </div>

      {/* Sub-page Tab Navigation */}
      <div className="flex flex-wrap gap-2">
        {tabs.map((t) => {
          const active = isActive(t.path)
          const Icon = t.icon
          return (
            <NavLink
              key={t.path}
              to={`/msme/${t.path}`}
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
