import { toWebRequest } from 'h3'

export default defineEventHandler((event) => {
  const auth = getAuth()

  // Delegate all /api/auth/* routes to Better Auth's handler
  return auth.handler(toWebRequest(event))
})
