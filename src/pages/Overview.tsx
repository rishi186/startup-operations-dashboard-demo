import { lazy, Suspense } from 'react'
import { collegeOutreach, finance, ideaLab, incubationEvents, partners, pipeline, portfolio } from '../data/synthetic'
import { useDemoEvents } from '../data/demoEvents'
import { summarizeEnterpriseEvents } from '../utils/enterpriseEvents'
import GlassCard from '../components/ui/GlassCard'
import StatCard from '../components/ui/StatCard'
import SectionHeader from '../components/ui/SectionHeader'
import PageHero from '../components/ui/PageHero'
import {
  Rocket, Users, Briefcase, Calendar, IndianRupee, Building, MapPin, Lightbulb,
  Target, Zap, GraduationCap, Network,
  Sparkles, TrendingUp, Wallet, HardHat, Bell
} from 'lucide-react'
import Reveal from '../components/ui/Reveal'
const PipelineSankey = lazy(() => import('../components/charts/PipelineSankey'))

type Accent = 'amber' | 'blue' | 'purple' | 'teal' | 'rose' | 'emerald' | 'indigo' | 'gold'

const PROGRAM_ICONS = {
  'Idea Lab': Lightbulb,
  'Founder Cohort': Rocket,
  'College Outreach': Network,
  'Small Business Programs': Target,
} as Record<string, typeof Lightbulb>

