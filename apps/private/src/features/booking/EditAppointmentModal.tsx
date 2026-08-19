import React from 'react'
import { useI18n } from 'twake-i18n'
import { useAppDispatch } from '@common/app/hooks'
import { updateBookingLink } from '@common/features/booking/BookingLinksSlice'
import { useAppointmentForm } from './hooks/useAppointmentForm'
import { AppointmentModalForm } from './components/AppointmentModalForm'
import type { BookingLink } from '@common/features/booking/types/BookingTypes'
import {
  formatResourceIds,
  formatAlarms,
  formatExtraAttendees,
  buildUpdateBookingPayload
} from './utils'
interface EditAppointmentModalProps {
  open: boolean
  onClose: () => void
  bookingLink: BookingLink
}

export const EditAppointmentModal: React.FC<EditAppointmentModalProps> = ({
  open,
  onClose,
  bookingLink
}) => {
  const { t } = useI18n()
  const dispatch = useAppDispatch()
  const {
    name,
    setName,
    duration,
    setDuration,
    description,
    setDescription,
    showDescription,
    setShowDescription,
    timezone,
    setTimezone,
    calendarid,
    setCalendarid,
    color,
    setColor,
    active,
    setActive,
    error,
    setError,
    loading,
    setLoading,
    isFormValid,
    userPersonalCalendars,
    availabilityRules,
    setAvailabilityRules,
    attendees,
    setAttendees,
    location,
    setLocation,
    alarms,
    setAlarms,
    busy,
    setBusy,
    eventClass,
    setEventClass,
    selectedResources,
    setSelectedResources
  } = useAppointmentForm({ bookingLink, isOpen: open })

  const handleActiveToggle = async (newActive: boolean): Promise<void> => {
    const prevActive = active
    setActive(newActive)
    setLoading(true)
    setError(null)
    try {
      await dispatch(
        updateBookingLink({
          publicId: bookingLink.publicId,
          request: {
            active: newActive
          }
        })
      ).unwrap()
    } catch (err) {
      console.error('Failed to update booking link active status:', err)
      setError(err instanceof Error ? err.message : String(err))
      setActive(prevActive)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (): Promise<void> => {
    if (!isFormValid) {
      setError(t('booking.fillRequiredFields'))
      return
    }

    try {
      setLoading(true)
      setError(null)
      const resourceIds = formatResourceIds(selectedResources)
      const alarmList = formatAlarms(alarms)
      const extraAttendeesList = formatExtraAttendees(attendees)

      const payload = buildUpdateBookingPayload({
        name,
        duration,
        calendarid,
        active,
        availabilityRules,
        timezone,
        description,
        color,
        location,
        eventClass,
        busy,
        resourceIds,
        alarmList,
        extraAttendeesList
      })

      await dispatch(
        updateBookingLink({
          publicId: bookingLink.publicId,
          request: payload
        })
      ).unwrap()
      onClose()
    } catch (err) {
      console.error('Failed to update booking link:', err)
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <AppointmentModalForm
      open={open}
      onClose={onClose}
      title={t('booking.editAppointmentTitle', {
        defaultValue: 'Edit appointment schedule'
      })}
      name={name}
      setName={setName}
      duration={duration}
      setDuration={setDuration}
      description={description}
      setDescription={setDescription}
      showDescription={showDescription}
      setShowDescription={setShowDescription}
      timezone={timezone}
      setTimezone={setTimezone}
      calendarid={calendarid}
      setCalendarid={setCalendarid}
      color={color}
      setColor={setColor}
      active={active}
      onActiveChange={newActive => void handleActiveToggle(newActive)}
      userPersonalCalendars={userPersonalCalendars}
      availabilityRules={availabilityRules}
      setAvailabilityRules={setAvailabilityRules}
      attendees={attendees}
      setAttendees={setAttendees}
      location={location}
      setLocation={setLocation}
      alarms={alarms}
      setAlarms={setAlarms}
      busy={busy}
      setBusy={setBusy}
      eventClass={eventClass}
      setEventClass={setEventClass}
      selectedResources={selectedResources}
      setSelectedResources={setSelectedResources}
      error={error}
      loading={loading}
      isFormValid={isFormValid}
      onSave={() => void handleSave()}
      saveButtonText={t('actions.save', { defaultValue: 'Save' })}
    />
  )
}
