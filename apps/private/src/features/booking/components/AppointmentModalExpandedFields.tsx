import React from 'react'
import { TextField } from '@linagora/twake-mui'
import { useI18n } from 'twake-i18n'
import { FieldWithLabel } from '@common/components/Event/components/FieldWithLabel'
import AttendeeSelector from '@common/components/Attendees/AttendeeSearch'
import { userAttendee } from '@common/features/User/models/attendee'
import { TimezoneSelectField } from './TimezoneSelectField'
import { AddDescButton } from '@common/components/Event/AddDescButton'
import LocationField from '@common/components/Event/fields/LocationField'
import { CalendarSelectField } from '@common/components/Event/fields/CalendarSelectField'
import { Calendar } from '@common/types/CalendarTypes'
import { EventFormFieldsExpanded } from '@common/components/Event/components/EventFormFieldsExpanded'
import { Valarms } from '@common/types/Valarms'
import { Resource } from '@common/components/Attendees/ResourceSearch'

export interface AppointmentModalExpandedFieldsProps {
  isExpanded: boolean
  showExpandedLabel: boolean
  participantsLabel: string
  attendees: userAttendee[]
  setAttendees: (value: userAttendee[]) => void
  timezone: string
  setTimezone: (value: string) => void
  inputSize: 'small' | 'medium'
  showDescription: boolean
  setShowDescription: (value: boolean) => void
  description: string
  setDescription: (value: string) => void
  location: string
  setLocation: (value: string) => void
  open: boolean
  calendarid: string
  setCalendarid: (value: string) => void
  userPersonalCalendars: Calendar[]
  alarms: Valarms
  setAlarms: (value: Valarms) => void
  busy: string
  setBusy: (value: string) => void
  eventClass: 'PUBLIC' | 'PRIVATE' | 'CONFIDENTIAL'
  setEventClass: (value: 'PUBLIC' | 'PRIVATE' | 'CONFIDENTIAL') => void
  selectedResources: Resource[]
  setSelectedResources: (value: Resource[]) => void
}

export const AppointmentModalExpandedFields: React.FC<
  AppointmentModalExpandedFieldsProps
> = ({
  isExpanded,
  showExpandedLabel,
  participantsLabel,
  attendees,
  setAttendees,
  timezone,
  setTimezone,
  inputSize,
  showDescription,
  setShowDescription,
  description,
  setDescription,
  location,
  setLocation,
  open,
  calendarid,
  setCalendarid,
  userPersonalCalendars,
  alarms,
  setAlarms,
  busy,
  setBusy,
  eventClass,
  setEventClass,
  selectedResources,
  setSelectedResources
}) => {
  const { t } = useI18n()

  if (!isExpanded) return null

  return (
    <>
      <FieldWithLabel label={participantsLabel} isExpanded={showExpandedLabel}>
        <AttendeeSelector
          attendees={attendees}
          setAttendees={setAttendees}
          timezone={timezone}
          placeholder={t('event.form.addGuestsPlaceholder')}
          inputSlot={params => <TextField {...params} size={inputSize} />}
          enableEmailAutocompleteAndCommit={false}
        />
      </FieldWithLabel>

      <TimezoneSelectField
        isExpanded
        timezone={timezone}
        setTimezone={setTimezone}
      />

      <AddDescButton
        showDescription={showDescription}
        setShowDescription={setShowDescription}
        showMore={isExpanded}
        description={description}
        setDescription={setDescription}
      />

      <LocationField
        location={location}
        setLocation={setLocation}
        showMore={isExpanded}
        isOpen={open}
      />

      <CalendarSelectField
        calendarid={calendarid}
        setCalendarid={setCalendarid}
        userPersonalCalendars={userPersonalCalendars}
        showMore={isExpanded}
      />

      <EventFormFieldsExpanded
        alarms={alarms}
        setAlarms={setAlarms}
        busy={busy}
        setBusy={setBusy}
        eventClass={eventClass}
        setEventClass={setEventClass}
        showMore={isExpanded}
        selectedResources={selectedResources}
        setSelectedResources={setSelectedResources}
      />
    </>
  )
}
