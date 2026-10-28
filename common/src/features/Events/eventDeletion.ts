import type { AppDispatch, RootState } from '@common/app/store'
import {
  addPendingDeletion,
  deleteEvent,
  deleteEventInstance,
  markPendingDeletionCommitting,
  removeEvent,
  removePendingDeletion
} from '@common/features/Calendars/CalendarSlice'
import { PendingDeletion } from '@common/features/Calendars/types/PendingDeletion'
import { CalendarEvent } from '@common/types/EventsTypes'
import { isRejected } from '@reduxjs/toolkit'

type Thunk<T> = (dispatch: AppDispatch, getState: () => RootState) => T

let nextDeletionId = 0

export function isHiddenByPendingDeletion(
  event: CalendarEvent,
  pendingDeletions: PendingDeletion[]
): boolean {
  return pendingDeletions.some(
    deletion =>
      deletion.calId === event.calId &&
      // every occurrence of a series shares the URL of its calendar object
      (deletion.scope === 'all'
        ? deletion.event.URL === event.URL
        : deletion.event.uid === event.uid)
  )
}

/**
 * Hides the event from the grid without telling the server yet, so that an
 * undo sends nothing: guests never get a cancellation followed by a new
 * invitation. Returns the id to commit or undo the deletion with.
 */
export const scheduleEventDeletion =
  ({
    calId,
    event,
    scope,
    guestsNotified
  }: {
    calId: string
    event: CalendarEvent
    scope: 'solo' | 'all'
    guestsNotified: boolean
  }): Thunk<string> =>
  dispatch => {
    // one deletion may be undone at a time: the previous one goes for good
    void dispatch(commitPendingDeletions())
    const id = `deletion-${++nextDeletionId}`
    dispatch(
      addPendingDeletion({
        id,
        calId,
        event: { ...event, calId },
        scope,
        guestsNotified,
        committing: false
      })
    )
    return id
  }

export const undoEventDeletion =
  (id: string): Thunk<void> =>
  (dispatch, getState) => {
    const deletion = getState().calendars.pendingDeletions?.find(
      d => d.id === id
    )
    if (!deletion || deletion.committing) return
    dispatch(removePendingDeletion(id))
  }

/**
 * Sends the deletion. The event stays hidden while the request runs; on
 * failure it shows up again, next to the error the thunks report.
 */
export const commitEventDeletion =
  (id: string): Thunk<Promise<void>> =>
  async (dispatch, getState) => {
    const deletion = getState().calendars.pendingDeletions?.find(
      d => d.id === id
    )
    if (!deletion || deletion.committing) return
    dispatch(markPendingDeletionCommitting(id))

    const { calId, event, scope } = deletion
    const calendar = getState().calendars.list[calId]
    const result =
      scope === 'solo' && calendar
        ? await dispatch(deleteEventInstance({ cal: calendar, event }))
        : await dispatch(
            deleteEvent({ calId, eventId: event.uid, eventURL: event.URL })
          )

    if (!isRejected(result)) {
      // drop the occurrences now: the refresh that follows comes later
      Object.values(getState().calendars.list[calId]?.events ?? {})
        .filter(e => isHiddenByPendingDeletion(e, [deletion]))
        .forEach(e =>
          dispatch(removeEvent({ calendarUid: calId, eventUid: e.uid }))
        )
    }
    dispatch(removePendingDeletion(id))
  }

export const commitPendingDeletions =
  (): Thunk<Promise<void>> => async (dispatch, getState) => {
    await Promise.all(
      (getState().calendars.pendingDeletions ?? [])
        .filter(d => !d.committing)
        .map(d => dispatch(commitEventDeletion(d.id)))
    )
  }
