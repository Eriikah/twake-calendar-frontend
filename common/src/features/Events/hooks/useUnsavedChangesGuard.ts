import { useCallback, useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

export interface UseUnsavedChangesGuardResult {
  showConfirm: boolean
  cancelClose: () => void
  confirmClose: () => void
  requestClose: (proceed: () => void) => void
}

// This app mounts <HistoryRouter> from redux-first-history/rr6, which is a
// non-data router. react-router-dom's stable `useBlocker` requires a data
// router and throws otherwise, so we implement blocking manually with
// useLocation + a navigate-back trap and let `beforeunload` handle browser
// closures / refresh.
export function useUnsavedChangesGuard(
  isEnabled: boolean
): UseUnsavedChangesGuardResult {
  const [pendingClose, setPendingClose] = useState<(() => void) | null>(null)
  const [blockedPath, setBlockedPath] = useState<string | null>(null)

  const location = useLocation()
  const navigate = useNavigate()

  const anchorPathRef = useRef<string | null>(null)
  const bypassRef = useRef(false)

  useEffect(() => {
    if (isEnabled && anchorPathRef.current === null) {
      anchorPathRef.current = location.pathname
    }
    if (!isEnabled) {
      anchorPathRef.current = null
    }
  }, [isEnabled, location.pathname])

  useEffect(() => {
    if (!isEnabled) return
    if (bypassRef.current) {
      bypassRef.current = false
      return
    }
    const anchor = anchorPathRef.current
    if (anchor && location.pathname !== anchor && blockedPath === null) {
      const attempted = location.pathname
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setBlockedPath(attempted)
      navigate(anchor, { replace: true })
    }
  }, [isEnabled, location.pathname, blockedPath, navigate])

  const showConfirm = blockedPath !== null || pendingClose !== null

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
    setBlockedPath(null)
  }, [])

  const confirmClose = useCallback((): void => {
    const pending = pendingClose
    const target = blockedPath
    setPendingClose(null)
    setBlockedPath(null)
    if (target) {
      bypassRef.current = true
      anchorPathRef.current = null
      navigate(target)
    } else if (pending) {
      pending()
    }
  }, [pendingClose, blockedPath, navigate])

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
