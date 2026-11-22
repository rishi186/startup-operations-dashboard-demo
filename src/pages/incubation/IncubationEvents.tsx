import { incubationEvents } from '../../data/synthetic'
import type { IncubationEventBucket, IncubationEventKey } from '../../types'
import { useState, useMemo } from 'react'
import GlassCard from '../../components/ui/GlassCard'
import StatCard from '../../components/ui/StatCard'
import { CalendarDays, Users, Presentation, Award, Rocket, FlaskConical, Lightbulb, Target, X, MapPin, Briefcase, Layers, BarChart3 } from 'lucide-react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, LabelList } from 'recharts'
import { buildIncubationEventPageData, buildSingleEventChartData } from '../../utils/incubationEventPageData'
import { formatCountValue } from '../../hooks/useCountUp'
import { gradId, ChartGradients, ChartTooltip, AXIS_TICK, GRID_STROKE } from '../../utils/chartTheme'

type EventKey = IncubationEventKey
type Scope = 'all' | EventKey

const EVENT_META: Record<EventKey, { icon: any; accent: 'blue' | 'amber' | 'purple' | 'teal'; bg: string; text: string; ring: string; bar: string; color: string; fallback: string; desc: string }> = {
  drone:   { icon: Rocket,       accent: 'blue',   bg: 'bg-blue-100',   text: 'text-blue-600',   ring: 'ring-blue-400',   bar: 'bg-blue-500',   color: '#2563eb', fallback: 'Robotics Prototyping Lab', desc: 'Hands-on robotics design and prototyping' },
  ipr:     { icon: Lightbulb,    accent: 'amber',  bg: 'bg-amber-100',  text: 'text-amber-600',  ring: 'ring-amber-400',  bar: 'bg-amber-500',  color: '#d97706', fallback: 'IP Basics for Founders',        desc: 'Intellectual property rights for startups' },
  leaders: { icon: Target,       accent: 'purple', bg: 'bg-brand-50', text: 'text-brand', ring: 'ring-brand', bar: 'bg-brand', color: '#5942A6', fallback: 'Founder Leadership Workshop',         desc: 'Leadership & vision for founders' },
  mentors: { icon: FlaskConical, accent: 'teal',   bg: 'bg-teal-100',   text: 'text-teal-600',   ring: 'ring-teal-400',   bar: 'bg-teal-500',   color: '#0d9488', fallback: 'Mentor Office Hours',         desc: 'Expert guidance & mentoring sessions' },
}
const EVENT_KEYS: EventKey[] = ['drone', 'ipr', 'leaders', 'mentors']

const EmptyChart = ({ msg = 'No data for this selection' }: { msg?: string }) => (
  <div className="h-full flex flex-col items-center justify-center gap-2 text-[var(--text-muted)]">
    <BarChart3 size={26} className="opacity-40" />
    <p className="text-xs">{msg}</p>
  </div>
)

