export type EventChange =
  | React.ChangeEvent<
      Omit<HTMLInputElement, 'value'> & {
        value: string
      }
    >
  | (Event & {
      target: {
        value: string
        name: string
      }
    })

export interface LanguageSelectorProps {
  onLanguageError: () => void
}

export interface LanguageSelectorInputProps {
  currentLanguage: string
  onChange: (event: EventChange) => void
}

export interface LanguageListBottomSheetProps extends LanguageSelectorInputProps {
  open: boolean
  onClose: () => void
}
