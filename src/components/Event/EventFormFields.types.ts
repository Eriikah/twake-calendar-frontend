import { Calendar } from '@/features/Calendars/CalendarTypes'
import { RepetitionObject } from '@/features/Events/EventsTypes'
import { userAttendee } from '@/features/User/models/attendee'
import { Resource } from '../Attendees/ResourceSearch'

export interface EventFormFieldsProps {
  // Form state
  title: string
  setTitle: (title: string) => void
  description: string
  setDescription: (description: string) => void
  location: string
  setLocation: (location: string) => void
  start: string
  setStart: (start: string) => void
  end: string
  setEnd: (end: string) => void
  allday: boolean
  setAllDay: (allday: boolean) => void
  repetition: RepetitionObject
  setRepetition: (repetition: RepetitionObject) => void
  typeOfAction?: 'solo' | 'all'
  attendees: userAttendee[]
  setAttendees: (attendees: userAttendee[]) => void
  alarm: string
  setAlarm: (alarm: string) => void
  busy: string
  setBusy: (busy: string) => void
  eventClass: 'PUBLIC' | 'PRIVATE' | 'CONFIDENTIAL'
  setEventClass: (eventClass: 'PUBLIC' | 'PRIVATE' | 'CONFIDENTIAL') => void
  timezone: string
  setTimezone: (timezone: string) => void
  calendarid: string
  setCalendarid: (calendarid: string) => void
  hasVideoConference: boolean
  setHasVideoConference: (hasVideoConference: boolean) => void
  meetingLink: string | null
  setMeetingLink: (meetingLink: string | null) => void
  selectedResources: Resource[]
  setSelectedResources: (resources: Resource[]) => void

  // UI state
  showMore: boolean
  showDescription: boolean
  setShowDescription: (showDescription: boolean) => void
  showRepeat: boolean
  setShowRepeat: (showRepeat: boolean) => void
  isOpen?: boolean

  // Data
  userPersonalCalendars: Calendar[]
  timezoneList: {
    zones: string[]
    browserTz: string
    getTimezoneOffset: (tzName: string, date: Date) => string
  }
  eventId?: string | null

  // Event handlers
  onStartChange?: (newStart: string) => void
  onEndChange?: (newEnd: string) => void
  onAllDayChange?: (
    newAllDay: boolean,
    newStart: string,
    newEnd: string
  ) => void
  onCalendarChange?: (newCalendarId: string) => void

  // Validation
  onValidationChange?: (isValid: boolean) => void
  showValidationErrors?: boolean
  onHasEndDateChangedChange?: (has: boolean) => void
}
