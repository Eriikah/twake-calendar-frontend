import React from 'react'
import { Button, Box } from '@linagora/twake-mui'
import { useI18n } from 'twake-i18n'
import AddIcon from '@mui/icons-material/Add'

export const ModalActions: React.FC<{
  isExpanded: boolean
  buttonSize: 'small' | 'medium' | 'large'
  onExpandToggle: () => void
  onSave: () => void
  loading: boolean
  isFormValid: boolean
  saveButtonText: string
}> = ({
  isExpanded,
  buttonSize,
  onExpandToggle,
  onSave,
  loading,
  isFormValid,
  saveButtonText
}) => {
  const { t } = useI18n()

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        width: '100%'
      }}
    >
      {!isExpanded && (
        <Button
          size={buttonSize}
          startIcon={<AddIcon />}
          onClick={onExpandToggle}
        >
          {t('common.moreOptions')}
        </Button>
      )}
      <Button
        onClick={() => void onSave()}
        variant="contained"
        disabled={loading || !isFormValid}
      >
        {saveButtonText}
      </Button>
    </Box>
  )
}
