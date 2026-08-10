import { fetchEntityById } from '@common/features/User/EntityDAO'
import { fetchResourceById } from '@common/features/User/ResourceDAO'
import { makeResourceToUserData } from '@common/features/User/transformers'
import { OpenPaasUserData } from '@common/features/User/type/OpenPaasUserData'
import { fetchUserById } from '@common/features/User/UserDao'

export const fetchOwnerOfResource = async (
  resourceId: string
): Promise<OpenPaasUserData> => {
  try {
    const data = await fetchResourceById(resourceId)
    const ownerData = await fetchUserById(data.creator)
    const { owner, resourceIcon } = makeResourceToUserData(data, ownerData)
    return {
      ...owner,
      resourceIcon
    }
  } catch (error) {
    console.error(`Failed to fetch resource details for ${resourceId}:`, error)
    throw error
  }
}

export const fetchOwnerData = async (
  ownerId: string
): Promise<OpenPaasUserData> => {
  try {
    const owner = await fetchUserById(ownerId)
    return owner
  } catch (error) {
    console.error(`Failed to fetch user details for ${ownerId}:`, error)
    throw error
  }
}

export async function getOwnerOrResourceData(
  ownerId: string
): Promise<OpenPaasUserData> {
  try {
    const entity = await fetchEntityById(ownerId)
    if (entity.resource) {
      const ownerData = await fetchUserById(entity.resource.creator)
      const { owner, resourceIcon } = makeResourceToUserData(
        entity.resource,
        ownerData
      )
      return {
        ...owner,
        resourceIcon,
        resource: true
      }
    }
    if (entity.user) {
      return entity.user
    }
  } catch {
    // Fall back if fetchEntityById fails or is mocked in existing tests
  }

  return fetchOwnerData(ownerId)
}
