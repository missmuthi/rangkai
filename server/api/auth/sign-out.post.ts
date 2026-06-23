import { eq } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/d1'

import * as schema from '../../db/schema'

import { deleteSession } from '../../utils/session'

export default defineEventHandler(async (event) => {
    // 1. CSRF / Origin Check
    const req = event.node.req
    const origin = req.headers.origin
    const referer = req.headers.referer
    const url = getRequestURL(event)

    // Use Origin if present, otherwise fallback to Referer, otherwise block if enforcing strictness
    // For sign-out, allow if either matches our domain
    const isSafeOrigin = (origin && origin === url.origin) || (referer && referer.startsWith(url.origin))

    if (!isSafeOrigin) {
        // If strict compliance is needed, throw 403. 
        // For better UX on some browsers/tools that omit headers, you might relax this, but plan said enforce.
        throw createError({
            statusCode: 403,
            statusMessage: 'Cross-site request blocked'
        })
    }

    // 2. Clear Sessions from DB
    const db = drizzle(hubDatabase(), { schema })

    const betterAuthCookie = getCookie(event, 'rangkai.session_token')
    if (betterAuthCookie) {
        const token = betterAuthCookie.split('.')[0]
        if (token) {
            await db.delete(schema.session).where(eq(schema.session.token, token))
        }
    }

    const legacyToken = getCookie(event, 'session')
    if (legacyToken) {
        await deleteSession(db, legacyToken)
    }

    // 3. Clear Cookies
    const isSecure = process.env.NODE_ENV === 'production' || process.env.ENVIRONMENT === 'production'
    deleteCookie(event, 'rangkai.session_token', {
        path: '/',
        secure: isSecure
    })
    deleteCookie(event, 'rangkai.session_data', {
        path: '/',
        secure: isSecure
    })
    deleteCookie(event, 'session', {
        path: '/',
        secure: isSecure
    })

    // 4. Redirect or 204
    // If called via Fetch/XHR, a 204 or user object null is fine. 
    // If called via Form, should redirect.
    // We'll return 204 for API usage usage.
    return sendNoContent(event)
})
