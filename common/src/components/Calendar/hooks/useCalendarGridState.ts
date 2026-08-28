import { useMemo } from 'react'
import { useAppSelector } from '@common/app/hooks'
import { useScreenSizeDetection } from '@common/useScreenSizeDetection'
import { useI18n } from 'twake-i18n'
import { useCalendarViewHandlers } from './useCalendarViewHandlers'
import { useFilteredCalendarEvents } from './useCalendarControllerHooks'
import { useFindUpcommingEvent } from './useFindUpcommingEvent'
import {
  extractEvents,
  eventToFullCalendarFormat
} from '../utils/calendarUtils'
import { CalendarApi, EventInput } from '@fullcalendar/core'
import { CalendarEvent } from '@common/types/EventsTypes'
import { EventErrorHandler } from '@common/components/Error/EventErrorHandler'
import type { RootState } from '@common/app/store'
import {
  BookingLink,
  DayOfWeek
} from '@common/features/booking/types/BookingTypes'
import { computeStartOfTheWeek } from '@common/utils/dateUtils'

const getTempCalendarIds = (
  tempcalendars: RootState['calendars']['templist']
): string[] => {
  const tempCalendarIdsString = Object.keys(tempcalendars || {})
    .sort()
    .join(',')
  return tempCalendarIdsString ? tempCalendarIdsString.split(',') : []
}

const getFilteredEvents = (
  selectedCalendars: string[],
  calendars: RootState['calendars']['list'],
  email: string | undefined,
  hideDeclinedEvents: boolean | undefined,
  visibleBookingLinks?: string[]
): CalendarEvent[] => {
  return extractEvents(selectedCalendars, calendars || {}, {
    hideDeclinedEvents,
    visibleBookingLinks
  })
}

export interface UseCalendarGridStateProps {
  calendarRef: React.MutableRefObject<CalendarApi | null>
  calendarWrapperRef: React.RefObject<HTMLDivElement>
  currentView: string
  timezone: string
  selectedCalendars: string[]
  setSelectedDate: React.Dispatch<React.SetStateAction<Date>>
  setSelectedMiniDate: (date: Date) => void
  onViewChange: (view: string) => void
  errorHandler: EventErrorHandler
  visibleBookingLinks?: string[]
}

export interface CalendarGridState {
  isPending: boolean
  filteredCalendarEvents: EventInput[]
  viewHandlers: ReturnType<typeof useCalendarViewHandlers>
  upcomingEventId: string | undefined
}

interface UseCalendarEventsDataProps {
  selectedCalendars: string[]
  calendars: RootState['calendars']['list']
  tempcalendars: RootState['calendars']['templist']
  userData: RootState['user']['userData']
  userId: string
  isPending: boolean
  hideDeclinedEvents: boolean
  currentView: string
  timezone: string
  t: (key: string) => string
}

export interface CalendarEventsData {
  sortedSelectedCalendars: string[]
  filteredCalendarEvents: EventInput[]
  upcomingEventId: string | undefined
  fullCalendarEvents: EventInput[]
}

interface FullCalendarEventsProps {
  selectedCalendars: string[]
  calendars: RootState['calendars']['list']
  tempcalendars: RootState['calendars']['templist']
  userData: RootState['user']['userData']
  userId: string
  isPending: boolean
  hideDeclinedEvents: boolean
  t: (key: string) => string
  visibleBookingLinks?: string[]
}

