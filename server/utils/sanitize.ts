/**
 * HTML Sanitization utility for Edge Runtime
 * Prevents XSS attacks by stripping dangerous HTML
 */

/**
 * Simple, safe HTML sanitizer for edge runtime
 * Removes all HTML tags and entities
 * For rich text, consider using a proper sanitization library with allowed tags
 */
export function sanitizeHtml(input: string | undefined | null): string {
  if (!input) return ''
  
  // Remove HTML tags
  let sanitized = input.replace(/<[^>]*>/g, '')
  
  // Decode HTML entities and re-encode to prevent entity-based XSS
  sanitized = sanitized
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&amp;/g, '&')
  
  // Remove any remaining potentially dangerous characters
  sanitized = sanitized
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
  
  return sanitized.trim()
}

/**
 * Sanitize text for safe display while preserving basic formatting
 * Allows only newlines, no HTML
 */
export function sanitizeText(input: string | undefined | null): string {
  if (!input) return ''
  return sanitizeHtml(input).substring(0, 10000) // Also enforce max length
}

/**
 * Validate and sanitize ISBN
 * Only allows digits and hyphens
 */
export function sanitizeIsbn(input: string | undefined | null): string {
  if (!input) return ''
  return input.replace(/[^0-9-]/g, '').substring(0, 17) // Max ISBN-13 with hyphens
}
