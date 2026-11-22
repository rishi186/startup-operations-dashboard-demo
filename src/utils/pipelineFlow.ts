type Pipeline = {
  ideas: number
  prototypes: number
  incubation: number
  accelerated: number
  funding: { microgrant: number; venture: number; seed: number }
}

export function buildPipelineFlow({ ideas, prototypes, incubation, accelerated, funding }: Pipeline) {
  const nodes = [
    { name: 'Validated Ideas', kind: 'stage' },
    { name: 'Prototypes', kind: 'stage' },
    { name: 'Incubation', kind: 'stage' },
    { name: 'Accelerated', kind: 'stage' },
    { name: 'Microgrant', kind: 'fund' },
    { name: 'Venture Connect', kind: 'fund' },
    { name: 'Seed Award', kind: 'fund' },
    { name: 'Idea stage', kind: 'drop' },
    { name: 'Not shortlisted', kind: 'drop' },
    { name: 'In active pipeline', kind: 'drop' },
  ]
  const links = [
    { source: 0, target: 1, value: prototypes },
    { source: 0, target: 7, value: ideas - prototypes },
    { source: 1, target: 2, value: incubation },
    { source: 1, target: 8, value: prototypes - incubation },
    { source: 2, target: 3, value: accelerated },
    { source: 2, target: 9, value: incubation - accelerated },
    { source: 3, target: 4, value: funding.microgrant },
    { source: 3, target: 5, value: funding.venture },
    { source: 3, target: 6, value: funding.seed },
  ].filter((link) => link.value > 0)

  const used = new Set(links.flatMap(({ source, target }) => [source, target]))
  const kept = nodes.map((_, index) => index).filter((index) => used.has(index))
  const remap = new Map(kept.map((previous, next) => [previous, next]))
  return {
    nodes: kept.map((index) => nodes[index]),
    links: links.map(({ source, target, value }) => ({
      source: remap.get(source)!,
      target: remap.get(target)!,
      value,
    })),
  }
}
