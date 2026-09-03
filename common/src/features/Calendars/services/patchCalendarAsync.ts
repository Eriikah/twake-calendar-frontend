import { toRejectedError } from '@common/utils/errorUtils'
import { calendarAction } from '@common/features/Calendars/CalendarDAO'
import { makeProppatchCalendarBody } from '@common/features/Calendars/transformers'
import { RejectedError } from '@common/features/Calendars/types/RejectedError'
import { ReducerCreators } from '@reduxjs/toolkit'
import { CalendarState } from '../CalendarSlice'

export const patchCalendarThunk = (create: ReducerCreators<CalendarState>) =>
  create.asyncThunk<
    {
      calId: string
      calLink: string
      patch: { name: string; desc: string; color: Record<string, string> }
    },
    {
      calId: string
      calLink: string
      patch: { name: string; desc: string; color: Record<string, string> }
    },
    { rejectValue: RejectedError }
  >(
    async ({ calId, calLink, patch }, { rejectWithValue }) => {
      try {
        const body = makeProppatchCalendarBody(patch)
        await calendarAction('PROPPATCH', calLink, body)
        return {
          calId,
          calLink,
          patch
        }
      } catch (err) {
        return rejectWithValue(toRejectedError(err))
      }
    },
    {
      pending: state => {
        state.pending = true
      },
      fulfilled: (state, action) => {
        state.pending = false
        state.error = null

        const { calId, patch } = action.payload

        const applyPatch = (cal: (typeof state.list)[string] | undefined) => {
          if (!cal) return
          if (patch.name !== undefined) cal.name = patch.name
          if (patch.desc !== undefined) cal.description = patch.desc
          if (patch.color !== undefined) {
            cal.color = patch.color
            if (cal.events) {
              Object.values(cal.events).forEach(event => {
                event.color = patch.color
              })
            }
          }
        }

        applyPatch(state.list[calId])
        applyPatch(state.templist[calId])
      },
      rejected: (state, action) => {
        state.pending = false
        state.error =
          action.payload?.message ||
          action.error.message ||
          'Failed to update calendar'
      }
    }
  )
