import { OpenPaasUserData } from './OpenPaasUserData'
import { ResourceData } from './ResourceData'

export interface EntityResponse {
  user?: OpenPaasUserData
  resource?: ResourceData
}
