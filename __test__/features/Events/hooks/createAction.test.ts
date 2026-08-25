/**
 * @jest-environment jsdom
 */

import { buildNewEvent } from '@common/features/Events/hooks/submitCreateHelpers/createAction'
import { userAttendee } from '@common/features/User/models/attendee'
import { userOrganiser } from '@common/features/User/userDataTypes'
import { Calendar } from '@common/types/CalendarTypes'
import { RepetitionObject } from '@common/types/Repetition'
import { VAlarm } from '@common/types/VAlarm'
import { Valarms } from '@common/types/Valarms'

jest.mock('p-map', () => jest.fn())

const baseCalendar: Calendar = {
  id: 'user-1/cal-1',
  link: 'user-1/cal-1.json',
  name: 'Personal Calendar',
  owner: {
    id: 'user-1',
    emails: ['user@example.com'],
    firstname: 'John',
    lastname: 'Doe'
  },
  events: {},
  visibility: 'private'
}

const teamCalendar: Calendar = {
  id: 'team-1/cal-1',
  link: 'team-1/cal-1.json',
  name: 'Team Calendar',
  owner: {
    id: 'team-1',
    emails: ['team@example.com'],
    firstname: 'Engineering Team',
    teamCalendar: true
  },
  events: {},
  visibility: 'private'
}

const baseValues = {
  title: 'Test Event',
  description: '',
  location: '',
  start: '2025-01-15T10:00:00',
  end: '2025-01-15T11:00:00',
  allday: false,
  timezone: 'Europe/Paris',
  calendarid: 'user-1/cal-1',
  eventClass: 'PUBLIC' as const,
  busy: 'OPAQUE',
  repetition: {} as RepetitionObject,
  showRepeat: false,
  hasEndDateChanged: false,
  alarms: new Valarms([new VAlarm({ trigger: '-PT15M', action: 'EMAIL' })]),
  attendees: [],
  selectedResources: [],
  meetingLink: '',
  hasVideoConference: false,
  attachments: [],
  showDescription: false
}

describe('handleCreateEvent - team calendar organizer handling', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('does NOT set organizer for team calendar when there are no attendees', async () => {
    const organizer = new userOrganiser({
      cn: 'Current User',
      cal_address: 'mailto:user@example.com'
    })

    const newEvent = buildNewEvent({
      values: {
        ...baseValues,
        calendarid: 'team-1/cal-1',
        attendees: [],
        selectedResources: []
      },
      targetCalendar: teamCalendar,
      showMore: true,
      organizer,
      newEventUID: '',
      t: (key: string) => key
    })

    // Organizer should be undefined for team calendar without attendees
    expect(newEvent.organizer).toBeUndefined()
    // Attendee list should also be empty (no organizer added as attendee)
    expect(newEvent.attendee).toEqual([])
  })

  it('SETS organizer for team calendar when there ARE attendees', async () => {
    const organizer = new userOrganiser({
      cn: 'Current User',
      cal_address: 'mailto:user@example.com'
    })

    const newEvent = buildNewEvent({
      values: {
        ...baseValues,
        calendarid: 'team-1/cal-1',
        attendees: [
          new userAttendee({
            cal_address: 'mailto:attendee@example.com',
            cn: 'Attendee'
          })
        ],
        selectedResources: []
      },
      targetCalendar: teamCalendar,
      showMore: true,
      organizer,
      newEventUID: '',
      t: (key: string) => key
    })

    // Organizer should be set when there are attendees
    expect(newEvent.organizer).toBeDefined()
    expect(newEvent.organizer?.cal_address).toBe('mailto:user@example.com')
    // Attendee list should contain the organizer as CHAIR plus the attendee
    expect(newEvent.attendee).toHaveLength(2)
    const organizerAttendee = newEvent.attendee?.find(
      (a: userAttendee) => a.role === 'CHAIR'
    )
    expect(organizerAttendee).toBeDefined()
    expect(organizerAttendee?.cal_address).toBe('mailto:user@example.com')
  })

  it('SETS organizer for regular (non-team) calendar even without attendees', async () => {
    const organizer = new userOrganiser({
      cn: 'Current User',
      cal_address: 'mailto:user@example.com'
    })

    const newEvent = buildNewEvent({
      values: {
        ...baseValues,
        calendarid: 'user-1/cal-1',
        attendees: [],
        selectedResources: []
      },
      targetCalendar: baseCalendar,
      showMore: true,
      organizer,
      newEventUID: '',
      t: (key: string) => key
    })

    // Organizer should be set for regular calendar even without attendees
    expect(newEvent.organizer).toBeDefined()
    expect(newEvent.organizer?.cal_address).toBe('mailto:user@example.com')
    // For regular calendars, attendee list still includes organizer as CHAIR
    expect(newEvent.attendee).toHaveLength(1)
    expect(newEvent.attendee?.[0]?.role).toBe('CHAIR')
    expect(newEvent.attendee?.[0]?.cal_address).toBe('mailto:user@example.com')
  })

  it('SETS organizer when moving event from regular to team calendar with attendees', async () => {
    const organizer = new userOrganiser({
      cn: 'Current User',
      cal_address: 'mailto:user@example.com'
    })

    const newEvent = buildNewEvent({
      values: {
        ...baseValues,
        calendarid: 'team-1/cal-1',
        attendees: [
          new userAttendee({
            cal_address: 'mailto:attendee@example.com',
            cn: 'Attendee'
          })
        ],
        selectedResources: []
      },
      targetCalendar: teamCalendar,
      showMore: true,
      organizer,
      newEventUID: '',
      t: (key: string) => key
    })

    // Organizer should be set when there are attendees, even in team calendar
    expect(newEvent.organizer).toBeDefined()
  })
})
