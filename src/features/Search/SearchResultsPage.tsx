import { useScreenSizeDetection } from '@/useScreenSizeDetection'
import DesktopSearchResultsPage from './DesktopSearchResultsPage'
import MobileSearchResultsPage from './MobileSearchResultsPage'
import './searchResult.styl'

export default function SearchResultsPage() {
  const { isTooSmall: isMobile } = useScreenSizeDetection()

  if (isMobile) {
    return <MobileSearchResultsPage />
  } else {
    return <DesktopSearchResultsPage />
  }
}
