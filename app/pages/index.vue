<script setup lang="ts">
/**
 * Landing Page - Consolidated
 * Premium landing page with full features and marketing CTA
 */

useSeoMeta({
  title: 'Rangkai - The Fastest Way to Catalog Books for SLiMS',
  description: 'Scan ISBN barcodes, fetch metadata from multiple sources, AI-powered cleanup, and one-click export to SLiMS-compatible CSV. Join 500+ Indonesian libraries saving 15+ hours weekly.'
})

const { isAuthenticated } = useAuth()

// Features data for the grid - User-benefit focused, SLiMS first
const features = [
  {
    icon: 'i-lucide-download',
    title: 'One-Click SLiMS Export',
    description: 'Export directly to SLiMS-compatible CSV format. No manual reformatting required. Just scan, clean, and import.'
  },
  {
    icon: 'i-lucide-scan-line',
    title: 'Instant Barcode Scanning',
    description: 'Point your phone camera at any ISBN barcode and get complete book details in seconds. Works with ISBN-10 and ISBN-13.'
  },
  {
    icon: 'i-lucide-database',
    title: 'Comprehensive Book Database',
    description: 'Search across Google Books, OpenLibrary, and Library of Congress simultaneously for the most complete metadata coverage.'
  },
  {
    icon: 'i-lucide-sparkles',
    title: 'AI-Powered Data Cleanup',
    description: 'Gemini AI automatically normalizes author names, adds DDC/LCC classifications, and enriches subject headings—no manual work needed.'
  },
  {
    icon: 'i-lucide-smartphone',
    title: 'Works Offline on Any Device',
    description: 'Install as a mobile app with offline access. Full-screen camera mode for faster scanning. No internet required once installed.'
  },
  {
    icon: 'i-lucide-globe',
    title: 'Access Your Library Anywhere',
    description: 'Your catalog is securely stored in the cloud. Search, edit, and export from any device with automatic real-time sync.'
  }
]

