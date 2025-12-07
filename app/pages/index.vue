<script setup lang="ts">
useSeoMeta({
  title: 'Rangkai - Book Scanner',
  description: 'Indonesian book metadata harvester for librarians. Scan barcodes, fetch metadata from multiple APIs, export to SLiMS format.'
})

const { isAuthenticated } = useAuth()
const scanMode = ref<'camera' | 'manual'>('camera')

function handleScan(isbn: string) {
  // Navigate to mobile scanner with the ISBN
  navigateTo(`/scan/mobile?isbn=${isbn}`)
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
    <!-- Hero Section -->
    <header class="container mx-auto px-4 py-16 text-center">
      <div class="inline-flex items-center gap-2 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 px-4 py-2 rounded-full text-sm font-medium mb-6">
        <span class="relative flex h-2 w-2">
          <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
          <span class="relative inline-flex rounded-full h-2 w-2 bg-indigo-500" />
        </span>
        Version 2.0 - New Architecture
      </div>
      
      <h1 class="text-5xl md:text-6xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-6">
        📚 Rangkai
      </h1>
      <p class="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-8">
        Book metadata harvester for Indonesian librarians. Scan barcodes, fetch metadata from multiple APIs, and export to SLiMS format.
      </p>

      <div class="flex flex-col sm:flex-row gap-4 justify-center">
        <NuxtLink
          to="/scan/mobile"
          class="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        >
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
          </svg>
          Start Scanning
        </NuxtLink>
        <NuxtLink
          v-if="isAuthenticated"
          to="/history"
          class="inline-flex items-center justify-center px-8 py-4 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 font-semibold rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600 transition-all"
        >
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          View History
        </NuxtLink>
        <NuxtLink
          v-else
          to="/auth/login"
          class="inline-flex items-center justify-center px-8 py-4 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 font-semibold rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600 transition-all"
        >
          Sign In
        </NuxtLink>
      </div>
    </header>

    <!-- Interactive Demo Section -->
    <section class="container mx-auto px-4 py-12">
      <div class="max-w-xl mx-auto">
        <h2 class="text-2xl font-bold text-center text-gray-900 dark:text-white mb-6">
          Try It Now
        </h2>
        
        <!-- Scanner Toggle -->
        <div class="flex justify-center mb-6">
          <ScannerToggle v-model="scanMode" />
        </div>
        
        <!-- Manual Input Demo -->
        <div v-if="scanMode === 'manual'" class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
          <ScannerManual @search="handleScan" />
        </div>
        
        <!-- Camera Placeholder -->
        <div v-else class="bg-gray-900 rounded-2xl overflow-hidden shadow-xl">
          <div class="aspect-[4/3] flex items-center justify-center">
            <div class="text-center text-gray-400">
              <svg class="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <p class="text-sm">Camera scanner available on mobile</p>
              <NuxtLink to="/scan/mobile" class="text-indigo-400 hover:text-indigo-300 text-sm underline mt-2 inline-block">
                Open Mobile Scanner →
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="container mx-auto px-4 py-16">
      <h2 class="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">Features</h2>
      <div class="grid md:grid-cols-3 gap-8">
        <div class="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-shadow">
          <div class="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mb-6">
            <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-3">Barcode Scanner</h3>
          <p class="text-gray-600 dark:text-gray-400">Scan ISBN barcodes with your phone camera for instant book lookup. Supports both ISBN-10 and ISBN-13 formats.</p>
        </div>

        <div class="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-shadow">
          <div class="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mb-6">
            <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-3">Multi-Source API</h3>
          <p class="text-gray-600 dark:text-gray-400">Fetches metadata from Google Books, OpenLibrary, and Library of Congress for comprehensive coverage.</p>
        </div>

        <div class="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-shadow">
          <div class="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mb-6">
            <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </div>
          <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-3">SLiMS Export</h3>
          <p class="text-gray-600 dark:text-gray-400">Export your scan history to SLiMS-compatible CSV format for seamless library system integration.</p>
        </div>
      </div>
    </section>
  </div>
</template>
