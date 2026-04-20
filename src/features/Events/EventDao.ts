import { api } from '@/utils/apiUtils'
import ICAL from 'ical.js'
import { CalDavItem } from '../Calendars/api/types'
import { VCalComponent } from '../Calendars/types/CalendarData'
import { SearchEventsResponse } from '../Search/types/SearchEventsResponse'
import { CalendarEvent } from './EventsTypes'

export async function reportEventRaw(
  event: CalendarEvent,
  match: { start: string; end: string }
): Promise<CalDavItem> {
  const response = await api(`dav${event.URL}`, {
    method: 'REPORT',
    body: JSON.stringify({ match }),
    headers: { Accept: 'application/json' }
  })
  if (!response.ok) {
    throw new Error(`REPORT request failed with status ${response.status}`)
  }
  return response.json()
}

export async function fetchEventRaw(event: CalendarEvent): Promise<string> {
  const response = await api.get(`dav${event.URL}`)
  return response.text()
}

export async function fetchEventIcs(event: CalendarEvent): Promise<string> {
  const response = await api.get(`dav${event.URL}?export=`)
  return response.text()
}

export async function putEventRaw(
  event: CalendarEvent,
  jCal: unknown[]
): Promise<Response> {
  return api(`dav${event.URL}`, {
    method: 'PUT',
    body: JSON.stringify(jCal),
    headers: { 'content-type': 'text/calendar; charset=utf-8' }
  })
}

export async function deleteEventRaw(event: CalendarEvent): Promise<Response> {
  return api(`dav${event.URL}`, { method: 'DELETE' })
}

export async function moveEventRaw(
  event: CalendarEvent,
  toURL: string
): Promise<Response> {
  return api(`dav${event.URL}`, {
    method: 'MOVE',
    headers: { destination: toURL }
  })
}

export async function importEventRaw(
  id: string,
  calLink: string
): Promise<Response> {
  return api.post('api/import', {
    body: JSON.stringify({ fileId: id, target: calLink })
  })
}

export async function searchEventRaw(reqParam: {
  query: string
  calendars: { calendarId: string; userId: string }[]
  organizers?: string[]
  attendees?: string[]
}): Promise<SearchEventsResponse> {
  return api
    .post('calendar/api/events/search?limit=30&offset=0', {
      body: JSON.stringify(reqParam)
    })
    .json()
}

/**
 * Fetches all VEVENTs (master + overrides) for a recurring series.
 * Returns the raw jCal VEVENT components — no transformation applied.
 */
export async function fetchAllRecurrentVevents(
  event: CalendarEvent
): Promise<VCalComponent[]> {
  const response = await api.get(`dav${event.URL}`)
  const eventData = await response.text()
  const jcal = ICAL.parse(eventData) as VCalComponent
  return (jcal[2] ?? []).filter(([name]) => name === 'vevent')
}

/**
 * Fires REPORT requests against each calendar href to collect raw free/busy
 * data. Returns an array of parsed JSON payloads (null on failure).
 */
export interface FreeBusyQuery {
  hrefs: string[]
  start: string
  end: string
}

export async function fetchFreeBusyReports(
  query: FreeBusyQuery
): Promise<unknown[]> {
  const body = JSON.stringify({
    type: 'free-busy-query',
    match: { start: query.start, end: query.end }
  })
  return Promise.all(
    query.hrefs.map(href =>
      api(`dav${href}`, {
        method: 'REPORT',
        headers: { Accept: 'application/json, text/plain, */*' },
        body
      })
        .then(r => (r.ok ? r.json() : null))
        .catch(() => null)
    )
  )
}

/**
 * POSTs to the freebusy endpoint and returns the raw response payload.
 * Throws on non-OK status.
 */
export interface FreeBusyPostQuery {
  userIds: string[]
  start: string
  end: string
  eventUid: string
}

export async function fetchFreeBusyPost(
  query: FreeBusyPostQuery
): Promise<unknown> {
  const r = await api('dav/calendars/freebusy', {
    method: 'POST',
    headers: { Accept: 'application/json, text/plain, */*' },
    body: JSON.stringify({
      start: query.start,
      end: query.end,
      users: query.userIds,
      uids: [query.eventUid]
    })
  })
  if (!r.ok) throw new Error(`HTTP ${r.status}`)
  return r.json()
}

/**
 * Fetches user data by email. Returns raw JSON array.
 */
export async function fetchUserByEmail(
  email: string
): Promise<Array<Record<string, string>>> {
  const r = await api(`api/users?email=${encodeURIComponent(email)}`)
  return r.json()
}

/**
 * POSTs an iTIP COUNTER proposal for a calendar event.
 * Accepts a pre-serialized ICS string and the envelope metadata.
 */
export interface CounterProposalPayload {
  ical: string
  sender: string
  recipient: string
  uid: string
  sequence: number
  method: 'COUNTER'
}

export async function postCounterProposalRaw(
  event: CalendarEvent,
  payload: CounterProposalPayload
): Promise<Response> {
  const response = await api(`dav${event.URL}`, {
    method: 'POST',
    body: JSON.stringify(payload),
    headers: {
      accept: 'application/json,text/plain,*/*',
      'content-type': 'application/calendar+json',
      Prefer: 'return=representation',
      'X-Http-Method-Override': 'ITIP'
    }
  })
  if (!response.ok) {
    throw new Error(`postCounterProposal failed with status ${response.status}`)
  }
  return response
}
