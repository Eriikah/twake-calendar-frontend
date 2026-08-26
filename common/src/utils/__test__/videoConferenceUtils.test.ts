import {
  generateMeetingId,
  generateMeetingLink,
  resolveVisioTemplate
} from '@common/utils/videoConferenceUtils'

// Mock window object for Node.js environment
const mockWindow = {
  VIDEO_CONFERENCE_BASE_URL: 'https://meet.linagora.com'
}

// @ts-expect-error :  Mock window object for Node.js environment
global.window = mockWindow

describe('videoConferenceUtils', () => {
  describe('generateMeetingId', () => {
    it('should generate meeting ID in correct format', () => {
      const meetingId = generateMeetingId()
      expect(meetingId).toMatch(/^[a-z]{3}-[a-z]{4}-[a-z]{3}$/)
    })

    it('should generate different IDs each time', () => {
      const id1 = generateMeetingId()
      const id2 = generateMeetingId()
      expect(id1).not.toBe(id2)
    })
  })

  describe('generateMeetingLink', () => {
    it('should generate link with default base URL', () => {
      const link = generateMeetingLink()
      expect(link).toMatch(
        /^https:\/\/meet\.linagora\.com\/[a-z]{3}-[a-z]{4}-[a-z]{3}$/
      )
    })

    it('should generate link with custom base URL', () => {
      const customBase = 'https://custom-meet.example.com'
      const link = generateMeetingLink({}, customBase)
      expect(link).toMatch(
        /^https:\/\/custom-meet\.example\.com\/[a-z]{3}-[a-z]{4}-[a-z]{3}$/
      )
    })

    it('should resolve {localpart} from the context in custom base URL', () => {
      const baseWithLocalpart = 'https://{localpart}-visio.example.com'
      const link = generateMeetingLink(
        { localpart: 'user123' },
        baseWithLocalpart
      )
      expect(link).toMatch(
        /^https:\/\/user123-visio\.example\.com\/[a-z]{3}-[a-z]{4}-[a-z]{3}$/
      )
    })

    it('should resolve {localpart} to empty string when missing from the context', () => {
      const baseWithLocalpart = 'https://{localpart}-visio.example.com'
      const link = generateMeetingLink({}, baseWithLocalpart)
      expect(link).toMatch(
        /^https:\/\/-visio\.example\.com\/[a-z]{3}-[a-z]{4}-[a-z]{3}$/
      )
    })

    it('should resolve workplaceFqdn expressions from the default base URL', () => {
      const originalDefault = window.VIDEO_CONFERENCE_BASE_URL
      window.VIDEO_CONFERENCE_BASE_URL =
        'https://{workplaceFqdn.localpart}-visio.{workplaceFqdn.domain}/#/bridge'
      const link = generateMeetingLink({
        workplaceFqdn: 'tmle.stg.lin-saas.com'
      })
      expect(link).toMatch(
        /^https:\/\/tmle-visio\.stg\.lin-saas\.com\/#\/bridge\/[a-z]{3}-[a-z]{4}-[a-z]{3}$/
      )
      window.VIDEO_CONFERENCE_BASE_URL = originalDefault
    })

    it('should return empty string when no base URL is configured', () => {
      const originalDefault = window.VIDEO_CONFERENCE_BASE_URL
      // @ts-expect-error : simulate missing configuration
      window.VIDEO_CONFERENCE_BASE_URL = undefined
      expect(generateMeetingLink({ localpart: 'user123' })).toBe('')
      window.VIDEO_CONFERENCE_BASE_URL = originalDefault
    })
  })

  describe('resolveVisioTemplate', () => {
    const fqdn = 'tmle.stg.lin-saas.com'

    it('should resolve {localpart}', () => {
      const template = 'https://visio-{localpart}.twake.app/#/bridge'
      const result = resolveVisioTemplate(template, { localpart: 'alice' })
      expect(result).toBe('https://visio-alice.twake.app/#/bridge')
    })

    it('should resolve {workplaceFqdn}', () => {
      const template = 'https://visio-{workplaceFqdn}/#/bridge'
      const result = resolveVisioTemplate(template, { workplaceFqdn: fqdn })
      expect(result).toBe('https://visio-tmle.stg.lin-saas.com/#/bridge')
    })

    it('should resolve {workplaceFqdn.localpart} and {workplaceFqdn.domain}', () => {
      const template =
        'https://{workplaceFqdn.localpart}-visio.{workplaceFqdn.domain}/#/bridge'
      const result = resolveVisioTemplate(template, { workplaceFqdn: fqdn })
      expect(result).toBe('https://tmle-visio.stg.lin-saas.com/#/bridge')
    })

    it('should resolve {workplaceFqdn.domain} to empty for a single-label FQDN', () => {
      const template =
        'https://{workplaceFqdn.localpart}-visio.{workplaceFqdn.domain}'
      const result = resolveVisioTemplate(template, {
        workplaceFqdn: 'localhost'
      })
      expect(result).toBe('https://localhost-visio.')
    })

    it('should leave unknown expressions untouched', () => {
      const template = 'https://{unknown}.example.com'
      expect(resolveVisioTemplate(template, {})).toBe(template)
    })

    it('should resolve missing context values to empty string', () => {
      const template = 'https://{localpart}-visio.{workplaceFqdn}'
      expect(resolveVisioTemplate(template, {})).toBe('https://-visio.')
    })
  })
})
