import type { IncubationEventBucket, IncubationEventsData } from '../types'

const stageOrder = ['Ideation', 'Prototype', 'MVP', 'Validation', 'Operational']
const breakdownFields = ['gender', 'occupation', 'stage', 'sector_clean', 'location'] as const

const toChartData = (record: Record<string, number>) =>
  Object.entries(record)
    .map(([name, value]) => ({ name, value }))
    .filter(({ value }) => value > 0)
    .sort((a, b) => b.value - a.value)

export function buildSingleEventChartData(bucket: IncubationEventBucket) {
  return {
    genderData: ['Male', 'Female', 'Others'].map((name) => ({ name, value: bucket.gender[name] ?? 0 })),
    stageData: stageOrder.map((name) => ({ name, value: bucket.stage[name] ?? 0 })).filter(({ value }) => value > 0),
    occupationData: toChartData(bucket.occupation),
    sectorChartData: toChartData(bucket.sector_clean),
    locationData: toChartData(bucket.location),
    participantsTracked: bucket.total,
  }
}

export function buildIncubationEventPageData(events: IncubationEventsData) {
  const combined: IncubationEventBucket = {
    name: 'All Events', total: 0, gender: {}, occupation: {}, stage: {}, sector_clean: {}, location: {},
  }
  for (const event of Object.values(events)) {
    combined.total += event.total
    for (const field of breakdownFields) {
      for (const [label, count] of Object.entries(event[field])) {
        combined[field][label] = (combined[field][label] ?? 0) + count
      }
    }
  }
  return {
    ...buildSingleEventChartData(combined),
    events,
    totalAttendees: combined.total,
    eventsConducted: Object.keys(events).length,
    sectorsRepresented: Object.keys(combined.sector_clean).length,
  }
}
