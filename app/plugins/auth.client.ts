export default defineNuxtPlugin(async () => {
  const { fetchSession } = useAuth()

  // Fetch session on app load
  await fetchSession()
})
