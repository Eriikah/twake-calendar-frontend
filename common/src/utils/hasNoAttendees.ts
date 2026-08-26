import { EventFormValues } from '@common/components/Event/EventFormFields.types'

export function hasNoAttendees(
  attendees: EventFormValues['attendees']
): boolean {
  return !attendees || attendees.length === 0
}
