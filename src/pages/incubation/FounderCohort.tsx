import { founderCohort } from '../../data/synthetic'
import type { Participant } from '../../types'
import { useMemo, useState } from 'react'
import GlassCard from '../../components/ui/GlassCard'
import StatCard from '../../components/ui/StatCard'
import PageHero from '../../components/ui/PageHero'
import { Rocket, Users, FlaskConical, Lightbulb, ChevronDown, ChevronUp } from 'lucide-react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { gradId, ChartGradients, ChartTooltip } from '../../utils/chartTheme'

const EmptyChart = ({ msg = 'No data for this selection' }: { msg?: string }) => (
  <div className="h-full flex items-center justify-center text-xs text-[var(--text-muted)]">{msg}</div>
)

const STAGE_ORDER = ['Ideation', 'Prototype', 'MVP', 'Validation', 'Operational']

// Fixed, semantic colours for each stage — matching the same stage badge colours already
// used in the participant table below (amber Ideation, teal Prototype, blue MVP, purple
// Validation). Distinct from Gender Split's sequential palette so the two donuts never
// look alike, and each stage always renders the same colour no matter its position.
const STAGE_COLOR_INDEX: Record<string, number> = { Ideation: 3, Prototype: 2, MVP: 1, Validation: 0, Operational: 6 }

/** Tally a field across participants into chart-ready {name,value} pairs, via the SAME
 *  normalizer used on the Incubation Events page (so "IDEATION"/"Ideation" merge, etc.)
 *  Blank values are skipped rather than counted as a category. */
function tally(participants: Participant[], field: 'gender' | 'stage') {
  const counts: Record<string, number> = {}
  for (const p of participants) {
    const raw = (p?.[field] ?? '').toString().trim()
    if (!raw) continue
    const label = raw.trim()
    counts[label] = (counts[label] || 0) + 1
  }
  if (field === 'stage') {
    return STAGE_ORDER.map((name) => ({ name, value: counts[name] || 0 })).filter((d) => d.value > 0)
  }
  return Object.entries(counts).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value)
}

