import { getInitials, stringToGradient } from '@/utils/avatarUtils'
import { getUserDisplayName } from '@/utils/userUtils'
import {
  Avatar,
  Button,
  ButtonGroup,
  FormControl,
  IconButton,
  MenuItem,
  Popover,
  Select
} from '@linagora/twake-mui'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import HelpOutlineIcon from '@mui/icons-material/HelpOutline'
import RefreshIcon from '@mui/icons-material/Refresh'
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined'
import WidgetsOutlinedIcon from '@mui/icons-material/WidgetsOutlined'
import { useI18n } from 'twake-i18n'
import { CALENDAR_VIEWS } from '../Calendar/utils/constants'
import { AppIcon, AppIconProps } from './AppIcon'
import SearchBar from './EventSearchBar'
import { MainTitle } from './MainTitle'
import { SharedMenubarProps } from './Menubar'
import { UserMenu } from './UserMenu'

export function DesktopMenubar({
  calendarRef,
  currentView,
  isIframe,
  dateLabel,
  applist,
  supportLink,
  anchorEl,
  onAppMenuOpen,
  onAppMenuClose,
  onUserMenuOpen,
  onSettingsClick,
  onLogoutClick,
  onNavigate,
  onRefresh,
  onViewChange,
  onDateChange,
  user,
  userMenuAnchorEl,
  onUserMenuClose
}: SharedMenubarProps) {
  const { t } = useI18n()

  return (
    <header className="menubar">
      <div className="left-menu">
        {!isIframe && (
          <div className="menu-items">
            <MainTitle
              calendarRef={calendarRef}
              currentView={currentView}
              onViewChange={onViewChange}
              onDateChange={onDateChange}
            />
          </div>
        )}

        <div className="menu-items" style={{ marginLeft: '65px' }}>
          <div className="navigation-controls">
            <ButtonGroup
              variant="outlined"
              size="medium"
              sx={{
                '& button:first-of-type': { borderRadius: '12px 0 0 12px' },
                '& button:last-of-type': { borderRadius: '0 12px 12px 0' }
              }}
            >
              <Button
                sx={{ width: 20 }}
                onClick={() => onNavigate('prev')}
                aria-label={t('menubar.previous')}
                title={t('menubar.previous')}
              >
                <ChevronLeftIcon sx={{ height: 20 }} />
              </Button>
              <Button onClick={() => onNavigate('today')}>
                {t('menubar.today')}
              </Button>
              <Button
                sx={{ width: 20 }}
                onClick={() => onNavigate('next')}
                aria-label={t('menubar.next')}
                title={t('menubar.next')}
              >
                <ChevronRightIcon sx={{ height: 20 }} />
              </Button>
            </ButtonGroup>
          </div>
        </div>

        <div className="menu-items">
          <div className="current-date-time">
            <p>{dateLabel}</p>
          </div>
        </div>
      </div>

      <div className="right-menu">
        <div className="search-container">
          <SearchBar />
        </div>

        <div className="menu-items">
          <IconButton
            className="refresh-button"
            onClick={onRefresh}
            aria-label={t('menubar.refresh')}
            title={t('menubar.refresh')}
            sx={{ mr: 1 }}
          >
            <RefreshIcon />
          </IconButton>
        </div>

        <div className="menu-items">
          <FormControl
            size="small"
            style={{ minWidth: 120, marginRight: 16 }}
            className="select-display"
          >
            <Select
              value={currentView}
              onChange={e => onViewChange(e.target.value)}
              variant="outlined"
              aria-label={t('menubar.viewSelector')}
              sx={{
                borderRadius: '12px',
                marginLeft: '1',
                '& fieldset': { borderRadius: '12px' }
              }}
            >
              <MenuItem value={CALENDAR_VIEWS.dayGridMonth}>
                {t('menubar.views.month')}
              </MenuItem>
              <MenuItem value={CALENDAR_VIEWS.timeGridWeek}>
                {t('menubar.views.week')}
              </MenuItem>
              <MenuItem value={CALENDAR_VIEWS.timeGridDay}>
                {t('menubar.views.day')}
              </MenuItem>
            </Select>
          </FormControl>
        </div>

        {!isIframe && (
          <>
            {supportLink && (
              <div className="menu-items">
                <IconButton
                  component="a"
                  href={supportLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ marginRight: 8 }}
                  aria-label={t('menubar.help')}
                  title={t('menubar.help')}
                >
                  <HelpOutlineIcon />
                </IconButton>
              </div>
            )}

            <div className="menu-items">
              {applist.length > 0 && (
                <IconButton
                  onClick={onAppMenuOpen}
                  style={{ marginRight: 8 }}
                  aria-label={t('menubar.apps')}
                  title={t('menubar.apps')}
                >
                  <WidgetsOutlinedIcon />
                </IconButton>
              )}
            </div>
          </>
        )}

        <div className="menu-items">
          <IconButton
            onClick={!isIframe ? onUserMenuOpen : onSettingsClick}
            aria-label={
              isIframe ? t('menubar.settings') : t('menubar.userProfile')
            }
            title={isIframe ? t('menubar.settings') : t('menubar.userProfile')}
          >
            {!isIframe ? (
              <Avatar
                color={stringToGradient(getUserDisplayName(user))}
                size="m"
              >
                {getInitials(getUserDisplayName(user))}
              </Avatar>
            ) : (
              <SettingsOutlinedIcon />
            )}
          </IconButton>
        </div>
      </div>

      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={onAppMenuClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{
          sx: { minWidth: 230, mt: 2, p: '14px 8px', borderRadius: '14px' }
        }}
      >
        <div className="app-grid">
          {applist.map((prop: AppIconProps) => (
            <AppIcon key={prop.name} prop={prop} />
          ))}
        </div>
      </Popover>

      <UserMenu
        open={Boolean(userMenuAnchorEl)}
        anchorEl={userMenuAnchorEl}
        onClose={onUserMenuClose}
        onSettingsClick={onSettingsClick}
        onLogoutClick={onLogoutClick}
        user={user}
      />
    </header>
  )
}
