import { useRef } from 'react'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import {
  setLanguage as setUserLanguage,
  updateUserConfigurationsAsync
} from '../../User/userSlice'
import { setLanguage as setSettingsLanguage } from '../SettingsSlice'
import { EventChange } from '../LanguageSelector/index.types'

export const useLanguageChange = ({
  onLanguageError
}: {
  onLanguageError: () => void
}): {
  handleLanguageChange: (event: EventChange) => void
  currentLanguage: string
} => {
  const dispatch = useAppDispatch()
  const userLanguage = useAppSelector(state => state.user?.coreConfig.language)
  const settingsLanguage = useAppSelector(state => state.settings?.language)
  const currentLanguage = userLanguage || settingsLanguage || 'en'
  const languageRequestSeq = useRef(0)

  const handleLanguageChange = (event: EventChange): void => {
    const newLanguage = event.target.value
    const previousLanguage = currentLanguage
    const requestSeq = ++languageRequestSeq.current
    dispatch(setUserLanguage(newLanguage))
    dispatch(setSettingsLanguage(newLanguage))
    dispatch(updateUserConfigurationsAsync({ language: newLanguage }))
      .unwrap()
      .catch(() => {
        if (requestSeq !== languageRequestSeq.current) {
          return
        }
        dispatch(setUserLanguage(previousLanguage))
        dispatch(setSettingsLanguage(previousLanguage))
        onLanguageError()
      })
  }

  return { currentLanguage, handleLanguageChange }
}
