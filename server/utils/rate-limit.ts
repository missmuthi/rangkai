/**
 * Distributed Rate Limiter using NuxtHub KV
 * Edge-compatible alternative to in-memory rate limiting
 */

const WINDOW_MS = 60 * 1000 // 1 minute
const MAX_REQUESTS = 100 // Requests per window

interface RateLimitData {
  count: number
  resetAt: number
}

/**
 * Check if an IP is rate limited using KV storage
 * @param ip - Client IP address
 * @returns true if rate limited, false otherwise
 */
export async function isRateLimited(ip: string): Promise<boolean> {
  const kv = hubKV()
  const now = Date.now()
  const key = `ratelimit:${ip}`

  try {
    // Get existing rate limit data
    const data = await kv.get<RateLimitData>(key)

    if (!data) {
      // First request in this window
      await kv.set(key, { count: 1, resetAt: now + WINDOW_MS }, { ttl: 60 })
      return false
    }

    // Check if window has expired
    if (now > data.resetAt) {
      // Reset window
      await kv.set(key, { count: 1, resetAt: now + WINDOW_MS }, { ttl: 60 })
      return false
    }

    // Window is still active
    if (data.count >= MAX_REQUESTS) {
      return true // Rate limited
    }

    // Increment counter
    await kv.set(key, { count: data.count + 1, resetAt: data.resetAt }, { ttl: 60 })
    return false
  } catch (error) {
    // On KV error, fail open (allow request) to prevent outage
    console.error('[rate-limit] KV error:', error)
    return false
  }
}

/**
 * Get current rate limit status for an IP
 * Useful for returning Retry-After headers
 */
export async function getRateLimitStatus(ip: string): Promise<{
  limited: boolean
  remaining: number
  resetAt: number
} | null> {
  const kv = hubKV()
  const key = `ratelimit:${ip}`

  try {
    const data = await kv.get<RateLimitData>(key)
    if (!data) {
      return {
        limited: false,
        remaining: MAX_REQUESTS,
        resetAt: Date.now() + WINDOW_MS
      }
    }

    const remaining = Math.max(0, MAX_REQUESTS - data.count)
    return {
      limited: data.count >= MAX_REQUESTS,
      remaining,
      resetAt: data.resetAt
    }
  } catch {
    return null
  }
}
