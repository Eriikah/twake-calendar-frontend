import { FieldWithLabel } from '@common/components/Event/components/FieldWithLabel'
import { FormControl } from '@linagora/twake-mui'
import { useI18n } from 'twake-i18n'
import { TimeSlotSelectFieldProps } from './index.type'
import { useScreenSizeDetection } from '@common/useScreenSizeDetection'
import { DesktopTimeSlotSelectField } from './DesktopTimeSlotSelectField'
import { MobileTimeSlotSelectField } from './MobileTimeSlotSelectField'

const TimeSlotSelectForm: React.FC<{
  children: React.ReactNode
  isExpanded?: boolean
}> = ({ children, isExpanded }) => {
  const { t } = useI18n()
  const { isTooSmall: isMobile } = useScreenSizeDetection()

  return (
    <FieldWithLabel
      label={t('booking.chooseTimeSlot')}
      isExpanded={!!isExpanded && !isMobile}
    >
      <FormControl fullWidth margin="dense" size="small">
        {children}
      </FormControl>
    </FieldWithLabel>
  )
}

export const TimeSlotSelectField: React.FC<TimeSlotSelectFieldProps> = ({
  duration,
  setDuration,
  isExpanded
}) => {
  const { isTooSmall: isMobile } = useScreenSizeDetection()

  if (isMobile) {
    return (
      <TimeSlotSelectForm isExpanded={isExpanded}>
        <MobileTimeSlotSelectField
          duration={duration}
          setDuration={setDuration}
        />
      </TimeSlotSelectForm>
    )
  }

  return (
    <TimeSlotSelectForm isExpanded={isExpanded}>
      <DesktopTimeSlotSelectField
        duration={duration}
        setDuration={setDuration}
      />
    </TimeSlotSelectForm>
  )
}
