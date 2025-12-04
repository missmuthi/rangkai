<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <header class="bg-white dark:bg-gray-800 shadow">
      <div class="container mx-auto px-4 py-4">
        <div class="flex items-center justify-between">
          <NuxtLink to="/" class="text-xl font-bold text-indigo-600 dark:text-indigo-400">
            Rangkai
          </NuxtLink>
          <nav class="flex items-center gap-4">
            <NuxtLink
              to="/scan"
              class="text-gray-700 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400"
            >
              Scan
            </NuxtLink>
            <NuxtLink
              to="/history"
              class="text-gray-700 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400"
            >
              History
            </NuxtLink>
            <AuthIndicator />
          </nav>
        </div>
      </div>
    </header>

    <main>
      <slot />
    </main>

    <footer class="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-auto">
      <div class="container mx-auto px-4 py-6">
        <p class="text-center text-sm text-gray-500 dark:text-gray-400">
          &copy; {{ new Date().getFullYear() }} Rangkai. All rights reserved.
        </p>
      </div>
    </footer>
  </div>
</template>
