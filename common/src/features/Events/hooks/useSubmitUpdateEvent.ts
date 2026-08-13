import { useCallback } from 'react'
import { useAppDispatch, useAppSelector } from '@common/app/hooks'
import { CalendarEvent } from '@common/types/EventsTypes'
import { EventFormValues } from '@common/components/Event/EventFormFields.types'
import { userOrganiser } from '@common/features/User/userDataTypes'
import { handleUpdateSubmit } from './submitUpdateHelpers/performUpdateAction'
import { useI18n } from 'twake-i18n'

export interface UseSubmitUpdateEventProps {
  event: CalendarEvent
  calId: string
  eventId: string
  typeOfAction?: 'solo' | 'all'
  masterEvent?: CalendarEvent | null
  showMore: boolean
  onClose: (refresh?: boolean) => void
}

export const useSubmitUpdateEvent = ({
  event,
  calId,
  eventId,
  typeOfAction,
  masterEvent,
  showMore,
  onClose
}: UseSubmitUpdateEventProps): {
  handleSubmit: (
    values: EventFormValues,
    organizer?: userOrganiser
  ) => Promise<void>
} => {
  const { t } = useI18n()
  const dispatch = useAppDispatch()
  const calList = useAppSelector(state => state.calendars.list)

  const handleSubmit = useCallback(
    async (
      values: EventFormValues,
      organizer?: userOrganiser
    ): Promise<void> => {
      await handleUpdateSubmit({
        event,
        values,
        organizer,
        calList,
        showMore,
        calId,
        eventId,
        typeOfAction,
        onClose,
        dispatch,
        masterEvent,
        t
      })
    },
    [
      event,
      calId,
      eventId,
      typeOfAction,
      masterEvent,
      showMore,
      onClose,
      dispatch,
      calList,
      t
    ]
  )

  return { handleSubmit }
}
