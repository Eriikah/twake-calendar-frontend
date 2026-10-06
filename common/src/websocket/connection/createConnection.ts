import {
  createWebSocketConnection as libraryCreateWebSocketConnection,
  type WebSocketCallbacks,
  type WebSocketWithCleanup
} from '@linagora/twake-websocket'
import { fetchWebSocketTicket } from '@common/websocket/api/fetchWebSocketTicket'

export async function createWebSocketConnection(
  callbacks: WebSocketCallbacks
): Promise<WebSocketWithCleanup> {
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

  return libraryCreateWebSocketConnection({ url, callbacks })
}
