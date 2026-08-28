import React, { useMemo, useRef, useState, useCallback, useEffect } from 'react'
import type { MutableRefObject } from 'react'
import type { CalendarApi } from '@fullcalendar/core'
import { createPortal } from 'react-dom'
import { useAppSelector } from '@common/app/hooks'
import type { RootState } from '@common/app/store'
import {
  AvailabilityRule,
  BookingLink,
  DayOfWeek
} from '@common/features/booking/types/BookingTypes'
import { computeStartOfTheWeek } from '@common/utils/dateUtils'
import { BaseBookingLinkChip } from '@common/components/Event/EventChip/BookingLinkEventChip'
import moment from 'moment-timezone'

interface BookingLinkOverlayProps {
  visibleBookingLinks: string[] | undefined
  calendarRef: MutableRefObject<CalendarApi | null>
  timezone: string
  currentView: string
  onEditBookingLink?: (link: BookingLink) => void
}

const DAY_TO_INDEX: Record<DayOfWeek, number> = {
  MON: 0,
  TUE: 1,
  WED: 2,
  THU: 3,
  FRI: 4,
  SAT: 5,
  SUN: 6
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

const getSlotHeight = (container: HTMLElement): number => {
  const slotEl = container.querySelector('.fc-timegrid-slot')
  if (slotEl) {
    const rect = slotEl.getBoundingClientRect()
    return rect.height
  }
  return 0
}

const parseDurationString = (duration: string): number => {
  const parts = duration.split(':').map(Number)
  if (parts.length >= 2) {
    return parts[0] * 60 + parts[1]
  }
  return 30
}

const parseDurationObject = (duration: {
  hours?: number
  minutes?: number
  milliseconds?: number
}): number => {
  if (duration.milliseconds !== undefined) {
    return Math.round(duration.milliseconds / 60000)
  }
  const hours = duration.hours ?? 0
  const minutes = duration.minutes ?? 0
  return hours * 60 + minutes
}

const getSlotDurationMinutes = (calendarApi: CalendarApi | null): number => {
  if (!calendarApi) return 30
  const view = calendarApi.view
  const slotDuration = (
    view as unknown as {
      options?: {
        slotDuration?:
          | string
          | { hours?: number; minutes?: number; milliseconds?: number }
      }
    }
  ).options?.slotDuration

  if (typeof slotDuration === 'string') {
    return parseDurationString(slotDuration)
  }
  if (typeof slotDuration === 'object' && slotDuration !== null) {
    return parseDurationObject(slotDuration)
  }
  return 30
}

const getStripTimes = (
  rule: AvailabilityRule & { dayOfWeek: string; timeZone?: string },
  dayIndex: number,
  startOfWeek: Date,
  calendarTimezone: string
): { startMinutes: number; durationMinutes: number } | null => {
  const ruleTimezone = rule.timeZone || calendarTimezone

  // Construire la date du jour dans la timezone de la règle
  const weekStartInRuleTz = moment.tz(startOfWeek, ruleTimezone).startOf('day')
  const ruleDayInRuleTz = weekStartInRuleTz.clone().add(dayIndex, 'days')

  const [startH, startM] = rule.start.split(':').map(Number)
  const [endH, endM] = rule.end.split(':').map(Number)

  const startInRuleTz = ruleDayInRuleTz
    .clone()
    .hour(startH)
    .minute(startM)
    .second(0)
  const endInRuleTz = ruleDayInRuleTz.clone().hour(endH).minute(endM).second(0)

  // Convertir dans la tz du calendrier
  const startInCalTz = startInRuleTz.clone().tz(calendarTimezone)
  const endInCalTz = endInRuleTz.clone().tz(calendarTimezone)

  const startMinutes = startInCalTz.hours() * 60 + startInCalTz.minutes()
  const durationMinutes = endInCalTz.diff(startInCalTz, 'minutes')

  return { startMinutes, durationMinutes }
}

const getTimeSlotOffset = (
  container: HTMLElement,
  time: string
): number | null => {
  const slotEl = container.querySelector<HTMLElement>(
    `.fc-timegrid-slot[data-time="${time}"]`
  )
  return slotEl?.offsetTop ?? null
}

const getDayColumnPosition = (
  container: HTMLElement,
  dateString: string
): { left: number; width: number } | null => {
  const dayEl = container.querySelector<HTMLElement>(
    `.fc-timegrid-col[data-date="${dateString}"]`
  )
  if (!dayEl) return null

  const containerRect = container.getBoundingClientRect()
  const dayRect = dayEl.getBoundingClientRect()
  return {
    left: dayRect.left - containerRect.left,
    width: dayRect.width
  }
}

const getDateStringForDay = (
  dayIndex: number,
  startOfWeek: Date,
  calendarTimezone: string
): string => {
  return moment
    .tz(startOfWeek, calendarTimezone)
    .startOf('day')
    .add(dayIndex, 'days')
    .format('YYYY-MM-DD')
}

const calculateTopOffset = (
  container: HTMLElement,
  startMinutes: number,
  slotDurationMinutes: number,
  pixelsPerMinute: number
): number => {
  const slotStartMinutes =
    Math.floor(startMinutes / slotDurationMinutes) * slotDurationMinutes
  const startH = Math.floor(slotStartMinutes / 60)
  const startM = slotStartMinutes % 60
  const slotTime = `${String(startH).padStart(2, '0')}:${String(startM).padStart(2, '0')}:00`

  const slotTop = getTimeSlotOffset(container, slotTime)

  if (slotTop === null) {
    const firstSlot = container.querySelector<HTMLElement>(
      '.fc-timegrid-slot[data-time]'
    )
    if (firstSlot) {
      const firstSlotTime = firstSlot.getAttribute('data-time') ?? '00:00:00'
      const [fh, fm] = firstSlotTime.split(':').map(Number)
      return (
        firstSlot.offsetTop + (startMinutes - (fh * 60 + fm)) * pixelsPerMinute
      )
    }
    return startMinutes * pixelsPerMinute
  }

  return slotTop + (startMinutes - slotStartMinutes) * pixelsPerMinute
}

const createStripPosition = (
  link: BookingLink,
  rule: AvailabilityRule & { dayOfWeek: string },
  ruleIndex: number,
  container: HTMLElement,
  calendarTimezone: string,
  startOfWeek: Date,
  slotDurationMinutes: number,
  pixelsPerMinute: number
): StripPosition | null => {
  const dayIndex = DAY_TO_INDEX[rule.dayOfWeek as keyof typeof DAY_TO_INDEX]
  const dateString = getDateStringForDay(
    dayIndex,
    startOfWeek,
    calendarTimezone
  )

  const columnPos = getDayColumnPosition(container, dateString)
  if (!columnPos) return null

  const { startMinutes = 0, durationMinutes = 0 } =
    getStripTimes(
      rule as AvailabilityRule & { dayOfWeek: string; timeZone?: string },
      dayIndex,
      startOfWeek,
      calendarTimezone
    ) ?? {}

  const top = calculateTopOffset(
    container,
    startMinutes,
    slotDurationMinutes,
    pixelsPerMinute
  )
  const OVERLAY_OFFSET_PX = 4

  return {
    top,
    height: durationMinutes * pixelsPerMinute,
    left: columnPos.left + OVERLAY_OFFSET_PX,
    width: 16,
    color: link.color || '#1976d2',
    linkId: link.publicId,
    ruleId: `${link.publicId}-${rule.dayOfWeek}-${ruleIndex}`,
    linkName: link.name,
    durationMinutes: Math.max(Math.round(durationMinutes), 15),
    active: link.active
  }
}

const computeStripPositions = (
  bookingLinks: BookingLink[],
  calendarApi: CalendarApi | null,
  container: HTMLElement,
  calendarTimezone: string
): StripPosition[] => {
  if (!calendarApi) return []

  const slotDurationMinutes = getSlotDurationMinutes(calendarApi)
  const slotHeight = getSlotHeight(container)
  if (slotHeight === 0) return []

  const pixelsPerMinute = slotHeight / slotDurationMinutes
  const startOfWeek = computeStartOfTheWeek(calendarApi.view.currentStart)
  const positions: StripPosition[] = []

  bookingLinks.forEach(link => {
    if (!link.availabilityRules) return

    link.availabilityRules.forEach(
      (rule: AvailabilityRule, ruleIndex: number) => {
        if (rule.type !== 'weekly') return

        const strip = createStripPosition(
          link,
          rule as AvailabilityRule & { dayOfWeek: string },
          ruleIndex,
          container,
          calendarTimezone,
          startOfWeek,
          slotDurationMinutes,
          pixelsPerMinute
        )

        if (strip) positions.push(strip)
      }
    )
  })

  return positions
}

const useBookingLinkPositions = (
  visibleBookingLinks: string[] | undefined,
  calendarRef: MutableRefObject<CalendarApi | null>,
  timezone: string,
  currentView: string
) => {
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

  const findContainer = useCallback((): void => {
    setContainerEl(null)
    setPositions([])

    setTimeout(() => {
      if (!calendarRef.current) return
      const calendarRoot = document.querySelector('.fc')
      // Assumes a single FullCalendar instance on the page.
      // If multiple instances are ever needed, pass a wrapper ref from CalendarGrid instead.
      const timegridBody = calendarRoot?.querySelector('.fc-timegrid-body')
      if (timegridBody) {
        setContainerEl(timegridBody as HTMLElement)
      }
    }, 150)
  }, [calendarRef])

  useEffect(() => {
    findContainer()
  }, [currentView])

  useEffect(() => {
    if (containerEl) updatePositions()
  }, [containerEl])

  useEffect(() => {
    if (containerEl) updatePositions()
  }, [filteredBookingLinks, timezone])

  useEffect(() => {
    if (!containerEl) return

    resizeObserverRef.current = new ResizeObserver(() => updatePositions())
    resizeObserverRef.current.observe(containerEl)

    return (): void => {
      resizeObserverRef.current?.disconnect()
    }
  }, [containerEl, updatePositions])

  useEffect(() => {
    if (!containerEl) return

    mutationObserverRef.current = new MutationObserver(() => updatePositions())
    mutationObserverRef.current.observe(containerEl, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['data-date', 'data-time']
    })

    return (): void => {
      mutationObserverRef.current?.disconnect()
    }
  }, [containerEl, updatePositions])

  return { containerEl, positions, filteredBookingLinks }
}

