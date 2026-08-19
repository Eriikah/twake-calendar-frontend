import { getInitials, stringToGradient } from '@common/utils/avatarUtils'

export * from './attendeeBadgeUtils'
export * from './calendarRefreshUtils'

export function stringToColor(string: string): string {
  let hash = 0
  for (let i = 0; i < string.length; i++) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash)
  }

  let color = '#'
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xff
    color += `00${value.toString(16)}`.slice(-2)
  }

  return color
}

export function stringAvatar(name: string): {
  color?: string
  children: string
} {
  return {
    color: stringToGradient(name),
    children: getInitials(name)
  }
}
