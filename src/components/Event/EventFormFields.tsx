import { TextField } from '@linagora/twake-mui'
import { useRef } from 'react'
import { useI18n } from 'twake-i18n'
import AttendeeSelector from '../Attendees/AttendeeSearch'
import { FieldWithLabel } from './components/FieldWithLabel'
import { AddDescButton } from './AddDescButton'
import { useScreenSizeDetection } from '@/useScreenSizeDetection'
import { CalendarSelectField } from './fields/CalendarSelectField'
import { EventDateTimeField } from './fields/EventDateTimeField'
import { VideoConferenceField } from './fields/VideoConferenceField'
import { EventFormFieldsExpanded } from './components/EventFormFieldsExpaned'
import { useAutoFocusTitle } from './hooks/useAutoFocusTitle'
import LocationField from './fields/LocationField'
import { EventFormFieldsProps } from './EventFormFields.types'

const showInputLabel = (showMore: boolean, label: string): string => {
  if (showMore) {
    return label
  }
  return ''
}

export default function EventFormFields({
  title,
  setTitle,
  description,
  setDescription,
  location,
  setLocation,
  start,
  setStart,
  end,
  setEnd,
  allday,
  setAllDay,
  repetition,
  setRepetition,
  typeOfAction,
  attendees,
  setAttendees,
  alarm,
  setAlarm,
  busy,
  setBusy,
  eventClass,
  setEventClass,
  timezone,
  setTimezone,
  calendarid,
  setCalendarid,
  hasVideoConference,
  setHasVideoConference,
  meetingLink,
  setMeetingLink,
  showMore,
  showDescription,
  setShowDescription,
  showRepeat,
  setShowRepeat,
  isOpen = false,
  userPersonalCalendars,
  timezoneList,
  eventId,
  onStartChange,
  onEndChange,
  onAllDayChange,
  onCalendarChange,
  onValidationChange,
  showValidationErrors = false,
  onHasEndDateChangedChange,
  selectedResources,
  setSelectedResources
}: EventFormFieldsProps): JSX.Element {
  const { t } = useI18n()
  const { isTooSmall: isMobile } = useScreenSizeDetection()

  const titleInputRef = useRef<HTMLInputElement>(null)

  useAutoFocusTitle({
    isOpen,
    eventId,
    titleInputRef,
    showMore
  })

  const isExpanded = showMore && !isMobile

  return (
    <>
      <FieldWithLabel
        label={showInputLabel(showMore, t('event.form.title'))}
        isExpanded={isExpanded}
      >
        <TextField
          fullWidth
          autoComplete="off"
          label=""
          inputProps={{ 'aria-label': t('event.form.title') }}
          placeholder={t('event.form.titlePlaceholder')}
          value={title}
          onChange={e => {
            setTitle(e.target.value)
          }}
          size={isMobile ? 'medium' : 'small'}
          margin="dense"
          inputRef={titleInputRef}
        />
      </FieldWithLabel>

      {/* DateTime, All-day, Timezone, Repeat */}
      <EventDateTimeField
        start={start}
        setStart={setStart}
        end={end}
        setEnd={setEnd}
        allday={allday}
        setAllDay={setAllDay}
        timezone={timezone}
        setTimezone={setTimezone}
        repetition={repetition}
        setRepetition={setRepetition}
        showRepeat={showRepeat}
        setShowRepeat={setShowRepeat}
        showMore={showMore}
        showValidationErrors={showValidationErrors}
        timezoneList={timezoneList}
        typeOfAction={typeOfAction}
        onStartChange={onStartChange}
        onEndChange={onEndChange}
        onAllDayChange={onAllDayChange}
        onHasEndDateChangedChange={onHasEndDateChangedChange}
        onValidationChange={onValidationChange}
      />

      {/* Attendees */}
      <FieldWithLabel
        label={showInputLabel(showMore, t('event.form.participants'))}
        isExpanded={isExpanded}
      >
        <AttendeeSelector
          attendees={attendees}
          setAttendees={setAttendees}
          start={start}
          eventUid={eventId}
          timezone={timezone}
          end={end}
          placeholder={t('event.form.addGuestsPlaceholder')}
          inputSlot={params => (
            <TextField {...params} size={isMobile ? 'medium' : 'small'} />
          )}
        />
      </FieldWithLabel>

      {/* Video conference */}
      <VideoConferenceField
        hasVideoConference={hasVideoConference}
        setHasVideoConference={setHasVideoConference}
        meetingLink={meetingLink}
        setMeetingLink={setMeetingLink}
        description={description}
        setDescription={setDescription}
        showMore={showMore}
        setShowDescription={setShowDescription}
      />

      {/* Description toggle */}
      <AddDescButton
        showDescription={showDescription}
        setShowDescription={setShowDescription}
        showMore={showMore}
        description={description}
        setDescription={setDescription}
      />

      {/* Location */}
      <LocationField
        location={location}
        setLocation={setLocation}
        showMore={showMore}
        isOpen={isOpen}
      />

      {/* Calendar selector */}
      <CalendarSelectField
        calendarid={calendarid}
        setCalendarid={setCalendarid}
        userPersonalCalendars={userPersonalCalendars}
        showMore={showMore}
        onCalendarChange={onCalendarChange}
      />

      <EventFormFieldsExpanded
        alarm={alarm}
        setAlarm={setAlarm}
        busy={busy}
        setBusy={setBusy}
        eventClass={eventClass}
        setEventClass={setEventClass}
        showMore={showMore}
        selectedResources={selectedResources}
        setSelectedResources={setSelectedResources}
      />
    </>
  )
}
