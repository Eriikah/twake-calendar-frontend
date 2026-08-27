export function renameDefault(
  davName: string | undefined,
  ownerName: string,
  t: (key: string, params?: Record<string, unknown>) => string,
  isOwnCalendar?: boolean
): string {
  if (!ownerName) {
    if (davName && davName !== '#default') return davName
  }
  if (!davName) {
    return t('calendar.defaultCalendarName', { name: ownerName })
  }
  if (davName !== '#default') {
    return davName
  }
  if (isOwnCalendar) {
    return t('calendar.defaultPersonalCalendarName')
  }
  return t('calendar.defaultCalendarName', { name: ownerName })
}
