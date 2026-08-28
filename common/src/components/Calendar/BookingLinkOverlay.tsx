import React, { useMemo, useRef, useState, useCallback } from 'react'
import type { MutableRefObject } from 'react'
import type { CalendarApi } from '@fullcalendar/core'
import { createPortal } from 'react-dom'
import { useAppSelector } from '@common/app/hooks'
import type { RootState } from '@common/app/store'
import {
  AvailabilityRule,
  BookingLink
} from '@common/features/booking/types/BookingTypes'
import {
  computeStartOfTheWeek,
  pad,
  convertTimeToMinutesInTimezone,
  getDateInTimezone
} from '@common/utils/dateUtils'
import { DAY_TO_INDEX } from './hooks/useCalendarGridState'
import { BaseBookingLinkChip } from '@common/components/Event/EventChip/BookingLinkEventChip'

interface BookingLinkOverlayProps {
  visibleBookingLinks: string[] | undefined
  calendarRef: MutableRefObject<CalendarApi | null>
  timezone: string
  currentView: string
  onEditBookingLink?: (link: BookingLink) => void
}

interface StripPosition {
  top: number
  height: number
  left: number
  width: number
  color: string
  linkId: string
  ruleId: string
  linkName?: string
  durationMinutes: number
  active?: boolean
}

