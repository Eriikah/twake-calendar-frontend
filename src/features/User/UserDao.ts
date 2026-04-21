import { api } from '@/utils/apiUtils'

/**
 * Fetches user data by email. Returns raw JSON array.
 */
export async function fetchUserByEmail(
  email: string
): Promise<Array<Record<string, string>>> {
  const r = await api(`api/users?email=${encodeURIComponent(email)}`)
  return r.json()
}
