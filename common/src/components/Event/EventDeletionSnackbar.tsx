import { useAppDispatch, useAppSelector } from '@common/app/hooks'
import { SnackbarAlert } from '@common/components/Loading/SnackBarAlert'
import {
  commitEventDeletion,
  commitPendingDeletions,
  undoEventDeletion
} from '@common/features/Events/eventDeletion'
import { useEffect } from 'react'
import { useI18n } from 'twake-i18n'

// How long the user has to undo a deletion before it is sent
export const UNDO_DELETION_DURATION = 3000

export function EventDeletionSnackbar(): JSX.Element | null {
  const { t } = useI18n()
  const dispatch = useAppDispatch()
  const deletion = useAppSelector(state =>
    state.calendars.pendingDeletions?.find(d => !d.committing)
  )

  // a deletion the user saw must not be lost with the page
  useEffect(() => {
    const onPageHide = (): void => void dispatch(commitPendingDeletions())
    window.addEventListener('pagehide', onPageHide)
    return () => window.removeEventListener('pagehide', onPageHide)
  }, [dispatch])

  if (!deletion) return null

  return (
    <SnackbarAlert
      // a new deletion restarts the countdown
      key={deletion.id}
      open
      setOpen={() => void dispatch(commitEventDeletion(deletion.id))}
      message={t(
        deletion.guestsNotified
          ? 'event.deletedGuestsNotified'
          : 'event.deleted'
      )}
      action={{
        label: t('actions.undo'),
        onClick: () => dispatch(undoEventDeletion(deletion.id))
      }}
      autoHideDuration={UNDO_DELETION_DURATION}
    />
  )
}
