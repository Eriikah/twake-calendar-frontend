import type { AlertColor } from '@linagora/twake-mui'
import { Alert, Button, LinearProgress, Snackbar } from '@linagora/twake-mui'

export interface AlertAction {
  label: string
  onClick: () => void
}

/**
 * The alert a snackbar shows: a message, an optional text button, and an
 * optional bar counting down how much time is left (0 to 100).
 */
export function ActionAlert({
  message,
  severity = 'success',
  action,
  onClose,
  progress,
  sx
}: {
  message: string
  severity?: AlertColor
  action?: AlertAction
  onClose?: () => void
  progress?: number
  sx?: object
}): JSX.Element {
  return (
    <Alert
      variant="filled"
      severity={severity}
      onClose={onClose}
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
      {progress !== undefined && (
        <LinearProgress
          variant="determinate"
          color="inherit"
          value={progress}
          aria-hidden
          // the message is a wrapping flex row: a full row of its own,
          // or the bar shrinks to nothing
          sx={{ flexBasis: '100%', mt: 1, height: 2, borderRadius: 1 }}
        />
      )}
    </Alert>
  )
}

export function SnackbarAlert({
  open,
  setOpen,
  message,
  severity = 'success',
  sx
}: {
  open: boolean
  setOpen: (o: boolean) => void
  message: string
  severity?: AlertColor
  sx?: object
}): JSX.Element {
  return (
    <Snackbar
      open={open}
      autoHideDuration={2000}
      onClose={() => setOpen(false)}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      <ActionAlert
        message={message}
        severity={severity}
        onClose={() => setOpen(false)}
        sx={sx}
      />
    </Snackbar>
  )
}
