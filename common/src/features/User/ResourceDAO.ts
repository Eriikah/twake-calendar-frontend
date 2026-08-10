import { fetchEntityById } from './EntityDAO'
import { ResourceData } from './type/ResourceData'

export async function fetchResourceById(id: string): Promise<ResourceData> {
  const entity = await fetchEntityById(id)
  if (!entity.resource) {
    throw new Error(`Resource entity not found for id ${id}`)
  }
  return entity.resource
}
