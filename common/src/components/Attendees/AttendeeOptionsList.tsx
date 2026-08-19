import { ListItem, ListItemAvatar, ListItemText } from '@linagora/twake-mui'
import React, { HTMLAttributes } from 'react'
import { AttendeeAvatar } from './AttendeeAvatar'
import { User } from './types'

export interface AttendeeOptionsListProps extends HTMLAttributes<HTMLLIElement> {
  options: User[]
  onOptionClick?: (user: User) => void
  selectedUsers: User[]
}

export const AttendeeOptionsList: React.FC<AttendeeOptionsListProps> = ({
  options,
  onOptionClick,
  selectedUsers,
  ...props
}) => {
  return (
    <>
      {options.map(option => {
        if (selectedUsers.find(u => u.email === option.email)) return null
        const isNotShowEmail = ['resource', 'team-calendar'].includes(
          option.objectType || ''
        )
        return (
          <ListItem
            key={option.email}
            onClick={() => onOptionClick?.(option)}
            disableGutters
            sx={{ cursor: 'pointer', py: 1 }}
            {...props}
          >
            <ListItemAvatar>
              <AttendeeAvatar option={option} />
            </ListItemAvatar>
            <ListItemText
              primary={option.displayName || option.email}
              secondary={!isNotShowEmail ? option.email : undefined}
              slotProps={{
                primary: { variant: 'body2' },
                secondary: { variant: 'caption' }
              }}
            />
          </ListItem>
        )
      })}
    </>
  )
}
