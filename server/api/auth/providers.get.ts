export default defineEventHandler((event) => {
  const config = useRuntimeConfig()

  // Determine which social providers are configured based on runtime config
  const providers: Record<string, boolean> = {
    google: !!(config.oauthGoogleClientId && config.oauthGoogleClientSecret),
  }

  return {
    siteUrl: config.public.siteUrl || null,
    providers,
  }
})
