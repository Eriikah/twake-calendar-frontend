import { useAppSelector } from '@common/app/hooks'
import { calendarDavPath } from '@common/features/Calendars/utils/calendarDavPath'
import { useSelectedCalendars } from '@common/utils/storage/useSelectedCalendars'
import { useMemo } from 'react'

export function useCalendarRegistrationPaths(): {
  calendarList: string[]
  tempCalendarList: string[]
} {
  const selectedCalendars = useSelectedCalendars()

  // A calendar shared with the user is watched through their own instance of
  // it: the side service refuses a registration on its owner's node. Joined in
  // a string so that consumers only rerun when a path actually changes.
  const registrationPaths = useAppSelector(state =>
    selectedCalendars
      .map(id => {
        const calendar = state.calendars?.list?.[id]
        return calendar
          ? calendarDavPath(calendar).replace(/^\/calendars\//, '')
          : id
      })
      .join('\n')
  )
  const calendarList = useMemo(
    () => (registrationPaths ? registrationPaths.split('\n') : []),
    [registrationPaths]
  )

  // Same trick for temp calendars (previously recomputed each render, which
  // re-ran the sync effect every time).
  const tempRegistrationPaths = useAppSelector(state =>
    Object.keys(state?.calendars?.templist ?? {}).join('\n')
  )
  const tempCalendarList = useMemo(
    () => (tempRegistrationPaths ? tempRegistrationPaths.split('\n') : []),
    [tempRegistrationPaths]
  )

  return { calendarList, tempCalendarList }
}
