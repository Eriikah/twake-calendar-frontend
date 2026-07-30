import { userAttendee } from '@common/features/User/models/attendee'

export type SearchEventData = {
  uid: string
  userId: string
  calendarId: string
  start: string
  end?: string
  allDay?: boolean
  summary?: string
  description?: string
  location?: string
  class?: 'PRIVATE' | 'PUBLIC' | 'CONFIDENTIAL'
  dtstamp?: string
  isRecurrentMaster?: boolean
  attendees?: userAttendee[]
  organizer?:
    | userAttendee
    | {
        cn?: string
        email?: string
      }
  ['x-openpaas-videoconference']?: string
}
