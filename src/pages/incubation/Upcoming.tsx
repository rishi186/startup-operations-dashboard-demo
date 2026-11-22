import { Zap, Gauge } from 'lucide-react'
import GlassCard from '../../components/ui/GlassCard'
import PageHero from '../../components/ui/PageHero'
import { upcomingPrograms } from '../../data/synthetic'

const icons = [Zap, Gauge]

export default function Upcoming() {
  return (
    <div className="space-y-6">
      <PageHero title="Upcoming Programs" subtitle="Sample schedule" accent="purple" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {upcomingPrograms.map((program, index) => {
          const Icon = icons[index]
          return (
            <GlassCard key={program.name} level={2} accent={index === 0 ? 'purple' : 'teal'} stagger={index} className="text-center">
              <div className="w-14 h-14 rounded-2xl bg-brand-50 flex items-center justify-center mx-auto mb-4">
                <Icon size={26} className="text-brand" aria-hidden="true" />
              </div>
              <h3 className="text-lg font-bold text-[var(--text-primary)]">{program.name}</h3>
              <p className="text-xs text-[var(--text-muted)] mt-1">{program.focus} · {program.date}</p>
            </GlassCard>
          )
        })}
      </div>
    </div>
  )
}
