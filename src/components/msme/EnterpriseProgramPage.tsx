import { useMemo, useState } from 'react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import GlassCard from '../ui/GlassCard'
import PageHero from '../ui/PageHero'
import { CalendarDays, CheckCircle2, Users, RotateCcw, Search } from 'lucide-react'
import type { EnterpriseProgramData } from '../../types'
import { combineSummaries } from '../../data/synthetic'
import { gradId, ChartGradients, ChartTooltip } from '../../utils/chartTheme'

const AGE_ORDER = ['18-25', '26-35', '36-45', '46-60', '60+']

function toSortedChartData(record: Record<string, number>) {
  return Object.entries(record)
    .map(([name, value]) => ({ name, value }))
    .filter((d) => d.value > 0)
    .sort((a, b) => b.value - a.value)
}

interface Props {
  title: string
  subtitle: string
  description?: string
  data: EnterpriseProgramData
}

export default function EnterpriseProgramPage({ title, subtitle, description, data }: Props) {
  const [district, setDistrict] = useState('')
  const [mandal, setMandal] = useState('')
  const [constituency, setConstituency] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [batchId, setBatchId] = useState('')
  const [search, setSearch] = useState('')

  const batches = data?.batches || []

  const districts = [...new Set(batches.map((batch) => batch.district))].sort()
  const isMultiDistrict = districts.length > 1
  const mandalOptions = [...new Set(batches
    .filter((batch) => !district || batch.district === district)
    .map((batch) => batch.mandal)
  )].sort()
  const constituencyOptions = useMemo(
    () => [...new Set(batches.map((b) => b.constituency).filter(Boolean))].sort((a, b) => a.localeCompare(b)),
    [batches]
  )

  const filtered = useMemo(() => {
    return batches.filter((b) => {
      if (district && b.district !== district) return false
      if (mandal && (b.mandal || '').toUpperCase() !== mandal.toUpperCase()) return false
      if (constituency && b.constituency !== constituency) return false
      if (batchId && b.id !== batchId) return false
      if (startDate && b.startDate < startDate) return false
      if (endDate && b.endDate > endDate) return false
      return true
    })
  }, [batches, district, mandal, constituency, batchId, startDate, endDate])

  const tableRows = useMemo(() => {
    if (!search.trim()) return filtered
    const q = search.trim().toLowerCase()
    return filtered.filter((b) =>
      [b.id, b.component, b.district, b.constituency, b.mandal, b.checklistStatus, b.status, b.reviewStatus, b.remarks]
        .some((v) => (v || '').toLowerCase().includes(q))
    )
  }, [filtered, search])

  const summary = combineSummaries(tableRows.map((batch) => batch.summary))
  const completed = tableRows.filter((batch) => batch.status === 'Completed').length
  const genderData = toSortedChartData(summary.byGender)
  const categoryData = toSortedChartData(summary.byCategory)
  const ageData = AGE_ORDER.map((name) => ({ name, value: summary.byAge[name] ?? 0 })).filter((d) => d.value > 0)

  const resetFilters = () => {
    setDistrict('')
    setMandal('')
    setConstituency('')
    setStartDate('')
    setEndDate('')
    setBatchId('')
    setSearch('')
  }

  const selectCls = 'w-full px-3 py-2 rounded-lg border border-[var(--glass-border)] bg-white/60 text-sm focus:outline-none focus:ring-2 focus:ring-brand'
  const labelCls = 'text-[11px] font-semibold text-[var(--text-secondary)] mb-1 block'

  const cards = [
    { label: 'Total Batches', value: tableRows.length, icon: CalendarDays, accent: 'purple' as const },
    { label: 'Registrants Enrolled', value: summary.total, icon: Users, accent: 'indigo' as const },
    { label: 'Batches Completed', value: completed, icon: CheckCircle2, accent: 'emerald' as const },
  ]

  return (
    <div className="space-y-4">
      <PageHero title={title} subtitle={subtitle} description={description} compact />

      {/* Filters */}
      <GlassCard level={2} padding="p-4">
        <div className={`grid grid-cols-2 sm:grid-cols-3 gap-3 ${isMultiDistrict ? 'lg:grid-cols-6' : 'lg:grid-cols-5'}`}>
          {isMultiDistrict && (
            <div>
              <label className={labelCls}>District</label>
              <select aria-label="District" value={district} onChange={(e) => { setDistrict(e.target.value); setMandal('') }} className={selectCls}>
                <option value="">All</option>
                {districts.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          )}
          <div>
            <label className={labelCls}>Ward</label>
            <select aria-label="Ward" value={mandal} onChange={(e) => setMandal(e.target.value)} disabled={isMultiDistrict && !district} className={`${selectCls} disabled:opacity-40`}>
              <option value="">All</option>
              {mandalOptions.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Constituency</label>
            <select aria-label="Constituency" value={constituency} onChange={(e) => setConstituency(e.target.value)} className={selectCls}>
              <option value="">All</option>
              {constituencyOptions.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Batch</label>
            <select aria-label="Batch ID" value={batchId} onChange={(e) => setBatchId(e.target.value)} className={selectCls}>
              <option value="">All</option>
              {batches.map((b) => <option key={b.id} value={b.id}>{b.id}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Start Date</label>
            <input type="date" aria-label="Start date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className={selectCls} />
          </div>
          <div>
            <label className={labelCls}>End Date</label>
            <input type="date" aria-label="End date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className={selectCls} />
          </div>
        </div>
        <div className="flex justify-end mt-3">
          <button onClick={resetFilters} className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium glass-2 text-[var(--text-secondary)] hover:glass-3 active:scale-95 transition-all">
            <RotateCcw size={14} /> Reset
          </button>
        </div>
      </GlassCard>

      {/* Headline cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {cards.map((c, i) => (
          <GlassCard key={c.label} level={2} padding="p-4" stagger={i}>
            <div className="w-9 h-9 rounded-lg bg-brand-50 flex items-center justify-center mb-2.5">
              <c.icon size={18} className="text-brand" />
            </div>
            <p className="text-2xl font-bold font-mono text-[var(--text-primary)]">{c.value.toLocaleString('en-IN')}</p>
            <p className="text-xs text-[var(--text-muted)] mt-1">{c.label}</p>
          </GlassCard>
        ))}
      </div>

      {/* Monitoring table */}
      <GlassCard level={2} padding="p-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-3">
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">Batch Monitoring</h3>
          <div className="relative w-full sm:w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
            <input aria-label="Search batches" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search…" className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-[var(--glass-border)] bg-white/60 text-sm focus:outline-none focus:ring-2 focus:ring-brand" />
          </div>
        </div>
        <div className="overflow-x-auto max-h-96">
          <table className="w-full text-xs tbl-stripe tbl-head-sticky">
            <thead>
              <tr className="border-b border-[var(--glass-border)]">
                <th className="text-left px-2 py-2 font-semibold text-[var(--text-secondary)]">Batch ID</th>
                <th className="text-left px-2 py-2 font-semibold text-[var(--text-secondary)]">Component</th>
                <th className="text-left px-2 py-2 font-semibold text-[var(--text-secondary)]">District</th>
                <th className="text-left px-2 py-2 font-semibold text-[var(--text-secondary)]">Constituency</th>
                <th className="text-left px-2 py-2 font-semibold text-[var(--text-secondary)]">Ward</th>
                <th className="text-left px-2 py-2 font-semibold text-[var(--text-secondary)]">Start</th>
                <th className="text-left px-2 py-2 font-semibold text-[var(--text-secondary)]">End</th>
                <th className="text-left px-2 py-2 font-semibold text-[var(--text-secondary)]">Checklist</th>
                <th className="text-left px-2 py-2 font-semibold text-[var(--text-secondary)]">Review Status</th>
                <th className="text-left px-2 py-2 font-semibold text-[var(--text-secondary)]">Remarks</th>
              </tr>
            </thead>
            <tbody>
              {tableRows.length === 0 && (
                <tr><td colSpan={10} className="text-center py-8 text-[var(--text-muted)]">No batches match these filters.</td></tr>
              )}
              {tableRows.map((b) => (
                <tr key={b.id} className="tbl-row border-b border-[var(--glass-border)] last:border-0">
                  <td className="px-2 py-2 font-mono text-[var(--text-primary)]">{b.id}</td>
                  <td className="px-2 py-2 text-[var(--text-secondary)] max-w-[220px] truncate" title={b.component}>{b.component}</td>
                  <td className="px-2 py-2 text-[var(--text-secondary)]">{b.district}</td>
                  <td className="px-2 py-2 text-[var(--text-secondary)]">{b.constituency}</td>
                  <td className="px-2 py-2 text-[var(--text-secondary)]">{b.mandal}</td>
                  <td className="px-2 py-2 text-[var(--text-secondary)] font-mono">{b.startDate}</td>
                  <td className="px-2 py-2 text-[var(--text-secondary)] font-mono">{b.endDate}</td>
                  <td className="px-2 py-2 text-[var(--text-secondary)]">{b.checklistStatus}</td>
                  <td className="px-2 py-2">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${b.reviewStatus.toLowerCase() === 'verified' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{b.reviewStatus || '—'}</span>
                  </td>
                  <td className="px-2 py-2 text-[var(--text-muted)] max-w-[160px] truncate" title={b.remarks}>{b.remarks || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {/* Demographic breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <GlassCard level={2} padding="p-4">
          <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-1">Social Category Distribution</h3>
          <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mb-2">{summary.total} registrants</p>
          <div className="h-[220px]">
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <ChartGradients />
                  <Pie data={categoryData} cx="50%" cy="50%" innerRadius={48} outerRadius={76} paddingAngle={2} cornerRadius={4} stroke="#fff" strokeWidth={2} dataKey="value" labelLine={false}>
                    {categoryData.map((_e, i) => <Cell key={i} fill={`url(#${gradId(i)})`} />)}
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                  <Legend verticalAlign="bottom" height={24} iconType="circle" iconSize={7} wrapperStyle={{ fontSize: '11px', color: '#475569' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : <div className="h-full flex items-center justify-center text-xs text-[var(--text-muted)]">No data yet</div>}
          </div>
        </GlassCard>

        <GlassCard level={2} padding="p-4">
          <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-1">Age Distribution</h3>
          <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mb-2">{summary.total} registrants</p>
          <div className="h-[220px]">
            {ageData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <ChartGradients />
                  <Pie data={ageData} cx="50%" cy="50%" innerRadius={48} outerRadius={76} paddingAngle={2} cornerRadius={4} stroke="#fff" strokeWidth={2} dataKey="value" labelLine={false}>
                    {ageData.map((_e, i) => <Cell key={i} fill={`url(#${gradId(i)})`} />)}
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                  <Legend verticalAlign="bottom" height={24} iconType="circle" iconSize={7} wrapperStyle={{ fontSize: '11px', color: '#475569' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : <div className="h-full flex items-center justify-center text-xs text-[var(--text-muted)]">No data yet</div>}
          </div>
        </GlassCard>

        <GlassCard level={2} padding="p-4">
          <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-1">Gender Distribution</h3>
          <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mb-2">{summary.total} registrants</p>
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
            ) : <div className="h-full flex items-center justify-center text-xs text-[var(--text-muted)]">No data yet</div>}
          </div>
        </GlassCard>
      </div>
    </div>
  )
}
