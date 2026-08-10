import { api } from '@common/utils/apiUtils'
import { fetchEntityById } from '@common/features/User/EntityDAO'

jest.mock('@common/utils/apiUtils', () => ({
  api: {
    get: jest.fn()
  }
}))

const mockApiGet = api.get as jest.Mock

describe('EntityDAO', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('fetchEntityById', () => {
    it('should fetch user entity from GET /api/entity/{id}', async () => {
      const mockUserData = {
        id: 'user-123',
        firstname: 'John',
        emails: ['john@example.com']
      }
      const mockResponse = { user: mockUserData }
      mockApiGet.mockReturnValue({
        json: jest.fn().mockResolvedValue(mockResponse)
      })

      const result = await fetchEntityById('user-123')

      expect(api.get).toHaveBeenCalledWith('api/entity/user-123')
      expect(result).toEqual(mockResponse)
    })

    it('should fetch resource entity from GET /api/entity/{id}', async () => {
      const mockResourceData = { _id: 'res-456', name: 'Room A' }
      const mockResponse = { resource: mockResourceData }
      mockApiGet.mockReturnValue({
        json: jest.fn().mockResolvedValue(mockResponse)
      })

      const result = await fetchEntityById('res-456')

      expect(api.get).toHaveBeenCalledWith('api/entity/res-456')
      expect(result).toEqual(mockResponse)
    })
  })
})
