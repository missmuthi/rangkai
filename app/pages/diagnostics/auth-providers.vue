<script setup lang="ts">
type ProvidersResponse = {
  siteUrl: string | null
  providers: Record<string, boolean>
}

const { data, pending, error, refresh } = await useFetch<ProvidersResponse>(
  '/api/auth/providers',
  {
    server: false,
  }
)

const providerEntries = computed(() => {
  return data.value ? Object.entries(data.value.providers) : []
})
</script>

<template>
  <main class="max-w-2xl mx-auto px-4 py-10 space-y-6">
    <header class="space-y-2">
      <p class="text-sm text-gray-500">Diagnostics</p>
      <h1 class="text-2xl font-semibold text-gray-900">Auth Providers Status</h1>
      <p class="text-sm text-gray-600">
        Fetches <code>/api/auth/providers</code> to verify which OAuth providers are enabled in the current deployment.
      </p>
    </header>

    <section class="rounded-lg border border-gray-200 bg-white shadow-sm p-4 space-y-3">
      <div class="flex items-center justify-between">
        <div class="space-y-1">
          <p class="text-sm font-medium text-gray-900">Request</p>
          <p class="text-xs text-gray-500">GET /api/auth/providers</p>
        </div>
        <button
          type="button"
          class="inline-flex items-center gap-2 rounded-md border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          :disabled="pending"
          @click="() => refresh()"
        >
          <span v-if="pending" class="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
          <span v-else class="h-4 w-4 text-gray-500">↻</span>
          Refresh
        </button>
      </div>

      <div v-if="pending" class="text-sm text-gray-600">Loading...</div>
      <div v-else-if="error" class="text-sm text-red-600">
        Failed to load providers: {{ error.message }}
      </div>
      <div v-else-if="data" class="space-y-3">
        <div class="text-sm text-gray-700">
          <span class="font-medium">siteUrl:</span>
          <span class="ml-1">{{ data.siteUrl || 'not set' }}</span>
        </div>

        <div class="space-y-1">
          <p class="text-sm font-medium text-gray-900">Providers</p>
          <div class="divide-y divide-gray-200 rounded-md border border-gray-200">
            <div v-if="providerEntries.length === 0" class="px-3 py-2 text-sm text-gray-600">
              No providers returned.
            </div>
            <div
              v-for="[name, enabled] in providerEntries"
              :key="name"
              class="flex items-center justify-between px-3 py-2"
            >
              <span class="text-sm text-gray-800">{{ name }}</span>
              <span
                :class="[
                  'text-xs font-semibold px-2 py-1 rounded-full border',
                  enabled
                    ? 'text-green-700 border-green-200 bg-green-50'
                    : 'text-red-700 border-red-200 bg-red-50'
                ]"
              >
                {{ enabled ? 'ENABLED' : 'DISABLED' }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  </main>
</template>
