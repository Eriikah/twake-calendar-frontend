import { Button, Drawer } from '@linagora/twake-mui'
import CalendarViewDayOutlinedIcon from '@mui/icons-material/CalendarViewDayOutlined'
import CalendarViewMonthOutlinedIcon from '@mui/icons-material/CalendarViewMonthOutlined'
import CalendarViewWeekOutlinedIcon from '@mui/icons-material/CalendarViewWeekOutlined'
import { useI18n } from 'twake-i18n'
import { FieldWithLabel } from '../../Event/components/FieldWithLabel'
import { CalendarSidebarProps } from './SideBar'
import { SidebarCommonContent } from './SidebarCommonContent'

export function TabletSidebar({
  open,
  onClose,
  onViewChange,
  onCreateEvent,
  tempUsers,
  setTempUsers,
  selectedCalendars,
  setSelectedCalendars
}: CalendarSidebarProps) {
  const { t } = useI18n()
  const changeViewAndClose = (view: string) => {
    onViewChange(view)
    onClose()
  }

  return (
    <Drawer
      variant="temporary"
      open={open}
      onClose={onClose}
      className="sidebar"
      sx={{
        [`& .MuiDrawer-paper`]: {
          paddingTop: 2,
          paddingBottom: 3,
          paddingLeft: 3,
          paddingRight: 2,
          width: '270px',
          marginTop: 0
        },
        zIndex: 3000
      }}
      slotProps={{ paper: { className: 'sidebar' } }}
    >
      <FieldWithLabel label={t('sidebar.displayMode')} isExpanded={false}>
        <Button
          variant="text"
          onClick={() => changeViewAndClose('timeGridDay')}
          startIcon={<CalendarViewDayOutlinedIcon />}
        >
          {t('menubar.views.day')}
        </Button>
        <Button
          variant="text"
          onClick={() => changeViewAndClose('timeGridWeek')}
          startIcon={<CalendarViewWeekOutlinedIcon />}
        >
          {t('menubar.views.week')}
        </Button>
        <Button
          variant="text"
          onClick={() => changeViewAndClose('dayGridMonth')}
          startIcon={<CalendarViewMonthOutlinedIcon />}
        >
          {t('menubar.views.month')}
        </Button>
      </FieldWithLabel>

      <SidebarCommonContent
        onCreateEvent={onCreateEvent}
        tempUsers={tempUsers}
        setTempUsers={setTempUsers}
        selectedCalendars={selectedCalendars}
        setSelectedCalendars={setSelectedCalendars}
      />
    </Drawer>
  )
}
