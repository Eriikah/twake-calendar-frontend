import { Calendar } from '@common/types/CalendarTypes'
import { CalendarEvent } from '@common/types/EventsTypes'
import { normalizeIdentity } from '@common/utils/normalizeIdentity'

function isTeamCalendarOrganizer(
  calendar: Calendar | undefined,
  organizerEmail: string
): boolean {
  if (!calendar?.owner?.teamCalendar || !calendar.owner.emails) return false
  return calendar.owner.emails.some(
    email => normalizeIdentity(email) === normalizeIdentity(organizerEmail)
  )
}

export function isEventOrganiser(
  event: CalendarEvent,
  effectiveEmail: string | undefined,
  calendar?: Calendar
): boolean {
  if (!event?.organizer) return true // no organizer = assume owner

  const organizerEmail = event.organizer.cal_address
  if (!organizerEmail) return false

  if (isTeamCalendarOrganizer(calendar, organizerEmail)) return true

  if (!effectiveEmail) return false
  return normalizeIdentity(organizerEmail) === normalizeIdentity(effectiveEmail)
}
