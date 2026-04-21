import { api } from '@/utils/apiUtils'

export interface FreeBusyQuery {
  hrefs: string[]
  start: string
  end: string
}
/**
 * Fires REPORT requests against each calendar href to collect raw free/busy
 * data. Returns an array of parsed JSON payloads (null on failure).
 * It's for getting the free busy for added attendees in an event (new or while modifying)
 */
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

export interface FreeBusyPostQuery {
  userIds: string[]
  start: string
  end: string
  eventUid: string
}
/**
 * POSTs to the freebusy endpoint and returns the raw response payload.
 * Throws on non-OK status.
 * It's for getting the free busy for present attendees while editing event
 */
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
