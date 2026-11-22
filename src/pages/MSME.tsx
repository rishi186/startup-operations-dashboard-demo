import { useDemoEvents } from "../data/demoEvents"
import { quoteEventCsvCell, summarizeEnterpriseEvents } from "../utils/enterpriseEvents"
import { useMemo, useState, Fragment, useEffect, useCallback, useRef } from "react"
import GlassCard from "../components/ui/GlassCard"
import StatCard from "../components/ui/StatCard"
import SectionHeader from "../components/ui/SectionHeader"
import PageHero from "../components/ui/PageHero"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts"
import { CalendarDays, Users, MapPin, ClipboardList, Search, ChevronDown, ChevronUp, Download, Briefcase, TrendingUp, BarChart3 } from "lucide-react"
import type { EnterpriseEvent } from "../types"
import Reveal from "../components/ui/Reveal"
import { seriesColor, gradId, ChartGradients, ChartTooltip, AXIS_TICK, GRID_STROKE } from "../utils/chartTheme"

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debouncedValue
}

const EVENT_COLORS: Record<string, string> = {
  "Business Registration": "#d97706",
  "Skills Development": "#2563eb",
  "Intellectual Property": "#0d9488",
  "Vendor Development": "#5942a6",
}

const TYPE_BADGES: Record<string, { short: string; color: string }> = {
  "Business Registration": { short: "REG", color: "bg-amber-100 text-amber-700" },
  "Skills Development": { short: "SKL", color: "bg-blue-100 text-blue-700" },
  "Intellectual Property": { short: "IP", color: "bg-teal-100 text-teal-700" },
  "Vendor Development": { short: "VEN", color: "bg-brand-50 text-brand" },
}

function computeEventsByType(events: readonly EnterpriseEvent[]) {
  const map: Record<string, number> = {}
  events.forEach((e) => {
    map[e.eventType] = (map[e.eventType] || 0) + 1
  })
  return Object.entries(map).map(([name, value]) => ({ name, value, color: EVENT_COLORS[name] || "#94a3b8" }))
}

function computeParticipantsByDistrict(events: readonly EnterpriseEvent[]) {
  const map: Record<string, { registered: number; actual: number }> = {}
  events.forEach((e) => {
    const d = e.district || "Unknown"
    if (!map[d]) map[d] = { registered: 0, actual: 0 }
    map[d].registered += e.participantsRegistered || 0
    map[d].actual += e.participantsActual || 0
  })
  const sorted = Object.entries(map)
    .sort((a, b) => b[1].actual - a[1].actual)
    .map(([name, vals]) => ({ name, registered: vals.registered, actual: vals.actual }))

  if (sorted.length <= 5) return sorted

  const top5 = sorted.slice(0, 5)
  const others = sorted.slice(5).reduce(
    (s, item) => ({ registered: s.registered + item.registered, actual: s.actual + item.actual }),
    { registered: 0, actual: 0 }
  )
  return [...top5, { name: "Others", ...others }]
}

