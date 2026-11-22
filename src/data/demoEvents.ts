import { useSyncExternalStore } from 'react'
import { demoDistricts, enterpriseCategories, msmeEvents } from './synthetic'
import type { EnterpriseEvent } from '../types'
import { eventFiscalYear, isParticipantCount } from '../utils/enterpriseEvents'

const storageKey = 'startup-operations-dashboard-demo:msme-events:v1'
const eventTypes = enterpriseCategories.map(({ title }) => title)
const subscribers = new Set<() => void>()
let tabOnly = false

function isSavedEvent(value: unknown): value is EnterpriseEvent {
  if (typeof value !== 'object' || value === null) return false
  const event = value as Partial<EnterpriseEvent>
  return typeof event.id === 'string' && event.id.length > 0 &&
    typeof event.eventCode === 'string' && event.eventCode.length > 0 &&
    typeof event.eventName === 'string' && event.eventName.trim().length > 0 && event.eventName.length <= 100 &&
    typeof event.venue === 'string' && event.venue.trim().length > 0 && event.venue.length <= 100 &&
    typeof event.eventType === 'string' && eventTypes.includes(event.eventType) &&
    typeof event.district === 'string' && demoDistricts.includes(event.district) &&
    typeof event.date === 'string' && typeof event.fiscalYear === 'string' && eventFiscalYear(event.date) === event.fiscalYear &&
    (event.status === 'Completed' || event.status === 'In Progress') &&
    isParticipantCount(event.participantsRegistered) &&
    (event.participantsActual === null ||
      (isParticipantCount(event.participantsActual) && event.participantsActual <= event.participantsRegistered)) &&
    !!event.outcomes && typeof event.outcomes.setupBusiness === 'boolean' &&
    typeof event.outcomes.esCompliance === 'boolean' && typeof event.outcomes.iprFiling === 'boolean' &&
    typeof event.outcomes.buyerMou === 'boolean'
}

function decodeEvents(raw: string | null): readonly EnterpriseEvent[] {
  try {
    const parsed: unknown = raw === null ? null : JSON.parse(raw)
    if (Array.isArray(parsed) && parsed.every(isSavedEvent) && new Set(parsed.map(({ id }) => id)).size === parsed.length) {
      return parsed
    }
  } catch {
    // An invalid saved dataset falls back to the original sample records.
  }
  return msmeEvents
}

function readEvents(fallback: readonly EnterpriseEvent[]) {
  if (tabOnly) return fallback
  try {
    return decodeEvents(window.localStorage.getItem(storageKey))
  } catch {
    return fallback
  }
}

let snapshot = readEvents(msmeEvents)

function publish(events: readonly EnterpriseEvent[]) {
  snapshot = events
  subscribers.forEach((notify) => notify())
}

function syncStorage(event: StorageEvent) {
  if (!tabOnly && (event.key === storageKey || event.key === null)) {
    publish(readEvents(msmeEvents))
  }
}

function subscribe(notify: () => void) {
  if (subscribers.size === 0) window.addEventListener('storage', syncStorage)
  subscribers.add(notify)
  return () => {
    subscribers.delete(notify)
    if (subscribers.size === 0) window.removeEventListener('storage', syncStorage)
  }
}

export function useDemoEvents() {
  return useSyncExternalStore(subscribe, () => snapshot)
}

function save(events: readonly EnterpriseEvent[], reset = false) {
  try {
    if (reset) {
      window.localStorage.removeItem(storageKey)
    } else {
      window.localStorage.setItem(storageKey, JSON.stringify(events))
    }
    tabOnly = false
  } catch {
    tabOnly = true
  }
  publish(events)
  return !tabOnly
}

export type EventDraft = Omit<EnterpriseEvent, 'id' | 'eventCode' | 'fiscalYear'>

type EditFailure = { ok: false; reason: 'conflict' | 'invalid' }

export function replaceDemoEvent(
  events: readonly EnterpriseEvent[], original: EnterpriseEvent | null, replacement: EnterpriseEvent,
): readonly EnterpriseEvent[] {
  return original
    ? events.map((event) => event.id === original.id ? replacement : event)
    : [replacement, ...events]
}

function changedInAnotherTab(events: readonly EnterpriseEvent[], original: EnterpriseEvent) {
  return JSON.stringify(events.find(({ id }) => id === original.id)) !== JSON.stringify(original)
}

export function saveDemoEvent(original: EnterpriseEvent | null, draft: EventDraft): { ok: true; event: EnterpriseEvent; persisted: boolean } | EditFailure {
  const events = readEvents(snapshot)
  if (original && changedInAnotherTab(events, original)) {
    publish(events)
    return { ok: false, reason: 'conflict' }
  }
  const fiscalYear = eventFiscalYear(draft.date)
  if (!fiscalYear) return { ok: false, reason: 'invalid' }
  const id = original?.id ?? crypto.randomUUID()
  const event = {
    ...draft,
    id,
    eventCode: original?.eventCode ?? 'DEMO-' + id.toUpperCase().slice(0, 12),
    fiscalYear,
  }
  if (!isSavedEvent(event)) return { ok: false, reason: 'invalid' }
  return { ok: true, event, persisted: save(replaceDemoEvent(events, original, event)) }
}

export function deleteDemoEvent(original: EnterpriseEvent): { ok: true; persisted: boolean } | EditFailure {
  const events = readEvents(snapshot)
  if (changedInAnotherTab(events, original)) {
    publish(events)
    return { ok: false, reason: 'conflict' }
  }
  return { ok: true, persisted: save(events.filter(({ id }) => id !== original.id)) }
}

export function resetDemoEvents() {
  return save(msmeEvents, true)
}
