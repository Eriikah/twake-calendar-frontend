import { isEventOrganiser } from '@common/utils/isEventOrganiser'
import { Calendar } from '@common/types/CalendarTypes'
import { CalendarEvent } from '@common/types/EventsTypes'

describe('isEventOrganiser', () => {
  it('should return true if event has no organizer', () => {
    const event = {} as CalendarEvent
    expect(isEventOrganiser(event, 'user@example.com')).toBe(true)
  })

  it('should return false if organizer cal_address is missing', () => {
    const event = { organizer: {} } as CalendarEvent
    expect(isEventOrganiser(event, 'user@example.com')).toBe(false)
  })

  it('should return true if organizer email matches effectiveEmail (case-insensitive)', () => {
    const event = {
      organizer: { cal_address: 'USER@example.com' }
    } as CalendarEvent
    expect(isEventOrganiser(event, 'user@example.com')).toBe(true)
  })

  it('should return false if organizer email does not match effectiveEmail', () => {
    const event = {
      organizer: { cal_address: 'other@example.com' }
    } as CalendarEvent
    expect(isEventOrganiser(event, 'user@example.com')).toBe(false)
  })

  it('should return false if effectiveEmail is undefined', () => {
    const event = {
      organizer: { cal_address: 'user@example.com' }
    } as CalendarEvent
    expect(isEventOrganiser(event, undefined)).toBe(false)
  })

  it('should return true if calendar is a team calendar and organizer is in owner emails', () => {
    const event = {
      organizer: { cal_address: 'organizer@example.com' }
    } as CalendarEvent

    const calendar = {
      owner: { teamCalendar: true, emails: ['organizer@example.com'] }
    } as unknown as Calendar

    expect(isEventOrganiser(event, 'different@example.com', calendar)).toBe(
      true
    )
  })
})
