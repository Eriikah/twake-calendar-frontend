import { FormControl, TextField } from '@linagora/twake-mui'
import React from 'react'
import { useI18n } from 'twake-i18n'
import { FieldWithLabel } from './FieldWithLabel'
import { Resource, ResourceSearch } from '../../Attendees/ResourceSearch'
import { useScreenSizeDetection } from '@/useScreenSizeDetection'
import { FreeBusyField } from '../fields/FreeBusyField'
import { NotificationField } from '../fields/NotificationField'
import { VisibilityField } from '../fields/VisibilityField'
import { EventFormFieldsProps } from '../EventFormFields.types'

export const EventFormFieldsExpanded: React.FC<
  Pick<
    EventFormFieldsProps,
    | 'alarm'
    | 'setAlarm'
    | 'busy'
    | 'setBusy'
    | 'eventClass'
    | 'setEventClass'
    | 'showMore'
    | 'selectedResources'
    | 'setSelectedResources'
  >
> = ({
  alarm,
  setAlarm,
  busy,
  setBusy,
  eventClass,
  setEventClass,
  showMore,
  selectedResources,
  setSelectedResources
}) => {
  const { t } = useI18n()
  const { isTooSmall: isMobile } = useScreenSizeDetection()

  return (
    <>
      {showMore && (
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

      <NotificationField
        alarm={alarm}
        setAlarm={setAlarm}
        showMore={showMore}
      />

      <FreeBusyField busy={busy} setBusy={setBusy} showMore={showMore} />

      <VisibilityField
        eventClass={eventClass}
        setEventClass={setEventClass}
        showMore={showMore}
      />
    </>
  )
}
