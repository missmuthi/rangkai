export default defineEventHandler((event) => {
  const auth = getAuth()
  return auth.handler(toWebRequest(event))
})
