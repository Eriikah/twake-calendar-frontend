import React from 'react'
import { MobileSelector } from '@/components/MobileSelector'
import { SmallTimezoneSelector } from '@/components/Timezone/SmallTimeZoneSelector'

export const MobileTimezoneSelector: React.FC<{
  currentTimezone: string
  onChange: (tz: string) => void
}> = ({ currentTimezone, onChange }) => {
  return (
    <MobileSelector
      displayText={currentTimezone}
      bottomSheetChildren={({ open, onClose }) => (
        <SmallTimezoneSelector
          open={open}
          onClose={onClose}
          value={currentTimezone}
          onChange={(tz: string) => {
            onChange(tz)
            onClose()
          }}
          referenceDate={new Date()}
        />
      )}
    />
  )
}
