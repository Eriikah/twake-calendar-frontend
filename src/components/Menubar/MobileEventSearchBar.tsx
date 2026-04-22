import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { selectCalendars } from '@/app/selectors/selectCalendars'
import { searchEventsAsync } from '@/features/Search/SearchSlice'
import { setView } from '@/features/Settings/SettingsSlice'
import { userAttendee } from '@/features/User/models/attendee'
import { createAttendee } from '@/features/User/models/attendee.mapper'
import { extractEventBaseUuid } from '@/utils/extractEventBaseUuid'
import {
  Box,
  IconButton,
  InputAdornment,
  TextField,
  type AutocompleteRenderInputParams
} from '@linagora/twake-mui'
import HighlightOffIcon from '@mui/icons-material/HighlightOff'
import SearchIcon from '@mui/icons-material/Search'
import { useCallback, useState } from 'react'
import { useI18n } from 'twake-i18n'
import { PeopleSearch } from '../Attendees/PeopleSearch'
import { User } from '../Attendees/types'
import { SearchState } from '../Calendar/utils/tempSearchUtil'
import { MobileSearchDialog } from './MobileSearchDialog'

const SEARCH_OBJECT_TYPES = ['user', 'contact']

const MobileSearchBar: React.FC = () => {
  const { t } = useI18n()
  const dispatch = useAppDispatch()
  const calendars = useAppSelector(selectCalendars)
  const userId = useAppSelector(state => state.user.userData?.openpaasId)
  const personnalCalendars = userId
    ? calendars.filter(c => extractEventBaseUuid(c.id) === userId)
    : []

  const [dialogOpen, setDialogOpen] = useState(true)
  const [, setSearch] = useState('')
  const [searchState, setSearchState] = useState<SearchState>({
    query: '',
    options: [] as User[],
    loading: false
  })
  const [selectedContacts, setSelectedContacts] = useState<User[]>([])

  const [filters, setFilters] = useState({
    searchIn: 'my-calendars',
    keywords: '',
    organizers: [] as userAttendee[],
    attendees: [] as userAttendee[]
  })

  const [, setFilterError] = useState(false)

  function buildQuery(
    searchQuery: string,
    filters: {
      searchIn: string
      keywords: string
      organizers: userAttendee[]
      attendees: userAttendee[]
    }
  ):
    | {
        search: string
        filters: {
          keywords: string
          organizers: string[]
          attendees: string[]
          searchIn: string[]
        }
      }
    | undefined {
    const trimmedSearch = searchQuery.trim()
    const trimmedKeywords = filters.keywords.trim()

    const hasSearchCriteria =
      trimmedSearch ||
      trimmedKeywords ||
      filters.organizers.length > 0 ||
      filters.attendees.length > 0

    if (!hasSearchCriteria) return undefined

    const searchInCalendars = !filters.searchIn
      ? calendars.map(c => c.id)
      : filters.searchIn === 'my-calendars'
        ? personnalCalendars.map(c => c.id)
        : [filters.searchIn]

    return {
      search: trimmedSearch,
      filters: {
        keywords: trimmedKeywords,
        organizers: filters.organizers.map(u => u.cal_address),
        attendees: filters.attendees.map(u => u.cal_address),
        searchIn: searchInCalendars
      }
    }
  }

  const handleSearchChange = useCallback(
    ({ query, options, loading }: SearchState): void => {
      setDialogOpen(true)
      setSearchState(prev => ({
        query: query ?? '',
        options: options ?? prev.options,
        loading: loading ?? prev.loading
      }))
    },
    []
  )

  const handleContactSelect = (contacts: User[]): void => {
    const organizers = contacts.map(contact =>
      createAttendee({
        cal_address: contact.email,
        cn: contact.displayName
      })
    )

    setSelectedContacts(contacts)
    setSearch('')
    setSearchState({ query: '', options: [], loading: false })

    if (contacts.length > 0) {
      void handleSearch('', {
        ...filters,
        organizers
      })
    }
  }

  const handleSearch = async (
    searchQuery: string,
    currentFilters: typeof filters
  ): Promise<void> => {
    const cleanedQuery = buildQuery(searchQuery, currentFilters)
    if (cleanedQuery) {
      await dispatch(searchEventsAsync(cleanedQuery))
      dispatch(setView('search'))
      setDialogOpen(false)
    } else {
      setFilterError(true)
    }
  }

  return (
    <>
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          transition: 'width 0.25s ease-out'
        }}
      >
        <PeopleSearch
          selectedUsers={selectedContacts}
          onChange={(_event, users) => {
            handleContactSelect(users)
          }}
          hideOptions
          inputValue={searchState.query}
          onSearchStateChange={handleSearchChange}
          objectTypes={SEARCH_OBJECT_TYPES}
          onToggleEventPreview={() => {}}
          customRenderInput={(
            params: AutocompleteRenderInputParams,
            query: string,
            setQuery: (value: string) => void
          ) => (
            <TextField
              {...params}
              fullWidth
              autoFocus
              placeholder={t('common.search')}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  void handleSearch(query, filters)
                }
              }}
              onChange={e => {
                const value = e.target.value
                setQuery(value)
                setSearch(value)
              }}
              variant="outlined"
              sx={{
                borderRadius: '999px',
                '& .MuiInputBase-input': { padding: '12px 10px' },
                animation: 'scaleIn 0.25s ease-out',
                '@keyframes scaleIn': {
                  from: { transform: 'scaleX(0)', opacity: 0 },
                  to: { transform: 'scaleX(1)', opacity: 1 }
                },
                transformOrigin: 'right',
                '& .MuiOutlinedInput-root': {
                  borderRadius: '999px',
                  height: 40,
                  padding: '0 10px'
                }
              }}
              InputProps={{
                ...params.InputProps,
                startAdornment: (
                  <>
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: '#605D62' }} />
                    </InputAdornment>
                    {params.InputProps.startAdornment}
                  </>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    {(query || selectedContacts.length > 0) && (
                      <IconButton
                        aria-label={t('common.clear')}
                        onClick={() => {
                          setQuery('')
                          setSearch('')
                          setFilters(prev => ({
                            ...prev,
                            keywords: '',
                            attendees: [],
                            organizers: []
                          }))
                          setSelectedContacts([])
                        }}
                      >
                        <HighlightOffIcon />
                      </IconButton>
                    )}
                  </InputAdornment>
                )
              }}
            />
          )}
        />
      </Box>

      <MobileSearchDialog
        open={dialogOpen}
        onShow={() => {
          if (searchState.query) {
            void handleSearch(searchState.query, filters)
          }
          setDialogOpen(false)
        }}
        options={searchState.options ?? []}
        selectedUsers={selectedContacts}
        onOptionClick={user =>
          handleContactSelect([
            ...selectedContacts,
            { displayName: user.displayName, email: user.email }
          ])
        }
      />
    </>
  )
}

export default MobileSearchBar
