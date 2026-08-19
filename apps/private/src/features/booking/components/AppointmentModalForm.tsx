import React, { useState } from 'react'
import { TextField, Typography, useTheme } from '@linagora/twake-mui'
import { ResponsiveDialog } from '@common/components/Dialog'
import { useI18n } from 'twake-i18n'
import { TimeSlotSelectField } from './TimeSlotSelectField'
import { AppointmentModalExpandedFields } from './AppointmentModalExpandedFields'
import { HeaderRightAction } from './HeaderRightAction'
import { ModalActions } from './ModalActions'
import { ColorPicker } from '@common/components/Calendar/CalendarColorPicker'
import type { Calendar } from '@common/types/CalendarTypes'
import { useScreenSizeDetection } from '@common/useScreenSizeDetection'
import { RegularHoursField } from './RegularHoursField'
import { DayAvailability } from './RegularHoursField/RegularHoursTypes'
import { useAppSelector } from '@common/app/hooks'
import { getAccessiblePair } from '@common/utils/getAccessiblePair'
import { useFocusTitleOnOpen } from '@common/components/Event/hooks/useAutoFocusTitle'
import { userAttendee } from '@common/features/User/models/attendee'
import { FieldWithLabel } from '@common/components/Event/components/FieldWithLabel'
import { Resource } from '@common/components/Attendees/ResourceSearch'
import { Valarms } from '@common/types/Valarms'
import { useResponsiveInputSize } from '@common/hooks/useResponsiveInputSize'

interface AppointmentModalFormProps {
  open: boolean
  onClose: () => void
  title: string
  name: string
  setName: (value: string) => void
  duration: number
  setDuration: (value: number) => void
  description: string
  setDescription: (value: string) => void
  showDescription: boolean
  setShowDescription: (value: boolean) => void
  timezone: string
  setTimezone: (value: string) => void
  calendarid: string
  setCalendarid: (value: string) => void
  color: string
  setColor: (value: string) => void
  userPersonalCalendars: Calendar[]
  availabilityRules?: DayAvailability[]
  setAvailabilityRules?: React.Dispatch<React.SetStateAction<DayAvailability[]>>
  active?: boolean
  onActiveChange?: (active: boolean) => void
  attendees: userAttendee[]
  setAttendees: (value: userAttendee[]) => void
  location: string
  setLocation: (value: string) => void
  alarms: Valarms
  setAlarms: (value: Valarms) => void
  busy: string
  setBusy: (value: string) => void
  eventClass: 'PUBLIC' | 'PRIVATE' | 'CONFIDENTIAL'
  setEventClass: (value: 'PUBLIC' | 'PRIVATE' | 'CONFIDENTIAL') => void
  selectedResources: Resource[]
  setSelectedResources: (value: Resource[]) => void
  error: string | null
  loading: boolean
  isFormValid: boolean
  onSave: () => void
  saveButtonText: string
}

export const AppointmentModalForm: React.FC<
  AppointmentModalFormProps
> = props => {
  const {
    open,
    onClose,
    title,
    name,
    setName,
    duration,
    setDuration,
    color,
    setColor,
    availabilityRules,
    setAvailabilityRules,
    active,
    onActiveChange,
    error,
    loading,
    isFormValid,
    onSave,
    saveButtonText,
    ...expandedFormFieldsProps
  } = props
  const { t } = useI18n()
  const { isTooSmall: isMobile } = useScreenSizeDetection()
  const theme = useTheme()

  const nameInputRef = React.useRef<HTMLInputElement>(null)

  useFocusTitleOnOpen(open, null, nameInputRef)

  const inputSize = useResponsiveInputSize()

  const buttonSize = isMobile ? 'small' : 'medium'

  const businessHours = useAppSelector(state => state.settings.businessHours)
  const workingDays = businessHours?.daysOfWeek

  const [isExpanded, setIsExpanded] = useState(false)

  const showExpandedLabel = isExpanded && !isMobile
  const titleLabel = isExpanded ? t('booking.title') : ''
  const participantsLabel = isExpanded ? t('event.form.participants') : ''

  return (
    <ResponsiveDialog
      open={open}
      onClose={onClose}
      title={title}
      headerRightAction={
        <HeaderRightAction
          onActiveChange={onActiveChange}
          active={active}
          loading={loading}
        />
      }
      isExpanded={isExpanded}
      onExpandToggle={() => setIsExpanded(p => !p)}
      expandText={t('tooltip.expand')}
      actions={
        <ModalActions
          isExpanded={isExpanded}
          buttonSize={buttonSize}
          onExpandToggle={() => setIsExpanded(s => !s)}
          onSave={onSave}
          loading={loading}
          isFormValid={isFormValid}
          saveButtonText={saveButtonText}
        />
      }
    >
      {error && (
        <Typography color="error" variant="body2" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      <FieldWithLabel label={titleLabel} isExpanded={showExpandedLabel}>
        <TextField
          sx={{ pt: 1 }}
          size={isMobile ? 'medium' : 'small'}
          margin="dense"
          placeholder={t('booking.scheduleName')}
          type="text"
          fullWidth
          value={name}
          onChange={e => setName(e.target.value)}
          inputRef={nameInputRef}
        />
      </FieldWithLabel>

      <TimeSlotSelectField
        duration={duration}
        setDuration={setDuration}
        isExpanded={isExpanded}
      />

      <RegularHoursField
        availabilityRules={availabilityRules}
        setAvailabilityRules={setAvailabilityRules}
        workingDays={workingDays}
        isExpanded={isExpanded}
      />

      <FieldWithLabel
        label={t('booking.color')}
        isExpanded={showExpandedLabel}
        sx={{ padding: 0, margin: 0 }}
      >
        <ColorPicker
          selectedColor={{
            light: color,
            dark: getAccessiblePair(color, theme)
          }}
          onChange={c => setColor(c.light)}
        />
      </FieldWithLabel>

      <AppointmentModalExpandedFields
        isExpanded={isExpanded}
        showExpandedLabel={showExpandedLabel}
        participantsLabel={participantsLabel}
        inputSize={inputSize}
        open={open}
        {...expandedFormFieldsProps}
      />
    </ResponsiveDialog>
  )
}