/* ── Detailed per-event modal ── */
function EventHoverCard({ data, label, icon: Icon, color, text, onClose }: {
  data: IncubationEventBucket
  label: string
  icon: any
  color: string
  text: string
  onClose: () => void
}) {
  const genderEntries = Object.entries(data.gender || {}).filter(([k]) => ['Male', 'Female', 'Others'].includes(k) || k === 'Male.')
  const topSectors = Object.entries(data.sector_clean).sort((a, b) => b[1] - a[1]).slice(0, 6)
  const topStages = Object.entries(data.stage || {}).sort((a, b) => b[1] - a[1]).slice(0, 5)
  const topOccupations = Object.entries(data.occupation || {}).sort((a, b) => b[1] - a[1]).slice(0, 5)
  const topLocations = Object.entries(data.location || {}).sort((a, b) => b[1] - a[1]).slice(0, 5)

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.45)', animation: 'modalFadeIn 0.2s ease-out' }}
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={label}
        className="w-full max-w-lg rounded-2xl border border-[var(--glass-border)] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.35)] overflow-hidden"
        style={{ background: 'rgba(243, 239, 230, 0.98)', animation: 'modalZoomIn 0.25s ease-out' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--glass-border)] bg-white/60">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center`}>
              <Icon size={20} className={text} />
            </div>
            <div>
              <h2 className="text-base font-bold text-[var(--text-primary)]">{label}</h2>
              <p className="text-[11px] text-[var(--text-muted)]">{data.total} registrations</p>
            </div>
          </div>
          <button aria-label="Close event details" onClick={onClose} className="p-2 rounded-lg hover:bg-black/5 transition-colors">
            <X size={18} className="text-[var(--text-muted)]" />
          </button>
        </div>

        <div className="p-5 space-y-5 max-h-[70vh] overflow-y-auto thin-scrollbar">
          {genderEntries.length > 0 && (
            <div>
              <h4 className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Users size={12} /> Gender Breakdown
              </h4>
              <div className="flex gap-2">
                {genderEntries.map(([k, v]) => (
                  <div key={k} className="flex-1 rounded-xl bg-white/60 border border-[var(--glass-border)] px-3 py-2 text-center">
                    <p className="text-lg font-bold text-[var(--text-primary)]">{v}</p>
                    <p className="text-[10px] text-[var(--text-muted)]">{k === 'Male.' ? 'Male' : k}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {topSectors.length > 0 && (
            <div>
              <h4 className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Layers size={12} /> Top Sectors
              </h4>
              <div className="space-y-1.5">
                {topSectors.map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between text-xs">
                    <span className="text-[var(--text-secondary)] truncate mr-2">{k}</span>
                    <span className="font-semibold text-[var(--text-primary)] bg-sky-50 px-2 py-0.5 rounded-full">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {topStages.length > 0 && (
            <div>
              <h4 className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Briefcase size={12} /> Startup Stage
              </h4>
              <div className="flex flex-wrap gap-2">
                {topStages.map(([k, v]) => (
                  <span key={k} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
                    {k} <span className="font-bold">{v}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {topOccupations.length > 0 && (
            <div>
              <h4 className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Briefcase size={12} /> Top Occupations
              </h4>
              <div className="space-y-1.5">
                {topOccupations.map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between text-xs">
                    <span className="text-[var(--text-secondary)] truncate mr-2">{k || 'Unknown'}</span>
                    <span className="font-semibold text-[var(--text-primary)] bg-brand-50 px-2 py-0.5 rounded-full">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {topLocations.length > 0 && (
            <div>
              <h4 className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <MapPin size={12} /> Top Locations
              </h4>
              <div className="space-y-1.5">
                {topLocations.map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between text-xs">
                    <span className="text-[var(--text-secondary)] truncate mr-2">{k}</span>
                    <span className="font-semibold text-[var(--text-primary)] bg-brand-50 px-2 py-0.5 rounded-full">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* ── Animated KPI tile ── */
function AnimatedStat({ icon, label, value, accent, stagger }: { icon: any; label: string; value: number; accent: any; stagger: number }) {
  return <StatCard icon={icon} label={label} value={formatCountValue(value)} accent={accent} stagger={stagger} />
}

/* ── Selectable event tile (drives the charts below) ── */
function EventTile({ eventKey, label, value, total, active, onSelect, onDetails, stagger }: {
  eventKey: EventKey
  label: string
  value: number
  total: number
  active: boolean
  onSelect: () => void
  onDetails: () => void
  stagger: number
}) {
  const meta = EVENT_META[eventKey]
  const Icon = meta.icon
  const share = total > 0 ? Math.round((value / total) * 100) : 0
  return (
    <GlassCard
      level={2}
      accent={meta.accent}
      hover
      padding="p-4"
      stagger={stagger}
      onClick={onSelect}
      className={`cursor-pointer transition-shadow ${active ? `ring-2 ${meta.ring}` : ''}`}
    >
      <div className="flex items-start justify-between">
        <div className={`w-9 h-9 rounded-lg ${meta.bg} flex items-center justify-center`}>
          <Icon size={18} className={meta.text} />
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={(e) => { e.stopPropagation(); onDetails() }}
            className="text-[10px] px-2 py-0.5 rounded-md glass-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
          >
            Details
          </button>
        </div>
      </div>
      <p className="text-2xl font-bold font-mono text-[var(--text-primary)] mt-3">{formatCountValue(value)}</p>
      <p className="text-xs font-semibold text-[var(--text-primary)] mt-0.5 truncate" title={label}>{label}</p>
      <p className="text-[10px] text-[var(--text-muted)] mt-0.5 line-clamp-1">{meta.desc}</p>
      <div className="mt-2.5 h-1.5 rounded-full bg-black/5 overflow-hidden">
        <div className={`h-full ${meta.bar} rounded-full transition-all duration-700`} style={{ width: `${share}%` }} />
      </div>
      <p className="text-[10px] text-[var(--text-muted)] mt-1">{share}% of all registrations{active ? ' · showing below' : ''}</p>
    </GlassCard>
  )
}

export default function IncubationEvents() {
  const pageData = useMemo(() => buildIncubationEventPageData(incubationEvents), [])
  const { events, totalAttendees, participantsTracked, eventsConducted, sectorsRepresented } = pageData

  const [scope, setScope] = useState<Scope>('all')
  const [activeEvent, setActiveEvent] = useState<EventKey | null>(null)

  const scopeChart = useMemo(() => {
    if (scope === 'all') {
      return {
        genderData: pageData.genderData,
        stageData: pageData.stageData,
        occupationData: pageData.occupationData,
        sectorChartData: pageData.sectorChartData,
        locationData: pageData.locationData,
        participantsTracked: pageData.participantsTracked,
      }
    }
    return buildSingleEventChartData(events[scope])
  }, [scope, pageData, events])


  const scopeLabel = scope === 'all' ? 'All Events' : (events[scope].name || EVENT_META[scope].fallback)

  const scopes: { key: Scope; label: string; count: number }[] = [
    { key: 'all', label: 'All Events', count: totalAttendees },
    ...EVENT_KEYS.map((k) => ({ key: k as Scope, label: EVENT_META[k].fallback.split(' ')[0], count: events[k].total })),
  ]

  const stageTotal = scopeChart.stageData.reduce((s, d) => s + d.value, 0)
  const genderHasData = scopeChart.genderData.some((d) => d.value > 0)

  const activeData = activeEvent ? events[activeEvent] : null

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl bg-brand-gradient p-6 md:p-8 text-white">
        <div className="relative z-10 flex items-end justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-1">Incubation Events</h1>
            <p className="text-sm md:text-base opacity-90">Workshops, Bootcamps &amp; Community Events</p>
            <p className="text-xs mt-2 opacity-75">Showcase progress, connect with mentors, and celebrate milestones.</p>
          </div>
          <div className="text-right">
            <p className="text-4xl md:text-5xl font-bold font-mono leading-none">{formatCountValue(totalAttendees)}</p>
            <p className="text-[11px] uppercase tracking-wider opacity-80 mt-1.5">Total Registrations</p>
          </div>
        </div>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <AnimatedStat icon={CalendarDays} label="Events Conducted" value={eventsConducted} accent="rose" stagger={0} />
        <AnimatedStat icon={Users} label="Total Registrations" value={totalAttendees} accent="blue" stagger={1} />
        <AnimatedStat icon={Presentation} label="Participants Tracked" value={participantsTracked} accent="purple" stagger={2} />
        <AnimatedStat icon={Award} label="Sectors Represented" value={sectorsRepresented} accent="amber" stagger={3} />
      </div>

      {/* Event selector tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {EVENT_KEYS.map((key, i) => (
          <EventTile
            key={key}
            eventKey={key}
            label={events[key].name || EVENT_META[key].fallback}
            value={events[key].total}
            total={totalAttendees}
            active={scope === key}
            onSelect={() => setScope(scope === key ? 'all' : key)}
            onDetails={() => setActiveEvent(key)}
            stagger={i}
          />
        ))}
      </div>

      {/* Scope pills */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-[var(--text-muted)] mr-1">Showing:</span>
        <div className="flex gap-1.5 p-1 rounded-xl glass-1 flex-wrap">
          {scopes.map((s) => {
            const isActive = scope === s.key
            return (
              <button
                key={s.key}
                onClick={() => setScope(s.key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${isActive ? 'bg-brand-gradient text-white shadow' : 'text-[var(--text-secondary)] hover:glass-2'}`}
              >
                {s.label}
                <span className={`font-mono ${isActive ? 'opacity-80' : 'text-[var(--text-muted)]'}`}>{s.count}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Charts Row (scope-driven) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Gender */}
        <GlassCard level={2}>
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-sm font-bold tracking-tight text-[var(--text-primary)]">Gender Distribution</h3>
          </div>
          <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mb-2">{scopeLabel}</p>
          <div className="h-[260px]">
            {genderHasData ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <ChartGradients />
                  <Pie data={scopeChart.genderData} cx="50%" cy="52%" innerRadius={52} outerRadius={82} paddingAngle={2} cornerRadius={4} stroke="#fff" strokeWidth={2} dataKey="value" labelLine={false}>
                    {scopeChart.genderData.map((_e, i) => <Cell key={i} fill={`url(#${gradId(i)})`} />)}
                  </Pie>
                  <text x="50%" y="52%" textAnchor="middle" dominantBaseline="middle" className="fill-slate-700">
                    <tspan x="50%" dy="-6" fontSize="22" fontWeight="700">{scopeChart.participantsTracked}</tspan>
                    <tspan x="50%" dy="16" fontSize="10" fill="#64748b">Tracked</tspan>
                  </text>
                  <Tooltip content={<ChartTooltip />} />
                  <Legend verticalAlign="bottom" height={24} iconType="circle" iconSize={7} wrapperStyle={{ fontSize: '11px', color: '#475569' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : <EmptyChart msg="No gender data recorded" />}
          </div>
        </GlassCard>

        {/* Stage */}
        <GlassCard level={2}>
          <h3 className="text-sm font-bold tracking-tight text-[var(--text-primary)] mb-1">Startup Stage</h3>
          <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mb-2">{scopeLabel}</p>
          <div className="h-[260px]">
            {scopeChart.stageData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <ChartGradients />
                  <Pie data={scopeChart.stageData} cx="50%" cy="52%" innerRadius={52} outerRadius={82} paddingAngle={2} cornerRadius={4} stroke="#fff" strokeWidth={2} dataKey="value" labelLine={false}>
                    {scopeChart.stageData.map((_e, i) => <Cell key={i} fill={`url(#${gradId(i)})`} />)}
                  </Pie>
                  <text x="50%" y="52%" textAnchor="middle" dominantBaseline="middle">
                    <tspan x="50%" dy="-6" fontSize="22" fontWeight="700" fill="#334155">{stageTotal}</tspan>
                    <tspan x="50%" dy="16" fontSize="10" fill="#64748b">Startups</tspan>
                  </text>
                  <Tooltip content={<ChartTooltip />} />
                  <Legend verticalAlign="bottom" height={24} iconType="circle" iconSize={7} wrapperStyle={{ fontSize: '11px', color: '#475569' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : <EmptyChart msg="No stage data recorded" />}
          </div>
        </GlassCard>

        {/* Occupation */}
        <GlassCard level={2}>
          <h3 className="text-sm font-bold tracking-tight text-[var(--text-primary)] mb-1">Occupation</h3>
          <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mb-3">{scopeLabel}</p>
          <div className="h-[260px]">
            {scopeChart.occupationData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={scopeChart.occupationData} layout="vertical" margin={{ left: 0, right: 40 }} barCategoryGap="30%">
                  <ChartGradients />
                  <CartesianGrid stroke={GRID_STROKE} strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" tick={AXIS_TICK} axisLine={{ stroke: '#e2e8f0' }} tickLine={false} domain={[0, 'auto']} allowDecimals={false} />
                  <YAxis dataKey="name" type="category" width={64} tick={AXIS_TICK} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ fill: 'rgba(106,44,145,0.08)' }} content={<ChartTooltip />} />
                  <Bar dataKey="value" fill="url(#brandGrad0)" radius={[0, 6, 6, 0]} barSize={18}>
                    <LabelList dataKey="value" position="right" fill="#475569" fontSize={12} fontWeight={600} offset={8} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : <EmptyChart msg="No occupation data recorded" />}
          </div>
        </GlassCard>
      </div>

      {/* Sector + Location row (scope-driven) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <GlassCard level={2}>
          <h3 className="text-sm font-bold tracking-tight text-[var(--text-primary)] mb-1">Sector Breakdown</h3>
          <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mb-4">{scopeLabel}</p>
          <div className="h-[320px]">
            {scopeChart.sectorChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={scopeChart.sectorChartData.slice(0, 12)} layout="vertical" margin={{ left: 10, right: 40 }} barCategoryGap="20%">
                  <ChartGradients />
                  <CartesianGrid stroke={GRID_STROKE} strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" tick={AXIS_TICK} axisLine={{ stroke: '#e2e8f0' }} tickLine={false} domain={[0, 'auto']} allowDecimals={false} />
                  <YAxis dataKey="name" type="category" width={150} tick={AXIS_TICK} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ fill: 'rgba(106,44,145,0.08)' }} content={<ChartTooltip />} />
                  <Bar dataKey="value" fill="url(#brandGrad0)" radius={[0, 6, 6, 0]} barSize={16}>
                    <LabelList dataKey="value" position="right" fill="#475569" fontSize={12} fontWeight={600} offset={8} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : <EmptyChart msg="No sector data recorded" />}
          </div>
        </GlassCard>

        <GlassCard level={2}>
          <h3 className="text-sm font-bold tracking-tight text-[var(--text-primary)] mb-1">Top Locations</h3>
          <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mb-4">{scopeLabel}</p>
          <div className="h-[320px]">
            {scopeChart.locationData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={scopeChart.locationData} layout="vertical" margin={{ left: 10, right: 40 }} barCategoryGap="20%">
                  <ChartGradients />
                  <CartesianGrid stroke={GRID_STROKE} strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" tick={AXIS_TICK} axisLine={{ stroke: '#e2e8f0' }} tickLine={false} domain={[0, 'auto']} allowDecimals={false} />
                  <YAxis dataKey="name" type="category" width={110} tick={AXIS_TICK} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ fill: 'rgba(106,44,145,0.08)' }} content={<ChartTooltip />} />
                  <Bar dataKey="value" fill="url(#brandGrad0)" radius={[0, 6, 6, 0]} barSize={16}>
                    <LabelList dataKey="value" position="right" fill="#475569" fontSize={12} fontWeight={600} offset={8} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : <EmptyChart msg="No location data recorded" />}
          </div>
        </GlassCard>
      </div>

      {/* Detailed modal */}
      {activeEvent && activeData && (
        <EventHoverCard
          data={activeData}
          label={events[activeEvent].name || EVENT_META[activeEvent].fallback}
          icon={EVENT_META[activeEvent].icon}
          color={EVENT_META[activeEvent].bg}
          text={EVENT_META[activeEvent].text}
          onClose={() => setActiveEvent(null)}
        />
      )}
    </div>
  )
}
