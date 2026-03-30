import { Box } from '@linagora/twake-mui'
import CalendarSelection from '../CalendarSelection'
import { TempCalendarsInput } from '../TempCalendarsInput'
import { CalendarSidebarProps } from './SideBar'

export function SidebarCommonContent({
  onCreateEvent,
  tempUsers,
  setTempUsers,
  selectedCalendars,
  setSelectedCalendars
}: Pick<
  CalendarSidebarProps,
  | 'onCreateEvent'
  | 'tempUsers'
  | 'setTempUsers'
  | 'selectedCalendars'
  | 'setSelectedCalendars'
>) {
  return (
    <>
      <Box sx={{ mb: 3, mt: 2 }}>
        <TempCalendarsInput
          tempUsers={tempUsers}
          setTempUsers={setTempUsers}
          handleToggleEventPreview={onCreateEvent}
        />
      </Box>
      <Box className="calendarList">
        <CalendarSelection
          selectedCalendars={selectedCalendars}
          setSelectedCalendars={setSelectedCalendars}
        />
      </Box>
    </>
  )
}
