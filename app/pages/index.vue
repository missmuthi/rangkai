<script setup lang="ts">
/**
 * Landing Page - Consolidated
 * Premium landing page with full features and marketing CTA
 */

useSeoMeta({
  title: 'Rangkai - Book Scanner for Indonesian Librarians',
  description: 'Scan barcodes, fetch metadata from multiple APIs, AI-powered cleanup, and export to SLiMS format. The complete cataloging solution.'
})

const { isAuthenticated } = useAuth()

// Features data for the grid
const features = [
  {
    icon: 'i-lucide-scan-line',
    title: 'Barcode Scanner',
    description: 'Scan ISBN barcodes with your phone camera. Supports ISBN-10 and ISBN-13 formats with real-time detection.'
  },
  {
    icon: 'i-lucide-database',
    title: 'Multi-Source API',
    description: 'Fetch metadata from Google Books, OpenLibrary, and Library of Congress for comprehensive coverage.'
  },
  {
    icon: 'i-lucide-sparkles',
    title: 'AI-Powered Cleanup',
    description: 'Gemini AI normalizes author names, adds DDC/LCC classifications, and enriches subject headings.'
  },
  {
    icon: 'i-lucide-download',
    title: 'SLiMS Export',
    description: 'Export your scan history to SLiMS-compatible CSV format with UTF-8 encoding for seamless import.'
  },
  {
    icon: 'i-lucide-smartphone',
    title: 'PWA Support',
    description: 'Install as a native-like app on any device with offline access and full-screen camera mode.'
  },
  {
    icon: 'i-lucide-history',
    title: 'Cloud Sync',
    description: 'Your scan history is cloud-synced and accessible from any device with real-time search.'
  }
]

// Stats for social proof
const stats = [
  { value: '10K+', label: 'Books Scanned' },
  { value: '500+', label: 'Librarians' },
  { value: '99.9%', label: 'Uptime' }
]
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
        <span>Version 2.0 - Built for Indonesian Libraries</span>
      </div>
      
      <!-- Main Heading -->
      <div class="space-y-6 animate-fade-in" style="animation-delay: 150ms">
        <h1 class="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-foreground">
          📚 <span class="bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">Rangkai</span>
        </h1>
        <p class="text-xl sm:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
          The <span class="text-foreground font-semibold">complete cataloging solution</span> for Indonesian librarians. 
          Scan, fetch, clean, and export bibliographic metadata in seconds.
        </p>
      </div>

      <!-- CTA Buttons -->
      <div class="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in" style="animation-delay: 300ms">
        <UButton
          v-if="!isAuthenticated"
          size="xl"
          icon="i-lucide-rocket"
          @click="navigateTo('/login')"
        >
          Start Scanning Free
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
          icon="i-lucide-book-open"
          @click="navigateTo('/faq')"
        >
          Learn More
        </UButton>
      </div>

      <!-- Stats -->
      <div class="flex flex-wrap justify-center gap-8 pt-8 animate-fade-in" style="animation-delay: 450ms">
        <div v-for="stat in stats" :key="stat.label" class="text-center">
          <div class="text-3xl font-bold text-primary">{{ stat.value }}</div>
          <div class="text-sm text-muted-foreground">{{ stat.label }}</div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="container mx-auto px-4 py-24 space-y-16 bg-muted/30">
      <div class="max-w-4xl mx-auto text-center space-y-6">
        <div class="inline-flex items-center gap-2 rounded-full bg-primary/10 border border-primary/20 px-4 py-1.5 text-sm font-medium text-primary">
          <span>✨</span>
          <span>Everything You Need</span>
        </div>
        <h2 class="text-4xl sm:text-5xl font-bold tracking-tight">
          Modern Cataloging Made Simple
        </h2>
        <p class="text-xl text-muted-foreground">
          From barcode scanning to SLiMS export, Rangkai handles your entire workflow.
        </p>
      </div>
      
      <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        <UCard 
          v-for="feature in features"
          :key="feature.title"
          class="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
          :ui="{ 
            body: { padding: 'p-6 sm:p-8' },
            ring: 'ring-1 ring-border group-hover:ring-primary/50'
          }"
        >
          <div class="space-y-4">
            <div class="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <UIcon :name="feature.icon" class="w-7 h-7 text-primary" />
            </div>
            <h3 class="text-xl font-bold text-foreground">{{ feature.title }}</h3>
            <p class="text-muted-foreground leading-relaxed">
              {{ feature.description }}
            </p>
          </div>
        </UCard>
      </div>
    </section>

    <!-- CTA Section - Marketing for Login -->
    <section class="container mx-auto px-4 py-24">
      <div class="rounded-3xl border bg-gradient-to-br from-primary/10 via-background to-background p-8 md:p-16 text-center space-y-8 relative overflow-hidden">
        <!-- Decorative elements -->
        <div class="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
        <div class="absolute bottom-0 left-0 w-48 h-48 bg-primary/5 rounded-full blur-3xl" />
        
        <div class="relative z-10 space-y-6">
          <div class="inline-flex items-center gap-2 rounded-full bg-primary/10 border border-primary/20 px-4 py-1.5 text-sm font-medium text-primary">
            <UIcon name="i-lucide-zap" class="w-4 h-4" />
            <span>Ready to Transform Your Workflow?</span>
          </div>
          
          <h2 class="text-3xl md:text-5xl font-bold tracking-tight max-w-3xl mx-auto">
            Stop Manual Entry.<br>
            <span class="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">Start Scanning.</span>
          </h2>
          
          <p class="text-lg text-muted-foreground max-w-2xl mx-auto">
            Join hundreds of Indonesian librarians who save hours every week with Rangkai's intelligent metadata harvesting. 
            <span class="text-foreground font-medium">Free to get started.</span>
          </p>
        </div>
        
        <div class="relative z-10 flex flex-col sm:flex-row gap-4 justify-center">
          <UButton 
            v-if="!isAuthenticated"
            size="xl"
            icon="i-lucide-user-plus"
            @click="navigateTo('/register')"
          >
            Create Free Account
          </UButton>
          <UButton
            v-else
            size="xl"
            icon="i-lucide-scan"
            @click="navigateTo('/scan/mobile')"
          >
            Start Scanning Now
          </UButton>
          <UButton 
            size="xl"
            variant="outline"
            icon="i-lucide-message-circle"
            @click="navigateTo('/faq')"
          >
            View FAQ
          </UButton>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <LayoutFooter />
  </main>
</template>
