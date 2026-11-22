import type { EnterpriseEvent } from '../types'

export const MAX_EVENT_PARTICIPANTS = 10_000

export function eventFiscalYear(date: string): string | null {
  if (!/^20\d{2}-\d{2}-\d{2}$/.test(date)) return null
  const calendarDate = new Date(date)
  if (Number.isNaN(calendarDate.getTime()) || calendarDate.toISOString().slice(0, 10) !== date) return null
  const start = calendarDate.getUTCFullYear() - (calendarDate.getUTCMonth() < 3 ? 1 : 0)
  return String(start).slice(-2) + '-' + String(start + 1).slice(-2)
}

export function isParticipantCount(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0 && value <= MAX_EVENT_PARTICIPANTS
}

export function summarizeEnterpriseEvents(events: readonly EnterpriseEvent[]) {
  return {
    totalEvents: events.length,
    totalReg: events.reduce((total, event) => total + event.participantsRegistered, 0),
    totalActual: events.reduce((total, event) => total + (event.participantsActual ?? 0), 0),
    districts: new Set(events.map((event) => event.district)).size,
  }
}

export function quoteEventCsvCell(cell: string | number): string {
  const text = String(cell)
  // Visitor-entered text should open as a literal in spreadsheet apps.
  const literal = /^[\t\r\n]|^\s*[=+@-]/.test(text) ? "'" + text : text
  return '"' + literal.replace(/"/g, '""') + '"'
}
