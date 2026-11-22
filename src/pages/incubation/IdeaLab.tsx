import { ideaLab } from '../../data/synthetic'
import { useState } from 'react'
import GlassCard from '../../components/ui/GlassCard'
import StatCard from '../../components/ui/StatCard'
import PageHero from '../../components/ui/PageHero'
import { Lightbulb, Users, Target, Rocket, X } from 'lucide-react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { seriesColor, gradId, ChartGradients, ChartTooltip } from '../../utils/chartTheme'

export default function IdeaLab() {
  const { summary, prototypes, sectorDistribution: sectorChartData } = ideaLab

  const stats = [
    { label: 'No. of Cohorts', value: summary.cohorts, icon: Target, accent: 'amber' as const },
    { label: 'Registered Students', value: summary.applications, icon: Users, accent: 'blue' as const },
    { label: 'Actual Participants', value: summary.attendance, icon: Lightbulb, accent: 'gold' as const },
    { label: 'Prototypes Ready', value: summary.prototypes, icon: Rocket, accent: 'purple' as const, clickable: true },
  ]

  const [showModal, setShowModal] = useState(false)

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHero
        title="Idea Lab"
        subtitle="Idea Validation & Early-Stage Startup Program"
        description="Validate concepts, build MVPs, and launch into the ecosystem."
        accent="amber"
      />

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stats.map((s, i) => {
          const onClick = s.clickable ? () => setShowModal(true) : undefined
          return (
            <StatCard
              key={s.label}
              icon={s.icon}
              label={s.label}
              value={s.value}
              accent={s.accent}
              stagger={i}
              onClick={onClick}
            />
          )
        })}
      </div>

      {/* Sector Distribution Pie Chart */}
      <GlassCard level={2} accent="purple">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between mb-2">
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">Sector Distribution</h3>
          <span className="text-xs text-[var(--text-muted)]">{summary.attendance} attendees</span>
        </div>
        <div className="h-[300px] sm:h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <ChartGradients />
              <Pie
                data={sectorChartData}
                cx="40%"
                cy="50%"
                innerRadius={60}
                outerRadius={120}
                paddingAngle={2}
                cornerRadius={4}
                dataKey="value"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth={1}
              >
                {sectorChartData.map((_entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={`url(#${gradId(index)})`} stroke={seriesColor(index)} />
                ))}
              </Pie>
              <Tooltip
                content={<ChartTooltip valueFormatter={(v: any) => `${v} participants`} />}
              />
              <Legend
                verticalAlign="middle"
                align="right"
                layout="vertical"
                iconType="circle"
                iconSize={10}
                wrapperStyle={{ fontSize: '12px', color: '#94a3b8', paddingLeft: '20px' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>

      {/* Prototypes Ready Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" style={{ animation: 'modalFadeIn 0.2s ease-out' }} onClick={() => setShowModal(false)}>
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Prototypes Ready"
            className="w-full max-w-3xl max-h-[80vh] overflow-hidden rounded-2xl border border-[var(--glass-border)] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)]"
            style={{ background: 'rgba(243, 239, 230, 0.95)', animation: 'modalZoomIn 0.2s ease-out' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--glass-border)] bg-white/50">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center">
                  <Rocket size={18} className="text-slate-600" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-[var(--text-primary)]">Prototypes Ready</h2>
                  <p className="text-[11px] text-[var(--text-muted)]">{prototypes.length} startups ready for incubation</p>
                </div>
              </div>
              <button aria-label="Close prototypes" onClick={() => setShowModal(false)} className="p-2 rounded-lg hover:bg-black/5 transition-colors group">
                <X size={18} className="text-[var(--text-muted)] group-hover:text-[var(--text-primary)] transition-colors" />
              </button>
            </div>

            {/* Table */}
            <div className="overflow-auto max-h-[calc(80vh-72px)] thin-scrollbar">
              <table className="w-full text-sm">
                <thead className="sticky top-0 z-10">
                  <tr className="border-b border-[var(--glass-border)]" style={{ background: 'rgba(255,255,255,0.85)' }}>
                    <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">S.No</th>
                    <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">Name</th>
                    <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">Stage</th>
                    <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">Cohort</th>
                    <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">Startup</th>
                  </tr>
                </thead>
                <tbody>
                  {prototypes.map((ff, i) => (
                    <tr
                      key={ff.id}
                      className="border-b border-[var(--glass-border)] last:border-0 transition-colors"
                      style={{ background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.3)' }}
                    >
                      <td className="px-4 py-2.5 font-mono text-xs text-[var(--text-muted)]">{i + 1}</td>
                      <td className="px-4 py-2.5 font-semibold text-[var(--text-primary)] text-sm">{ff.name}</td>
                      <td className="px-4 py-2.5">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                          {ff.stage}
                        </span>
                      </td>
                      <td className="px-4 py-2.5">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                          {ff.cohort}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-[var(--text-secondary)] text-sm font-medium">{ff.startup}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
