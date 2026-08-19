import React from 'react'
import { Box, Typography, Avatar } from '@linagora/twake-mui'
import { useI18n } from 'twake-i18n'
import TimerOutlinedIcon from '@mui/icons-material/TimerOutlined'
import { BookingSlotsResponse } from '@common/features/booking/types/BookingTypes'
import { stringAvatar } from '@common/components/Event/utils/eventUtils'
import { InfoRow } from '@common/components/Event/InfoRow'
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined'
import LayersOutlinedIcon from '@mui/icons-material/LayersOutlined'

export const BookingOwnerAvatar: React.FC<{
  owner: BookingSlotsResponse['owner']
  size?: 's' | 'm' | 'l'
}> = ({ owner, size }) => {
  return (
    <Avatar
      size={size}
      {...stringAvatar(owner.displayName || owner.email)}
      sx={{ mr: 1 }}
    />
  )
}

export const BookingOwnerName: React.FC<{
  owner: BookingSlotsResponse['owner']
}> = ({ owner }) => {
  return (
    <Typography variant="subtitle1">
      {owner.displayName || owner.email}
    </Typography>
  )
}

export const BookingOwnerDisplay: React.FC<{
  owner: BookingSlotsResponse['owner']
  size?: 's' | 'm' | 'l'
  showName?: boolean
}> = ({ owner, size, showName = true }) => {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
      <BookingOwnerAvatar owner={owner} size={size} />
      {showName && (
        <Typography variant="body2">
          {owner.displayName || owner.email}
        </Typography>
      )}
    </Box>
  )
}

export const BookingTitle: React.FC<{ bookingInfo: BookingSlotsResponse }> = ({
  bookingInfo
}) => {
  const { t } = useI18n()

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      {bookingInfo.name && (
        <Typography variant="h6">{bookingInfo.name}</Typography>
      )}
      <TimerOutlinedIcon sx={{ color: 'text.secondary' }} />
      <Typography
        variant="caption"
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          color: 'text.secondary'
        }}
      >
        {t('booking.durationMinutes', {
          count: bookingInfo.durationMinutes
        })}
      </Typography>
    </Box>
  )
}

export const BookingEventDetails: React.FC<{
  bookingInfo: BookingSlotsResponse
}> = ({ bookingInfo }) => {
  return (
    <Box>
      {bookingInfo.description && (
        <Typography variant="body2" sx={{ color: 'text.secondary', mt: '4px' }}>
          {bookingInfo.description}
        </Typography>
      )}
      {bookingInfo.location && (
        <Box sx={{ mt: 1 }}>
          <InfoRow
            icon={<LocationOnOutlinedIcon sx={{ color: 'text.secondary' }} />}
            text={bookingInfo.location}
          />
        </Box>
      )}

      {bookingInfo.resources?.length && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 1
          }}
        >
          <LayersOutlinedIcon sx={{ color: 'text.secondary' }} />
          <Typography>
            {bookingInfo.resources
              ?.map(resource => (resource as { name: string })?.name)
              ?.join(', ')}
          </Typography>
        </Box>
      )}
    </Box>
  )
}
