import { EventFormValues } from '@common/components/Event/EventFormFields.types'
import { userAttendee } from '@common/features/User/models/attendee'
import { Valarms } from '@common/types/Valarms'

const trim = (s: string | undefined): string => (s ?? '').trim()

const attendeeKey = (a: userAttendee): string =>
  `${a.cal_address}|${a.partstat}|${a.role}|${a.cutype}`

const attendeesEqual = (a: userAttendee[], b: userAttendee[]): boolean => {
  if (a.length !== b.length) return false
  const keysA = new Set(a.map(attendeeKey))
  return b.every(x => keysA.has(attendeeKey(x)))
}

const alarmsKey = (v: Valarms | undefined): string => {
  if (!v) return '[]'
  try {
    return JSON.stringify(v.getAlarms?.() ?? [])
  } catch {
    return JSON.stringify(v)
  }
}

const repetitionKey = (r: unknown): string => {
  try {
    return JSON.stringify(r ?? {})
  } catch {
    return ''
  }
}

export function isEventFormDirty(
  current: EventFormValues,
  initial: Partial<EventFormValues>
): boolean {
  if (trim(current.title) !== trim(initial.title)) return true
  if (trim(current.description) !== trim(initial.description)) return true
  if (trim(current.location) !== trim(initial.location)) return true
  if (current.start !== (initial.start ?? '')) return true
  if (current.end !== (initial.end ?? '')) return true
  if (current.allday !== (initial.allday ?? false)) return true
  if (current.busy !== (initial.busy ?? 'OPAQUE')) return true
  if (current.eventClass !== (initial.eventClass ?? current.eventClass))
    return true
  if (current.timezone !== (initial.timezone ?? '')) return true
  if (current.calendarid !== (initial.calendarid ?? '')) return true
  if (current.hasVideoConference !== (initial.hasVideoConference ?? false))
    return true
  if ((current.meetingLink ?? null) !== (initial.meetingLink ?? null))
    return true
  if (repetitionKey(current.repetition) !== repetitionKey(initial.repetition))
    return true
  if (!attendeesEqual(current.attendees ?? [], initial.attendees ?? []))
    return true
  if (alarmsKey(current.alarms) !== alarmsKey(initial.alarms as Valarms))
    return true
  return false
}
