import { TdriveFile } from '../hooks/useTdrivePicker'

export function getMessageType(data: unknown): string | undefined {
  if (typeof data === 'string') return data
  if (typeof data === 'object' && data !== null) {
    const { type } = data as Record<string, unknown>
    return typeof type === 'string' ? type : undefined
  }
  return undefined
}

export function isReadyMessage(typeStr: string | undefined): boolean {
  return typeStr?.endsWith(':ready') ?? false
}

export function extractIntentId(typeStr: string): string {
  return typeStr.split(':')[0]
}

export function buildReadyResponse(intentId: string): object {
  return { type: `${intentId}:send`, payload: {} }
}

function isValidFile(
  file: Record<string, unknown>
): file is { id: string; name: string; url: string } {
  return (
    typeof file.id === 'string' &&
    typeof file.name === 'string' &&
    typeof file.url === 'string'
  )
}

export function parseFileSelection(data: unknown): TdriveFile | null {
  if (typeof data !== 'object' || data === null) return null

  const msg = data as Record<string, unknown>
  if (msg.type !== 'intent-response') return null

  const file = msg.file as Record<string, unknown> | undefined
  if (!file) return null

  if (!isValidFile(file)) {
    return null
  }

  return {
    id: file.id,
    name: file.name,
    url: file.url,
    type: 'sharingLink'
  }
}
