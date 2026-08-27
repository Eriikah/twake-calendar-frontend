import React, { useMemo } from 'react'
import {
  ListItemText,
  ListItemButton,
  ListItem,
  List
} from '@linagora/twake-mui'
import { TIME_SLOT_OPTIONS, TimeSlotSelectFieldProps } from './index.type'
import { MobileSelector } from '@common/components/MobileSelector'
import { useI18n } from 'twake-i18n'

export const MobileTimeSlotSelectField: React.FC<TimeSlotSelectFieldProps> = ({
  duration,
  setDuration
}) => {
  const { t } = useI18n()

  const currentLabel = useMemo(() => {
    const selectedOption = TIME_SLOT_OPTIONS.find(
      option => option.value === duration
    )
    return selectedOption ? t(selectedOption.label) : ''
  }, [duration, t])

  return (
    <MobileSelector
      displayText={<span style={{ fontSize: 16 }}>{currentLabel}</span>}
    >
      <List sx={{ overflow: 'auto', flex: 1, pt: 0 }}>
        {TIME_SLOT_OPTIONS.map(({ value, label }) => (
          <ListItem key={value} value={value} disablePadding>
            <ListItemButton
              selected={duration === value}
              aria-selected={duration === value}
              onClick={() => setDuration(value)}
              sx={{ py: 1 }}
            >
              <ListItemText primary={t(label)} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </MobileSelector>
  )
}
