import { useRef, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Plus, RotateCcw, Save, Trash2 } from 'lucide-react'
import DashboardPreview from '../components/admin/DashboardPreview'
import GlassCard from '../components/ui/GlassCard'
import PageHero from '../components/ui/PageHero'
import { demoDistricts, enterpriseCategories, msmeEvents } from '../data/synthetic'
import {
  deleteDemoEvent, replaceDemoEvent, resetDemoEvents, saveDemoEvent, useDemoEvents,
  type EventDraft,
} from '../data/demoEvents'
import type { EnterpriseEvent } from '../types'
import { eventFiscalYear, isParticipantCount, MAX_EVENT_PARTICIPANTS, summarizeEnterpriseEvents } from '../utils/enterpriseEvents'

type EventForm = Omit<EventDraft, 'participantsRegistered' | 'participantsActual'> & {
  registered: string
  actual: string
}

const outcomeLabels = {
  setupBusiness: 'New business setup',
  esCompliance: 'Compliance support',
  iprFiling: 'IP filing support',
  buyerMou: 'Buyer agreement',
} as const

const defaultForm: EventForm = {
  eventName: '',
  eventType: enterpriseCategories[0].title,
  district: demoDistricts[0],
  date: '',
  venue: '',
  registered: '',
  actual: '',
  status: 'In Progress',
  outcomes: { setupBusiness: false, esCompliance: false, iprFiling: false, buyerMou: false },
}

const inputClass = 'mt-1 block w-full min-w-0 rounded-lg border border-[var(--glass-border)] bg-white/80 px-3 py-2 text-sm text-[var(--text-primary)]'
const secondaryButton = 'inline-flex items-center justify-center gap-2 rounded-lg border border-[var(--glass-border)] bg-white/75 px-3 py-2 text-sm font-semibold text-[var(--text-secondary)] transition hover:bg-white disabled:opacity-50'

function eventForm(event: EnterpriseEvent | null): EventForm {
  if (!event) return defaultForm
  const { eventName, eventType, district, date, venue, participantsRegistered, participantsActual, status, outcomes } = event
  return {
    eventName, eventType, district, date, venue, status, outcomes,
    registered: String(participantsRegistered),
    actual: participantsActual === null ? '' : String(participantsActual),
  }
}

function readDraft(form: EventForm): EventDraft | null {
  const { registered, actual, ...rest } = form
  const participantsRegistered = registered === '' ? NaN : Number(registered)
  const participantsActual = actual === '' ? null : Number(actual)
  const eventName = form.eventName.trim()
  const venue = form.venue.trim()
  if (!eventName || !venue || !eventFiscalYear(form.date) || !isParticipantCount(participantsRegistered)) return null
  if (participantsActual !== null &&
    (!isParticipantCount(participantsActual) || participantsActual > participantsRegistered)) return null
  return { ...rest, eventName, venue, participantsRegistered, participantsActual }
}

