type AccentColor = 'amber' | 'blue' | 'purple' | 'teal' | 'rose' | 'emerald' | 'indigo' | 'gold'

interface Props {
  title: string
  subtitle: string
  description?: string
  accent?: AccentColor
  compact?: boolean
}

export default function PageHero({ title, subtitle, description, compact = false }: Props) {
  const padding = compact ? 'p-5 sm:p-6' : 'p-6 sm:p-7 md:p-9'
  const titleSize = compact ? 'text-xl sm:text-2xl' : 'text-2xl sm:text-3xl md:text-4xl'
  const subSize = compact ? 'text-xs' : 'text-sm md:text-base'
  const descSize = compact ? 'text-[10px]' : 'text-xs'

  return (
    <div className={`relative overflow-hidden rounded-2xl bg-brand-premium ${padding} text-white shadow-[0_18px_40px_-18px_rgba(74,31,111,0.55)]`}>
      <div className="relative z-10">
        <h1 className={`${titleSize} font-extrabold tracking-tight mb-1.5`}>{title}</h1>
        <p className={`${subSize} font-medium text-white/85`}>{subtitle}</p>
        {description && <p className={`${descSize} mt-2 text-white/70`}>{description}</p>}
      </div>
      {/* Calm, static brand wash — no animation. */}
      <div
        className="pointer-events-none absolute -top-16 -right-10 w-64 h-64 rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(184,154,214,0.22) 0%, transparent 70%)' }}
      />
    </div>
  )
}
