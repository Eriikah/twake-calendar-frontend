import React from 'react'
import { BookingStatusSwitch } from './BookingStatusSwitch'

export const HeaderRightAction: React.FC<{
  onActiveChange?: (active: boolean) => void
  active?: boolean
  loading: boolean
}> = ({ onActiveChange, active, loading }) => {
  if (!onActiveChange || active === undefined) return null

  return (
    <BookingStatusSwitch
      active={active}
      onChange={onActiveChange}
      disabled={loading}
    />
  )
}
