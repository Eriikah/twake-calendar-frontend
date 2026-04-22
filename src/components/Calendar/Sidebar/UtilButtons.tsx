import { IconButton, Box } from '@linagora/twake-mui'
import HelpOutlineIcon from '@mui/icons-material/HelpOutline'
import { useI18n } from 'twake-i18n'
import { AppListMenu } from '@/components/Menubar/AppListMenu'
import { UserMenu } from '@/components/Menubar/UserMenu'
import { useAppSelector } from '@/app/hooks'
import { useUtilMenus } from '../hooks/useUtilMenus'

export const UtilButtons: React.FC<{ isIframe?: boolean }> = ({ isIframe }) => {
  const { t } = useI18n()
  const user = useAppSelector(state => state.user.userData)

  const {
    anchorEl,
    supportLink,
    userMenuAnchorEl,
    handleAppMenuOpen,
    handleAppMenuClose,
    handleUserMenuOpen,
    handleUserMenuClose,
    handleSettingsClick,
    handleLogoutClick
  } = useUtilMenus()

  return (
    <Box display="flex" alignItems="center">
      {supportLink && (
        <IconButton
          component="a"
          href={supportLink}
          target="_blank"
          rel="noopener noreferrer"
          style={{ marginRight: 4 }}
          aria-label={t('menubar.help')}
          title={t('menubar.help')}
        >
          <HelpOutlineIcon fontSize="small" />
        </IconButton>
      )}

      <AppListMenu
        anchorEl={anchorEl}
        onAppMenuOpen={handleAppMenuOpen}
        onAppMenuClose={handleAppMenuClose}
        iconSize="small"
      />

      <UserMenu
        anchorEl={userMenuAnchorEl}
        onClose={handleUserMenuClose}
        onSettingsClick={handleSettingsClick}
        onLogoutClick={() => void handleLogoutClick()}
        onUserMenuOpen={handleUserMenuOpen}
        isIframe={isIframe}
        user={user}
        size="s"
      />
    </Box>
  )
}
