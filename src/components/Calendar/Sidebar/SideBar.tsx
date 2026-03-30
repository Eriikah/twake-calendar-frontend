import { useScreenSizeDetection } from '@/useScreenSizeDetection'
import { CalendarApi } from '@fullcalendar/core'
import { Dispatch, MutableRefObject, SetStateAction } from 'react'
import { User } from '../../Attendees/PeopleSearch'
import { DesktopSidebar } from './DesktopSidebar'
import { TabletSidebar } from './TabletSidebar'

export interface CalendarSidebarProps {
  open: boolean
  onClose: () => void
  calendarRef: MutableRefObject<CalendarApi | null>
  isIframe?: boolean
  onCreateEvent: () => void
  onViewChange: (view: string) => void
  selectedMiniDate: Date
  setSelectedMiniDate: (date: Date) => void
  selectedCalendars: string[]
  setSelectedCalendars: Dispatch<SetStateAction<string[]>>
  tempUsers: User[]
  setTempUsers: Dispatch<SetStateAction<User[]>>
}

export default function Sidebar(sharedProps: CalendarSidebarProps) {
  const { isTablet } = useScreenSizeDetection()

  return isTablet ? (
    <TabletSidebar {...sharedProps} />
  ) : (
    <DesktopSidebar {...sharedProps} />
  )
}
