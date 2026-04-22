import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { selectCalendars } from '@/app/selectors/selectCalendars'
import { searchEventsAsync } from '@/features/Search/SearchSlice'
import { setView } from '@/features/Settings/SettingsSlice'
import { userAttendee } from '@/features/User/models/attendee'
import { createAttendee } from '@/features/User/models/attendee.mapper'
import { extractEventBaseUuid } from '@/utils/extractEventBaseUuid'
import { useCallback, useState } from 'react'
import { User } from '../Attendees/types'
import { SearchState } from '../Calendar/utils/tempSearchUtil'

type Filters = {
  searchIn: string
  keywords: string
  organizers: userAttendee[]
  attendees: userAttendee[]
}

function getSearchInCalendars(
  searchIn: string,
  allIds: string[],
  personalIds: string[]
): string[] {
  if (!searchIn) return allIds
  if (searchIn === 'my-calendars') return personalIds
  return [searchIn]
}

function buildQuery(
  searchQuery: string,
  filters: Filters,
  allIds: string[],
  personalIds: string[]
) {
  const trimmedSearch = searchQuery.trim()
  const trimmedKeywords = filters.keywords.trim()
  const hasSearchCriteria =
    trimmedSearch ||
    trimmedKeywords ||
    filters.organizers.length > 0 ||
    filters.attendees.length > 0
  if (!hasSearchCriteria) return undefined
  return {
    search: trimmedSearch,
    filters: {
      keywords: trimmedKeywords,
      organizers: filters.organizers.map(u => u.cal_address),
      attendees: filters.attendees.map(u => u.cal_address),
      searchIn: getSearchInCalendars(filters.searchIn, allIds, personalIds)
    }
  }
}

export function useMobileSearch() {
  const dispatch = useAppDispatch()
  const calendars = useAppSelector(selectCalendars)
  const userId = useAppSelector(state => state.user.userData?.openpaasId)
  const personalCalendars = userId
    ? calendars.filter(c => extractEventBaseUuid(c.id) === userId)
    : []

  const [dialogOpen, setDialogOpen] = useState(true)
  const [inputQuery, setInputQuery] = useState('')
  const [searchState, setSearchState] = useState<SearchState>({
    query: '',
    options: [] as User[],
    loading: false
  })
  const [selectedContacts, setSelectedContacts] = useState<User[]>([])
  const [filters, setFilters] = useState<Filters>({
    searchIn: 'my-calendars',
    keywords: '',
    organizers: [],
    attendees: []
  })

  const handleSearch = useCallback(
    async (searchQuery: string, currentFilters: Filters): Promise<void> => {
      const query = buildQuery(
        searchQuery,
        currentFilters,
        calendars.map(c => c.id),
        personalCalendars.map(c => c.id)
      )
      if (!query) return
      await dispatch(searchEventsAsync(query))
      dispatch(setView('search'))
      setDialogOpen(false)
    },
    [dispatch, calendars, personalCalendars]
  )

  const handleSearchChange = useCallback(
    ({ query, options, loading }: SearchState): void => {
      if (!query) {
        setDialogOpen(false)
        setSearchState({ query: '', options: [], loading: false })
        return
      }
      setDialogOpen(true)
      setSearchState(prev => ({
        query,
        options: options ?? prev.options,
        loading: loading ?? prev.loading
      }))
    },
    []
  )

  const handleContactSelect = useCallback(
    (contacts: User[]): void => {
      const organizers = contacts.map(c =>
        createAttendee({ cal_address: c.email, cn: c.displayName })
      )
      setSelectedContacts(contacts)
      setInputQuery('')
      setSearchState({ query: '', options: [], loading: false })
      if (contacts.length > 0) {
        void handleSearch('', { ...filters, organizers })
      }
    },
    [filters, handleSearch]
  )

  const clearAll = useCallback((): void => {
    setInputQuery('')
    setSelectedContacts([])
    setSearchState({ query: '', options: [], loading: false })
    setFilters(prev => ({
      ...prev,
      keywords: '',
      attendees: [],
      organizers: []
    }))
    setDialogOpen(false)
  }, [])

  const handleShow = useCallback((): void => {
    if (inputQuery) void handleSearch(inputQuery, filters)
    setDialogOpen(false)
  }, [inputQuery, filters, handleSearch])

  return {
    dialogOpen,
    inputQuery,
    setInputQuery,
    searchState,
    selectedContacts,
    filters,
    handleSearch,
    handleSearchChange,
    handleContactSelect,
    clearAll,
    handleShow
  }
}
