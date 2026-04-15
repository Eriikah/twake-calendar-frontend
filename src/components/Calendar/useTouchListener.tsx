import { DateSelectArg } from '@fullcalendar/core'
import { RefObject, useEffect } from 'react'

const MOVE_THRESHOLD = 10
const TAP_DURATION = 200

function isTapGesture(dx: number, dy: number, duration: number): boolean {
  return dx < MOVE_THRESHOLD && dy < MOVE_THRESHOLD && duration < TAP_DURATION
}

function getTimeAtPoint(x: number, y: number): string | null {
  const el = document.elementFromPoint(x, y)
  return (
    (el as HTMLElement)?.closest('[data-time]')?.getAttribute('data-time') ??
    null
  )
}

function getDateAtPoint(x: number): string | null {
  const col = Array.from(document.querySelectorAll('[data-date]')).find(el => {
    const rect = el.getBoundingClientRect()
    return x >= rect.left && x <= rect.right
  })
  return col?.getAttribute('data-date') ?? null
}

function buildSelectArg(date: string, time: string): DateSelectArg {
  const start = new Date(`${date}T${time}`)
  const end = new Date(start.getTime() + 30 * 60 * 1000)
  return { start, end, allDay: false } as DateSelectArg
}

export function useTouchListener(
  handleDateSelect: (selectInfo: DateSelectArg | null) => void,
  isTouch: boolean,
  wrapperRef: RefObject<HTMLDivElement>
): void {
  useEffect(() => {
    const el = wrapperRef.current
    if (!el || !isTouch) return

    let startX = 0,
      startY = 0,
      startTime = 0

    const onTouchStart = (e: TouchEvent): void => {
      startX = e.touches[0].clientX
      startY = e.touches[0].clientY
      startTime = Date.now()
    }

    const onTouchEnd = (e: TouchEvent): void => {
      const touch = e.changedTouches[0]
      const dx = Math.abs(touch.clientX - startX)
      const dy = Math.abs(touch.clientY - startY)

      if (!isTapGesture(dx, dy, Date.now() - startTime)) return

      const time = getTimeAtPoint(touch.clientX, touch.clientY)
      const date = getDateAtPoint(touch.clientX)

      if (time && date) {
        handleDateSelect(buildSelectArg(date, time))
      }
    }

    el.addEventListener('touchstart', onTouchStart, { passive: true })
    el.addEventListener('touchend', onTouchEnd, { passive: true })

    return (): void => {
      el.removeEventListener('touchstart', onTouchStart)
      el.removeEventListener('touchend', onTouchEnd)
    }
  }, [handleDateSelect, isTouch, wrapperRef])
}
