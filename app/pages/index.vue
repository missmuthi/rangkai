<script setup lang="ts">

useSeoMeta({
  title: 'Rangkai - Book Scanner',
  description: 'Indonesian book metadata harvester for librarians. Scan barcodes, fetch metadata from multiple APIs, export to SLiMS format.'
})

const { isAuthenticated } = useAuth()
const { handleSearch } = useSearchRouting()
const scanMode = ref<'camera' | 'manual'>('camera')

function handleScan(isbn: string) {
  handleSearch(isbn)
}
</script>

<template>
  <main class="min-h-screen bg-background">
    <!-- Hero Section -->
    <section class="relative container mx-auto px-4 py-32 sm:py-40 text-center space-y-8 overflow-hidden">
      <!-- Animated Background -->
      <LandingHeroBackground />
      
      <!-- Badge -->
      <div 
        class="inline-flex items-center gap-2 rounded-full bg-primary/10 border border-primary/20 px-4 py-1.5 text-sm font-medium text-primary backdrop-blur-sm animate-fade-in"
      >
        <span class="relative flex h-2 w-2">
          <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
          <span class="relative inline-flex rounded-full h-2 w-2 bg-primary" />
        </span>
        <span>Version 2.0 - New Architecture</span>
      </div>
      
      <!-- Main Heading -->
      <div class="space-y-6 animate-fade-in" style="animation-delay: 150ms">
        <h1 class="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-foreground">
          📚 <span class="bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">Rangkai</span>
        </h1>
        <p class="text-xl sm:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
          Book metadata harvester for <span class="text-foreground font-semibold">Indonesian librarians</span>. 
          Scan barcodes, fetch metadata from multiple APIs, and export to SLiMS format.
        </p>
      </div>

      <!-- CTA Buttons -->
      <div class="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in" style="animation-delay: 300ms">
        <UButton
          v-if="!isAuthenticated"
          size="xl"
          icon="i-lucide-log-in"
          @click="navigateTo('/login')"
        >
          Sign In
        </UButton>
        <UButton
          v-else
          size="xl"
          icon="i-lucide-arrow-right"
          @click="navigateTo('/dashboard')"
        >
          Go to Dashboard
        </UButton>
        <UButton
          size="xl"
          color="gray"
          variant="ghost"
          icon="i-lucide-play-circle"
          @click="navigateTo('/features')"
        >
          Learn More
        </UButton>
      </div>
    </section>

    <!-- Interactive Demo Section -->
    <section class="container mx-auto px-4 py-16 space-y-8">
      <div class="text-center space-y-4">
        <h2 class="text-3xl font-bold tracking-tight">Try It Now</h2>
        <p class="text-muted-foreground">Experience the scanner right from your browser.</p>
      </div>

      <div class="max-w-xl mx-auto space-y-8">
        <!-- Scanner Toggle -->
        <div class="flex justify-center">
          <ScannerToggle v-model="scanMode" />
        </div>
        
        <!-- Manual Input Demo -->
        <div v-if="scanMode === 'manual'" class="rounded-xl border bg-card text-card-foreground shadow p-6">
          <ScannerManual @search="handleScan" />
        </div>
        
        <!-- Camera Placeholder -->
        <div v-else class="rounded-xl border bg-muted/50 overflow-hidden shadow-inner">
          <div class="aspect-[4/3] flex items-center justify-center">
            <div class="text-center space-y-4 p-6">
              <ScanBarcode class="w-16 h-16 mx-auto text-muted-foreground/50" />
              <div>
                <p class="text-sm font-medium">Camera scanner available on mobile</p>
                <UButton variant="link" class="mt-2" @click="navigateTo('/scan/mobile')">
                  Open Mobile Scanner
                  <template #trailing>
                    <UIcon name="i-lucide-arrow-right" class="w-4 h-4" />
                  </template>
                </UButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="container mx-auto px-4 py-24 space-y-16">
      <div class="max-w-4xl mx-auto text-center space-y-6">
        <div class="inline-flex items-center gap-2 rounded-full bg-primary/10 border border-primary/20 px-4 py-1.5 text-sm font-medium text-primary">
          <span>✨</span>
          <span>Powerful Features</span>
        </div>
        <h2 class="text-4xl sm:text-5xl font-bold tracking-tight">
          Book metadata harvester for Indonesian librarians
        </h2>
        <p class="text-xl text-muted-foreground">
          Scan, fetch, <span class="text-primary font-semibold">and clean</span> bibliographic metadata with AI for seamless SLiMS cataloging.
        </p>
      </div>
      
      <div class="grid md:grid-cols-3 gap-8">
        <UCard 
          class="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
          :ui="{ 
            body: { padding: 'p-6 sm:p-8' },
            ring: 'ring-1 ring-border group-hover:ring-primary/50'
          }"
        >
          <div class="space-y-4">
            <div class="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <UIcon name="i-lucide-scan-line" class="w-7 h-7 text-primary" />
            </div>
            <h3 class="text-xl font-bold text-foreground">Barcode Scanner</h3>
            <p class="text-muted-foreground leading-relaxed">
              Scan ISBN barcodes with your phone camera for instant book lookup. Supports both ISBN-10 and ISBN-13 formats.
            </p>
          </div>
        </UCard>

        <UCard 
          class="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
          :ui="{ 
            body: { padding: 'p-6 sm:p-8' },
            ring: 'ring-1 ring-border group-hover:ring-primary/50'
          }"
        >
          <div class="space-y-4">
            <div class="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <UIcon name="i-lucide-book-open" class="w-7 h-7 text-primary" />
            </div>
            <h3 class="text-xl font-bold text-foreground">Multi-Source API</h3>
            <p class="text-muted-foreground leading-relaxed">
              Fetches metadata from Google Books, OpenLibrary, and Library of Congress for comprehensive coverage.
            </p>
          </div>
        </UCard>

        <UCard 
          class="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
          :ui="{ 
            body: { padding: 'p-6 sm:p-8' },
            ring: 'ring-1 ring-border group-hover:ring-primary/50'
          }"
        >
          <div class="space-y-4">
            <div class="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <UIcon name="i-lucide-download" class="w-7 h-7 text-primary" />
            </div>
            <h3 class="text-xl font-bold text-foreground">SLiMS Export</h3>
            <p class="text-muted-foreground leading-relaxed">
              Export your scan history to SLiMS-compatible CSV format for seamless library system integration.
            </p>
          </div>
        </UCard>
      </div>
    </section>

    <!-- Footer -->
    <LayoutFooter />
  </main>
</template>
