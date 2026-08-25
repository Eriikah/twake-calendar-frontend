import { Tooltip } from '@linagora/twake-mui'
import AccessTimeFilledIcon from '@mui/icons-material/AccessTimeFilled'
import HelpOutlineOutlinedIcon from '@mui/icons-material/HelpOutlineOutlined'
import { useI18n } from 'twake-i18n'
import { FreeBusyStatus } from './useFreeBusy'

interface FreeBusyIndicatorProps {
  status: FreeBusyStatus
  size?: number
}

export const FreeBusyIndicator: React.FC<FreeBusyIndicatorProps> = ({
  status
}) => {
  const { t } = useI18n()
  if (!['busy', 'unknown', 'contact'].includes(status)) return null

  const StatusIcon =
    status === 'busy' ? AccessTimeFilledIcon : HelpOutlineOutlinedIcon

  return (
    <Tooltip
      title={
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {t(`event.freeBusy.${status}`)}
        </span>
      }
      leaveDelay={2000}
      placement="bottom-start"
      slotProps={{ tooltip: { sx: { opacity: 1, bgcolor: 'grey.900' } } }}
    >
      <StatusIcon
        aria-label={t(`event.freeBusy.${status}`)}
        sx={{ color: status === 'busy' ? 'warning.main' : undefined }}
        style={{
          margin: '0 -6px 0 5px',
          flexShrink: 0
        }}
      />
    </Tooltip>
  )
}
