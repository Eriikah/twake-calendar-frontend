/**
 * @jest-environment jsdom
 */
import { EventDescriptionBuilder } from '../EventDescriptionBuilder'
import { Attachment } from '@common/types/Attachment'

// Mock DOMPurify as done in descriptionUtils.test.ts
jest.mock('dompurify', () => {
  return jest.requireActual('dompurify')(window)
})

describe('EventDescriptionBuilder', () => {
  beforeEach(() => {
    // Enable attachments for testing
    ;(window as any).ENABLE_EVENT_ATTACHMENTS = true
  })

  it('should initialize with text and no attachments by default', () => {
    const builder = new EventDescriptionBuilder()
    expect(builder.buildHtml()).toBe('')
    expect(builder.getAttachments()).toEqual([])
    expect(builder.hasContent()).toBe(false)
  })

  it('should remove visio link', () => {
    const text = 'Meeting notes\n\nVisio: https://visio.link/123'
    const builder = new EventDescriptionBuilder(text).removeVisio()
    expect(builder.buildHtml()).toBe('Meeting notes')
  })

  it('should sanitize HTML', () => {
    const text = '<h1>Heading</h1><p style="color: red;">Text</p>'
    const builder = new EventDescriptionBuilder(text).sanitize()
    expect(builder.buildHtml()).toBe('Heading<p>Text</p>')
  })

  it('should filter displayable attachments', () => {
    const attach1 = { hasDisplayableFilename: () => true } as Attachment
    const attach2 = { hasDisplayableFilename: () => false } as Attachment

    const builder = new EventDescriptionBuilder('', [
      attach1,
      attach2
    ]).filterAttachments()
    expect(builder.getAttachments()).toEqual([attach1])
  })

  it('should return empty attachments if ENABLE_EVENT_ATTACHMENTS is false', () => {
    ;(window as any).ENABLE_EVENT_ATTACHMENTS = false
    const attach1 = { hasDisplayableFilename: () => true } as Attachment

    const builder = new EventDescriptionBuilder('', [
      attach1
    ]).filterAttachments()
    expect(builder.getAttachments()).toEqual([])
  })

  it('should support fluent chaining', () => {
    const attach = { hasDisplayableFilename: () => true } as Attachment
    const text = '<h1>Meeting</h1>\nVisio: https://visio.link/123'

    const builder = new EventDescriptionBuilder(text, [attach])
      .removeVisio()
      .sanitize()
      .filterAttachments()

    expect(builder.buildHtml()).toBe('Meeting')
    expect(builder.getAttachments()).toEqual([attach])
    expect(builder.hasContent()).toBe(true)
  })

  it('should preserve search-result behavior and correctly decode quoted > characters and nested HTML entities like &amp;amp;', () => {
    const text =
      '<html><body>Text with a <b title=">">quoted tag</b> and &amp;amp;</body></html>'
    const builder = new EventDescriptionBuilder(text)

    // First, verify the original builder behavior correctly decodes these with DOMParser
    expect(builder.buildPlainText()).toBe('Text with a quoted tag and &amp;')

    const text2 = '<a title=">">link &amp;amp;</a>'
    const builder2 = new EventDescriptionBuilder(text2)
    expect(builder2.buildPlainText()).toBe('link &amp;')
  })
})
