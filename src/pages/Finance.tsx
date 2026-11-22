import { useState, useMemo } from "react"
import GlassCard from "../components/ui/GlassCard"
import StatCard from "../components/ui/StatCard"
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, ComposedChart
} from "recharts"
import { Building2, TrendingUp, ArrowUpRight, ArrowDownRight, Wallet, Receipt, Minus } from "lucide-react"
import { finance } from "../data/synthetic"
import Reveal from "../components/ui/Reveal"
import { CHART_SERIES, gradId, ChartGradients, ChartTooltip, AXIS_TICK, GRID_STROKE, CHART_ANIM } from "../utils/chartTheme"

function formatINR(n: number) {
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)}Cr`
  if (n >= 100000) return `₹${(n / 100000).toFixed(2)}L`
  return `₹${n.toLocaleString("en-IN")}`
}

function deriveMonthLabel(dateStr: string): string {
  const parts = dateStr.split("-")
  if (parts.length !== 3) return dateStr
  const [, month, year] = parts
  const monthNames: Record<string, string> = {
    "01": "Jan", "02": "Feb", "03": "Mar", "04": "Apr", "05": "May", "06": "Jun",
    "07": "Jul", "08": "Aug", "09": "Sep", "10": "Oct", "11": "Nov", "12": "Dec",
  }
  const monthName = monthNames[month] || month
  const yr = year.slice(-2)
  return `${monthName} ${yr}`
}

const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec']

/** Map a free-text expense period ("March", "Jan to Feb") + fiscal year to the same
 *  "MMM YY" key grants use, so income and expense for the same month land on one bar.
 *  Unrecognised periods are returned as-is (and sort to the end of the timeline). */
function canonicalExpenseMonth(period: string, fiscalYear: string): string {
  if (!period) return 'Unknown'
  const idx = MONTHS.findIndex((m) => period.toLowerCase().includes(m))
  if (idx === -1) return period
  const monthNum = idx + 1
  const startYear = fiscalYear?.includes('2026-27') ? 2026 : 2025 // FY starts in April
  const year = monthNum >= 4 ? startYear : startYear + 1
  const label = MONTHS[idx][0].toUpperCase() + MONTHS[idx].slice(1)
  return `${label} ${String(year).slice(-2)}`
}

export default function Finance() {
  const [activeTab, setActiveTab] = useState<"all" | "fy25" | "fy26">("all")

  const { filteredGrants, filteredExpenses, fy25GrantTotal, fy26GrantTotal, fy25ExpenseTotal, fy26ExpenseTotal, grandGrantTotal, grandExpenseTotal, totalIncome, totalExpense, netProfit, companyGrantTotals, monthlyData } = useMemo(() => {
    const grants = finance.grants || []
    const expenses = finance.expenses || []

    const fy25Grants = grants.filter(g => g.fiscalYear === "FY 2025-26")
    const fy26Grants = grants.filter(g => g.fiscalYear === "FY 2026-27")
    const fy25Expenses = expenses.filter(e => e.fiscalYear === "FY 2025-26")
    const fy26Expenses = expenses.filter(e => e.fiscalYear === "FY 2026-27")

    const fy25GT = fy25Grants.reduce((s, d) => s + d.amount, 0)
    const fy26GT = fy26Grants.reduce((s, d) => s + d.amount, 0)
    const fy25ET = fy25Expenses.reduce((s, d) => s + d.amount, 0)
    const fy26ET = fy26Expenses.reduce((s, d) => s + d.amount, 0)
    const gGT = fy25GT + fy26GT
    const gET = fy25ET + fy26ET

    const allGrants = grants.map(d => ({ ...d, year: d.fiscalYear, type: "Grant" }))
    const allExpenses = expenses.map(d => ({ ...d, year: d.fiscalYear, type: "Expense" }))

    const fGrants = activeTab === "all" ? allGrants : activeTab === "fy25" ? allGrants.filter(g => g.year === "FY 2025-26") : allGrants.filter(g => g.year === "FY 2026-27")
    const fExpenses = activeTab === "all" ? allExpenses : activeTab === "fy25" ? allExpenses.filter(e => e.year === "FY 2025-26") : allExpenses.filter(e => e.year === "FY 2026-27")

    const companyMap = new Map<string, { company: string; fy25: number; fy26: number; total: number; color: string }>()
    grants.forEach(g => {
      const existing = companyMap.get(g.company) || { company: g.company, fy25: 0, fy26: 0, total: 0, color: CHART_SERIES[companyMap.size % CHART_SERIES.length] }
      if (g.fiscalYear === "FY 2025-26") existing.fy25 += g.amount
      if (g.fiscalYear === "FY 2026-27") existing.fy26 += g.amount
      existing.total += g.amount
      companyMap.set(g.company, existing)
    })
    const cGT = Array.from(companyMap.values()).sort((a, b) => b.total - a.total)

    const monthlyMap = new Map<string, { month: string; income: number; expense: number }>()
    const monthOrder = ["Dec 25", "Jan 26", "Jan-Feb 26", "Feb 26", "Mar 26", "Apr 26", "May 26", "Jun 26", "Jul 26", "Aug 26", "Sep 26", "Oct 26", "Nov 26", "Dec 26", "Jan 27", "Feb 27", "Mar 27"]
    grants.forEach(g => {
      const monthKey = g.date ? deriveMonthLabel(g.date) : "Unknown"
      const existing = monthlyMap.get(monthKey) || { month: monthKey, income: 0, expense: 0 }
      existing.income += g.amount
      monthlyMap.set(monthKey, existing)
    })
    expenses.forEach(e => {
      const monthKey = canonicalExpenseMonth(e.period, e.fiscalYear)
      const existing = monthlyMap.get(monthKey) || { month: monthKey, income: 0, expense: 0 }
      existing.expense += e.amount
      monthlyMap.set(monthKey, existing)
    })
    const mD = Array.from(monthlyMap.values()).sort((a, b) => {
      const oa = monthOrder.indexOf(a.month); const ob = monthOrder.indexOf(b.month)
      return (oa === -1 ? Infinity : oa) - (ob === -1 ? Infinity : ob)
    })

    return {
      filteredGrants: fGrants,
      filteredExpenses: fExpenses,
      fy25GrantTotal: fy25GT,
      fy26GrantTotal: fy26GT,
      fy25ExpenseTotal: fy25ET,
      fy26ExpenseTotal: fy26ET,
      grandGrantTotal: gGT,
      grandExpenseTotal: gET,
      totalIncome: gGT,
      totalExpense: gET,
      netProfit: gGT - gET,
      companyGrantTotals: cGT,
      monthlyData: mD,
    }
  }, [finance, activeTab])

  const hasData = (finance.grants?.length || 0) > 0 || (finance.expenses?.length || 0) > 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Finance Overview</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">CSR Grants, Expenses & P&L Summary</p>
        </div>
      </div>

      {/* -- MAIN STAT CARDS -- */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Wallet} label="Total Income (Grants)" value={formatINR(totalIncome)} accent="gold" badge="Income" stagger={0} />
        <StatCard icon={Receipt} label="Total Expenses" value={formatINR(totalExpense)} accent="rose" badge="Expense" stagger={1} />
        <StatCard icon={TrendingUp} label="Net Balance" value={formatINR(netProfit)} accent="teal" badge="Bal" stagger={2} />
        <StatCard icon={Building2} label="Grant Companies" value={companyGrantTotals.length} accent="indigo" stagger={3} />
      </div>

      {/* -- FY BREAKDOWN ROW -- */}
      <Reveal>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* FY 2025-26 Card */}
        <GlassCard level={2} hover>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">FY 2025-26</h3>
            <span className="text-[10px] text-[var(--text-muted)] bg-[var(--glass-surface-1)] px-2 py-0.5 rounded-md">Completed</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="glass-1 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <ArrowUpRight size={14} className="text-slate-500" />
                <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wide">Income</span>
              </div>
              <p className="text-lg font-mono font-bold text-[var(--text-primary)]">{formatINR(fy25GrantTotal)}</p>
              <p className="text-[10px] text-[var(--text-muted)]">{finance.grants?.filter(g => g.fiscalYear === 'FY 2025-26').length || 0} grants received</p>
            </div>
            <div className="glass-1 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <ArrowDownRight size={14} className="text-slate-500" />
                <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wide">Expense</span>
              </div>
              <p className="text-lg font-mono font-bold text-[var(--text-primary)]">{formatINR(fy25ExpenseTotal)}</p>
              <p className="text-[10px] text-[var(--text-muted)]">{finance.expenses?.filter(e => e.fiscalYear === 'FY 2025-26').length || 0} periods</p>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-[var(--glass-border)] flex items-center justify-between">
            <span className="text-xs text-[var(--text-muted)]">Balance</span>
            <span className="text-sm font-mono font-semibold text-[var(--text-primary)]">{formatINR(fy25GrantTotal - fy25ExpenseTotal)}</span>
          </div>
        </GlassCard>

        {/* FY 2026-27 Card */}
        <GlassCard level={2} hover>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">FY 2026-27</h3>
            <span className="text-[10px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md font-medium">In Progress</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="glass-1 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <ArrowUpRight size={14} className="text-slate-500" />
                <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wide">Income</span>
              </div>
              <p className="text-lg font-mono font-bold text-[var(--text-primary)]">{formatINR(fy26GrantTotal)}</p>
              <p className="text-[10px] text-[var(--text-muted)]">{finance.grants?.filter(g => g.fiscalYear === 'FY 2026-27').length || 0} grants received</p>
            </div>
            <div className="glass-1 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <ArrowDownRight size={14} className="text-slate-500" />
                <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wide">Expense</span>
              </div>
              <p className="text-lg font-mono font-bold text-[var(--text-primary)]">{formatINR(fy26ExpenseTotal)}</p>
              <p className="text-[10px] text-[var(--text-muted)]">{finance.expenses?.filter(e => e.fiscalYear === 'FY 2026-27').length || 0} periods</p>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-[var(--glass-border)] flex items-center justify-between">
            <span className="text-xs text-[var(--text-muted)]">Balance</span>
            <span className="text-sm font-mono font-semibold text-[var(--text-primary)]">{formatINR(fy26GrantTotal - fy26ExpenseTotal)}</span>
          </div>
        </GlassCard>
      </div>
      </Reveal>

      {/* -- YEAR FILTER TABS -- */}
      <div className="flex justify-center">
        <div className="flex gap-1 glass-2 rounded-xl p-1">
          {(["all", "fy25", "fy26"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === tab ? "bg-[#1e40af] text-white shadow-sm" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              {tab === "all" ? "All Years" : tab === "fy25" ? "FY 2025-26" : "FY 2026-27"}
            </button>
          ))}
        </div>
      </div>

      {/* -- GRANTS & EXPENSES TABLES -- */}
      <Reveal>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Grants Table */}
        <GlassCard level={2} accent="emerald">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">CSR Grants</h3>
            <span className="text-xs font-mono text-slate-600 font-semibold">{formatINR(activeTab === "all" ? grandGrantTotal : activeTab === "fy25" ? fy25GrantTotal : fy26GrantTotal)}</span>
          </div>
          {filteredGrants.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-10 h-10 rounded-full glass-2 flex items-center justify-center mb-2"><Minus size={18} className="text-[var(--text-muted)]" /></div>
              <p className="text-sm text-[var(--text-muted)]">No grants for this period</p>
            </div>
          ) : (
            <div className="overflow-auto max-h-80 rounded-xl border border-[var(--glass-border)]">
              <table className="w-full text-xs tbl-stripe">
                <thead className="tbl-head-sticky">
                  <tr className="border-b border-[var(--glass-border)] bg-[var(--glass-surface-1)]">
                    <th className="px-3 py-2 text-left font-medium text-[var(--text-muted)]">Date</th>
                    <th className="px-3 py-2 text-left font-medium text-[var(--text-muted)]">Company</th>
                    <th className="px-3 py-2 text-left font-medium text-[var(--text-muted)]">FY</th>
                    <th className="px-3 py-2 text-right font-medium text-[var(--text-muted)]">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredGrants.map((grant, i) => (
                    <tr key={i} className="tbl-row border-b border-[var(--glass-border)] last:border-0">
                      <td className="px-3 py-2 text-[var(--text-primary)]">{grant.date}</td>
                      <td className="px-3 py-2">
                        <span className="inline-flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full" style={{ background: companyGrantTotals.find(c => c.company === grant.company)?.color || "#5942A6" }} />
                          <span className="text-[var(--text-primary)] font-medium">{grant.company}</span>
                        </span>
                      </td>
                      <td className="px-3 py-2 text-[var(--text-secondary)]">{grant.year}</td>
                      <td className="px-3 py-2 text-right font-mono font-semibold text-[var(--text-primary)]">{formatINR(grant.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </GlassCard>

        {/* Expenses Table */}
        <GlassCard level={2} accent="rose">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">Expenses</h3>
            <span className="text-xs font-mono text-slate-600 font-semibold">{formatINR(activeTab === "all" ? grandExpenseTotal : activeTab === "fy25" ? fy25ExpenseTotal : fy26ExpenseTotal)}</span>
          </div>
          {filteredExpenses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-10 h-10 rounded-full glass-2 flex items-center justify-center mb-2"><Minus size={18} className="text-[var(--text-muted)]" /></div>
              <p className="text-sm text-[var(--text-muted)]">No expenses for this period</p>
            </div>
          ) : (
            <div className="overflow-auto max-h-80 rounded-xl border border-[var(--glass-border)]">
              <table className="w-full text-xs tbl-stripe">
                <thead className="tbl-head-sticky">
                  <tr className="border-b border-[var(--glass-border)] bg-[var(--glass-surface-1)]">
                    <th className="px-3 py-2 text-left font-medium text-[var(--text-muted)]">Period</th>
                    <th className="px-3 py-2 text-left font-medium text-[var(--text-muted)]">FY</th>
                    <th className="px-3 py-2 text-right font-medium text-[var(--text-muted)]">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredExpenses.map((exp, i) => (
                    <tr key={i} className="tbl-row border-b border-[var(--glass-border)] last:border-0">
                      <td className="px-3 py-2 text-[var(--text-primary)] font-medium">{exp.period}</td>
                      <td className="px-3 py-2 text-[var(--text-secondary)]">{exp.year}</td>
                      <td className="px-3 py-2 text-right font-mono font-semibold text-[var(--text-primary)]">{formatINR(exp.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </GlassCard>
      </div>
      </Reveal>

      {/* -- CHARTS -- */}
      <Reveal>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Income vs Expense Bar */}
        <GlassCard level={2} hover>
          <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4">Income vs Expense by Financial Year</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={[
              { fy: "FY 2025-26", income: fy25GrantTotal, expense: fy25ExpenseTotal },
              { fy: "FY 2026-27", income: fy26GrantTotal, expense: fy26ExpenseTotal },
            ]} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <ChartGradients />
              <CartesianGrid stroke={GRID_STROKE} strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="fy" tick={AXIS_TICK} axisLine={{ stroke: "var(--glass-border)" }} />
              <YAxis tick={AXIS_TICK} tickFormatter={formatINR} axisLine={{ stroke: "var(--glass-border)" }} />
              <Tooltip content={<ChartTooltip valueFormatter={formatINR} />} />
              <Bar dataKey="income" name="Income (Grants)" fill={`url(#${gradId(0)})`} radius={[6, 6, 0, 0]} activeBar={{ fillOpacity: 1 }} {...CHART_ANIM} />
              <Bar dataKey="expense" name="Expenses" fill={`url(#${gradId(1)})`} radius={[6, 6, 0, 0]} activeBar={{ fillOpacity: 1 }} {...CHART_ANIM} animationBegin={220} />
              <Legend wrapperStyle={{ fontSize: "12px" }} />
            </BarChart>
          </ResponsiveContainer>
        </GlassCard>

        {/* Company Donut */}
        <GlassCard level={2} hover>
          <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4">Grant Share by Company</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <ChartGradients />
              <Pie data={companyGrantTotals} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={2} cornerRadius={4} dataKey="total" stroke="none" activeShape={true} {...CHART_ANIM}>
                {companyGrantTotals.map((_entry, index) => (
                  <Cell key={`cell-${index}`} fill={`url(#${gradId(index)})`} />
                ))}
              </Pie>
              <Tooltip content={<ChartTooltip valueFormatter={formatINR} />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {companyGrantTotals.map((item) => (
              <div key={item.company} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: item.color }} />
                  <span className="text-[var(--text-secondary)]">{item.company}</span>
                </div>
                <span className="text-[var(--text-primary)] font-mono font-semibold">{formatINR(item.total)}</span>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
      </Reveal>

      {/* Timeline Chart */}
      {hasData && monthlyData.length > 0 && (
        <GlassCard level={2} hover>
          <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4">Monthly Cash Flow Timeline</h3>
          <ResponsiveContainer width="100%" height={260}>
            <ComposedChart data={monthlyData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <ChartGradients />
              <CartesianGrid stroke={GRID_STROKE} strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" tick={{ ...AXIS_TICK, fontSize: 10 }} axisLine={{ stroke: "var(--glass-border)" }} />
              <YAxis tick={AXIS_TICK} tickFormatter={formatINR} axisLine={{ stroke: "var(--glass-border)" }} />
              <Tooltip content={<ChartTooltip valueFormatter={formatINR} />} />
              <Bar dataKey="income" name="Income" fill={`url(#${gradId(0)})`} radius={[6, 6, 0, 0]} activeBar={{ fillOpacity: 1 }} {...CHART_ANIM} />
              <Bar dataKey="expense" name="Expense" fill={`url(#${gradId(1)})`} radius={[6, 6, 0, 0]} activeBar={{ fillOpacity: 1 }} {...CHART_ANIM} animationBegin={220} />
              <Legend wrapperStyle={{ fontSize: "12px" }} />
            </ComposedChart>
          </ResponsiveContainer>
        </GlassCard>
      )}

      {!hasData && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-14 h-14 rounded-2xl glass-2 flex items-center justify-center mb-4">
            <Minus size={28} className="text-[var(--text-muted)]" />
          </div>
          <p className="text-sm font-medium text-[var(--text-muted)]">No financial data available</p>
          <p className="text-xs text-[var(--text-muted)] opacity-70 mt-1">Use the Finance Admin to add grants and expenses</p>
        </div>
      )}
    </div>
  )
}
