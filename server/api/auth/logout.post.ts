export default defineEventHandler(async (event) => {
  try {
    await signOutFromEvent(event)
    return { ok: true }
  } catch (err) {
    console.warn('signOut failed', err)
    return sendRedirect(event, '/api/auth/sign-out', 302)
  }
})
