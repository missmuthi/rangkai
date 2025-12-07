import { getUserFromEvent } from '../utils/auth'

export default defineEventHandler(async (event) => {
  const user = await getUserFromEvent(event)

  return {
    user: user || null
  }
})
