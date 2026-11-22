import { Sankey, Tooltip, Layer, Rectangle, ResponsiveContainer } from 'recharts'
import { buildPipelineFlow } from '../../utils/pipelineFlow'
import { pipeline } from '../../data/synthetic'

const DROP_NAMES = ['Idea stage', 'Not shortlisted', 'In active pipeline']
const NODE_FILL: Record<string, string> = { stage: '#5942A6', fund: '#0F766E', drop: '#C9B6DE' }

function NodeShape(props: any) {
  const { x, y, width, height, index, payload, containerWidth } = props
  const kind = payload?.kind || (DROP_NAMES.includes(payload?.name) ? 'drop' : 'stage')
  const fill = NODE_FILL[kind] || '#5942A6'
  const isRight = x + width > containerWidth - 130
  const labelX = isRight ? x - 8 : x + width + 8
  const anchor = isRight ? 'end' : 'start'
  const value = payload?.value
  return (
    <Layer key={`node-${index}`}>
      <Rectangle x={x} y={y} width={width} height={Math.max(height, 2)} radius={3} fill={fill} fillOpacity={kind === 'drop' ? 0.9 : 1} />
      <text x={labelX} y={y + height / 2 - 4} textAnchor={anchor} fontSize={12} fontWeight={700} fill="var(--text-primary,#23262e)">{payload?.name}</text>
      {value != null && (
        <text x={labelX} y={y + height / 2 + 11} textAnchor={anchor} fontSize={11} fontWeight={600} fill={kind === 'drop' ? 'var(--text-muted,#9aa0ad)' : fill}>{value}</text>
      )}
    </Layer>
  )
}

function LinkShape(props: any) {
  const { sourceX, targetX, sourceY, targetY, sourceControlX, targetControlX, linkWidth, index, payload } = props
  const toDrop = DROP_NAMES.includes(payload?.target?.name) || payload?.target?.kind === 'drop'
  const color = toDrop ? '#B89AD6' : '#8062C0'
  return (
    <path
      key={`link-${index}`}
      d={`M${sourceX},${sourceY} C${sourceControlX},${sourceY} ${targetControlX},${targetY} ${targetX},${targetY}`}
      fill="none"
      stroke={color}
      strokeWidth={Math.max(1, linkWidth)}
      strokeOpacity={toDrop ? 0.32 : 0.42}
    />
  )
}

function FlowTooltip({ active, payload }: any) {
  if (!active || !payload || !payload.length) return null
  const p = payload[0]?.payload || {}
  const label = p.source && p.target ? `${p.source.name} → ${p.target.name}` : p.name
  const value = p.value
  if (label == null) return null
  return (
    <div style={{ background: 'rgba(255,255,255,0.94)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', border: '1px solid rgba(106,44,145,0.14)', borderRadius: 12, boxShadow: '0 12px 30px -8px rgba(74,31,111,0.24)', padding: '9px 13px', fontSize: 12 }}>
      <span style={{ fontWeight: 600, color: 'var(--text-secondary,#6b7280)' }}>{label}</span>
      {value != null && <span style={{ fontWeight: 800, color: 'var(--text-primary,#23262e)', marginLeft: 8 }}>{value}</span>}
    </div>
  )
}

export default function PipelineSankey() {
  const flow = buildPipelineFlow(pipeline)
  if (!flow.links.length || flow.nodes.length < 2) return null
  return (
    <div className="overflow-x-auto -mx-1 px-1 thin-scrollbar">
      <div className="min-w-[680px]">
        <ResponsiveContainer width="100%" height={350}>
          <Sankey
            data={flow}
            node={<NodeShape />}
            link={<LinkShape />}
            nodePadding={26}
            nodeWidth={13}
            linkCurvature={0.5}
            margin={{ top: 16, right: 124, bottom: 16, left: 16 }}
          >
            <Tooltip content={<FlowTooltip />} />
          </Sankey>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
