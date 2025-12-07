<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4">
    <div class="max-w-md w-full space-y-8">
      <!-- Header -->
      <div class="text-center">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
          Welcome to Rangkai
        </h1>
        <p class="mt-2 text-gray-600 dark:text-gray-400">
          Sign in to manage your book catalog
        </p>
      </div>

      <!-- Error Alert -->
      <div v-if="error" class="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-lg">
        {{ error }}
      </div>

      <!-- OAuth Buttons -->
      <div class="space-y-3">
        <button
          class="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition"
          @click="handleGoogleLogin"
        >
          <svg class="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          <span class="text-gray-700 dark:text-gray-300">Continue with Google</span>
        </button>
      </div>

      <p class="text-xs text-center text-gray-500 dark:text-gray-400 pt-4">
        By continuing, you verify that you are an authorized user of this library.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false
})

const { isAuthenticated } = useAuth()
const route = useRoute()
const router = useRouter()

const error = ref('')

// Redirect if already authenticated
watch(isAuthenticated, (value) => {
  if (value) {
    const redirect = route.query.redirect as string || '/dashboard'
    router.push(redirect)
  }
}, { immediate: true })

// function handleEmailLogin() ... removed

function handleGoogleLogin() {
  window.location.href = '/api/auth/google'
}

onMounted(() => {
  const query = route.query
  if (query.error) {
    const errorMap: Record<string, string> = {
      'oauth_provider_error': 'Google authentication failed.',
      'oauth_missing_params': 'Invalid response from Google.',
      'oauth_state_mismatch': 'Security check failed. Please try again.',
      'oauth_token_exchange_failed': 'Failed to connect to Google.',
      'oauth_user_info_failed': 'Failed to get user info from Google.',
      'oauth_not_configured': 'Google Sign-In is not configured.',
      'auth_not_configured': 'Authentication is not configured.',
    }
    
    const errCode = Array.isArray(query.error) ? query.error[0] : query.error
    const msg = errorMap[errCode as string] || 'Authentication failed'
    
    if (query.details) {
       // Optional: Log details to console but don't show to user unless sanitized
       console.warn('Auth Error Details:', query.details)
    }
    
    error.value = msg
  }
})
</script>
