import { AppDispatch } from '@common/app/store'
import {
  emptyEventsCal,
  getCalendarDetail,
  getCalendarsList,
  refreshCalendarWithSyncToken
} from '@common/features/Calendars/CalendarSlice'
import { Calendar } from '@common/types/CalendarTypes'
import { formatDateToYYYYMMDDTHHMMSS } from '@common/utils/dateUtils'

export async function refreshCalendars(
  dispatch: AppDispatch,
  calendars: Calendar[],
  calendarRange: {
    start: Date
    end: Date
  },
  calType?: 'temp'
): Promise<void> {
  if (process.env.NODE_ENV === 'test') return

  if (!calType) {
    await dispatch(getCalendarsList())
  }

  const results = await Promise.allSettled(
    calendars.map(calendar =>
      dispatch(
        refreshCalendarWithSyncToken({ calendar, calType, calendarRange })
      ).unwrap()
    )
  )

  results.forEach((result, index) => {
    if (result.status === 'rejected') {
      console.error(
        `Failed to refresh calendar ${calendars[index].id}:`,
        result.reason
      )
    }
  })
}

export async function refreshSingularCalendar(
  dispatch: AppDispatch,
  calendar: Calendar,
  calendarRange: { start: Date; end: Date },
  calType?: 'temp'
): Promise<void> {
  const isTestEnv = process.env.NODE_ENV === 'test'
  dispatch(emptyEventsCal({ calId: calendar.id, calType }))

  if (isTestEnv) {
    return
  }

  await dispatch(
    getCalendarDetail({
      calId: calendar.id,
      match: {
        start: formatDateToYYYYMMDDTHHMMSS(calendarRange.start),
        end: formatDateToYYYYMMDDTHHMMSS(calendarRange.end)
      },
      calType
    })
  )
}
