/**
 * GET /api/profile - Get current user profile
 */

import { requireAuth } from '../utils/auth'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)

  // Return safe user fields
  return {
    id: user.id,
    email: user.email,
    name: user.name,
  }
})
