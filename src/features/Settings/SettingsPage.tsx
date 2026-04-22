import { useState } from 'react'
import './SettingsPage.styl'
import { useScreenSizeDetection } from '@/useScreenSizeDetection'
import { SettingErrorSnackbars } from './SettingErrorSnackbars'
import { DesktopSettingsPage } from './DesktopSettingsPage'
import { MobileSettingsPage } from './MobileSettingsPage'

export type SidebarNavItem = 'settings' | 'sync'
export type SettingsSubTab = 'settings' | 'notifications'

const SettingsPage: React.FC<{ isInIframe?: boolean }> = ({ isInIframe }) => {
  const { isTooSmall: isMobile } = useScreenSizeDetection()

  const [activeSettingsSubTab, setActiveSettingsSubTab] =
    useState<SettingsSubTab>('settings')

  const [languageErrorOpen, setLanguageErrorOpen] = useState(false)
  const [timeZoneErrorOpen, setTimeZoneErrorOpen] = useState(false)
  const [alarmEmailsErrorOpen, setAlarmEmailsErrorOpen] = useState(false)
  const [hideDeclinedEventsErrorOpen, setHideDeclinedEventsErrorOpen] =
    useState(false)
  const [displayWeekNumbersErrorOpen, setDisplayWeekNumbersErrorOpen] =
    useState(false)
  const [workingDaysErrorOpen, setWorkingDaysErrorOpen] = useState(false)

  const handleSettingsSubTabChange = (
    _event: React.SyntheticEvent,
    newValue: SettingsSubTab
  ): void => {
    setActiveSettingsSubTab(newValue)
  }
  const handleLanguageErrorClose = (): void => {
    setLanguageErrorOpen(false)
  }
  const handleTimeZoneErrorClose = (): void => {
    setTimeZoneErrorOpen(false)
  }
  const handleHideDeclinedEventsErrorClose = (): void => {
    setHideDeclinedEventsErrorOpen(false)
  }
  const handleAlarmEmailsErrorClose = (): void => {
    setAlarmEmailsErrorOpen(false)
  }
  const handleDisplayWeekNumbersErrorClose = (): void => {
    setDisplayWeekNumbersErrorOpen(false)
  }

  return (
    <main
      className={`main-layout settings-layout${isInIframe ? ' isInIframe' : ''} ${isMobile ? 'settings-layout--mobile' : ''}`}
    >
      {isMobile ? (
        <MobileSettingsPage
          activeSettingsSubTab={activeSettingsSubTab}
          setLanguageErrorOpen={setLanguageErrorOpen}
          setTimeZoneErrorOpen={setTimeZoneErrorOpen}
          setAlarmEmailsErrorOpen={setAlarmEmailsErrorOpen}
          setHideDeclinedEventsErrorOpen={setHideDeclinedEventsErrorOpen}
          setDisplayWeekNumbersErrorOpen={setDisplayWeekNumbersErrorOpen}
          setWorkingDaysErrorOpen={setWorkingDaysErrorOpen}
          handleSettingsSubTabChange={handleSettingsSubTabChange}
          setActiveSettingsSubTab={setActiveSettingsSubTab}
        />
      ) : (
        <DesktopSettingsPage
          activeSettingsSubTab={activeSettingsSubTab}
          setLanguageErrorOpen={setLanguageErrorOpen}
          setTimeZoneErrorOpen={setTimeZoneErrorOpen}
          setAlarmEmailsErrorOpen={setAlarmEmailsErrorOpen}
          setHideDeclinedEventsErrorOpen={setHideDeclinedEventsErrorOpen}
          setDisplayWeekNumbersErrorOpen={setDisplayWeekNumbersErrorOpen}
          setWorkingDaysErrorOpen={setWorkingDaysErrorOpen}
          handleSettingsSubTabChange={handleSettingsSubTabChange}
          setActiveSettingsSubTab={setActiveSettingsSubTab}
        />
      )}
      <SettingErrorSnackbars
        languageErrorOpen={languageErrorOpen}
        timeZoneErrorOpen={timeZoneErrorOpen}
        alarmEmailsErrorOpen={alarmEmailsErrorOpen}
        hideDeclinedEventsErrorOpen={hideDeclinedEventsErrorOpen}
        displayWeekNumbersErrorOpen={displayWeekNumbersErrorOpen}
        workingDaysErrorOpen={workingDaysErrorOpen}
        handleLanguageErrorClose={handleLanguageErrorClose}
        handleTimeZoneErrorClose={handleTimeZoneErrorClose}
        handleAlarmEmailsErrorClose={handleAlarmEmailsErrorClose}
        handleHideDeclinedEventsErrorClose={handleHideDeclinedEventsErrorClose}
        handleDisplayWeekNumbersErrorClose={handleDisplayWeekNumbersErrorClose}
        setWorkingDaysErrorOpen={setWorkingDaysErrorOpen}
      />
    </main>
  )
}

export default SettingsPage
