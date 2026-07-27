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

function parseTdriveDocument(doc: unknown): TdriveFile | null {
  if (typeof doc !== 'object' || doc === null) return null
  const { id, name, sharingLink, mimeType } = doc as Record<string, unknown>
  if (typeof id !== 'string' || typeof name !== 'string') return null
  if (typeof sharingLink === 'string') {
    return {
      id,
      name,
      url: sharingLink,
      type: 'sharingLink',
      mimeType: typeof mimeType === 'string' ? mimeType : null
    }
  }
  return null
}

export function parseFileSelection(data: unknown): TdriveFile | null {
  if (typeof data !== 'object' || data === null) return null

  const msg = data as Record<string, unknown>
  if (typeof msg.type !== 'string' || !msg.type.endsWith(':done')) return null

  const documents = msg.document
  if (!Array.isArray(documents) || documents.length === 0) return null

  return parseTdriveDocument(documents[0])
}
