import {
  appendResponseHeader,
  deleteCookie,
  getCookie,
  getRequestHeader,
  sendNoContent,
  setResponseStatus,
} from 'h3'

import {
  extractSetCookieHeaders,
  getAuthCookieConfig,
  signOutFromEvent,
} from '../../utils/auth'
import { useDb } from '../../utils/db'
import { deleteSession } from '../../utils/session'

export default defineEventHandler(async (event) => {
  const origin = getRequestHeader(event, 'origin')
  const referer = getRequestHeader(event, 'referer')
  const url = getRequestURL(event)

  const isSafeOrigin = (origin && origin === url.origin) || (referer && referer.startsWith(url.origin))

  if (!isSafeOrigin) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Cross-site request blocked',
    })
  }

  const signOutResult = await signOutFromEvent(event)
  const cookieConfig = getAuthCookieConfig()
  const db = useDb()
  const legacyToken = getCookie(event, cookieConfig.legacySession.name)
  const responseHeaders =
    signOutResult instanceof Response
      ? signOutResult.headers
      : (signOutResult as { headers?: Headers | undefined } | null | undefined)?.headers

  for (const setCookie of extractSetCookieHeaders(responseHeaders)) {
    appendResponseHeader(event, 'set-cookie', setCookie)
  }

  deleteCookie(event, cookieConfig.sessionToken.name, cookieConfig.sessionToken.options)
  deleteCookie(event, cookieConfig.sessionData.name, cookieConfig.sessionData.options)
  deleteCookie(event, cookieConfig.legacySession.name, cookieConfig.legacySession.options)

  if (legacyToken) {
    await deleteSession(db, legacyToken)
  }

  setResponseStatus(event, 204)
  return sendNoContent(event)
})