export default function Overview() {
  const { programsList, infrastructure, digitalInfra, forwardPlan, notices, workspace } = portfolio
  const eventBuckets = Object.values(incubationEvents)
  const events = useDemoEvents()
  const { totalActual: msmeAttendance } = summarizeEnterpriseEvents(events)
  const incubationAttendance = eventBuckets.reduce((total, event) => total + event.total, 0)
  const funding = finance.grants.reduce((total, grant) => total + grant.amount, 0)
  const occupancy = Math.round(workspace.occupied / workspace.capacity * 100)

  const displayKPIs: { label: string; value: number | string; sub?: string; icon: typeof Rocket; accent: Accent }[] = [
    { label: 'Startup Applicants', value: ideaLab.summary.applications, icon: Rocket, accent: 'purple' },
    { label: 'Total Participations', value: ideaLab.summary.attendance + incubationAttendance + msmeAttendance + collegeOutreach.stats.students, icon: Users, accent: 'blue' },
    { label: 'MSME Attendance', value: msmeAttendance, icon: Briefcase, accent: 'indigo' },
    { label: 'Events Tracked', value: eventBuckets.length + events.length, icon: Calendar, accent: 'rose' },
    { label: 'Grant Funding', value: (funding / 100000).toFixed(2) + 'L', icon: IndianRupee, accent: 'gold' },
    { label: 'Occupancy', value: occupancy + '%', sub: workspace.occupied + ' of ' + workspace.capacity + ' desks', icon: Building, accent: 'teal' },
    { label: 'Campus Partners', value: collegeOutreach.stats.colleges, icon: MapPin, accent: 'emerald' },
  ]

  const startupEngine = [
    { number: pipeline.ideas, label: 'Ideas validated', icon: Lightbulb },
    { number: pipeline.prototypes, label: 'Prototypes built', icon: Rocket },
    { number: pipeline.incubation, label: 'Ventures shortlisted for incubation', icon: Target },
    { number: pipeline.accelerated, label: 'Ventures accelerated', icon: Zap },
    { number: pipeline.funding.seed, label: 'Seed awards', icon: Wallet },
  ]
  const innovationNetwork = [
    { number: collegeOutreach.stats.colleges, label: 'Campus partners', icon: GraduationCap },
    { number: collegeOutreach.stats.students, label: 'Students reached', icon: Users },
    { number: msmeAttendance, label: 'MSME attendance', icon: Briefcase },
    { number: collegeOutreach.stats.ambassadors, label: 'Campus ambassadors', icon: Network },
  ]

  const urgencyColor: Record<string, string> = {
    red: 'border-l-red-500',
    gold: 'border-l-amber-500',
    green: 'border-l-emerald-500',
  }

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <PageHero
        title="Startup Operations Dashboard"
        subtitle="Incubation, outreach, and enterprise support"
        accent="purple"
      />

      {/* Top KPI Row - 7 Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        {displayKPIs.map((kpi, i) => (
          <StatCard key={i} icon={kpi.icon} label={kpi.label} value={kpi.value} sub={kpi.sub} accent={kpi.accent} stagger={i} />
        ))}
      </div>

      {/* Startup Pipeline — Idea to Investment (Sankey flow) — hidden when printing */}
      <Reveal className="no-print">
        <GlassCard level={2} hover={false} accent="purple">
          <SectionHeader icon={Rocket} title="Startup Pipeline — Idea to Investment" subtitle="How ventures flow from validated ideas through to funding, with drop-off at each stage" accent="purple" />
          <Suspense fallback={<div className="h-[350px]" aria-hidden="true" />}>
            <PipelineSankey />
          </Suspense>
        </GlassCard>
      </Reveal>

      {/* Three Column Layout */}
      <Reveal>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Startup Development Engine */}
        <GlassCard level={2} hover accent="purple" stagger={0}>
          <SectionHeader icon={Rocket} title="Startup Development Engine" accent="purple" />
          <div className="space-y-3">
            {startupEngine.map((item: any, i: number) => (
              <div key={i} className="flex items-center gap-3.5">
                <div className="w-14 h-10 rounded-xl bg-brand-50 flex items-center justify-center shrink-0">
                  <span className="text-base font-extrabold text-brand num-figure leading-none">{item.number}</span>
                </div>
                <p className="flex-1 text-sm font-medium text-[var(--text-primary)] leading-snug">{item.label}</p>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Programs & Ecosystem */}
        <GlassCard level={2} hover accent="blue" stagger={1}>
          <SectionHeader icon={Sparkles} title="Programs & Ecosystem Initiatives" accent="blue" />
          <div className="space-y-3">
            {programsList.map((prog, i) => {
              const Icon = PROGRAM_ICONS[prog.name] || Sparkles
              return (
                <div key={i} className="flex items-center gap-3 glass-1 rounded-lg p-3 transition-all hover:scale-[1.02] hover:border-blue-200">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                    <Icon size={16} className="text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--text-primary)] truncate">{prog.name}</p>
                    <p className="text-xs text-[var(--text-muted)] truncate">{prog.desc}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </GlassCard>

        {/* Innovation & MSME Network */}
        <GlassCard level={2} hover accent="emerald" stagger={2}>
          <SectionHeader icon={Network} title="Innovation and MSME Network" accent="emerald" />
          <div className="space-y-4">
            {innovationNetwork.map((item: any, i: number) => (
              <div key={i} className="flex items-start gap-4">
                <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
                  <item.icon size={18} className="text-emerald-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xl font-bold text-emerald-600 font-mono">{item.number}</p>
                  <p className="text-xs text-[var(--text-muted)] leading-snug">{item.label}</p>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
      </Reveal>

      {/* Infrastructure & Digital Capability */}
      <Reveal>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <GlassCard level={2} hover accent="amber" stagger={0}>
          <SectionHeader icon={HardHat} title="Infrastructure & Digital Capability" accent="amber" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm font-medium text-[var(--text-muted)] mb-3">15,025 Sq ft Facility (G+2)</p>
              <div className="space-y-2">
                {infrastructure.map((item, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm text-[var(--text-primary)]">
                    <div className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-[var(--text-muted)] mb-3">Digital Infrastructure</p>
              <div className="space-y-2">
                {digitalInfra.map((item, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm text-[var(--text-primary)]">
                    <div className="w-2 h-2 rounded-full bg-teal-500 shrink-0" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Forward Plan */}
        <GlassCard level={2} hover accent="teal" stagger={1}>
          <SectionHeader icon={TrendingUp} title="Forward Plan (2026-27)" accent="teal" />
          <div className="space-y-3">
            {forwardPlan.map((item, i) => (
              <div key={i} className="flex items-start gap-3 text-sm text-[var(--text-primary)]">
                <div className="w-5 h-5 rounded-full bg-teal-100 flex items-center justify-center shrink-0 mt-0.5">
                  <div className="w-2 h-2 rounded-full bg-teal-600" />
                </div>
                <span className="leading-relaxed">{item}</span>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
      </Reveal>

      {/* Notices */}
      {notices.length > 0 && (
        <GlassCard level={2} accent="rose">
          <SectionHeader icon={Bell} title="Notices & Announcements" accent="rose" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {notices.map((n, i) => (
              <div key={i} className={`p-4 rounded-xl bg-[var(--glass-surface-1)] border border-[var(--glass-border)] border-l-4 ${urgencyColor[n.urgency] || urgencyColor.gold}`}>
                <p className="text-sm font-semibold text-[var(--text-primary)]">{n.title}</p>
                {n.description && <p className="text-xs text-[var(--text-muted)] mt-1">{n.description}</p>}
                {n.date && <p className="text-[10px] text-[var(--text-muted)] mt-2">{n.date}</p>}
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <GlassCard level={1} className="text-center py-5">
          <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wide mb-3">Sample corporate partners</p>
          <ul className="flex flex-wrap items-center justify-center gap-3">
            {partners.map((partner) => (
              <li key={partner} className="rounded-lg bg-white/65 px-3 py-2 text-xs font-semibold text-brand">{partner}</li>
            ))}
          </ul>
        </GlassCard>
        <GlassCard level={1} className="text-center py-5">
          <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wide mb-3">Sample knowledge partner</p>
          <p className="inline-block rounded-lg bg-white/65 px-3 py-2 text-xs font-semibold text-brand">{collegeOutreach.colleges[0].college}</p>
        </GlassCard>
      </div>
    </div>
  )
}
