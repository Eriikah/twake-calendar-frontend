import { useCallback, useEffect, useRef, useState } from 'react'
import {
  useLocation,
  useNavigate,
  type NavigateFunction
} from 'react-router-dom'

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

function useAnchorPath(
  isEnabled: boolean,
  currentPath: string
): React.MutableRefObject<string | null> {
  const anchorRef = useRef<string | null>(null)
  useEffect(() => {
    if (!isEnabled) {
      anchorRef.current = null
      return
    }
    if (anchorRef.current === null) {
      anchorRef.current = currentPath
    }
  }, [isEnabled, currentPath])
  return anchorRef
}

function useBeforeUnloadWarning(isEnabled: boolean): void {
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
}

function shouldTrapUrlChange(
  isEnabled: boolean,
  anchor: string | null,
  currentPath: string,
  blockedPath: string | null
): boolean {
  if (!isEnabled) return false
  if (anchor === null || blockedPath !== null) return false
  return anchor !== currentPath
}

interface UrlChangeTrapOptions {
  isEnabled: boolean
  anchorRef: React.MutableRefObject<string | null>
  currentPath: string
  blockedPath: string | null
  bypassRef: React.MutableRefObject<boolean>
  navigate: NavigateFunction
  onTrap: (attemptedPath: string) => void
}

function useUrlChangeTrap(options: UrlChangeTrapOptions): void {
  const {
    isEnabled,
    anchorRef,
    currentPath,
    blockedPath,
    bypassRef,
    navigate,
    onTrap
  } = options
  useEffect(() => {
    if (bypassRef.current) {
      bypassRef.current = false
      return
    }
    const anchor = anchorRef.current
    if (!shouldTrapUrlChange(isEnabled, anchor, currentPath, blockedPath)) {
      return
    }
    onTrap(currentPath)
    if (anchor !== null) navigate(anchor, { replace: true })
  }, [
    isEnabled,
    anchorRef,
    currentPath,
    blockedPath,
    bypassRef,
    navigate,
    onTrap
  ])
}

export function useUnsavedChangesGuard(
  isEnabled: boolean
): UseUnsavedChangesGuardResult {
  const [pendingClose, setPendingClose] = useState<(() => void) | null>(null)
  const [blockedPath, setBlockedPath] = useState<string | null>(null)

  const location = useLocation()
  const navigate = useNavigate()

  const anchorPathRef = useAnchorPath(isEnabled, location.pathname)
  const bypassRef = useRef(false)

  const trapAttempted = useCallback((attempted: string): void => {
    setBlockedPath(attempted)
  }, [])

  useUrlChangeTrap({
    isEnabled,
    anchorRef: anchorPathRef,
    currentPath: location.pathname,
    blockedPath,
    bypassRef,
    navigate,
    onTrap: trapAttempted
  })

  useBeforeUnloadWarning(isEnabled)

  const showConfirm = blockedPath !== null || pendingClose !== null

  const cancelClose = useCallback((): void => {
    setPendingClose(null)
    setBlockedPath(null)
  }, [])

  const confirmNavigation = useCallback(
    (target: string): void => {
      bypassRef.current = true
      anchorPathRef.current = null
      navigate(target)
    },
    [anchorPathRef, navigate]
  )

  const confirmClose = useCallback((): void => {
    const pending = pendingClose
    const target = blockedPath
    setPendingClose(null)
    setBlockedPath(null)
    if (target !== null) {
      confirmNavigation(target)
      return
    }
    pending?.()
  }, [pendingClose, blockedPath, confirmNavigation])

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
