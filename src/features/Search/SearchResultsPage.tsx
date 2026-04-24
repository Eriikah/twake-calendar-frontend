import { useScreenSizeDetection } from '@/useScreenSizeDetection'
import DesktopSearchResultsPage from './DesktopSearchResultsPage'
import MobileSearchResultsPage from './MobileSearchResultsPage'
import './searchResult.styl'

const SearchResultsPage: React.FC = () => {
  const { isTooSmall: isMobile } = useScreenSizeDetection()

  if (isMobile) {
    return <MobileSearchResultsPage />
  } else {
    return <DesktopSearchResultsPage />
  }
}

export default SearchResultsPage
