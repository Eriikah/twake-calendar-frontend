import { useAppSelector } from '@/app/hooks'
import { Box } from '@linagora/twake-mui'
import { useI18n } from 'twake-i18n'
import { AttendeesFilter } from './AttendeesFilter'
import DesktopSearchResultsPage from './DesktopSearchResultsPage'
import { OrganizersFilter } from './OrganizersFilter'
import { SearchInFilter } from './SearchInFilter'
import './searchResult.styl'
import { defaultSearchParams } from './SearchSlice'

const MobileSearchResultsPage: React.FC = () => {
  const searchParams = useAppSelector(state => state.searchResult.searchParams)
  const hasSearched = searchParams !== defaultSearchParams

  const FiltersButtons: React.FC = () => {
    return (
      <Box
        sx={{
          display: 'flex',
          overflowX: 'auto',
          gap: 2,
          px: 2,
          py: 1,
          scrollbarWidth: 'none',
          '&::-webkit-scrollbar': { display: 'none' },
          backgroundColor: '#FFF',
          minHeight: '48px'
        }}
      >
        <SearchInFilter mode="mobile" />
        <OrganizersFilter mode="mobile" />
        <AttendeesFilter mode="mobile" />
      </Box>
    )
  }

  return (
    <>
      <FiltersButtons />
      {hasSearched && <DesktopSearchResultsPage />}
    </>
  )
}

export default MobileSearchResultsPage
