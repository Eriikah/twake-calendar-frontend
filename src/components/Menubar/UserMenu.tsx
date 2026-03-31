import { userData } from '@/features/User/userDataTypes'
import { getInitials, stringToGradient } from '@/utils/avatarUtils'
import { getUserDisplayName } from '@/utils/userUtils'
import {
  alpha,
  Avatar,
  Box,
  Divider,
  Menu,
  MenuItem,
  Typography,
  useTheme
} from '@linagora/twake-mui'
import LogoutIcon from '@mui/icons-material/Logout'
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined'
import { useI18n } from 'twake-i18n'

export type UserMenuProps = {
  open: boolean
  anchorEl: HTMLElement | null
  onClose: () => void
  onSettingsClick: () => void
  onLogoutClick: () => void
  user: userData | null
}

export function UserMenu({
  open,
  anchorEl,
  onClose,
  onSettingsClick,
  onLogoutClick,
  user
}: UserMenuProps) {
  const { t } = useI18n()
  const theme = useTheme()

  return (
    <Menu
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      PaperProps={{
        sx: {
          minWidth: 280,
          mt: 1,
          padding: '0 !important',
          borderRadius: '14px'
        }
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '24px'
        }}
      >
        <Avatar
          color={stringToGradient(getUserDisplayName(user))}
          size="l"
          sx={{ marginBottom: '8px' }}
        >
          {getInitials(getUserDisplayName(user))}
        </Avatar>
        <Typography
          sx={{
            color: theme.palette.grey[900],
            fontFamily: 'Inter',
            fontSize: 22,
            fontWeight: 600
          }}
        >
          {getUserDisplayName(user)}
        </Typography>
        <Typography sx={{ fontSize: 14, fontWeight: 500 }}>
          {user?.email}
        </Typography>
      </Box>
      <MenuItem onClick={onSettingsClick} sx={{ py: 1.5 }}>
        <SettingsOutlinedIcon
          sx={{
            mr: 2,
            color: alpha(theme.palette.grey.A900, 0.48),
            fontSize: 20
          }}
        />
        {t('menubar.settings') || 'Settings'}
      </MenuItem>
      <Divider />
      <MenuItem onClick={onLogoutClick} sx={{ py: 1.5 }}>
        <LogoutIcon
          sx={{
            mr: 2,
            color: alpha(theme.palette.grey.A900, 0.48),
            fontSize: 20
          }}
        />
        {t('menubar.logout') || 'Logout'}
      </MenuItem>
    </Menu>
  )
}
