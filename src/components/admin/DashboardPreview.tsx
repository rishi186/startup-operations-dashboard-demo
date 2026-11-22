import GlassCard from '../ui/GlassCard'

interface Props {
  stats: { label: string; value: number }[]
  dirty: boolean
  valid: boolean
}

export default function DashboardPreview({ stats, dirty, valid }: Props) {
  const status = !dirty ? 'Matches the dashboard' : valid ? 'Unsaved changes' : 'Complete the form to preview changes'

  return (
    <GlassCard level={2} padding="p-4 sm:p-5" accent="purple">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 mb-3">
        <h2 className="text-sm font-semibold text-[var(--text-primary)]">Dashboard preview</h2>
        <p className="text-xs text-[var(--text-secondary)]">{status}</p>
      </div>
      <dl className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
        {stats.map(({ label, value }) => (
          <div key={label} className="glass-1 rounded-xl p-3">
            <dt className="text-xs text-[var(--text-secondary)]">{label}</dt>
            <dd className="mt-1 text-2xl font-bold leading-tight tabular-nums text-[var(--text-primary)]">{value.toLocaleString()}</dd>
          </div>
        ))}
      </dl>
    </GlassCard>
  )
}
