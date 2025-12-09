/**
 * Secure cookie configuration defaults
 * Use these for all sensitive cookies (sessions, auth tokens, etc.)
 */

import type { CookieSerializeOptions } from 'cookie-es'

/**
 * Production-ready secure cookie defaults
 */
export const secureCookieDefaults: CookieSerializeOptions = {
  httpOnly: true,        // Prevent JavaScript access
  secure: true,          // HTTPS only
  sameSite: 'lax',       // CSRF protection
  path: '/',             // Available site-wide
  maxAge: 60 * 60 * 24 * 7  // 7 days
}

/**
 * Get secure cookie options with environment-aware security
 * In development, 'secure' is disabled to allow HTTP localhost
 */
export function getSecureCookieOptions(overrides?: CookieSerializeOptions): CookieSerializeOptions {
  const isDev = process.env.NODE_ENV === 'development'
  
  return {
    ...secureCookieDefaults,
    secure: isDev ? false : true,  // Allow HTTP in dev
    ...overrides
  }
}
