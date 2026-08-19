import { createBookingLink } from '@common/features/booking/BookingDao'
import { setVisibleBookingLinks } from '@common/utils/storage/setVisibleBookingLinks'
import React, { useEffect } from 'react'
import { useI18n } from 'twake-i18n'
import { AppointmentModalForm } from './components/AppointmentModalForm'
import { useAppointmentForm } from './hooks/useAppointmentForm'
import { getVisibleBookingLinks } from '@common/utils/storage/getVisibleBookingLinks'
import {
  formatResourceIds,
  formatAlarms,
  formatExtraAttendees,
  buildBookingPayload
} from './utils'

interface CreateAppointmentModalProps {
  open: boolean
  onClose: () => void
}

export const CreateAppointmentModal: React.FC<CreateAppointmentModalProps> = ({
  open,
  onClose
}) => {
  const { t } = useI18n()
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
  } = useAppointmentForm({ isOpen: open })

  useEffect(() => {
    if (!calendarid && userPersonalCalendars.length > 0) {
      setCalendarid(userPersonalCalendars[0].id)
    }
  }, [userPersonalCalendars, calendarid, setCalendarid])

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

      const payload = buildBookingPayload({
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

      const response = await createBookingLink(payload)
      const currentLinks = getVisibleBookingLinks()
      if (!currentLinks.includes(response.bookingLinkPublicId)) {
        setVisibleBookingLinks([...currentLinks, response.bookingLinkPublicId])
      }
      onClose()
    } catch (err) {
      console.error('Failed to create booking link:', err)
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <AppointmentModalForm
      open={open}
      onClose={onClose}
      title={t('booking.createAppointmentTitle')}
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
      onActiveChange={setActive}
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
      saveButtonText={t('booking.save')}
    />
  )
}
