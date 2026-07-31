import { api } from '@common/utils/apiUtils'

export interface TokenExchangeResponse {
  token_type: 'bearer'
  scope: string
  access_token: string
  refresh_token: string
  client_id: string
  client_secret: string
  registration_access_token: string
}

export interface IntentData {
  type: string
  attributes: {
    action: 'PICK'
    type: 'io.cozy.files'
    permissions: string[]
    actions: Array<{
      sharingLink?: { label: string }
      downloadLink?: { label: string }
    }>
  }
}

export interface IntentService {
  slug: string
  href: string
}

export interface IntentResponse {
  data: {
    type: string
    id: string
    attributes: {
      action: 'PICK'
      type: 'io.cozy.files'
      permissions: string[]
      client: string
      services: IntentService[]
      availableApps: null
    }
    meta: { rev: string }
    links: { self: string; permissions: string }
  }
}

/**
 * Exchange the current access token for a Tdrive-specific token.
 */
export async function exchangeToken(
  tdriveBaseUrl: string,
  idToken: string
): Promise<TokenExchangeResponse> {
  const json = { id_token: idToken, exchange_type: 'app' }
  const response = await api.post('auth/token_exchange', {
    prefixUrl: tdriveBaseUrl,
    json
  })
  return response.json<TokenExchangeResponse>()
}

/**
 * Create an intent for file picking in Tdrive.
 */
export async function createIntent(
  tdriveBaseUrl: string,
  idToken: string
): Promise<IntentResponse> {
  const body: IntentData = {
    type: 'io.cozy.intents',
    attributes: {
      action: 'PICK',
      type: 'io.cozy.files',
      permissions: ['GET'],
      actions: [
        {
          sharingLink: { label: 'Add as link' }
        }
      ]
    }
  }

  const response = await api.post('intents', {
    prefixUrl: tdriveBaseUrl,
    json: { data: body },
    headers: {
      Authorization: `Bearer ${idToken}`
    }
  })
  return response.json<IntentResponse>()
}

interface FetchIntentJSONOptions {
  tdriveBaseUrl: string
  accessToken: string
}

export const fetchIntentJSON =
  ({ tdriveBaseUrl, accessToken }: FetchIntentJSONOptions) =>
  async (method: string, path: string, body?: unknown): Promise<unknown> => {
    const normalizedBase = tdriveBaseUrl.replace(/\/+$/, '')
    const normalizedPath = path.replace(/^\/+/, '')
    const url = `${normalizedBase}/${normalizedPath}`

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000)

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`
        },
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal
      })
      if (!res.ok) throw new Error(await res.text())
      return res.json()
    } finally {
      clearTimeout(timeoutId)
    }
  }