// Stats for social proof - User-facing metrics
const stats = [
  { value: '10K+', label: 'Books Cataloged' },
  { value: '500+', label: 'Libraries Using Rangkai' },
  { value: '15+', label: 'Hours Saved Weekly' }
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
        <span>📚 Rangkai v2.0 • Trusted by 500+ Indonesian Libraries</span>
      </div>
      
      <!-- Main Heading - Value Prop First -->
      <div class="space-y-6 animate-fade-in" style="animation-delay: 150ms">
        <h1 class="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-foreground leading-tight">
          The Fastest Way to <br>
          <span class="bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">Catalog Books for SLiMS</span>
        </h1>
        <p class="text-xl sm:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
          Scan barcodes, fetch complete metadata from multiple sources, clean with AI, and export directly to SLiMS-compatible CSV. 
          <span class="text-foreground font-semibold">All in under 30 seconds per book.</span>
        </p>
        
        <!-- Pricing Clarity -->
        <div class="flex items-center justify-center gap-2 text-sm text-primary">
          <UIcon name="i-lucide-check-circle" class="w-4 h-4" />
          <span class="font-medium">Free Forever • No Credit Card Required</span>
        </div>
      </div>

      <!-- CTA Buttons -->
      <div class="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in" style="animation-delay: 300ms">
        <UButton
          v-if="!isAuthenticated"
          size="xl"
          icon="i-lucide-scan"
          @click="navigateTo('/login')"
        >
          Start Cataloging Free
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
          color="gray"
          variant="outline"
          icon="i-lucide-play-circle"
          @click="navigateTo('#demo')"
        >
          See How It Works
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

    <!-- How It Works Section -->
    <section class="container mx-auto px-4 py-24">
      <div class="max-w-4xl mx-auto text-center space-y-12">
        <div>
          <div class="inline-flex items-center gap-2 rounded-full bg-primary/10 border border-primary/20 px-4 py-1.5 text-sm font-medium text-primary mb-6">
            <span>🚀</span>
            <span>Simple 3-Step Process</span>
          </div>
          <h2 class="text-4xl sm:text-5xl font-bold tracking-tight">
            From Barcode to SLiMS in 30 Seconds
          </h2>
        </div>
        
        <div class="grid md:grid-cols-3 gap-8 text-left">
          <!-- Step 1 -->
          <div class="relative">
            <div class="absolute -top-4 -left-4 w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-xl font-bold text-primary">
              1
            </div>
            <UCard :ui="{ body: { padding: 'p-6' } }">
              <div class="space-y-4">
                <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-blue-500/10 flex items-center justify-center">
                  <UIcon name="i-lucide-scan" class="w-8 h-8 text-blue-500" />
                </div>
                <h3 class="text-xl font-bold">Scan Barcode</h3>
                <p class="text-muted-foreground">
                  Point your phone camera at the ISBN barcode. Instant detection—no typing required.
                </p>
              </div>
            </UCard>
          </div>
          
          <!-- Step 2 -->
          <div class="relative">
            <div class="absolute -top-4 -left-4 w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-xl font-bold text-primary">
              2
            </div>
            <UCard :ui="{ body: { padding: 'p-6' } }">
              <div class="space-y-4">
                <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-purple-500/10 flex items-center justify-center">
                  <UIcon name="i-lucide-sparkles" class="w-8 h-8 text-purple-500" />
                </div>
                <h3 class="text-xl font-bold">AI Cleans Data</h3>
                <p class="text-muted-foreground">
                  Gemini AI fetches metadata, normalizes authors, adds classifications, and enriches subject headings automatically.
                </p>
              </div>
            </UCard>
          </div>
          
          <!-- Step 3 -->
          <div class="relative">
            <div class="absolute -top-4 -left-4 w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-xl font-bold text-primary">
              3
            </div>
            <UCard :ui="{ body: { padding: 'p-6' } }">
              <div class="space-y-4">
                <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500/20 to-green-500/10 flex items-center justify-center">
                  <UIcon name="i-lucide-download" class="w-8 h-8 text-green-500" />
                </div>
                <h3 class="text-xl font-bold">Export to SLiMS</h3>
                <p class="text-muted-foreground">
                  One-click CSV export in SLiMS format. Import directly—no reformatting needed.
                </p>
              </div>
            </UCard>
          </div>
        </div>
      </div>
    </section>

    <!-- Product Demo Section (Placeholder) -->
    <section id="demo" class="container mx-auto px-4 py-24 bg-muted/30">
      <div class="max-w-6xl mx-auto">
        <div class="grid lg:grid-cols-2 gap-12 items-center">
          <!-- Left: Text -->
          <div class="space-y-6">
            <div class="inline-flex items-center gap-2 rounded-full bg-primary/10 border border-primary/20 px-4 py-1.5 text-sm font-medium text-primary">
              <UIcon name="i-lucide-eye" class="w-4 h-4" />
              <span>See It In Action</span>
            </div>
            <h2 class="text-4xl sm:text-5xl font-bold tracking-tight">
              Watch Rangkai Work Its Magic
            </h2>
            <p class="text-xl text-gray-300 leading-relaxed">
              From scanning a barcode to getting publication-ready metadata, see how Rangkai eliminates hours of manual data entry.
            </p>
            <ul class="space-y-3">
              <li class="flex items-start gap-3">
                <UIcon name="i-lucide-check" class="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                <span class="text-gray-300">Real-time barcode scanning with instant metadata retrieval</span>
              </li>
              <li class="flex items-start gap-3">
                <UIcon name="i-lucide-check" class="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                <span class="text-gray-300">AI-powered cleanup with DDC/LCC classification</span>
              </li>
              <li class="flex items-start gap-3">
                <UIcon name="i-lucide-check" class="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                <span class="text-gray-300">SLiMS-ready CSV export with UTF-8 encoding</span>
              </li>
            </ul>
          </div>
          
          <!-- Right: Placeholder for demo -->
          <div class="relative">
            <div class="aspect-video rounded-2xl border-4 border-primary/20 bg-gradient-to-br from-primary/10 to-background flex items-center justify-center">
              <div class="text-center space-y-4 p-8">
                <UIcon name="i-lucide-image" class="w-16 h-16 text-primary/50 mx-auto" />
                <p class="text-muted-foreground text-sm">
                  Product demo screenshots/GIF will be added here
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Testimonials Section (Placeholder) -->
    <section class="container mx-auto px-4 py-24">
      <div class="max-w-6xl mx-auto space-y-12">
        <div class="text-center space-y-6">
          <div class="inline-flex items-center gap-2 rounded-full bg-primary/10 border border-primary/20 px-4 py-1.5 text-sm font-medium text-primary">
            <span>💬</span>
            <span>Loved by Librarians</span>
          </div>
          <h2 class="text-4xl sm:text-5xl font-bold tracking-tight">
            What Indonesian Libraries Are Saying
          </h2>
        </div>
        
        <div class="grid md:grid-cols-3 gap-8">
          <!-- Placeholder Testimonial 1 -->
          <UCard :ui="{ body: { padding: 'p-6' } }">
            <div class="space-y-4">
              <div class="flex gap-1">
                <UIcon v-for="i in 5" :key="i" name="i-lucide-star" class="w-4 h-4 text-yellow-500 fill-current" />
              </div>
              <p class="text-gray-300 italic">
                "Rangkai cut my cataloging time from 20 minutes per book to under 2 minutes. The AI cleanup is shockingly accurate."
              </p>
              <div class="pt-4 border-t border-border">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <UIcon name="i-lucide-user" class="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p class="font-semibold text-foreground">Testimonial Placeholder</p>
                    <p class="text-sm text-muted-foreground">Library Name</p>
                  </div>
                </div>
              </div>
            </div>
          </UCard>
          
          <!-- Placeholder Testimonial 2 -->
          <UCard :ui="{ body: { padding: 'p-6' } }">
            <div class="space-y-4">
              <div class="flex gap-1">
                <UIcon v-for="i in 5" :key="i" name="i-lucide-star" class="w-4 h-4 text-yellow-500 fill-current" />
              </div>
              <p class="text-gray-300 italic">
                "The SLiMS export feature is a game-changer. No more manual CSV formatting—it just works perfectly."
              </p>
              <div class="pt-4 border-t border-border">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <UIcon name="i-lucide-user" class="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p class="font-semibold text-foreground">Testimonial Placeholder</p>
                    <p class="text-sm text-muted-foreground">Library Name</p>
                  </div>
                </div>
              </div>
            </div>
          </UCard>
          
          <!-- Placeholder Testimonial 3 -->
          <UCard :ui="{ body: { padding: 'p-6' } }">
            <div class="space-y-4">
              <div class="flex gap-1">
                <UIcon v-for="i in 5" :key="i" name="i-lucide-star" class="w-4 h-4 text-yellow-500 fill-current" />
              </div>
              <p class="text-gray-300 italic">
                "Finally, a tool that understands Indonesian library workflows. The offline mode is perfect for our rural school."
              </p>
              <div class="pt-4 border-t border-border">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <UIcon name="i-lucide-user" class="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p class="font-semibold text-foreground">Testimonial Placeholder</p>
                    <p class="text-sm text-muted-foreground">Library Name</p>
                  </div>
                </div>
              </div>
            </div>
          </UCard>
        </div>
      </div>
    </section>

    <!-- Social Proof - Trusted By (Placeholder) -->
    <section class="container mx-auto px-4 py-16 bg-muted/30">
      <div class="max-w-4xl mx-auto text-center space-y-8">
        <p class="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          Trusted by Leading Indonesian Libraries
        </p>
        <div class="flex flex-wrap justify-center items-center gap-8 opacity-60">
          <!-- Placeholder for school logos -->
          <div class="px-8 py-4 rounded-lg bg-foreground/5 border border-border">
            <p class="text-foreground/50 font-medium">School Logo 1</p>
          </div>
          <div class="px-8 py-4 rounded-lg bg-foreground/5 border border-border">
            <p class="text-foreground/50 font-medium">School Logo 2</p>
          </div>
          <div class="px-8 py-4 rounded-lg bg-foreground/5 border border-border">
            <p class="text-foreground/50 font-medium">School Logo 3</p>
          </div>
          <div class="px-8 py-4 rounded-lg bg-foreground/5 border border-border">
            <p class="text-foreground/50 font-medium">School Logo 4</p>
          </div>
        </div>
        <p class="text-xs text-muted-foreground italic">
          (Placeholder for actual school/library logos - awaiting assets)
        </p>
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
            Join 500+ Indonesian Librarians<br>
            <span class="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">Saving 15+ Hours Every Week</span>
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

  </main>
</template>
