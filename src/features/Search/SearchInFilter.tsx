import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { selectCalendars } from '@/app/selectors/selectCalendars'
import { CalendarItemList } from '@/components/Calendar/CalendarItemList'
import { CalendarName } from '@/components/Calendar/CalendarName'
import {
  MobileSelector,
  MobileSelectorHandle
} from '@/components/MobileSelector'
import { setFilters } from '@/features/Search/SearchSlice'
import { extractEventBaseUuid } from '@/utils/extractEventBaseUuid'
import {
  Box,
  Divider,
  InputLabel,
  List,
  ListItemButton,
  ListItemText,
  MenuItem,
  Select,
  Typography
} from '@linagora/twake-mui'
import { useRef } from 'react'
import { useI18n } from 'twake-i18n'

interface Props {
  mode: 'popover' | 'mobile'
}

export const SearchInFilter: React.FC<Props> = ({ mode }) => {
  const { t } = useI18n()
  const dispatch = useAppDispatch()
  const filters = useAppSelector(
    state => state.searchResult.searchParams.filters
  )
  const calendars = useAppSelector(selectCalendars)
  const userId = useAppSelector(state => state.user.userData?.openpaasId)
  const personalCalendars = userId
    ? calendars.filter(c => extractEventBaseUuid(c.id) === userId)
    : []

  const selectorRef = useRef<MobileSelectorHandle>(null)

  const handleSelect = (value: string) => {
    dispatch(setFilters({ searchIn: value }))
    selectorRef.current?.onClose()
  }

  if (mode === 'mobile') {
    const getDisplayLabel = () => {
      if (!filters.searchIn) {
        return t('search.filter.allCalendar')
      }

      if (filters.searchIn === 'my-calendars') {
        return t('search.filter.myCalendar')
      }

      const selectedCalendar = (
        <CalendarName
          calendar={
            personalCalendars.find(c => c.id === filters.searchIn) ?? {}
          }
        />
      )

      return selectedCalendar ? selectedCalendar : t('search.searchIn')
    }
    return (
      <MobileSelector ref={selectorRef} displayText={getDisplayLabel()}>
        <List>
          <ListItemButton
            selected={filters.searchIn === ''}
            onClick={() => handleSelect('')}
          >
            <ListItemText primary={t('search.filter.allCalendar')} />
          </ListItemButton>

          <Divider />

          <ListItemButton
            selected={filters.searchIn === 'my-calendars'}
            onClick={() => handleSelect('my-calendars')}
          >
            <ListItemText primary={t('search.filter.myCalendar')} />
          </ListItemButton>

          {personalCalendars.map(c => (
            <ListItemButton
              key={c.id}
              selected={filters.searchIn === c.id}
              onClick={() => handleSelect(c.id)}
            >
              <CalendarName calendar={c} />
            </ListItemButton>
          ))}
        </List>
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
      <InputLabel sx={{ m: 0 }}>{t('search.searchIn')}</InputLabel>
      <Select
        displayEmpty
        value={filters.searchIn}
        onChange={e => dispatch(setFilters({ searchIn: e.target.value }))}
        sx={{ height: '40px' }}
      >
        <MenuItem value="">
          <Typography sx={{ color: '#243B55', fontSize: '16px' }}>
            {t('search.filter.allCalendar')}
          </Typography>
        </MenuItem>
        <Divider />
        <MenuItem
          value="my-calendars"
          sx={{ color: '#243B55', fontSize: '12px' }}
        >
          {t('search.filter.myCalendar')}
        </MenuItem>
        {CalendarItemList(personalCalendars)}
      </Select>{' '}
    </Box>
  )
}
