// Simple in-memory rate limiter
// Note: This state resets on server restart/redeploy, which is acceptable for this use case.

type RateLimitEntry = {
    timestamps: number[]
}

const limitStore = new Map<string, RateLimitEntry>()

// Limits: 10 requests per minute for unauthenticated auth endpoints
const WINDOW_MS = 60 * 1000
const MAX_REQUESTS = 10

export function isRateLimited(ip: string): boolean {
    const now = Date.now()
    const entry = limitStore.get(ip) || { timestamps: [] }

    // Filter out old timestamps
    entry.timestamps = entry.timestamps.filter(t => now - t < WINDOW_MS)

    if (entry.timestamps.length >= MAX_REQUESTS) {
        return true
    }

    entry.timestamps.push(now)
    limitStore.set(ip, entry)

    // Cleanup occasionally (simple strategy)
    if (limitStore.size > 10000) {
        limitStore.clear()
    }

    return false
}
