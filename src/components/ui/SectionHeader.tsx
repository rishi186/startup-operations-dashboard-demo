type AccentColor = 'amber' | 'blue' | 'purple' | 'teal' | 'rose' | 'emerald' | 'indigo' | 'gold'

const ACCENT_STYLES: Record<AccentColor, { bg: string; text: string; ring: string }> = {
  amber: { bg: 'bg-amber-100', text: 'text-amber-600', ring: 'ring-amber-200' },
  blue: { bg: 'bg-blue-100', text: 'text-blue-600', ring: 'ring-blue-200' },
  purple: { bg: 'bg-brand-100', text: 'text-brand', ring: 'ring-brand-200' },
  teal: { bg: 'bg-teal-100', text: 'text-teal-600', ring: 'ring-teal-200' },
  rose: { bg: 'bg-rose-100', text: 'text-rose-600', ring: 'ring-rose-200' },
  emerald: { bg: 'bg-emerald-100', text: 'text-emerald-600', ring: 'ring-emerald-200' },
  indigo: { bg: 'bg-brand-100', text: 'text-brand', ring: 'ring-brand-200' },
  gold: { bg: 'bg-amber-100', text: 'text-amber-700', ring: 'ring-amber-200' },
}

interface Props {
  icon: any
  title: string
  subtitle?: string
  accent?: AccentColor
  action?: React.ReactNode
}

export default function SectionHeader({ icon: Icon, title, subtitle, accent = 'purple', action }: Props) {
  const s = ACCENT_STYLES[accent]
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-5">
      <div className="flex items-center gap-3 min-w-0">
        <div className={`w-10 h-10 shrink-0 rounded-xl ${s.bg} ring-1 ${s.ring} flex items-center justify-center`}>
          <Icon size={20} className={s.text} />
        </div>
        <div className="min-w-0">
          <h3 className="text-base sm:text-lg font-bold tracking-tight text-[var(--text-primary)] truncate">{title}</h3>
          {subtitle && <p className="text-xs font-medium text-[var(--text-muted)] mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  )
}
