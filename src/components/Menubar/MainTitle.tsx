import { useAppDispatch } from '@/app/hooks'
import { setView } from '@/features/Settings/SettingsSlice'
import logo from '@/static/header-logo.svg'
import { CalendarApi } from '@fullcalendar/core'
import React from 'react'
import { useI18n } from 'twake-i18n'

export type MainTitleProps = {
  calendarRef: React.RefObject<CalendarApi | null>
  currentView: string
  onViewChange?: (view: string) => void
  onDateChange?: (date: Date) => void
}

export function MainTitle({
  calendarRef,
  currentView,
  onViewChange,
  onDateChange
}: MainTitleProps) {
  const { t } = useI18n()
  const dispatch = useAppDispatch()

  const handleLogoClick = async () => {
    if (!calendarRef.current) return

    await dispatch(setView('calendar'))

    if (currentView !== 'timeGridWeek') {
      calendarRef.current.changeView('timeGridWeek')
      if (onViewChange) {
        onViewChange('timeGridWeek')
      }
    }

    calendarRef.current.today()

    if (onDateChange) {
      const newDate = calendarRef.current.getDate()
      onDateChange(newDate)
    }
  }

  return (
    <div className="menubar-item tc-home">
      <img
        className="logo"
        src={logo}
        alt={t('menubar.logoAlt')}
        onClick={handleLogoClick}
      />
    </div>
  )
}
