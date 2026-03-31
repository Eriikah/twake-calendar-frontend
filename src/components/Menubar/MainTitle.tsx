import { useAppDispatch } from '@/app/hooks'
import { setView } from '@/features/Settings/SettingsSlice'
import logo from '@/static/header-logo.svg'
import { CalendarApi } from '@fullcalendar/core'
import { Button } from '@linagora/twake-mui'
import React from 'react'
import { useI18n } from 'twake-i18n'
import { CALENDAR_VIEWS } from '../Calendar/utils/constants'

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

    if (currentView !== CALENDAR_VIEWS.timeGridWeek) {
      calendarRef.current.changeView(CALENDAR_VIEWS.timeGridWeek)
      if (onViewChange) {
        onViewChange(CALENDAR_VIEWS.timeGridWeek)
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
      <Button
        onClick={handleLogoClick}
        aria-label={t('menubar.logoAlt')}
        style={{ background: 'none', border: 0, padding: 0, cursor: 'pointer' }}
      >
        <img
          className="logo"
          src={logo}
          alt={t('menubar.logoAlt')}
          onClick={handleLogoClick}
        />
      </Button>
    </div>
  )
}
