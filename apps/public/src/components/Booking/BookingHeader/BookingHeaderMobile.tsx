import { BookingSlotsResponse } from '@common/features/booking/types/BookingTypes'
import { Box } from '@linagora/twake-mui'
import React from 'react'
import {
  BookingOwnerAvatar,
  BookingEventDetails,
  BookingTitle,
  BookingOwnerName
} from './BookingOwnerInfo'
import { BookingMetaInfo } from './BookingMetaInfo'

export const BookingHeaderMobile: React.FC<{
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
        flexDirection: 'column',
        gap: '16px',
        p: '24px',
        pb: 0
      }}
    >
      <Box
        sx={{
          display: 'flex',
          gap: '10px',
          alignItems: 'flex-start',
          flexDirection: 'column'
        }}
      >
        <Box
          sx={{
            display: 'flex',
            gap: '10px',
            alignItems: 'center'
          }}
        >
          <BookingOwnerAvatar owner={bookingInfo.owner} size="s" />
          <BookingOwnerName owner={bookingInfo.owner} />
        </Box>
        <BookingTitle bookingInfo={bookingInfo} />
        <BookingEventDetails bookingInfo={bookingInfo} />
      </Box>
      <BookingMetaInfo
        selectedTimezone={selectedTimezone}
        onTimezoneChange={onTimezoneChange}
        referenceDate={referenceDate}
      />
    </Box>
  )
}