export default function DemoAdmin() {
  const events = useDemoEvents()
  const nameInput = useRef<HTMLInputElement>(null)
  const [editing, setEditing] = useState<EnterpriseEvent | null>(() => events[0] ?? null)
  const [form, setForm] = useState(() => eventForm(editing))
  const [feedback, setFeedback] = useState<{ text: string; error?: boolean } | null>(null)
  const dirty = JSON.stringify(form) !== JSON.stringify(eventForm(editing))
  const draft = readDraft(form)
  const fiscalYear = eventFiscalYear(form.date)

  const previewEvents = draft && fiscalYear && dirty ? replaceDemoEvent(events, editing, {
    ...draft, id: editing?.id ?? 'preview-event', eventCode: editing?.eventCode ?? 'Preview', fiscalYear,
  }) : events
  const totals = summarizeEnterpriseEvents(previewEvents)

  function change<Key extends keyof EventForm>(key: Key, value: EventForm[Key]) {
    setForm((current) => ({ ...current, [key]: value }))
    setFeedback(null)
  }

  function editEvent(event: EnterpriseEvent | null) {
    setEditing(event)
    setForm(eventForm(event))
    setFeedback(null)
  }

  function saveEvent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!draft) {
      setFeedback({ text: 'Enter an event name, venue, and valid date. Attendance must be between zero and the number registered.', error: true })
      return
    }

    const result = saveDemoEvent(editing, draft)
    if (!result.ok) {
      setFeedback({
        text: result.reason === 'conflict'
          ? 'This event changed in another tab. Select it again to load the saved version.'
          : 'Check the event details and try saving again.',
        error: true,
      })
      return
    }
    editEvent(result.event)
    setFeedback({ text: result.persisted ? 'Event saved. The dashboard now shows your changes.' : 'Event saved for this tab. Browser storage is unavailable.' })
  }

  function chooseEvent(event: EnterpriseEvent | null) {
    if (dirty && !window.confirm('Discard the unsaved changes to this event?')) return
    editEvent(event)
    nameInput.current?.focus()
  }

  function removeEvent() {
    if (!editing || !window.confirm('Delete this sample event from your demo?')) return
    const result = deleteDemoEvent(editing)
    if (!result.ok) {
      setFeedback({ text: 'This event changed in another tab. Select it again to load the saved version.', error: true })
      return
    }
    editEvent(null)
    setFeedback({ text: result.persisted ? 'Sample event deleted.' : 'Sample event deleted for this tab. Browser storage is unavailable.' })
  }

  function reset() {
    if (!window.confirm('Restore the original sample events and discard your demo edits?')) return
    const persisted = resetDemoEvents()
    editEvent(msmeEvents[0])
    setFeedback({ text: persisted ? 'The original sample events are restored.' : 'The original sample events are restored for this tab.' })
  }

  return (
    <div className="space-y-5">
      <PageHero
        title="Demo Admin"
        subtitle="MSME event management"
        description="Edit fictional events, preview the totals, and see your saved changes on the dashboard. Edits are stored in this browser."
        compact
      />

      <div className="flex flex-wrap items-center justify-between gap-2">
        <Link
          to="/msme/events"
          className={secondaryButton}
          onClick={(event) => {
            if (dirty && !window.confirm('Leave this page and discard the unsaved changes?')) event.preventDefault()
          }}
        >
          View MSME dashboard <ArrowRight size={16} aria-hidden="true" />
        </Link>
        <button type="button" className={secondaryButton} disabled={events === msmeEvents && !dirty} onClick={reset}>
          <RotateCcw size={15} aria-hidden="true" /> Reset demo data
        </button>
      </div>

      <DashboardPreview dirty={dirty} valid={draft !== null} stats={[
        { label: 'Total events', value: totals.totalEvents },
        { label: 'Registered', value: totals.totalReg },
        { label: 'Actual participants', value: totals.totalActual },
        { label: 'Districts covered', value: totals.districts },
      ]} />

      <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
        <GlassCard padding="p-4 sm:p-5" hover={false}>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-semibold text-[var(--text-primary)]">Sample events</h2>
              <p className="text-xs text-[var(--text-secondary)]">{events.length} saved</p>
            </div>
            <button type="button" className={secondaryButton} onClick={() => chooseEvent(null)}>
              <Plus size={16} aria-hidden="true" /> Add event
            </button>
          </div>
          {events.length === 0 ? (
            <p className="py-4 text-sm text-[var(--text-secondary)]">Add a sample event to start the directory.</p>
          ) : (
            <ul className="max-h-[275px] space-y-1.5 overflow-y-auto thin-scrollbar pr-1 xl:max-h-[540px]">
              {events.map((event) => (
                <li key={event.id}>
                  <button
                    type="button"
                    aria-pressed={editing?.id === event.id}
                    onClick={() => chooseEvent(event)}
                    className={`w-full rounded-lg border px-3 py-2.5 text-left transition ${editing?.id === event.id
                      ? 'border-brand-200 bg-brand-50' : 'border-transparent bg-white/55 hover:bg-white'}`}
                  >
                    <span className="block break-words text-sm font-medium text-[var(--text-primary)]">{event.eventName}</span>
                    <span className="block text-xs text-[var(--text-secondary)] mt-0.5">{event.date} · {event.district} · {event.status}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </GlassCard>

        <GlassCard padding="p-4 sm:p-5" hover={false}>
          <form aria-label={editing ? 'Edit event' : 'New event'} className="space-y-4" onSubmit={saveEvent}>
            <div>
              <h2 className="text-base font-semibold text-[var(--text-primary)]">{editing ? 'Edit event' : 'New event'}</h2>
              {editing && <p className="mt-1 text-xs font-mono text-[var(--text-secondary)]">{editing.eventCode}</p>}
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-xs font-medium sm:col-span-2">
                Event name
                <input ref={nameInput} className={inputClass} value={form.eventName} onChange={(event) => change('eventName', event.target.value)} maxLength={100} required />
              </label>
              <label className="text-xs font-medium">
                Event type
                <select className={inputClass} value={form.eventType} onChange={(event) => change('eventType', event.target.value)}>
                  {enterpriseCategories.map(({ title }) => <option key={title}>{title}</option>)}
                </select>
              </label>
              <label className="text-xs font-medium">
                District
                <select className={inputClass} value={form.district} onChange={(event) => change('district', event.target.value)}>
                  {demoDistricts.map((district) => <option key={district}>{district}</option>)}
                </select>
              </label>
              <label className="text-xs font-medium">
                Event date
                <input className={inputClass} type="date" value={form.date} onChange={(event) => change('date', event.target.value)} min="2000-01-01" max="2099-12-31" required />
                {fiscalYear && <span className="mt-1 block font-normal text-[var(--text-secondary)]">FY {fiscalYear}</span>}
              </label>
              <label className="text-xs font-medium">
                Status
                <select className={inputClass} value={form.status} onChange={(event) => change('status', event.target.value as EnterpriseEvent['status'])}>
                  <option>In Progress</option>
                  <option>Completed</option>
                </select>
              </label>
              <label className="text-xs font-medium sm:col-span-2">
                Sample venue
                <input className={inputClass} value={form.venue} onChange={(event) => change('venue', event.target.value)} maxLength={100} required />
              </label>
              <label className="text-xs font-medium">
                Registered participants
                <input className={inputClass} type="number" min={0} max={MAX_EVENT_PARTICIPANTS} step={1} value={form.registered} onChange={(event) => change('registered', event.target.value)} required />
              </label>
              <label className="text-xs font-medium">
                Actual participants
                <input className={inputClass} type="number" min={0} max={MAX_EVENT_PARTICIPANTS} step={1} value={form.actual} onChange={(event) => change('actual', event.target.value)} />
              </label>
            </div>
            <fieldset>
              <legend className="mb-2 text-xs font-medium">Outcomes</legend>
              <div className="grid grid-cols-2 gap-2">
                {(Object.keys(outcomeLabels) as (keyof typeof outcomeLabels)[]).map((key) => (
                  <label key={key} className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                    <input type="checkbox" className="accent-brand" checked={form.outcomes[key]} onChange={(event) => change('outcomes', { ...form.outcomes, [key]: event.target.checked })} />
                    {outcomeLabels[key]}
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="flex flex-wrap items-center gap-2 border-t border-[var(--glass-border)] pt-4">
              <button type="submit" disabled={!dirty} className="inline-flex items-center gap-2 rounded-lg bg-brand-gradient px-4 py-2.5 text-sm font-semibold text-white shadow-sm disabled:opacity-50">
                <Save size={16} aria-hidden="true" /> Save event
              </button>
              {editing && (
                <button type="button" className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-rose-700 hover:bg-rose-50" onClick={removeEvent}>
                  <Trash2 size={15} aria-hidden="true" /> Delete event
                </button>
              )}
            </div>
            {feedback && (
              <p
                role={feedback.error ? 'alert' : 'status'}
                className={`rounded-lg px-3 py-2 text-sm ${feedback.error ? 'bg-rose-50 text-rose-800' : 'bg-emerald-50 text-emerald-800'}`}
              >
                {feedback.text}
              </p>
            )}
          </form>
        </GlassCard>
      </div>
    </div>
  )
}
