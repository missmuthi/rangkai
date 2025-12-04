export default defineEventHandler(async (event) => {
  // Proxy POST requests to the Better Auth signInSocial API so the endpoint works
  const auth = getAuth()

  try {
    const body = await readBody(event)

    // Strengthen validation + support form-encoded and url params fallback
    const provider = body?.provider || getQuery(event)?.provider

    if (!provider) {
      throw createError({ statusCode: 400, message: 'provider is required' })
    }

    // Pass the incoming body to the library so any additional fields (callbackURL, disableRedirect,
    // idToken, scopes, etc.) are forwarded. Also include request headers so the origin callback checks
    // and cookie checks work as expected.
    const payload = { ...body, provider }
    const headersObj = (event.node?.req?.headers as Record<string, string>) || {}

    // Debugging: print the request shape in non-prod for easier diagnosis.
    if (process.env.NODE_ENV !== 'production') {
      console.debug('[auth] signInSocial proxy body:', payload)
      console.debug('[auth] signInSocial proxy headers:', Object.keys(headersObj))
    }

    // Call Better Auth's API to sign-in with social provider; pass headers for validation
    const result = await auth.api.signInSocial({ ...payload, headers: headersObj })

    // Return whatever the auth API returned (likely url + redirect boolean or session)
    return result
  } catch (err: unknown) {
    // Bubble up the error with helpful message (for debugging). Avoid leaking credentials.
    const message = (err as { message?: string })?.message || String(err)
    console.warn('signInSocial proxy failed', message)
    // Return a structured error with message for debugging during preview builds
    event.node.res.statusCode = (err as { statusCode?: number })?.statusCode || 500
    return {
      error: true,
      message: message
    }
  }
})