export default function FounderCohort() {
  const [showParticipants, setShowParticipants] = useState(false)
  const { participants, prototypes, cohorts } = founderCohort
  const total = participants.length
  const ideationCount = Math.max(0, total - prototypes)

  const stats = [
    { label: 'Total Participants', value: total, icon: Users, accent: 'blue' as const, clickable: true },
    { label: 'Cohorts', value: cohorts, icon: Rocket, accent: 'indigo' as const },
    { label: 'Prototypes Built', value: prototypes, icon: FlaskConical, accent: 'teal' as const },
    { label: 'In Ideation Stage', value: ideationCount, icon: Lightbulb, accent: 'amber' as const },
  ]

  const genderData = useMemo(() => tally(participants, 'gender'), [participants])
  const stageData = useMemo(() => tally(participants, 'stage'), [participants])

  return (
    <div className="space-y-3">
      {/* Compact Header */}
      <PageHero
        title="Founder Cohort"
        subtitle="Prototype Development & Pre-Incubation Program"
        accent="blue"
        compact
      />

      {/* Compact Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {stats.map((s, i) => {
          const isClickable = s.clickable
          return (
            <StatCard
              key={s.label}
              icon={s.icon}
              label={s.label}
              value={s.value}
              accent={s.accent}
              stagger={i}
              onClick={isClickable ? () => setShowParticipants(v => !v) : undefined}
            />
          )
        })}
      </div>

      {/* Gender + Stage breakdown — derived from the roster below */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <GlassCard level={2} padding="p-3">
          <h3 className="text-xs font-semibold text-[var(--text-primary)] mb-1">Gender Split</h3>
          <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mb-2">{total} participants</p>
          <div className="h-[220px]">
            {genderData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <ChartGradients />
                  <Pie data={genderData} cx="50%" cy="50%" innerRadius={48} outerRadius={76} paddingAngle={2} cornerRadius={4} stroke="#fff" strokeWidth={2} dataKey="value" labelLine={false}>
                    {genderData.map((_e, i) => <Cell key={i} fill={`url(#${gradId(i)})`} />)}
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                  <Legend verticalAlign="bottom" height={24} iconType="circle" iconSize={7} wrapperStyle={{ fontSize: '11px', color: '#475569' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : <EmptyChart msg="No gender data recorded" />}
          </div>
        </GlassCard>

        <GlassCard level={2} padding="p-3">
          <h3 className="text-xs font-semibold text-[var(--text-primary)] mb-1">Stage Breakdown</h3>
          <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mb-2">{total} participants</p>
          <div className="h-[220px]">
            {stageData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <ChartGradients />
                  <Pie data={stageData} cx="50%" cy="50%" innerRadius={48} outerRadius={76} paddingAngle={2} cornerRadius={4} stroke="#fff" strokeWidth={2} dataKey="value" labelLine={false}>
                    {stageData.map((e, i) => <Cell key={i} fill={`url(#${gradId(STAGE_COLOR_INDEX[e.name] ?? i)})`} />)}
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                  <Legend verticalAlign="bottom" height={24} iconType="circle" iconSize={7} wrapperStyle={{ fontSize: '11px', color: '#475569' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : <EmptyChart msg="No stage data recorded" />}
          </div>
        </GlassCard>
      </div>

      {/* Collapsible Participant List */}
      {showParticipants && (
        <GlassCard level={2} padding="p-3" className="overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-semibold text-[var(--text-primary)]">Founder Cohort Roster</h3>
            <button
              onClick={() => setShowParticipants(false)}
              className="flex items-center gap-1 text-[10px] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
            >
              Hide <ChevronUp size={12} />
            </button>
          </div>
          <div className="overflow-x-auto -mx-3 -mb-3">
            <table className="w-full text-[11px] leading-tight min-w-[800px]">
              <thead>
                <tr className="border-b border-[var(--glass-border)] bg-[var(--glass-surface-1)]">
                  <th className="px-2 py-1.5 text-left font-medium text-[var(--text-muted)] uppercase tracking-wider">S.No</th>
                  <th className="px-2 py-1.5 text-left font-medium text-[var(--text-muted)] uppercase tracking-wider">Founder / Innovator</th>
                  <th className="px-2 py-1.5 text-left font-medium text-[var(--text-muted)] uppercase tracking-wider">Startup</th>
                  <th className="px-2 py-1.5 text-left font-medium text-[var(--text-muted)] uppercase tracking-wider">Gender</th>
                  <th className="px-2 py-1.5 text-left font-medium text-[var(--text-muted)] uppercase tracking-wider">Sector</th>
                  <th className="px-2 py-1.5 text-left font-medium text-[var(--text-muted)] uppercase tracking-wider">Location</th>
                  <th className="px-2 py-1.5 text-left font-medium text-[var(--text-muted)] uppercase tracking-wider">Stage</th>
                  <th className="px-2 py-1.5 text-left font-medium text-[var(--text-muted)] uppercase tracking-wider">Occupation</th>
                  <th className="px-2 py-1.5 text-left font-medium text-[var(--text-muted)] uppercase tracking-wider">Cohort</th>
                </tr>
              </thead>
              <tbody>
                {participants.map((p, i) => (
                  <tr key={i} className="border-b border-[var(--glass-border)] last:border-0 hover:bg-[var(--glass-surface-1)]/50">
                    <td className="px-2 py-1 font-mono text-[var(--text-muted)]">{i + 1}</td>
                    <td className="px-2 py-1 font-medium text-[var(--text-primary)]">{p.name}</td>
                    <td className="px-2 py-1 text-[var(--text-secondary)]">{p.startup}</td>
                    <td className="px-2 py-1 text-[var(--text-secondary)]">{p.gender}</td>
                    <td className="px-2 py-1 text-[var(--text-secondary)] max-w-[140px] truncate" title={p.sector}>{p.sector}</td>
                    <td className="px-2 py-1 text-[var(--text-secondary)]">{p.location}</td>
                    <td className="px-2 py-1">
                      {(() => {
                        const stage = (p.stage ?? '').toString()
                        const s = stage.toLowerCase()
                        return (
                          <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium ${
                            s === 'prototype' ? 'bg-teal-100 text-teal-700'
                            : s === 'ideation' ? 'bg-amber-100 text-amber-700'
                            : s === 'mvp' ? 'bg-blue-100 text-blue-700'
                            : s === 'validation' ? 'bg-brand-50 text-brand'
                            : 'bg-slate-100 text-slate-600'
                          }`}>
                            {stage || '-'}
                          </span>
                        )
                      })()}
                    </td>
                    <td className="px-2 py-1 text-[var(--text-secondary)]">{p.occupation}</td>
                    <td className="px-2 py-1">
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600">
                        {p.cohort}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      )}

      {/* Show hint when collapsed */}
      {!showParticipants && (
        <div className="flex items-center gap-1 text-[10px] text-[var(--text-muted)] px-1">
          <ChevronDown size={12} /> Click "Total Participants" to view the full list
        </div>
      )}
    </div>
  )
}
