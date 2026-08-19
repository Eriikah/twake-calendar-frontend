export interface TimeSlotSelectFieldProps {
  duration: number | undefined
  setDuration: (duration: number) => void
  isExpanded?: boolean
}

export const TIME_SLOT_OPTIONS = [
  {
    value: 15,
    label: 'booking.15minutes'
  },
  {
    value: 30,
    label: 'booking.30minutes'
  },
  {
    value: 45,
    label: 'booking.45minutes'
  },
  {
    value: 60,
    label: 'booking.1hour'
  },
  {
    value: 120,
    label: 'booking.2hours'
  }
]
