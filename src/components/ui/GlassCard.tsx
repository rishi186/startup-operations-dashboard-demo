type AccentColor = 'amber' | 'blue' | 'purple' | 'teal' | 'rose' | 'emerald' | 'indigo' | 'gold'

interface GlassCardProps {
  children: React.ReactNode
  className?: string
  level?: 1 | 2 | 3
  hover?: boolean
  padding?: string
  onClick?: () => void
  accent?: AccentColor
  stagger?: number
  tilt?: boolean
}

export default function GlassCard({
  children,
  className = '',
  level = 2,
  hover = true,
  padding = 'p-5',
  onClick,
  accent,
  stagger,
}: GlassCardProps) {
  const levelClass = `glass-${level}`
  const hoverClass = hover ? 'glass-hover' : ''
  const accentClass = accent ? `glass-accent-${accent}` : ''
  const staggerStyle = stagger != null ? { animationDelay: `${stagger * 60}ms` } : undefined
  const staggerClass = stagger != null ? 'animate-stagger' : ''

  return (
    <div
      className={`${levelClass} ${accentClass} rounded-2xl ${padding} ${hoverClass} ${staggerClass} ${className}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      style={staggerStyle}
    >
      {children}
    </div>
  )
}
