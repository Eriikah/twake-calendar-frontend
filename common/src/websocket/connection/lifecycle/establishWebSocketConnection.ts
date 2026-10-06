import { createWebSocketConnection } from '@linagora/twake-websocket'
import { fetchWebSocketTicket } from '@common/websocket/api/fetchWebSocketTicket'
import {
  WebSocketCallbacks,
  WebSocketWithCleanup
} from '@linagora/twake-websocket'

export async function establishWebSocketConnection(
  callbacks: WebSocketCallbacks,
  socketRef: React.MutableRefObject<WebSocketWithCleanup | null>,
  setIsSocketOpen: (value: boolean) => void,
  signal?: AbortSignal
) {
  try {
    const wsBaseUrl =
      window.WEBSOCKET_URL ??
      window.CALENDAR_BASE_URL?.replace(
        /^http(s)?:/,
        (_: string, s: string | undefined) => (s ? 'wss:' : 'ws:')
      ) ??
      ''

    if (!wsBaseUrl) {
      throw new Error('WEBSOCKET_URL is not defined')
    }

    const ticket = await fetchWebSocketTicket()
    const url = `${wsBaseUrl}/ws?ticket=${encodeURIComponent(ticket.value)}`

    const socket = await createWebSocketConnection({ url, callbacks })

    if (signal?.aborted) {
      socket.cleanup()
      socket.close()
      return
    }

    socketRef.current = socket

    if (socket.readyState === WebSocket.OPEN) {
      setIsSocketOpen(true)
    }
  } catch (error) {
    console.error('Failed to create WebSocket connection:', error)
    setIsSocketOpen(false)
  }
}
