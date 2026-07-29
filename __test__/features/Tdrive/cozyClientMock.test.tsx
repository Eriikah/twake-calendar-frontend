import { createMockCozyClient } from '@common/features/Tdrive/cozyClientMock'
import * as apiUtils from '@common/utils/apiUtils'

jest.mock('@common/utils/apiUtils')

describe('createMockCozyClient', () => {
  const mockApi = apiUtils as jest.Mocked<typeof apiUtils>

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('creates a client with stackClient.fetchJSON', () => {
    const client = createMockCozyClient({
      uri: 'https://drive.example.com',
      token: 'test-token'
    })

    expect(client.stackClient).toBeDefined()
    expect(typeof client.stackClient.fetchJSON).toBe('function')
  })

  it('makes POST /intents request correctly', async () => {
    const mockResponse = {
      json: jest.fn().mockResolvedValue({
        data: {
          id: 'intent-123',
          type: 'io.cozy.intents',
          attributes: {
            action: 'PICK',
            type: 'io.cozy.files'
          }
        }
      })
    }
    mockApi.api.post = jest.fn().mockResolvedValue(mockResponse)

    const client = createMockCozyClient({
      uri: 'https://drive.example.com',
      token: 'test-token'
    })

    const body = {
      data: {
        type: 'io.cozy.intents',
        attributes: {
          action: 'PICK',
          type: 'io.cozy.files',
          permissions: ['GET']
        }
      }
    }

    const result = await client.stackClient.fetchJSON('POST', '/intents', body)

    expect(mockApi.api.post).toHaveBeenCalledWith('intents', {
      prefixUrl: 'https://drive.example.com',
      json: body,
      headers: {
        Authorization: 'Bearer test-token'
      }
    })
    expect(result).toEqual({
      data: {
        id: 'intent-123',
        type: 'io.cozy.intents',
        attributes: {
          action: 'PICK',
          type: 'io.cozy.files'
        }
      }
    })
  })

  it('makes GET /intents/:id request correctly', async () => {
    const mockResponse = {
      json: jest.fn().mockResolvedValue({
        data: {
          id: 'intent-123',
          type: 'io.cozy.intents'
        }
      })
    }
    mockApi.api.get = jest.fn().mockResolvedValue(mockResponse)

    const client = createMockCozyClient({
      uri: 'https://drive.example.com',
      token: 'test-token'
    })

    const result = await client.stackClient.fetchJSON(
      'GET',
      '/intents/intent-123'
    )

    expect(mockApi.api.get).toHaveBeenCalledWith('intents/intent-123', {
      prefixUrl: 'https://drive.example.com',
      headers: {
        Authorization: 'Bearer test-token'
      }
    })
    expect(result).toEqual({
      data: {
        id: 'intent-123',
        type: 'io.cozy.intents'
      }
    })
  })

  it('throws on unhandled request types', async () => {
    const client = createMockCozyClient({
      uri: 'https://drive.example.com',
      token: 'test-token'
    })

    await expect(
      client.stackClient.fetchJSON('DELETE', '/intents/123')
    ).rejects.toThrow('Unhandled mock request: DELETE /intents/123')
  })
})
