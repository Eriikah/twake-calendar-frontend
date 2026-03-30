import { getInitials, stringToGradient } from '@/utils/avatarUtils'
import { getUserDisplayName } from '@/utils/userUtils'
import { Avatar, Button, ButtonGroup, IconButton } from '@linagora/twake-mui'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import MenuIcon from '@mui/icons-material/Menu'
import RefreshIcon from '@mui/icons-material/Refresh'
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined'
import TodayIcon from '@mui/icons-material/Today'
import { useI18n } from 'twake-i18n'
import SearchBar from './EventSearchBar'
import { SharedMenubarProps } from './Menubar'
import { MainTitle } from './MainTitle'
import { UserMenu } from './UserMenu'

export function TabletMenubar({
  calendarRef,
  currentView,
  isIframe,
  dateLabel,
  onUserMenuOpen,
  onSettingsClick,
  onLogoutClick,
  onNavigate,
  onRefresh,
  onToggleSidebar,
  user,
  userMenuAnchorEl,
  onUserMenuClose,
  onViewChange,
  onDateChange
}: SharedMenubarProps) {
  const { t } = useI18n()

  return (
    <header className="menubar">
      <div className="left-menu">
        <IconButton
          onClick={onToggleSidebar}
          aria-label={t('menubar.toggleSidebar')}
          title={t('menubar.toggleSidebar')}
        >
          <MenuIcon />
        </IconButton>

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

        <div className="menu-items" style={{ marginLeft: 0 }}>
          <div className="navigation-controls">
            <ButtonGroup
              size="medium"
              sx={{
                '& button:first-of-type': { borderRadius: '12px 0 0 12px' },
                '& button:last-of-type': { borderRadius: '0 12px 12px 0' }
              }}
            >
              <Button sx={{ width: 20 }} onClick={() => onNavigate('prev')}>
                <ChevronLeftIcon sx={{ height: 20 }} />
              </Button>
              <Button variant="outlined" onClick={() => onNavigate('today')}>
                <TodayIcon />
              </Button>
              <Button sx={{ width: 20 }} onClick={() => onNavigate('next')}>
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
          <IconButton
            onClick={!isIframe ? onUserMenuOpen : onSettingsClick}
            aria-label={isIframe ? t('menubar.settings') : undefined}
          >
            {!isIframe ? (
              <Avatar
                color={stringToGradient(getUserDisplayName(user))}
                size="m"
                aria-label={t('menubar.userProfile')}
              >
                {getInitials(getUserDisplayName(user))}
              </Avatar>
            ) : (
              <SettingsOutlinedIcon />
            )}
          </IconButton>
        </div>
      </div>

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
