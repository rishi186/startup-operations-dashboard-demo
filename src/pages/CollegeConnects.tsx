import { collegeOutreach } from '../data/synthetic'
import { useState, useEffect, useRef } from 'react'
import GlassCard from '../components/ui/GlassCard'
import StatCard from '../components/ui/StatCard'
import SectionHeader from '../components/ui/SectionHeader'
import PageHero from '../components/ui/PageHero'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts'
import { Building2, Users, MapPin, Search, Wrench, Monitor, School, UserCheck, Network, GraduationCap } from 'lucide-react'
import Reveal from '../components/ui/Reveal'
import { gradId, ChartGradients, ChartTooltip, AXIS_TICK, GRID_STROKE } from '../utils/chartTheme'

const ICON_MAP: Record<string, any> = {
  'Prototyping Lab / Makerspace': Wrench,
  'Technical Labs': Monitor,
  'Meeting / Training Rooms': Users,
  'Workstations': School,
  'Dedicated Incubation Space': Building2,
}

const INFRA_COLORS = [
  { text: 'text-emerald-600', bg: 'bg-emerald-100', border: 'hover:border-emerald-200' },
  { text: 'text-blue-600', bg: 'bg-blue-100', border: 'hover:border-blue-200' },
  { text: 'text-brand', bg: 'bg-brand-50', border: 'hover:border-brand-200' },
  { text: 'text-amber-600', bg: 'bg-amber-100', border: 'hover:border-amber-200' },
  { text: 'text-teal-600', bg: 'bg-teal-100', border: 'hover:border-teal-200' },
]

export default function CollegeConnects() {
  const [search, setSearch] = useState('')
  const [showColleges, setShowColleges] = useState(false)
  const collegesRef = useRef<HTMLDivElement>(null)
  const { stats, districts, infra: infraItems, colleges } = collegeOutreach

  useEffect(() => {
    if (showColleges && collegesRef.current) {
      setTimeout(() => {
        collegesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 100)
    }
  }, [showColleges])

  const filtered = colleges.filter((item) =>
    (item.college || '').toLowerCase().includes(search.toLowerCase()) ||
    (item.ambassador || '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Hero */}
      <PageHero
        title="College Outreach"
        subtitle="Campus engagement across sample districts"
        description="Building a culture of innovation across engineering and degree colleges."
        accent="emerald"
      />

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard
            label="Colleges"
            value={stats.colleges}
            icon={Building2}
            accent="emerald"
            stagger={0}
            onClick={() => setShowColleges(v => !v)}
          />
        <StatCard label="Students" value={stats.students.toLocaleString()} icon={Users} accent="blue" stagger={1} />
        <StatCard label="Districts" value={stats.districts} icon={MapPin} accent="teal" stagger={2} />
          <StatCard label="Faculty Ambassadors" value={stats.ambassadors} icon={UserCheck} accent="indigo" stagger={3} onClick={() => setShowColleges(v => !v)} />
      </div>

      {/* District Chart + Infra */}
      <Reveal>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* District Distribution */}
        <GlassCard level={2} hover accent="emerald" stagger={0}>
          <SectionHeader icon={MapPin} title="District Distribution" subtitle="Students per district" accent="emerald" />
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={districts} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <ChartGradients />
              <CartesianGrid stroke={GRID_STROKE} strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tick={AXIS_TICK} angle={-15} textAnchor="end" height={60} />
              <YAxis tick={AXIS_TICK} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={28} name="Students">
                {districts.map((_, i) => (
                  <Cell key={`d-${i}`} fill={`url(#${gradId(i)})`} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </GlassCard>

        {/* Infrastructure */}
        <GlassCard level={2} hover accent="blue" stagger={1}>
          <SectionHeader icon={Network} title="Available Infrastructure" subtitle="Facilities across the network" accent="blue" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {infraItems.map((item, i) => {
              const Icon = ICON_MAP[item.label] || Wrench
              const color = INFRA_COLORS[i % INFRA_COLORS.length]
              return (
                <div key={i} className={`glass-1 rounded-xl p-4 flex items-center gap-3 transition-all duration-300 hover:scale-[1.03] ${color.border}`}>
                  <div className={`w-10 h-10 rounded-xl ${color.bg} flex items-center justify-center shrink-0`}>
                    <Icon size={18} className={color.text} />
                  </div>
                  <span className="text-xs text-[var(--text-primary)] font-medium leading-tight">{item.label}</span>
                </div>
              )
            })}
          </div>
        </GlassCard>
      </div>
      </Reveal>

      {/* College & Ambassador Directory */}
      {showColleges && (
      <div ref={collegesRef} className="scroll-mt-6">
      <GlassCard level={2} accent="emerald">
        <SectionHeader icon={GraduationCap} title="College Directory" subtitle={`${filtered.length} colleges`} accent="emerald" action={
          <div className="relative">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search college or ambassador..."
              className="pl-8 pr-3 py-1.5 rounded-lg bg-[var(--glass-surface-1)] border border-[var(--glass-border)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-emerald-300/50 focus:shadow-md focus:shadow-emerald-500/10 focus:ring-2 focus:ring-emerald-500/10 w-full sm:w-64 transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)]"
            />
          </div>
        } />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-[500px] overflow-y-auto thin-scrollbar">
          {filtered.map((item, i) => (
            <div key={i} className="glass-1 rounded-lg px-3 py-2.5 flex flex-col gap-1 transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] hover:bg-[var(--glass-surface-3)] hover:scale-[1.02] hover:shadow-md hover:shadow-emerald-500/10 hover:border-emerald-200 cursor-pointer animate-stagger" style={{ animationDelay: `${Math.min(i, 10) * 30}ms` }}>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shrink-0">
                  <School size={12} className="text-white" />
                </div>
                <span className="text-xs text-[var(--text-primary)] leading-tight truncate font-medium">{item.college}</span>
              </div>
              <div className="flex items-center gap-2 ml-8">
                <div className="w-1 h-1 rounded-full bg-emerald-400" />
                <span className="text-[10px] text-[var(--text-secondary)] leading-tight truncate">{item.ambassador}{item.district ? ` · ${item.district}` : ''}</span>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <p className="text-sm text-[var(--text-muted)] col-span-full text-center py-8">No results found</p>
          )}
        </div>
      </GlassCard>
      </div>
      )}
    </div>
  )
}
