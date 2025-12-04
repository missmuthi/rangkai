export default defineEventHandler(async (event) => {
  // Proxy POST requests to the Better Auth signInSocial API so the endpoint works
  const auth = getAuth()

  try {
    const body = await readBody(event)
    const provider = body?.provider

    if (!provider) {
      throw createError({ statusCode: 400, message: 'provider is required' })
    }

    // Call Better Auth's API to sign-in with social provider
    const result = await auth.api.signInSocial({ provider })

    // Return whatever the auth API returned (likely url + redirect boolean or session)
    return result
  } catch (err) {
    // Bubble up the error with helpful message without leaking secrets
    console.warn('signInSocial proxy failed', (err as any)?.message || err)
    throw createError({ statusCode: 500, message: 'social sign-in failed' })
  }
})
