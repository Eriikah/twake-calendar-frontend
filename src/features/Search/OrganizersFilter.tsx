import { useAppDispatch, useAppSelector } from '@/app/hooks'
import UserSearch from '@/components/Attendees/AttendeeSearch'
import { MobileSelector } from '@/components/MobileSelector'
import { Box, InputLabel } from '@linagora/twake-mui'
import { useI18n } from 'twake-i18n'
import { userAttendee } from '../User/models/attendee'
import { setFilters } from './SearchSlice'

interface Props {
  mode: 'popover' | 'mobile'
  onErrorClear?: () => void
}

export const OrganizersFilter: React.FC<Props> = ({ mode, onErrorClear }) => {
  const { t } = useI18n()
  const dispatch = useAppDispatch()
  const filters = useAppSelector(
    state => state.searchResult.searchParams.filters
  )

  const search = (
    <UserSearch
      attendees={filters.organizers}
      setAttendees={(users: userAttendee[]) => {
        dispatch(setFilters({ organizers: users }))
        if (users.length > 0) onErrorClear?.()
      }}
    />
  )

  if (mode === 'mobile') {
    return (
      <MobileSelector ref={null} displayText={t('search.organizers')}>
        <Box sx={{ p: 2 }}>{search}</Box>
      </MobileSelector>
    )
  }

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: '140px 1fr',
        gap: 2,
        alignItems: 'center'
      }}
    >
      <InputLabel sx={{ m: 0 }}>{t('search.organizers')}</InputLabel>
      {search}
    </Box>
  )
}
