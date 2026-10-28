import type { AlertColor } from '@linagora/twake-mui'
import { Alert, Button, Snackbar } from '@linagora/twake-mui'

export function SnackbarAlert({
  open,
  setOpen,
  message,
  severity = 'success',
  action,
  autoHideDuration = 2000,
  sx
}: {
  open: boolean
  setOpen: (o: boolean) => void
  message: string
  severity?: AlertColor
  action?: { label: string; onClick: () => void }
  autoHideDuration?: number
  sx?: object
}): JSX.Element {
  return (
    <Snackbar
      open={open}
      autoHideDuration={autoHideDuration}
      // a click elsewhere in the app must not take the action away
      onClose={(_, reason) => {
        if (!(action && reason === 'clickaway')) setOpen(false)
      }}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      <Alert
        severity={severity}
        onClose={() => setOpen(false)}
        sx={{ width: '100%', ...sx }}
        action={
          action && (
            <Button
              variant="text"
              color="inherit"
              size="small"
              onClick={action.onClick}
            >
              {action.label}
            </Button>
          )
        }
      >
        {message}
      </Alert>
    </Snackbar>
  )
}
