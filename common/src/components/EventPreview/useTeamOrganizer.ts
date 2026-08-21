import { useState, useEffect } from 'react'
import { userAttendee } from '@common/features/User/models/attendee'
import { fetchEntityById } from '@common/features/User/EntityDAO'

const useFetchTeamName = (teamCalendarId?: string): string | undefined => {
  const [teamName, setTeamName] = useState<string | undefined>()

  useEffect(() => {
    const resetTeamName = (): void => {
      setTeamName(undefined)
    }

    resetTeamName()

    if (!teamCalendarId) return

    let isCurrent = true

    const fetchTeamById = async (): Promise<void> => {
      try {
        const response = await fetchEntityById(teamCalendarId)
        if (isCurrent) {
          const name = response.teamCalendar?.displayName as string
          setTeamName(name)
        }
      } catch (error) {
        console.error(error)
      }
    }

    void fetchTeamById()

    return (): void => {
      isCurrent = false
    }
  }, [teamCalendarId])

  return teamName
}

export const useTeamOrganizer = ({
  teamCalendarId,
  organizer,
  t
}: {
  teamCalendarId?: string
  organizer?: userAttendee
  t: (key: string, options?: Record<string, string>) => string
}): {
  isTeamOverride: boolean
  displayOrganizer: userAttendee | undefined
  isOriginalOrganizer: boolean
  organizerCaption: string | undefined
} => {
  const teamName = useFetchTeamName(teamCalendarId)

  const isTeamOverride = Boolean(teamCalendarId)
  const displayOrganizer = isTeamOverride
    ? ({ ...organizer, cn: teamName } as userAttendee)
    : organizer

  const isOriginalOrganizer = !isTeamOverride
  const organizerCaption = isTeamOverride
    ? t('event.teamOrganizerWithName', {
        organizerName: organizer?.cn || ''
      })
    : undefined

  return {
    isTeamOverride,
    displayOrganizer,
    isOriginalOrganizer,
    organizerCaption
  }
}
