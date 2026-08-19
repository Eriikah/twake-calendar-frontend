import { Attachment } from '@common/types/Attachment'
import { sanitizeHtml } from './sanitizeUtils'
import { removeVideoConferenceFromDescription } from './videoConferenceUtils'

export class EventDescriptionBuilder {
  private text: string
  private attachments: Attachment[]
  private displayableAttachments: Attachment[] = []

  constructor(initialText: string = '', attachments: Attachment[] = []) {
    this.text = initialText
    this.attachments = attachments
  }

  public removeVisio(): this {
    this.text = removeVideoConferenceFromDescription(this.text)
    return this
  }

  public sanitize(): this {
    this.text = sanitizeHtml(this.text)
    return this
  }

  /**
   * Filters the attachments to only those that can be displayed.
   */
  public filterAttachments(): this {
    if (window.ENABLE_EVENT_ATTACHMENTS === true) {
      this.displayableAttachments = this.attachments.filter(a =>
        a.hasDisplayableFilename()
      )
    } else {
      this.displayableAttachments = []
    }
    return this
  }

  /**
   * Strips all HTML tags, leaving only the plain text content without formatting.
   */
  public stripHtml(): this {
    const doc = new DOMParser().parseFromString(this.text, 'text/html')
    this.text = doc.body.textContent || ''
    return this
  }

  public buildPlainText(): string {
    const doc = new DOMParser().parseFromString(this.text, 'text/html')
    return doc.body.textContent || ''
  }

  public buildHtml(): string {
    return this.text
  }

  public getAttachments(): Attachment[] {
    return this.displayableAttachments
  }

  public hasContent(): boolean {
    return Boolean(this.text || this.displayableAttachments.length)
  }
}
