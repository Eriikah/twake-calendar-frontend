import DOMPurify from 'dompurify'

/**
 * Sanitizes HTML text by only allowing basic styling tags.
 * All CSS styling, attributes, and heading tags are removed.
 *
 * Allowed tags:
 * - Text styling: b, i, u, s, strong, em, strike, del
 * - Lists: ul, ol, li
 * - Other: p, br, a
 */
export function sanitizeHtml(htmlText: string): string {
  if (!htmlText) return ''

  // Allowed tags based on requirements:
  // "basic styling tag (bold, italic, underline, crossed, bullet points and lists)"
  // plus basic layout like p, br, a.
  const allowedTags = [
    'b',
    'i',
    'u',
    's',
    'strong',
    'em',
    'strike',
    'del',
    'ul',
    'ol',
    'li',
    'p',
    'br',
    'a'
  ]

  const sanitized = DOMPurify.sanitize(htmlText, {
    ALLOWED_TAGS: allowedTags,
    ALLOWED_ATTR: ['href'],
    KEEP_CONTENT: true
  })

  return sanitized
}
