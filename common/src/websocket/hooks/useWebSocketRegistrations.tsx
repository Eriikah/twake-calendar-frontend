import { useRef, useEffect } from 'react'
import { syncCalendarRegistrations } from '../operations'
import { WebSocketConnection } from '@linagora/twake-websocket'

/**
 * Keeps server-side registrations in sync with `paths` (diff-based).
 * After every reconnection (`epoch` change) the diff baseline is reset so
 * everything is registered again.
 */
export interface UseWebSocketRegistrationsOptions {
  /** Pause syncing (e.g. while the app list is still loading). Defaults to true. */
  enabled?: boolean
}

export function useWebSocketRegistrations(
  connection: Pick<WebSocketConnection, 'socketRef' | 'isOpen' | 'epoch'>,
  paths: string[],
  { enabled = true }: UseWebSocketRegistrationsOptions = {}
): void {
  const { socketRef, isOpen, epoch } = connection
  const previousPathsRef = useRef<string[]>([])
  const lastEpochRef = useRef(epoch)

  useEffect(() => {
    if (!enabled) return

    if (lastEpochRef.current !== epoch) {
      lastEpochRef.current = epoch
      previousPathsRef.current = []
    }

    syncCalendarRegistrations(isOpen, socketRef, paths, previousPathsRef)
  }, [enabled, isOpen, epoch, paths, socketRef])
}
