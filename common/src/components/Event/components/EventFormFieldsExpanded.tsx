import { useScreenSizeDetection } from '@common/useScreenSizeDetection'
import { FormControl, TextField } from '@linagora/twake-mui'
import React from 'react'
import { useI18n } from 'twake-i18n'
import {
  Resource,
  ResourceSearch
} from '@common/components/Attendees/ResourceSearch'
import { Valarms } from '@common/types/Valarms'
import { EventFormFieldsSpecific } from './EventFormFieldsSpecific'
import { FieldWithLabel } from './FieldWithLabel'
import { OrganizerSelectField } from '../fields/OrganizerSelectField'
import { Calendar } from '@common/types/CalendarTypes'
import { userOrganiser } from '@common/features/User/userDataTypes'

interface EventFormFieldsExpandedProps {
  alarms: Valarms
  setAlarms: (v: Valarms) => void
  busy: string
  setBusy: (v: string) => void
  eventClass: 'PUBLIC' | 'PRIVATE' | 'CONFIDENTIAL'
  setEventClass: (v: 'PUBLIC' | 'PRIVATE' | 'CONFIDENTIAL') => void
  showMore: boolean
  selectedResources: Resource[]
  setSelectedResources: (resources: Resource[]) => void
  userOrganizer: userOrganiser
  selectedCalendar: Calendar
  isTeamCalendar: boolean
  isDisableOrganizerSelection: boolean
  setSelectedOrganizer: (organizer: userOrganiser) => void
  selectedOrganizer: userOrganiser
}

export const EventFormFieldsExpanded: React.FC<
  EventFormFieldsExpandedProps
> = ({
  alarms,
  setAlarms,
  busy,
  setBusy,
  eventClass,
  setEventClass,
  selectedOrganizer,
  setSelectedOrganizer,
  showMore,
  selectedResources,
  setSelectedResources,
  userOrganizer,
  selectedCalendar,
  isTeamCalendar,
  isDisableOrganizerSelection
}) => {
  const { t } = useI18n()
  const { isTooSmall: isMobile } = useScreenSizeDetection()

  if (!showMore) return null

  return (
    <>
      {isTeamCalendar && selectedCalendar && (
        <OrganizerSelectField
          calendar={selectedCalendar}
          value={selectedOrganizer}
          onChange={setSelectedOrganizer}
          userOrganizer={userOrganizer}
          showMore={showMore}
          disabled={isDisableOrganizerSelection}
        />
      )}

      {!window.HIDE_RESOURCES && (
        <FieldWithLabel
          label={t('event.form.resource')}
          isExpanded={showMore && !isMobile}
        >
          <FormControl fullWidth margin="dense" size="small">
            <ResourceSearch
              objectTypes={['resource']}
              selectedResources={selectedResources}
              inputSlot={params => <TextField {...params} size="small" />}
              onChange={(_event: React.SyntheticEvent, value: Resource[]) =>
                setSelectedResources(value)
              }
              hideLabel={true}
            />
          </FormControl>
        </FieldWithLabel>
      )}

      <EventFormFieldsSpecific
        alarms={alarms}
        setAlarms={setAlarms}
        busy={busy}
        setBusy={setBusy}
        eventClass={eventClass}
        setEventClass={setEventClass}
        showMore={showMore}
      />
    </>
  )
}
