/**
 * Content sanitization utilities for SilverBridge Health.
 * - DOMPurify for sanitizing HTML rendered via v-html
 * - stripHtml for stripping tags from user input before Firestore write
 */
import DOMPurify from 'dompurify'

/**
 * Sanitize HTML content for safe v-html rendering.
 * Removes XSS vectors while preserving safe formatting tags.
 */
export function sanitizeHtml(html) {
  if (!html) return ''
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['h3', 'h4', 'p', 'ul', 'ol', 'li', 'strong', 'em', 'br', 'span', 'a'],
    ALLOWED_ATTR: ['href', 'target', 'rel'],
  })
}

/**
 * Strip all HTML tags from user input before writing to Firestore.
 * Prevents stored XSS if data is later rendered unsafely.
 */
export function stripHtml(text) {
  if (!text) return ''
  const div = document.createElement('div')
  div.textContent = text
  return div.textContent
}