const useStripRef = () =>
  useCallback((el: HTMLDivElement | null): void => {
    if (!el) return
    const handler = (e: MouseEvent): void => {
      e.stopPropagation()
    }
    el.addEventListener('mousedown', handler, { capture: true })
  }, [])

interface BookingLinkStripProps {
  position: StripPosition
  onEdit: (linkId: string) => void
  findLink: (linkId: string) => BookingLink | undefined
  stripRef: (el: HTMLDivElement | null) => void
}

const BookingLinkStrip: React.FC<BookingLinkStripProps> = ({
  position,
  onEdit,
  findLink,
  stripRef
}) => {
  const handleActivate = useCallback((): void => {
    const link = findLink(position.linkId)
    if (link) onEdit(position.linkId)
  }, [findLink, onEdit, position.linkId])

  const handleClick = useCallback(
    (e: React.MouseEvent): void => {
      e.stopPropagation()
      handleActivate()
    },
    [handleActivate]
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent): void => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.stopPropagation()
        e.preventDefault()
        handleActivate()
      }
    },
    [handleActivate]
  )

  return (
    <div
      ref={stripRef}
      role="button"
      tabIndex={0}
      aria-label={
        position.linkName ? `Edit ${position.linkName}` : 'Edit booking link'
      }
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      style={{
        position: 'absolute',
        top: position.top,
        left: position.left,
        height: position.height,
        width: position.width,
        pointerEvents: 'auto',
        zIndex: 2
      }}
    >
      <BaseBookingLinkChip
        data={{
          color: position.color,
          name: position.linkName,
          durationMinutes: position.durationMinutes,
          active: position.active
        }}
        width={`${position.width}px`}
        style={{ height: '100%', minHeight: '100%' }}
      />
    </div>
  )
}

export const BookingLinkOverlay: React.FC<BookingLinkOverlayProps> = ({
  visibleBookingLinks,
  calendarRef,
  timezone,
  currentView,
  onEditBookingLink
}) => {
  const { containerEl, positions, filteredBookingLinks } =
    useBookingLinkPositions(
      visibleBookingLinks,
      calendarRef,
      timezone,
      currentView
    )
  const stripRef = useStripRef()

  const findLink = useCallback(
    (linkId: string): BookingLink | undefined => {
      return filteredBookingLinks.find(l => l.publicId === linkId)
    },
    [filteredBookingLinks]
  )

  const handleEdit = useCallback(
    (linkId: string): void => {
      const link = findLink(linkId)
      if (link && onEditBookingLink) {
        onEditBookingLink(link)
      }
    },
    [findLink, onEditBookingLink]
  )

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
        <BookingLinkStrip
          key={pos.ruleId}
          position={pos}
          onEdit={handleEdit}
          findLink={findLink}
          stripRef={stripRef}
        />
      ))}
    </div>,
    containerEl
  )
}
