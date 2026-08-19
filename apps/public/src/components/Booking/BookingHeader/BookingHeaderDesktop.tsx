import { BookingSlotsResponse } from '@common/features/booking/types/BookingTypes'
import { Box } from '@linagora/twake-mui'
import React from 'react'
import { BookingMetaInfo } from './BookingMetaInfo'
import {
  BookingEventDetails,
  BookingOwnerDisplay,
  BookingTitle
} from './BookingOwnerInfo'

export const BookingHeaderDesktop: React.FC<{
  bookingInfo: BookingSlotsResponse
  selectedTimezone: string
  onTimezoneChange: (tz: string) => void
  referenceDate: Date
}> = ({ bookingInfo, selectedTimezone, onTimezoneChange, referenceDate }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: '16px',
        p: '24px'
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          flexDirection: 'row'
        }}
      >
        <BookingOwnerDisplay showName={false} owner={bookingInfo.owner} />
        <Box>
          <BookingTitle bookingInfo={bookingInfo} />
          <BookingEventDetails bookingInfo={bookingInfo} />
        </Box>
      </Box>

      <BookingMetaInfo
        selectedTimezone={selectedTimezone}
        onTimezoneChange={onTimezoneChange}
        referenceDate={referenceDate}
      />
    </Box>
  )
}
