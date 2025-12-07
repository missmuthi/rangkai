import { toWebRequest } from 'better-auth/h3'

export default defineEventHandler(async (event) => {
  const provider = getRouterParam(event, 'provider')

  if (!provider) {
    throw createError({ statusCode: 400, message: 'Provider is required' })
  }

  // Delegate to Better Auth's handler so social sign-in follows the same logic
  const auth = getAuth()
  return auth.handler(toWebRequest(event))
})
