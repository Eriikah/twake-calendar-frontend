export function extractEventBaseUuid(eventKey: string): string {
  if (!eventKey) return ''
  return eventKey.split('/')[0]
}
