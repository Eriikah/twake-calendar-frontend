import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { selectCalendars } from '@/app/selectors/selectCalendars'
import { Calendar } from '@/features/Calendars/CalendarTypes'
import {
    clearFilters,
    searchEventsAsync, SearchFilters, setFilters
} from '@/features/Search/SearchSlice'
import { buildQuery } from '@/features/Search/searchUtils'
import { setView } from '@/features/Settings/SettingsSlice'
import { createAttendee } from '@/features/User/models/attendee.mapper'
import { extractEventBaseUuid } from '@/utils/extractEventBaseUuid'
import { useCallback, useMemo, useState } from 'react'
import { User } from '../Attendees/types'
import { SearchState } from '../Calendar/utils/tempSearchUtil'

export function useMobileSearch(setDialogOpen: (b: boolean) => void): {
  inputQuery: string
  setInputQuery: React.Dispatch<React.SetStateAction<string>>
  searchState: SearchState
  selectedContacts: User[]
  filters: SearchFilters
  handleSearch: (
    searchQuery: string,
    currentFilters: SearchFilters
  ) => Promise<void>
  handleSearchChange: ({ query, options, loading }: SearchState) => void
  handleContactSelect: (contacts: User[]) => void
  clearAll: () => void
  handleShow: () => void
} {
  const dispatch = useAppDispatch()
  const calendars = useAppSelector(selectCalendars)
  const userId = useAppSelector(state => state.user.userData?.openpaasId)
  const filters = useAppSelector(
    state => state.searchResult.searchParams.filters
  )

  const personalCalendars = useMemo(
    (): Calendar[] =>
      userId
        ? calendars.filter(c => extractEventBaseUuid(c.id) === userId)
        : [],
    [calendars, userId]
  )

  const [inputQuery, setInputQuery] = useState('')
  const [searchState, setSearchState] = useState<SearchState>({
    query: '',
    options: [] as User[],
    loading: false
  })
  const [selectedContacts, setSelectedContacts] = useState<User[]>([])
  const handleSearch = useCallback(
    async (
      searchQuery: string,
      currentFilters: SearchFilters
    ): Promise<void> => {
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
    [dispatch, calendars, personalCalendars, setDialogOpen]
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
    [setDialogOpen]
  )

  const handleContactSelect = useCallback(
    (contacts: User[]): void => {
      const organizers = contacts.map(c =>
        createAttendee({ cal_address: c.email, cn: c.displayName })
      )
      const nextFilters = { ...filters, organizers }
      setSelectedContacts(contacts)
      dispatch(setFilters(nextFilters))
      setInputQuery('')
      setSearchState({ query: '', options: [], loading: false })
      if (contacts.length > 0) {
        void handleSearch('', nextFilters)
      }
    },
    [filters, handleSearch]
  )

  const clearAll = useCallback((): void => {
    setInputQuery('')
    setSelectedContacts([])
    setSearchState({ query: '', options: [], loading: false })
    dispatch(clearFilters())
    setDialogOpen(false)
  }, [setDialogOpen])

  const handleShow = useCallback((): void => {
    void handleSearch(inputQuery, filters)
    setDialogOpen(false)
  }, [inputQuery, filters, handleSearch, setDialogOpen])

  return {
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
