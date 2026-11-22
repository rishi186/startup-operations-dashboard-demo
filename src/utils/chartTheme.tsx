/* Shared chart theme — one professional, colour-blind-aware palette + reusable
 * gradient defs and tooltip, so every chart across the dashboard reads as one
 * unified, first-tier visual language. Anchored on Brand purple; hues are spread
 * across purple/blue/green/gold/grey families (no red, per brand) with varied
 * lightness so 16 series stay visually distinct before any repeat — a chart with
 * more categories than that no longer visibly repeats
 * colours within a few slices of each other. */

// Categorical series palette (use in order). Brand purple first.
export const CHART_SERIES = [
  '#5942A6', // purple (brand)
  '#2B5BA8', // blue
  '#0F766E', // teal
  '#B7791F', // gold
  '#2F855A', // emerald
  '#7853A8', // magenta-purple
  '#475569', // slate
  '#0E7490', // dark cyan
  '#7C3AED', // violet
  '#A16207', // olive / mustard
  '#1E3A8A', // navy
  '#15803D', // forest green
  '#0369A1', // steel blue
  '#047857', // deep green-teal
  '#64748B', // cool grey
  '#581C87', // deep purple
]

const idx = (i: number) => ((i % CHART_SERIES.length) + CHART_SERIES.length) % CHART_SERIES.length

/** Series colour by index (wraps). */
export const seriesColor = (i: number): string => CHART_SERIES[idx(i)]

/** Gradient id for series index — pair with <ChartGradients/>. */
export const gradId = (i: number): string => `brandGrad${idx(i)}`

/** Shared axis tick + grid styling for a consistent look. */
export const AXIS_TICK = { fill: 'var(--text-muted)', fontSize: 11 }
export const GRID_STROKE = 'var(--glass-border)'

/** Shared entrance-animation props — bars rise, lines trace, pies fan out on mount.
 *  Calm easing keeps it institutional (no bounce). Spread onto <Bar>/<Pie>/<Area>. */
export const CHART_ANIM = {
  isAnimationActive: true,
  animationBegin: 80,
  animationDuration: 850,
  animationEasing: 'ease-out' as const,
}

function GradientStops() {
  return (
    <>
      {CHART_SERIES.map((c, i) => (
        <linearGradient key={i} id={gradId(i)} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={c} stopOpacity={0.95} />
          <stop offset="100%" stopColor={c} stopOpacity={0.6} />
        </linearGradient>
      ))}
      <filter id="brandBarShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#1a172b" floodOpacity="0.12" />
      </filter>
    </>
  )
}

/** Global gradient/filter defs. SVG gradient ids are document-scoped, so rendering
 *  this ONCE at the app root makes url(#brandGradN) resolve in every chart. (Recharts
 *  drops custom component children, so per-chart <defs> via a component don't render —
 *  this global host is the reliable home for them.) Rendered from AppShell. */
export function ChartDefs() {
  return (
    <svg width="0" height="0" aria-hidden="true" focusable="false" style={{ position: 'absolute', width: 0, height: 0 }}>
      <defs>
        <GradientStops />
      </defs>
    </svg>
  )
}

/** Kept for charts that include it as a child (harmless): the global <ChartDefs/>
 *  is what actually provides the gradient ids. Returns the raw <defs> for any chart
 *  context that does render native children. */
export function ChartGradients() {
  return (
    <defs>
      <GradientStops />
    </defs>
  )
}

/** Clean, branded tooltip card. Use as <Tooltip content={<ChartTooltip />} />.
 *  Optional valueSuffix (e.g. '%') and valueFormatter for currency etc. */
export function ChartTooltip({ active, payload, label, valueSuffix = '', valueFormatter, labelFormatter }: any) {
  if (!active || !payload || !payload.length) return null
  const fmt = (v: any) =>
    valueFormatter ? valueFormatter(v) : (typeof v === 'number' ? v.toLocaleString('en-IN') : v)
  return (
    <div
      style={{
        background: 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(10px) saturate(1.3)',
        WebkitBackdropFilter: 'blur(10px) saturate(1.3)',
        border: '1px solid rgba(106,44,145,0.12)',
        borderRadius: 14,
        boxShadow: '0 12px 32px -8px rgba(74,31,111,0.22), 0 4px 10px rgba(16,24,40,0.08)',
        padding: '10px 13px',
        fontSize: 12,
        minWidth: 120,
      }}
    >
      {label != null && label !== '' && (
        <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6, letterSpacing: '-0.01em' }}>
          {labelFormatter ? labelFormatter(label) : label}
        </div>
      )}
      {payload.map((p: any, i: number) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
          <span style={{ width: 9, height: 9, borderRadius: 3, background: p.color || p.payload?.fill || seriesColor(i), display: 'inline-block', flexShrink: 0 }} />
          <span style={{ fontWeight: 500 }}>{p.name}</span>
          <span style={{ fontWeight: 700, color: 'var(--text-primary)', marginLeft: 'auto', fontVariantNumeric: 'tabular-nums' }}>
            {fmt(p.value)}{valueSuffix}
          </span>
        </div>
      ))}
    </div>
  )
}
