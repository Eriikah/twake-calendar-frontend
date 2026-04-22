import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { useTimeZoneList } from '@/components/Timezone/hooks/useTimeZoneList'
import { TimezoneAutocomplete } from '@/components/Timezone/TimezoneAutocomplete'
import { browserDefaultTimeZone, getTimezoneOffset } from '@/utils/timezone'
import {
  Box,
  FormControl,
  FormControlLabel,
  Switch,
  Typography
} from '@linagora/twake-mui'
import { useI18n } from 'twake-i18n'
import {
  setTimezone as setUserTimeZone,
  updateUserConfigurationsAsync
} from '../../User/userSlice'
import {
  setIsBrowserDefaultTimeZone,
  setTimeZone as setSettingsTimeZone
} from '../SettingsSlice'
import { useScreenSizeDetection } from '@/useScreenSizeDetection'
import { MobileTimezoneSelector } from './MobileTimezoneSelector'

interface TimezoneSelectorProps {
  onTimeZoneError: () => void
}

export const TimezoneSelector: React.FC<TimezoneSelectorProps> = ({
  onTimeZoneError
}) => {
  const dispatch = useAppDispatch()
  const { t } = useI18n()
  const { isTooSmall: isMobile } = useScreenSizeDetection()

  const previousConfig = useAppSelector(state => state.user.coreConfig)

  const timezoneList = useTimeZoneList()
  const userTimeZone = useAppSelector(
    state => state.user?.coreConfig?.datetime?.timeZone
  )
  const settingTimeZone = useAppSelector(state => state.settings?.timeZone)
  const currentTimeZone =
    userTimeZone ?? settingTimeZone ?? browserDefaultTimeZone
  const isBrowserDefault = useAppSelector(
    state => state.settings.isBrowserDefaultTimeZone
  )

  const handleTimeZoneChange = (newTimeZone: string): void => {
    const previousTimeZone = currentTimeZone
    dispatch(setUserTimeZone(newTimeZone))
    dispatch(setSettingsTimeZone(newTimeZone))
    dispatch(
      updateUserConfigurationsAsync({ timezone: newTimeZone, previousConfig })
    )
      .unwrap()
      .catch(() => {
        dispatch(setUserTimeZone(previousTimeZone))
        dispatch(setSettingsTimeZone(previousTimeZone))
        onTimeZoneError()
      })
  }

  const handleTimeZoneDefaultChange = (isDefault: boolean): void => {
    const previousTimeZone = currentTimeZone
    dispatch(setIsBrowserDefaultTimeZone(isDefault))
    if (isDefault) {
      dispatch(setUserTimeZone(null))
      dispatch(setSettingsTimeZone(browserDefaultTimeZone))
      dispatch(
        updateUserConfigurationsAsync({ timezone: null, previousConfig })
      )
        .unwrap()
        .catch(() => {
          dispatch(setUserTimeZone(previousTimeZone))
          dispatch(setSettingsTimeZone(previousTimeZone))
          dispatch(setIsBrowserDefaultTimeZone(!isDefault))
          onTimeZoneError()
        })
    }
  }

  const inputMinWidth = isMobile ? '100%' : 500

  return (
    <Box
      sx={{
        mb: 4
      }}
    >
      <Typography variant="h6" sx={{ mb: 1 }}>
        {t('settings.timeZone')}
      </Typography>
      <Box>
        <FormControl size="small" sx={{ minWidth: inputMinWidth }}>
          <FormControlLabel
            control={
              <Switch
                checked={isBrowserDefault}
                onChange={() => handleTimeZoneDefaultChange(!isBrowserDefault)}
                aria-label={t('settings.timeZoneBrowserDefault')}
              />
            }
            label={t('settings.timeZoneBrowserDefault')}
            labelPlacement="start"
            sx={{
              minWidth: isMobile ? '100%' : 400,
              justifyContent: 'space-between',
              marginLeft: 0,
              mb: 2
            }}
          />
          {!isMobile && !isBrowserDefault && (
            <TimezoneAutocomplete
              value={currentTimeZone}
              zones={timezoneList.zones}
              getTimezoneOffset={getTimezoneOffset}
              onChange={handleTimeZoneChange}
            />
          )}
        </FormControl>
      </Box>
      {isMobile && !isBrowserDefault && (
        <MobileTimezoneSelector
          currentTimezone={currentTimeZone}
          onChange={handleTimeZoneChange}
        />
      )}
    </Box>
  )
}
