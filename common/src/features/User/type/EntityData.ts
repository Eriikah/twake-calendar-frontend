import { OpenPaasUserData } from './OpenPaasUserData'
import { ResourceData } from './ResourceData'

export interface TeamCalendarData {
  _id?: string
  id: string
  name?: string
  title?: string
  description?: string
  displayName?: string
}

export interface EntityResponse {
  user?: OpenPaasUserData
  resource?: ResourceData
  teamCalendar?: TeamCalendarData
}
