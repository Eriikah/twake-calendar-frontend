import { useRef, useState, useEffect, MutableRefObject, RefObject } from 'react'
import { CalendarApi } from '@fullcalendar/core'
import { useSwipeAnimation } from './useSwipeAnimation'

interface UseSwipeCalendarProps {
  calendarRef: MutableRefObject<CalendarApi | null>
  containerRef: RefObject<HTMLElement>
  isMobile: boolean
}

interface SwipeCalendarReturn {
  offsetX: number
  isAnimating: boolean
}

const isHorizontalSwipe = (dx: number, dy: number): boolean =>
  Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 10

const getSwipeTarget = (
  offsetX: number,
  containerWidth: number
): number | null => {
  if (Math.abs(offsetX) <= containerWidth * 0.1) return null
  return offsetX > 0 ? containerWidth : -containerWidth
}

const handleTouchMove = (
  e: TouchEvent,
  touchStartRef: React.MutableRefObject<{ x: number; y: number } | null>,
  isHorizontalRef: React.MutableRefObject<boolean>,
  setOffsetX: (dx: number) => void
): void => {
  if (!touchStartRef.current) return
  const dx = e.touches[0].clientX - touchStartRef.current.x
  const dy = e.touches[0].clientY - touchStartRef.current.y
  if (!isHorizontalRef.current)
    isHorizontalRef.current = isHorizontalSwipe(dx, dy)
  if (isHorizontalRef.current && e.cancelable) {
    e.preventDefault()
    setOffsetX(dx)
  }
}

const handleTouchEnd = ({
  touchStartRef,
  isHorizontalRef,
  calendarRef,
  offsetX,
  containerWidth,
  setOffsetX,
  finalizeSwipe,
  cancelSwipe
}: {
  touchStartRef: React.MutableRefObject<{ x: number; y: number } | null>
  isHorizontalRef: React.MutableRefObject<boolean>
  calendarRef: MutableRefObject<CalendarApi | null>
  offsetX: number
  containerWidth: number
  setOffsetX: (dx: number) => void
  finalizeSwipe: (target: number, currentOffset: number) => void
  cancelSwipe: () => void
}): void => {
  const hasValidTouch = touchStartRef.current && calendarRef.current
  if (!hasValidTouch) {
    setOffsetX(0)
    touchStartRef.current = null
    isHorizontalRef.current = false
    return
  }
  if (isHorizontalRef.current) {
    const target = getSwipeTarget(offsetX, containerWidth)
    if (target !== null) finalizeSwipe(target, offsetX)
    else cancelSwipe()
  }
  touchStartRef.current = null
  isHorizontalRef.current = false
}

export const useSwipeCalendar = ({
  calendarRef,
  containerRef,
  isMobile
}: UseSwipeCalendarProps): SwipeCalendarReturn => {
  const { offsetX, isAnimating, setOffsetX, finalizeSwipe, cancelSwipe } =
    useSwipeAnimation(calendarRef)
  const [containerWidth, setContainerWidth] = useState(0)
  const touchStartRef = useRef<{ x: number; y: number } | null>(null)
  const isHorizontalRef = useRef<boolean>(false)

  useEffect(() => {
    const el = containerRef.current
    if (!el || !isMobile) return

    const onTouchStart = (e: TouchEvent): void => {
      setContainerWidth(el.getBoundingClientRect().width)
      touchStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY
      }
      isHorizontalRef.current = false
    }

    const onTouchMove = (e: TouchEvent): void =>
      handleTouchMove(e, touchStartRef, isHorizontalRef, setOffsetX)

    const onTouchEnd = (): void =>
      handleTouchEnd({
        touchStartRef,
        isHorizontalRef,
        calendarRef,
        offsetX,
        containerWidth,
        setOffsetX,
        finalizeSwipe,
        cancelSwipe
      })

    el.addEventListener('touchstart', onTouchStart, { passive: true })
    el.addEventListener('touchmove', onTouchMove, { passive: false })
    el.addEventListener('touchend', onTouchEnd, { passive: true })

    return (): void => {
      el.removeEventListener('touchstart', onTouchStart)
      el.removeEventListener('touchmove', onTouchMove)
      el.removeEventListener('touchend', onTouchEnd)
    }
  }, [
    containerRef,
    isMobile,
    offsetX,
    containerWidth,
    setOffsetX,
    finalizeSwipe,
    cancelSwipe,
    calendarRef
  ])

  return { offsetX, isAnimating }
}
