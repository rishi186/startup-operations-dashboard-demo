import { TrendingUp, TrendingDown } from 'lucide-react'

type AccentColor = 'amber' | 'blue' | 'purple' | 'teal' | 'rose' | 'emerald' | 'indigo' | 'gold'

const ACCENT_STYLES: Record<AccentColor, { bg: string; text: string; badge: string; bar: string; hex: string }> = {
  amber: { bg: 'bg-amber-100', text: 'text-amber-600', badge: 'bg-amber-50 text-amber-700', bar: 'bg-amber-400', hex: '#B7791F' },
  blue: { bg: 'bg-blue-100', text: 'text-blue-600', badge: 'bg-blue-50 text-blue-700', bar: 'bg-blue-400', hex: '#2B5BA8' },
  purple: { bg: 'bg-brand-100', text: 'text-brand', badge: 'bg-brand-50 text-brand', bar: 'bg-brand', hex: '#5942A6' },
  teal: { bg: 'bg-teal-100', text: 'text-teal-600', badge: 'bg-teal-50 text-teal-700', bar: 'bg-teal-400', hex: '#0F766E' },
  rose: { bg: 'bg-rose-100', text: 'text-rose-600', badge: 'bg-rose-50 text-rose-700', bar: 'bg-rose-400', hex: '#A63B7E' },
  emerald: { bg: 'bg-emerald-100', text: 'text-emerald-600', badge: 'bg-emerald-50 text-emerald-700', bar: 'bg-emerald-400', hex: '#2F855A' },
  indigo: { bg: 'bg-brand-100', text: 'text-brand', badge: 'bg-brand-50 text-brand', bar: 'bg-brand', hex: '#5942A6' },
  gold: { bg: 'bg-amber-100', text: 'text-amber-700', badge: 'bg-amber-50 text-amber-800', bar: 'bg-amber-500', hex: '#B7791F' },
}

/** Tiny GPU-light SVG sparkline (area + line). No chart lib. */
function Sparkline({ data, color }: { data: number[]; color: string }) {
  if (!data || data.length < 2) return null
  const w = 100, h = 30
  const min = Math.min(...data), max = Math.max(...data)
  const span = max - min || 1
  const pts = data.map((v, i) => [(i / (data.length - 1)) * w, h - ((v - min) / span) * (h - 5) - 3] as const)
  const line = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ')
  const area = `${line} L${w},${h} L0,${h} Z`
  const id = `spark-${color.replace('#', '')}`
  return (
    <svg width="100%" height={30} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="mt-2.5 block">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.28} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${id})`} />
      <path d={line} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
    </svg>
  )
}

interface Props {
  icon: any
  label: string
  value: string | number
  sub?: string
  accent?: AccentColor
  badge?: string
  onClick?: () => void
  /** When set, the badge becomes a clickable chip that fires this
   *  instead of the card's onClick — click propagation is stopped. */
  onBadgeClick?: () => void
  stagger?: number
  /** Optional trend chip, e.g. { value: '+12%', dir: 'up' }. Shown only when provided. */
  trend?: { value: string; dir: 'up' | 'down' }
  /** Optional recent-trend series — renders a sparkline under the value. */
  spark?: number[]
  /** Render the value in the premium gradient (use sparingly for hero metrics). */
  highlight?: boolean
}

export default function StatCard({ icon: Icon, label, value, sub, accent = 'purple', badge, onClick, onBadgeClick, stagger, trend, spark, highlight }: Props) {
  const s = ACCENT_STYLES[accent]

  return (
    <div
      className={`glass-2 glass-accent-${accent} rounded-2xl p-5 glass-hover ${onClick ? 'cursor-pointer' : ''} animate-stagger`}
      onClick={onClick}
      onKeyDown={onClick ? (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onClick()
        }
      } : undefined}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      style={stagger != null ? { animationDelay: `${stagger * 60}ms` } : undefined}
    >
      <div className="flex items-start justify-between gap-2">
        <div className={`w-11 h-11 rounded-xl ${s.bg} flex items-center justify-center shrink-0 transition-transform duration-300 hover:scale-110`}>
          <Icon size={20} className={s.text} />
        </div>
        {badge && onBadgeClick ? (
          <button
            onClick={(e) => { e.stopPropagation(); onBadgeClick() }}
            className={`text-[10px] px-2 py-0.5 rounded-md font-semibold ${s.badge} hover:brightness-95 active:scale-95 transition-all cursor-pointer`}
          >
            {badge}
          </button>
        ) : badge ? (
          <span className={`text-[10px] px-2 py-0.5 rounded-md font-semibold ${s.badge}`}>{badge}</span>
        ) : trend ? (
          <span className={`inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-md ${trend.dir === 'up' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
            {trend.dir === 'up' ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
            {trend.value}
          </span>
        ) : null}
      </div>
      <p className={`text-3xl font-extrabold mt-3.5 num-figure whitespace-nowrap leading-none ${highlight ? 'text-gradient-brand' : 'text-[var(--text-primary)]'}`}>{value}</p>
      {spark ? (
        <Sparkline data={spark} color={s.hex} />
      ) : (
        <div className={`mt-2.5 h-[3px] w-9 rounded-full ${s.bar} opacity-80`} />
      )}
      <p className="text-[13px] font-semibold text-[var(--text-secondary)] mt-2.5">{label}</p>
      {sub && <p className="text-[11px] font-medium text-[var(--text-muted)] mt-0.5">{sub}</p>}
    </div>
  )
}
