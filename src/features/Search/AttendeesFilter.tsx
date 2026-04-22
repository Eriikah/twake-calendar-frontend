import { useAppDispatch, useAppSelector } from '@/app/hooks'
import UserSearch from '@/components/Attendees/AttendeeSearch'
import { MobileSelector } from '@/components/MobileSelector'
import { setFilters } from '@/features/Search/SearchSlice'
import { userAttendee } from '@/features/User/models/attendee'
import { Box, InputLabel } from '@linagora/twake-mui'
import { useI18n } from 'twake-i18n'

interface Props {
  mode: 'popover' | 'mobile'
  onErrorClear?: () => void
}

export const AttendeesFilter: React.FC<Props> = ({ mode, onErrorClear }) => {
  const { t } = useI18n()
  const dispatch = useAppDispatch()
  const filters = useAppSelector(
    state => state.searchResult.searchParams.filters
  )

  const search = (
    <UserSearch
      attendees={filters.attendees}
      setAttendees={(users: userAttendee[]) => {
        dispatch(setFilters({ attendees: users }))
        if (users.length > 0) onErrorClear?.()
      }}
    />
  )

  if (mode === 'mobile') {
    return (
      <MobileSelector ref={null} displayText={t('search.participants')}>
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
      <InputLabel sx={{ m: 0 }}>{t('search.participants')}</InputLabel>
      {search}
    </Box>
  )
}