export default function MSME() {
  const events = useDemoEvents()
  const [selectedYear, setYearFilter] = useState("All")
  const fiscalYears: string[] = [...new Set(events.map(({ fiscalYear }) => fiscalYear))].sort()
  const yearOptions = [...fiscalYears, "All"]
  const yearFilter = yearOptions.includes(selectedYear) ? selectedYear : "All"
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState("")
  const [districtFilter, setDistrictFilter] = useState("")
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [showEvents, setShowEvents] = useState(false)
  const eventsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (showEvents && eventsRef.current) {
      setTimeout(() => {
        eventsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 100)
    }
  }, [showEvents])

  // Debounced search for performance
  const debouncedSearch = useDebounce(search, 300)

  const filteredEvents = useMemo(() => {
    let list = events
    if (yearFilter !== "All") {
      list = list.filter((e) => e.fiscalYear === yearFilter)
    }
    if (typeFilter) {
      list = list.filter((e) => e.eventType === typeFilter)
    }
    if (districtFilter) {
      list = list.filter((e) => e.district === districtFilter)
    }
    if (debouncedSearch.trim()) {
      const q = debouncedSearch.toLowerCase()
      list = list.filter((e) =>
        e.eventName.toLowerCase().includes(q) ||
        e.eventType.toLowerCase().includes(q) ||
        e.venue.toLowerCase().includes(q)
      )
    }
    return list
  }, [events, yearFilter, debouncedSearch, typeFilter, districtFilter])

  // CSV Export function
  const exportToCSV = useCallback(() => {
    const headers = ['Data source', 'Event Name', 'Type', 'Date', 'Venue', 'District', 'Registered', 'Actual', 'Status', 'Fiscal Year']
    const rows = filteredEvents.map(e => [
      'Synthetic demo',
      e.eventName,
      e.eventType,
      e.date,
      e.venue,
      e.district,
      e.participantsRegistered || 0,
      e.participantsActual ?? '',
      e.status,
      e.fiscalYear
    ])
    const csv = [headers.join(','), ...rows.map((row) => row.map(quoteEventCsvCell).join(','))].join('\r\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `synthetic-msme-events-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }, [filteredEvents])

  const stats = useMemo(() => summarizeEnterpriseEvents(filteredEvents), [filteredEvents])
  const eventsByType = useMemo(() => computeEventsByType(filteredEvents), [filteredEvents])
  const participantsByDistrict = useMemo(() => computeParticipantsByDistrict(filteredEvents), [filteredEvents])
  const typeDistribution = useMemo(() => {
    const total = filteredEvents.length || 1
    const byType = computeEventsByType(filteredEvents)
    return byType.map((item) => ({ ...item, value: Math.round((item.value / total) * 100) }))
  }, [filteredEvents])

  const allTypes = useMemo(() => [...new Set(events.map((e) => e.eventType))].sort(), [events])
  const allDistricts = useMemo(() => [...new Set(events.map((e) => e.district).filter(Boolean))].sort(), [events])

  const statCards = [
    { label: "Total Events", value: stats.totalEvents, icon: CalendarDays, accent: 'indigo' as const },
    { label: "Registered", value: stats.totalReg, icon: ClipboardList, accent: 'blue' as const },
    { label: "Actual Participants", value: stats.totalActual, icon: Users, accent: 'teal' as const },
    { label: "Districts Covered", value: stats.districts, icon: MapPin, accent: 'emerald' as const },
  ]

  return (
    <div className="space-y-6">
      <PageHero
        title="MSME Events"
        subtitle="Small business training, registration, and vendor development"
        description="Tracking events, participation, and outcomes across districts."
        accent="indigo"
      />

      {/* Year filter pills */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-[var(--text-muted)] font-medium mr-1">Period:</span>
        {yearOptions.map((y) => (
          <button
            key={y}
            onClick={() => setYearFilter(y)}
            aria-pressed={yearFilter === y}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all active:scale-95 ${
              yearFilter === y
                ? "bg-brand-gradient text-white shadow-md shadow-brand/20"
                : "glass-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:glass-3"
            }`}
          >
            {y === "All" ? "All Years" : `FY ${y}`}
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <div key={card.label}>
            <StatCard
              icon={card.icon}
              label={card.label}
              value={card.value}
              onClick={card.label === 'Total Events' ? () => setShowEvents(v => !v) : undefined}
              accent={card.accent}
              stagger={i}
            />
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <Reveal>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <GlassCard level={2} hover accent="indigo" stagger={0}>
          <SectionHeader icon={BarChart3} title="Events by Type" accent="indigo" />
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={eventsByType} layout="vertical" margin={{ top: 5, right: 20, bottom: 5, left: 20 }}>
              <ChartGradients />
              <CartesianGrid stroke={GRID_STROKE} strokeDasharray="3 3" vertical={false} horizontal={false} />
              <XAxis type="number" tick={AXIS_TICK} axisLine={{ stroke: "var(--glass-border)" }} />
              <YAxis dataKey="name" type="category" tick={AXIS_TICK} width={140} axisLine={{ stroke: "var(--glass-border)" }} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="value" name="Events" radius={[0, 6, 6, 0]} barSize={14}>
                {eventsByType.map((_, i) => (
                  <Cell key={`cell-${i}`} fill={`url(#${gradId(i)})`} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </GlassCard>

        <GlassCard level={2} hover accent="teal" stagger={1}>
          <SectionHeader icon={Users} title="Participants by District" accent="teal" />
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={participantsByDistrict} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <ChartGradients />
              <CartesianGrid stroke={GRID_STROKE} strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tick={AXIS_TICK} angle={-20} textAnchor="end" height={50} axisLine={{ stroke: "var(--glass-border)" }} />
              <YAxis tick={AXIS_TICK} axisLine={{ stroke: "var(--glass-border)" }} />
              <Tooltip content={<ChartTooltip />} />
              <Legend wrapperStyle={{ fontSize: "12px" }} />
              <Bar dataKey="registered" name="Registered" fill="url(#brandGrad1)" radius={[6, 6, 0, 0]} barSize={14} />
              <Bar dataKey="actual" name="Actual" fill="url(#brandGrad0)" radius={[6, 6, 0, 0]} barSize={14} />
            </BarChart>
          </ResponsiveContainer>
        </GlassCard>

        <GlassCard level={2} hover accent="amber" stagger={2}>
          <SectionHeader icon={TrendingUp} title="Type Distribution" accent="amber" />
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <ChartGradients />
              <Pie data={typeDistribution} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={2} cornerRadius={4} dataKey="value" stroke="#fff" strokeWidth={2}>
                {typeDistribution.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={`url(#${gradId(index)})`} />
                ))}
              </Pie>
              <Tooltip content={<ChartTooltip valueSuffix="%" />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-2">
            {typeDistribution.map((item, i) => (
              <div key={item.name} className="flex items-center gap-2 text-xs">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ background: seriesColor(i) }} />
                <span className="text-[var(--text-secondary)] truncate">{item.name}</span>
                <span className="text-[var(--text-primary)] font-mono ml-auto">{item.value}%</span>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
      </Reveal>

      {/* Filters + Table */}
      {showEvents && (
      <div ref={eventsRef} className="scroll-mt-6">
      <GlassCard level={2} accent="indigo">
        <SectionHeader icon={Briefcase} title="Event Directory" subtitle={`${filteredEvents.length} ${filteredEvents.length === 1 ? 'event' : 'events'}`} accent="indigo" action={
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg glass-2 hover:glass-3 text-[var(--text-secondary)] text-xs font-medium transition-all active:scale-95"
            title="Export to CSV"
          >
            <Download size={14} /> Export CSV
          </button>
        } />
        <div className="flex flex-col md:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search events..."
              className="w-full pl-9 pr-3 py-2 rounded-lg bg-[var(--glass-1)] border border-[var(--glass-border)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--glass-border)]/80"
            />
          </div>
          <select
            aria-label="Event type"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 rounded-lg bg-[var(--glass-1)] border border-[var(--glass-border)] text-sm text-[var(--text-primary)] focus:outline-none"
          >
            <option value="">All Types</option>
            {allTypes.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <select
            aria-label="Event district"
            value={districtFilter}
            onChange={(e) => setDistrictFilter(e.target.value)}
            className="px-3 py-2 rounded-lg bg-[var(--glass-1)] border border-[var(--glass-border)] text-sm text-[var(--text-primary)] focus:outline-none"
          >
            <option value="">All Districts</option>
            {allDistricts.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>

        {/* Desktop Table View */}
        <div className="overflow-auto hidden md:block max-h-[560px]">
          <table className="w-full text-sm">
            <thead className="tbl-head-sticky">
              <tr className="border-b border-[var(--glass-border)]">
                <th className="text-left py-2 px-3 text-[var(--text-muted)] font-medium w-[32%]">Event</th>
                <th className="text-left py-2 px-2 text-[var(--text-muted)] font-medium w-[10%]">Type</th>
                <th className="text-left py-2 px-2 text-[var(--text-muted)] font-medium w-[16%]">Date</th>
                <th className="text-left py-2 px-2 text-[var(--text-muted)] font-medium w-[14%]">District</th>
                <th className="text-right py-2 px-2 text-[var(--text-muted)] font-medium w-[8%]">Reg</th>
                <th className="text-right py-2 px-2 text-[var(--text-muted)] font-medium w-[8%]">Actual</th>
                <th className="text-center py-2 px-2 text-[var(--text-muted)] font-medium w-[12%]">View</th>
              </tr>
            </thead>
            <tbody>
              {filteredEvents.map((event) => {
                const badge = TYPE_BADGES[event.eventType] || { short: event.eventType.slice(0,8), color: "bg-slate-500/15 text-slate-400" }
                const isExpanded = expandedId === event.id
                return (
                <Fragment key={`frag-${event.id}`}>
                <tr className="border-b border-[var(--glass-border)]/50 hover:bg-[var(--glass-1)]/50 transition-colors">
                  <td className="py-2.5 px-3">
                    <p className="text-[var(--text-primary)] font-medium text-sm truncate" title={event.eventName}>{event.eventName}</p>
                  </td>
                  <td className="py-2.5 px-2">
                    <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-medium ${badge.color}`} title={event.eventType}>
                      {badge.short}
                    </span>
                  </td>
                  <td className="py-2.5 px-2 text-[var(--text-secondary)] text-sm">{event.date}</td>
                  <td className="py-2.5 px-2 text-[var(--text-secondary)] text-sm">{event.district}</td>
                  <td className="py-2.5 px-2 text-right text-[var(--text-primary)] font-mono text-sm">{event.participantsRegistered ?? "-"}</td>
                  <td className="py-2.5 px-2 text-right text-[var(--text-primary)] font-mono text-sm">{event.participantsActual ?? "-"}</td>
                  <td className="py-2.5 px-2 text-center">
                    <button
                      type="button"
                      aria-expanded={isExpanded}                      aria-label={isExpanded ? "Hide event details" : "Show event details"}                      onClick={() => setExpandedId(isExpanded ? null : event.id)}
                      className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-[var(--glass-2)] hover:bg-[var(--glass-3)] border border-[var(--glass-border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all active:scale-95"
                      title={isExpanded ? "Show less" : "View more"}
                    >
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                  </td>
                </tr>
                {isExpanded && (
                <tr key={`${event.id}-details`} className="bg-brand-50/30 border-l-2 border-brand-200">
                  <td colSpan={7} className="py-4 px-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-[10px] uppercase tracking-wide text-[var(--text-muted)] mb-1">Venue</p>
                        <p className="text-[var(--text-primary)]">{event.venue}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-wide text-[var(--text-muted)] mb-1">Event Code</p>
                        <p className="text-[var(--text-primary)] font-mono">{event.eventCode || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-wide text-[var(--text-muted)] mb-1">Status</p>
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium ${event.status === "Completed" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${event.status === "Completed" ? "bg-emerald-500" : "bg-amber-500"}`} />
                          {event.status}
                        </span>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-wide text-[var(--text-muted)] mb-1">Fiscal Year</p>
                        <p className="text-[var(--text-primary)]">FY {event.fiscalYear}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-wide text-[var(--text-muted)] mb-1">Attendance Rate</p>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-[var(--glass-surface-1)] rounded-full overflow-hidden">
                            <div className="h-full rounded-full bg-gradient-to-r from-teal-500 to-emerald-500" style={{ width: `${event.participantsRegistered && event.participantsActual ? Math.round((event.participantsActual / event.participantsRegistered) * 100) : 0}%` }} />
                          </div>
                          <span className="text-xs font-mono text-[var(--text-primary)]">
                            {event.participantsRegistered && event.participantsActual
                              ? `${Math.round((event.participantsActual / event.participantsRegistered) * 100)}%`
                              : "N/A"}
                          </span>
                        </div>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-wide text-[var(--text-muted)] mb-1">Outcomes</p>
                        <div className="flex flex-wrap gap-1">
                          {event.outcomes?.setupBusiness && <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 text-[10px] font-medium">Business</span>}
                          {event.outcomes?.esCompliance && <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 text-[10px] font-medium">E&S</span>}
                          {event.outcomes?.iprFiling && <span className="px-1.5 py-0.5 rounded bg-brand-50 text-brand text-[10px] font-medium">IPR</span>}
                          {event.outcomes?.buyerMou && <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 text-[10px] font-medium">MOU</span>}
                          {!event.outcomes?.setupBusiness && !event.outcomes?.esCompliance && !event.outcomes?.iprFiling && !event.outcomes?.buyerMou && (
                            <span className="text-[var(--text-muted)] text-xs">No outcomes recorded</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
                )}
                </Fragment>
                )
              })}
              {filteredEvents.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-[var(--text-muted)]">
                    No events match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-3">
          {filteredEvents.map((event) => {
            const badge = TYPE_BADGES[event.eventType] || { short: event.eventType.slice(0,8), color: "bg-slate-500/15 text-slate-400" }
            const isExpanded = expandedId === event.id
            return (
              <div key={`mobile-${event.id}`} className="glass-1 rounded-xl p-3 border border-[var(--glass-border)]">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-[var(--text-primary)] font-medium text-sm truncate">{event.eventName}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-medium ${badge.color}`}>
                        {badge.short}
                      </span>
                      <span className="text-xs text-[var(--text-muted)]">{event.date}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    aria-expanded={isExpanded}                    aria-label={isExpanded ? "Hide event details" : "Show event details"}                    onClick={() => setExpandedId(isExpanded ? null : event.id)}
                    className="flex items-center justify-center w-7 h-7 rounded-lg glass-2 text-[var(--text-muted)] active:scale-95"
                  >
                    {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-2 mt-2 pt-2 border-t border-[var(--glass-border)]">
                  <div className="text-center">
                    <p className="text-[10px] text-[var(--text-muted)]">District</p>
                    <p className="text-xs text-[var(--text-primary)] truncate">{event.district}</p>
                  </div>
                  <div className="text-center border-l border-r border-[var(--glass-border)]">
                    <p className="text-[10px] text-[var(--text-muted)]">Reg</p>
                    <p className="text-xs text-[var(--text-primary)] font-mono">{event.participantsRegistered ?? "-"}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] text-[var(--text-muted)]">Actual</p>
                    <p className="text-xs text-[var(--text-primary)] font-mono">{event.participantsActual ?? "-"}</p>
                  </div>
                </div>
                {isExpanded && (
                  <div className="mt-3 pt-3 border-t border-[var(--glass-border)] space-y-2 text-sm">
                    <div>
                      <p className="text-[10px] uppercase tracking-wide text-[var(--text-muted)]">Venue</p>
                      <p className="text-[var(--text-primary)]">{event.venue}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-[10px] uppercase tracking-wide text-[var(--text-muted)]">Event Code</p>
                        <p className="text-[var(--text-primary)] font-mono">{event.eventCode || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-wide text-[var(--text-muted)]">Status</p>
                        <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium ${event.status === "Completed" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${event.status === "Completed" ? "bg-emerald-500" : "bg-amber-500"}`} />
                          {event.status}
                        </span>
                      </div>
                    </div>
                    {event.participantsRegistered && event.participantsActual && (
                      <div>
                        <p className="text-[10px] uppercase tracking-wide text-[var(--text-muted)]">Attendance</p>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-[var(--glass-surface-1)] rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full"
                              style={{ width: `${Math.round((event.participantsActual / event.participantsRegistered) * 100)}%` }}
                            />
                          </div>
                          <span className="text-xs font-mono text-[var(--text-primary)]">
                            {Math.round((event.participantsActual / event.participantsRegistered) * 100)}%
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
          {filteredEvents.length === 0 && (
            <div className="text-center py-8 text-[var(--text-muted)] text-sm">
              No events match your filters.
            </div>
          )}
        </div>
      </GlassCard>
      </div>
      )}
    </div>
  )
}
