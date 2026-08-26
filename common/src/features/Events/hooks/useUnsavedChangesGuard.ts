import { useCallback, useEffect, useState } from 'react'
import { useBlocker } from 'react-router-dom'

export interface UseUnsavedChangesGuardResult {
  showConfirm: boolean
  cancelClose: () => void
  confirmClose: () => void
  requestClose: (proceed: () => void) => void
}

export function useUnsavedChangesGuard(
  isEnabled: boolean
): UseUnsavedChangesGuardResult {
  const [pendingClose, setPendingClose] = useState<(() => void) | null>(null)

  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      isEnabled && currentLocation.pathname !== nextLocation.pathname
  )

  const showConfirm = blocker.state === 'blocked' || pendingClose !== null

  useEffect(() => {
    if (!isEnabled) return
    const handler = (e: BeforeUnloadEvent): string => {
      e.preventDefault()
      e.returnValue = ''
      return ''
    }
    window.addEventListener('beforeunload', handler)
    return (): void => window.removeEventListener('beforeunload', handler)
  }, [isEnabled])

  const cancelClose = useCallback((): void => {
    setPendingClose(null)
    if (blocker.state === 'blocked') blocker.reset()
  }, [blocker])

  const confirmClose = useCallback((): void => {
    const pending = pendingClose
    setPendingClose(null)
    if (blocker.state === 'blocked') {
      blocker.proceed()
    } else if (pending) {
      pending()
    }
  }, [blocker, pendingClose])

  const requestClose = useCallback(
    (proceed: () => void): void => {
      if (!isEnabled) {
        proceed()
        return
      }
      setPendingClose(() => proceed)
    },
    [isEnabled]
  )

  return { showConfirm, cancelClose, confirmClose, requestClose }
}

export default useUnsavedChangesGuard
