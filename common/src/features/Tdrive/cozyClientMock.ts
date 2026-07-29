import { api } from '@common/utils/apiUtils'

/**
 * Mock CozyClient for cozy-interapp integration.
 * This provides just enough of the CozyClient interface to support
 * the POST /intents call that cozy-interapp requires.
 */
export interface MockCozyClientOptions {
  /** The Tdrive base URL (e.g., https://drive.example.com) */
  uri: string
  /** The access token for authentication */
  token: string
}

/**
 * Creates a mock CozyClient compatible with cozy-interapp.
 * cozy-interapp only needs `stackClient.fetchJSON` to make the POST /intents call.
 */
export function createMockCozyClient({ uri, token }: MockCozyClientOptions) {
  return {
    stackClient: {
      /**
       * Makes HTTP requests to the cozy-stack.
       * cozy-interapp uses this for POST /intents
       */
      async fetchJSON(
        method: string,
        path: string,
        body?: unknown
      ): Promise<unknown> {
        if (method === 'POST' && path === '/intents') {
          const response = await api.post('intents', {
            prefixUrl: uri,
            json: body,
            headers: {
              Authorization: `Bearer ${token}`
            }
          })
          return response.json()
        }

        if (method === 'GET' && path.startsWith('/intents/')) {
          const intentId = path.replace('/intents/', '')
          const response = await api.get(`intents/${intentId}`, {
            prefixUrl: uri,
            headers: {
              Authorization: `Bearer ${token}`
            }
          })
          return response.json()
        }

        throw new Error(`Unhandled mock request: ${method} ${path}`)
      }
    }
  }
}

export type MockCozyClient = ReturnType<typeof createMockCozyClient>
