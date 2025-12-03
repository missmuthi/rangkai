export default eventHandler(async (event) => {
  const pathname = event.context.params?.pathname
  if (!pathname || typeof pathname !== 'string') {
    throw createError({ statusCode: 400, statusMessage: 'pathname required' })
  }

  return hubBlob().delete(pathname)
})
