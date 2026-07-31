import React, { useState, useCallback } from 'react'
import {
  Dialog,
  DialogTitle,
  Box,
  IconButton,
  CircularProgress
} from '@linagora/twake-mui'
import { Close as CloseIcon } from '@mui/icons-material'
import { useI18n } from 'twake-i18n'

interface TdrivePickerDialogProps {
  open: boolean
  onClose: () => void
  containerRef: React.RefObject<HTMLDivElement>
  onReadyToUse: (callback: () => void) => void
}

export const TdrivePickerDialog: React.FC<TdrivePickerDialogProps> = ({
  open,
  onClose,
  containerRef,
  onReadyToUse
}) => {
  const { t } = useI18n()
  const [isReady, setIsReady] = useState(false)

  // Reset loader each time the dialog opens
  const handleTransitionEnter = useCallback(() => {
    setIsReady(false)
    onReadyToUse(() => setIsReady(true))
  }, [onReadyToUse])

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      onTransitionEnter={handleTransitionEnter}
      sx={{
        '& .MuiDialog-paper': {
          maxWidth: '900px',
          width: '100%',
          height: '80vh',
          maxHeight: '800px',
          display: 'flex',
          flexDirection: 'column'
        }
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 2,
          borderBottom: 1,
          borderColor: 'divider',
          flexShrink: 0
        }}
      >
        <DialogTitle sx={{ p: 0 }}>
          {t('event.form.tdrivePickerTitle')}
        </DialogTitle>
        <IconButton aria-label={t('actions.close')} onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </Box>
      <Box sx={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        {!isReady && (
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1
            }}
          >
            <CircularProgress />
          </Box>
        )}
        <Box
          ref={containerRef}
          sx={{
            position: 'absolute',
            inset: 0,
            '& > iframe': {
              width: '100%',
              height: '100%',
              border: 'none'
            }
          }}
        />
      </Box>
    </Dialog>
  )
}
