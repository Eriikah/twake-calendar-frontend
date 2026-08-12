import { useAppSelector } from '@common/app/hooks'
import { Calendar } from '@common/types/CalendarTypes'
import { defaultColors } from '@common/utils/defaultColors'
import { makeDisplayName } from '@common/utils/makeDisplayName'
import { renameDefault } from '@common/utils/renameDefault'
import { Box, Typography } from '@linagora/twake-mui'
import SquareRoundedIcon from '@mui/icons-material/SquareRounded'
import { useI18n } from 'twake-i18n'
import { OwnerCaption } from './OwnerCaption'
import { ResourceIcon } from '@common/components/Attendees/ResourceIcon'

export const CalendarName: React.FC<{ calendar: Calendar }> = ({
  calendar
}) => {
  const userData = useAppSelector(state => state.user.userData)
  const { t } = useI18n()

  const ownerId = calendar.id.split('/')[0]
  const ownerDisplayName = makeDisplayName(calendar) ?? ''
  const isOwnCalendar = userData.openpaasId === ownerId
  const isResource = calendar.owner?.resource
  const isTeamCalendar = calendar.owner?.teamCalendar
  const showCaption =
    calendar.name !== '#default' &&
    !isOwnCalendar &&
    !isResource &&
    !isTeamCalendar

  return (
    <Box
      style={{
        display: 'flex',
        flexDirection: 'row',
        gap: '16px',
        alignItems: 'center'
      }}
    >
      {isResource ? (
        <ResourceIcon
          colorIcon
          avatarUrl={calendar.owner.resourceIcon}
          color={calendar.color?.light ?? defaultColors[0].light}
        />
      ) : (
        <SquareRoundedIcon
          style={{
            color: calendar.color?.light ?? defaultColors[0].light,
            width: 24,
            height: 24
          }}
        />
      )}
      <Box style={{ display: 'flex', flexDirection: 'column' }}>
        <Typography variant="body2" sx={{ overflowWrap: 'break-word' }}>
          {renameDefault(calendar.name, ownerDisplayName, t, isOwnCalendar)}
        </Typography>
        <OwnerCaption
          showCaption={showCaption}
          ownerDisplayName={ownerDisplayName}
        />
      </Box>
    </Box>
  )
}