const useFullCalendarEvents = ({
  selectedCalendars,
  calendars,
  tempcalendars,
  userData,
  userId,
  isPending,
  hideDeclinedEvents,
  t,
  visibleBookingLinks
}: FullCalendarEventsProps): EventInput[] => {
  const tempCalendarIds = useMemo(
    () => getTempCalendarIds(tempcalendars),
    [tempcalendars]
  )

  const email = userData?.email
  const filteredEvents = useMemo(
    () =>
      getFilteredEvents(
        selectedCalendars,
        calendars,
        email,
        hideDeclinedEvents,
        visibleBookingLinks
      ),
    [
      selectedCalendars,
      calendars,
      email,
      hideDeclinedEvents,
      visibleBookingLinks
    ]
  )

  const filteredTempEvents = useMemo(
    () =>
      getFilteredEvents(
        tempCalendarIds,
        tempcalendars,
        email,
        hideDeclinedEvents,
        visibleBookingLinks
      ),
    [
      tempCalendarIds,
      tempcalendars,
      email,
      hideDeclinedEvents,
      visibleBookingLinks
    ]
  )

  return useMemo(() => {
    return eventToFullCalendarFormat({
      filteredEvents,
      filteredTempEvents,
      userId,
      userAddress: email,
      pending: isPending,
      calendars,
      t
    })
  }, [
    filteredEvents,
    filteredTempEvents,
    userId,
    email,
    isPending,
    calendars,
    t
  ])
}

export const useCalendarEventsData = ({
  selectedCalendars,
  calendars,
  tempcalendars,
  userData,
  userId,
  isPending,
  hideDeclinedEvents,
  currentView,
  timezone,
  t,
  visibleBookingLinks
}: UseCalendarEventsDataProps & {
  visibleBookingLinks?: string[]
}): CalendarEventsData => {
  const sortedSelectedCalendars = useMemo(
    () => [...selectedCalendars].sort(),
    [selectedCalendars]
  )

  const fullCalendarEvents = useFullCalendarEvents({
    selectedCalendars,
    calendars,
    tempcalendars,
    userData,
    userId,
    isPending,
    hideDeclinedEvents,
    t,
    visibleBookingLinks
  })

  const bookingListEvents = useBookingLinksEvents(visibleBookingLinks)

  const filteredCalendarEvents = useFilteredCalendarEvents(
    fullCalendarEvents,
    bookingListEvents,
    currentView,
    timezone
  )

  const upcomingEventId = useFindUpcommingEvent(fullCalendarEvents, currentView)

  return {
    sortedSelectedCalendars,
    filteredCalendarEvents,
    upcomingEventId,
    fullCalendarEvents
  }
}

interface CalendarReduxState {
  userId: string
  userData: RootState['user']['userData']
  calendars: RootState['calendars']['list']
  tempcalendars: RootState['calendars']['templist']
  isPending: boolean
  view: RootState['settings']['view']
  hideDeclinedEvents: boolean
}

const useCalendarReduxState = (): CalendarReduxState => {
  const userId = useAppSelector(state => state.user.userData?.openpaasId) ?? ''
  const userData = useAppSelector(state => state.user.userData)
  const calendars = useAppSelector(state => state.calendars.list)
  const tempcalendars = useAppSelector(state => state.calendars.templist)
  const isPending = useAppSelector(state => state.calendars.pending)
  const view = useAppSelector(state => state.settings.view)
  const hideDeclinedEvents = useAppSelector(state =>
    Boolean(state.settings.hideDeclinedEvents)
  )

  return {
    userId,
    userData,
    calendars,
    tempcalendars,
    isPending,
    view,
    hideDeclinedEvents
  }
}

