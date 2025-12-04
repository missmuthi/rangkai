<script setup lang="ts">
useSeoMeta({
  title: 'Rangkai - Book Scanner',
  description: 'Indonesian book metadata harvester for librarians. Scan barcodes, fetch metadata from multiple APIs, export to SLiMS format.'
})
</script>

<template>
  <div class="min-h-screen bg-gradient-to-b from-blue-50 to-white">
    <!-- Hero Section -->
    <header class="container mx-auto px-4 py-16 text-center">
      <h1 class="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
        📚 Rangkai
      </h1>
      <p class="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
        Book metadata harvester for Indonesian librarians. Scan barcodes, fetch metadata from multiple APIs, and export to SLiMS format.
      </p>

      <div class="flex flex-col sm:flex-row gap-4 justify-center">
        <NuxtLink
          to="/scan/mobile"
          class="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
        >
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
          </svg>
          Start Scanning
        </NuxtLink>
        <NuxtLink
          to="/history"
          class="inline-flex items-center justify-center px-6 py-3 bg-white text-gray-700 font-semibold rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
        >
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          View History
        </NuxtLink>
      </div>
    </header>

    <!-- Features Section -->
    <section class="container mx-auto px-4 py-12">
      <div class="grid md:grid-cols-3 gap-8">
        <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
            <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h3 class="text-lg font-semibold text-gray-900 mb-2">Barcode Scanner</h3>
          <p class="text-gray-600">Scan ISBN barcodes with your phone camera for instant book lookup.</p>
        </div>

        <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
            <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h3 class="text-lg font-semibold text-gray-900 mb-2">Multi-Source API</h3>
          <p class="text-gray-600">Fetches metadata from Google Books, OpenLibrary, and Library of Congress.</p>
        </div>

        <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
            <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </div>
          <h3 class="text-lg font-semibold text-gray-900 mb-2">CSV Export</h3>
          <p class="text-gray-600">Export your scan history to SLiMS-compatible CSV format.</p>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="container mx-auto px-4 py-8 text-center text-gray-500 text-sm">
      <p>Rangkai Book Scanner • Built with Nuxt & Cloudflare</p>
    </footer>
  </div>
</template>