const getDateString = (date: Date): string => {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

const getSlotHeight = (container: HTMLElement): number => {
  const slotEl = container.querySelector('.fc-timegrid-slot')
  if (slotEl) {
    const rect = slotEl.getBoundingClientRect()
    return rect.height
  }
  return 0
}

const getSlotDurationMinutes = (calendarApi: CalendarApi | null): number => {
  if (!calendarApi) return 30
  const view = calendarApi.view
  const slotDuration = (
    view as unknown as { options?: { slotDuration?: string } }
  ).options?.slotDuration
  if (slotDuration) {
    const parts = slotDuration.split(':').map(Number)
    if (parts.length >= 2) {
      return parts[0] * 60 + parts[1]
    }
  }
  return 30
}

const getTimeSlotOffset = (
  container: HTMLElement,
  time: string
): number | null => {
  const slotEl = container.querySelector<HTMLElement>(
    `.fc-timegrid-slot[data-time="${time}"]`
  )
  if (slotEl) {
    return slotEl.offsetTop
  }
  return null
}

const getDayColumnPosition = (
  container: HTMLElement,
  dateString: string
): { left: number; width: number } | null => {
  const dayEl = container.querySelector<HTMLElement>(
    `.fc-timegrid-col[data-date="${dateString}"]`
  )

  if (dayEl) {
    const containerRect = container.getBoundingClientRect()
    const dayRect = dayEl.getBoundingClientRect()
    return {
      left: dayRect.left - containerRect.left,
      width: dayRect.width
    }
  }
  return null
}

const computeStripPositions = (
  bookingLinks: BookingLink[],
  calendarApi: CalendarApi | null,
  container: HTMLElement,
  calendarTimezone: string
): StripPosition[] => {
  if (!calendarApi) return []

  const positions: StripPosition[] = []
  const slotDurationMinutes = getSlotDurationMinutes(calendarApi)
  const slotHeight = getSlotHeight(container)

  if (slotHeight === 0) return []

  const pixelsPerMinute = slotHeight / slotDurationMinutes
  const startOfWeek = computeStartOfTheWeek(calendarApi.view.currentStart)
  bookingLinks.forEach(link => {
    if (!link.availabilityRules) return

    link.availabilityRules.forEach(
      (rule: AvailabilityRule, ruleIndex: number) => {
        if (rule.type !== 'weekly') return

        // Get the base date for this day of week
        const dayIndex = DAY_TO_INDEX[rule.dayOfWeek]
        const ruleDate = getDateInTimezone(
          dayIndex,
          startOfWeek,
          calendarTimezone
        )
        const dateString = getDateString(ruleDate)

        const columnPos = getDayColumnPosition(container, dateString)
        if (!columnPos) return

        // Convert start and end times from rule's timezone to calendar's timezone
        const ruleTimezone = rule.timeZone

        const startMinutes = convertTimeToMinutesInTimezone(
          rule.start,
          ruleTimezone,
          calendarTimezone,
          ruleDate
        )
        const endMinutes = convertTimeToMinutesInTimezone(
          rule.end,
          ruleTimezone,
          calendarTimezone,
          ruleDate
        )

        const durationMinutes = endMinutes - startMinutes

        // Convert start time to slot time format (HH:mm:00) for DOM lookup
        const startHours = Math.floor(startMinutes / 60)
        const startMins = startMinutes % 60
        const slotTime = `${pad(startHours)}:${pad(startMins)}:00`

        let topOffset = getTimeSlotOffset(container, slotTime)

        if (topOffset === null) {
          const firstSlot = container.querySelector<HTMLElement>(
            '.fc-timegrid-slot[data-time]'
          )
          if (firstSlot) {
            const firstSlotTime =
              firstSlot.getAttribute('data-time') || '00:00:00'
            const [firstHours, firstMinutes] = firstSlotTime
              .split(':')
              .map(Number)
            const firstSlotMinutes = firstHours * 60 + firstMinutes
            const minuteDiff = startMinutes - firstSlotMinutes
            topOffset = firstSlot.offsetTop + minuteDiff * pixelsPerMinute
          } else {
            topOffset = startMinutes * pixelsPerMinute
          }
        } else {
          const slotStartMinutes =
            Math.floor(startMinutes / slotDurationMinutes) * slotDurationMinutes
          const minutesIntoSlot = startMinutes - slotStartMinutes
          topOffset += minutesIntoSlot * pixelsPerMinute
        }

        const height = durationMinutes * pixelsPerMinute

        // Offset from the left edge of the day column to avoid overlapping with events
        const OVERLAY_OFFSET_PX = 4

        positions.push({
          top: topOffset,
          height,
          left: columnPos.left + OVERLAY_OFFSET_PX,
          width: 16,
          color: link.color || '#1976d2',
          linkId: link.publicId,
          ruleId: `${link.publicId}-${rule.dayOfWeek}-${ruleIndex}`,
          linkName: link.name,
          durationMinutes: Math.max(Math.round(durationMinutes), 15),
          active: link.active
        })
      }
    )
  })

  return positions
}

export const BookingLinkOverlay: React.FC<BookingLinkOverlayProps> = ({
  visibleBookingLinks,
  calendarRef,
  timezone,
  currentView,
  onEditBookingLink
}) => {
  const [containerEl, setContainerEl] = useState<HTMLElement | null>(null)
  const [positions, setPositions] = useState<StripPosition[]>([])
  const resizeObserverRef = useRef<ResizeObserver | null>(null)
  const mutationObserverRef = useRef<MutationObserver | null>(null)

  const allBookingLinks = useAppSelector(
    (state: RootState) => state.bookingLinks.list
  )

  const filteredBookingLinks = useMemo((): BookingLink[] => {
    return allBookingLinks.filter((link: BookingLink) =>
      visibleBookingLinks?.includes(link.publicId)
    )
  }, [allBookingLinks, visibleBookingLinks])

  const updatePositions = useCallback((): void => {
    const calendarApi = calendarRef.current
    if (!calendarApi || !containerEl) {
      setPositions([])
      return
    }

    const newPositions = computeStripPositions(
      filteredBookingLinks,
      calendarApi,
      containerEl,
      timezone
    )
    setPositions(newPositions)
  }, [filteredBookingLinks, calendarRef, containerEl, timezone])

  // Use a layout effect pattern to find container and update positions
  const scheduleUpdate = useCallback((): void => {
    // Clear positions while we find the new container
    setContainerEl(null)
    setPositions([])

    // Delay to allow FullCalendar to render
    setTimeout(() => {
      if (calendarRef.current) {
        const calendarRoot = document.querySelector('.fc')
        if (calendarRoot) {
          const timegridBody = calendarRoot.querySelector('.fc-timegrid-body')
          if (timegridBody) {
            setContainerEl(timegridBody as HTMLElement)
          }
        }
      }
    }, 150)
  }, [calendarRef])

  // Schedule container finding when view changes
  useMemo(() => {
    scheduleUpdate()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentView])

  // Update positions when container changes
  useMemo(() => {
    if (containerEl) {
      updatePositions()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [containerEl])

  // Update positions when dependencies change
  useMemo(() => {
    if (containerEl) {
      updatePositions()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredBookingLinks, timezone])

  // Set up ResizeObserver on the container
  React.useEffect(() => {
    if (!containerEl) return

    resizeObserverRef.current = new ResizeObserver(() => {
      updatePositions()
    })

    resizeObserverRef.current.observe(containerEl)

    return (): void => {
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect()
      }
    }
  }, [containerEl, updatePositions])

  // Watch for DOM changes
  React.useEffect(() => {
    if (!containerEl) return

    mutationObserverRef.current = new MutationObserver(() => {
      updatePositions()
    })

    mutationObserverRef.current.observe(containerEl, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['data-date', 'data-time']
    })

    return (): void => {
      if (mutationObserverRef.current) {
        mutationObserverRef.current.disconnect()
      }
    }
  }, [containerEl, updatePositions])

  // Ref callback to attach mousedown handler for stopping FullCalendar selection
  const stripRef = useCallback((el: HTMLDivElement | null): void => {
    if (!el) return
    const handler = (e: MouseEvent): void => {
      e.stopPropagation()
    }
    el.addEventListener('mousedown', handler, { capture: true })
  }, [])

  if (!containerEl || positions.length === 0) return null

  return createPortal(
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: 'none',
        zIndex: 1
      }}
    >
      {positions.map(pos => (
        <div
          key={pos.ruleId}
          ref={stripRef}
          onClick={(e): void => {
            e.stopPropagation()
            const link = filteredBookingLinks.find(
              l => l.publicId === pos.linkId
            )
            if (link && onEditBookingLink) {
              onEditBookingLink(link)
            }
          }}
          style={{
            position: 'absolute',
            top: pos.top,
            left: pos.left,
            height: pos.height,
            width: pos.width,
            pointerEvents: 'auto',
            zIndex: 2
          }}
        >
          <BaseBookingLinkChip
            data={{
              color: pos.color,
              name: pos.linkName,
              durationMinutes: pos.durationMinutes,
              active: pos.active
            }}
            width={`${pos.width}px`}
            style={{
              height: '100%',
              minHeight: '100%'
            }}
          />
        </div>
      ))}
    </div>,
    containerEl
  )
}