export const useCalendarGridState = ({
  calendarRef,
  calendarWrapperRef,
  currentView,
  timezone,
  selectedCalendars,
  setSelectedDate,
  setSelectedMiniDate,
  onViewChange,
  errorHandler,
  visibleBookingLinks
}: UseCalendarGridStateProps): CalendarGridState => {
  const { t } = useI18n()
  const {
    userId,
    userData,
    calendars,
    tempcalendars,
    isPending,
    view,
    hideDeclinedEvents
  } = useCalendarReduxState()

  const { isTooSmall: isMobile, isTablet } = useScreenSizeDetection()

  const {
    sortedSelectedCalendars,
    filteredCalendarEvents,
    upcomingEventId,
    fullCalendarEvents
  } = useCalendarEventsData({
    selectedCalendars,
    calendars,
    tempcalendars,
    userData,
    userId,
    isPending,
    hideDeclinedEvents,
    currentView,
    timezone,
    t,
    visibleBookingLinks
  })

  const viewHandlers = useCalendarViewHandlers({
    calendarRef,
    setSelectedDate,
    setSelectedMiniDate,
    onViewChange,
    calendars,
    tempcalendars,
    errorHandler,
    timezone,
    isTablet,
    isMobile,
    t,
    upcommingEventId: upcomingEventId,
    currentView,
    view,
    calendarWrapperRef,
    sortedSelectedCalendars,
    fullCalendarEvents
  })

  return {
    isPending,
    filteredCalendarEvents,
    viewHandlers,
    upcomingEventId
  }
}
export const DAY_TO_INDEX: Record<DayOfWeek, number> = {
  MON: 0,
  TUE: 1,
  WED: 2,
  THU: 3,
  FRI: 4,
  SAT: 5,
  SUN: 6
}

// Constants for booking link event generation
const BOOKING_LINK_WEEKS_BEFORE = 26
const BOOKING_LINK_WEEKS_AFTER = 26
const BOOKING_LINK_TOTAL_WEEKS =
  BOOKING_LINK_WEEKS_BEFORE + BOOKING_LINK_WEEKS_AFTER

function useBookingLinksEvents(
  visibleBookingLinks: string[] | undefined
): EventInput[] {
  const allBookingLinks = useAppSelector(state => state.bookingLinks.list)

  return useMemo(() => {
    const bookingList = allBookingLinks.filter(link =>
      visibleBookingLinks?.includes(link.publicId)
    )

    return bookingList.flatMap((link: BookingLink): EventInput[] =>
      (link.availabilityRules ?? []).flatMap((rule): EventInput[] => {
        if (rule.type !== 'weekly') return []

        // Generate events for booking link visibility window
        return Array.from(
          { length: BOOKING_LINK_TOTAL_WEEKS },
          (_, weekOffset) => {
            const startOfWeek = computeStartOfTheWeek(new Date())
            const weekStart = new Date(startOfWeek)
            weekStart.setDate(
              weekStart.getDate() + (weekOffset - BOOKING_LINK_WEEKS_BEFORE) * 7
            )

            const dayIndex = DAY_TO_INDEX[rule.dayOfWeek]
            const date = new Date(weekStart)
            date.setDate(weekStart.getDate() + dayIndex)

            const [startHours, startMinutes] = rule.start.split(':')
            const [endHours, endMinutes] = rule.end.split(':')
            const start = new Date(date)
            start.setHours(
              parseInt(startHours, 10),
              parseInt(startMinutes, 10),
              0,
              0
            )
            const end = new Date(date)
            end.setHours(parseInt(endHours, 10), parseInt(endMinutes, 10), 0, 0)

            return {
              id: `${link.publicId}-${rule.dayOfWeek}-w${weekOffset}`,
              title: link.name,
              start: start.toISOString(),
              end: end.toISOString(),
              backgroundColor: link.color,
              borderColor: link.color,
              extendedProps: {
                calId: link.publicId,
                colors: link.color
                  ? { dark: link.color, light: link.color }
                  : undefined,
                attendee: [],
                class: 'PUBLIC',
                isBookingLink: true
              },
              priority: 0
            } as EventInput
          }
        )
      })
    )
  }, [allBookingLinks, visibleBookingLinks])
}

export function useVisibleBookingLinks(
  visibleBookingLinks: string[] | undefined
): BookingLink[] {
  const allBookingLinks = useAppSelector(state => state.bookingLinks.list)

  return useMemo(() => {
    return allBookingLinks.filter(link =>
      visibleBookingLinks?.includes(link.publicId)
    )
  }, [allBookingLinks, visibleBookingLinks])
}
