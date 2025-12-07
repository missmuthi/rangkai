<script setup lang="ts">
import { 
  ScanBarcode, 
  Database, 
  Sparkles, 
  Download, 
  Smartphone, 
  History, 
  Zap,
  Globe
} from 'lucide-vue-next'
import Card from '@/components/ui/Card.vue'
import CardContent from '@/components/ui/CardContent.vue'
import CardHeader from '@/components/ui/CardHeader.vue'
import CardTitle from '@/components/ui/CardTitle.vue'

useSeoMeta({
  title: 'Features - Rangkai Book Scanner',
  description: 'Discover how Rangkai helps Indonesian librarians with barcode scanning, metadata harvesting, AI-powered cleanup, and SLiMS export.'
})

const features = [
  {
    icon: ScanBarcode,
    title: 'Barcode Scanner',
    description: 'Scan ISBN barcodes with your phone camera using html5-qrcode library.',
    highlights: [
      'Supports ISBN-10 and ISBN-13 formats',
      'Real-time camera scanning',
      'Manual ISBN entry fallback',
      'Mobile-optimized interface'
    ]
  },
  {
    icon: Database,
    title: 'Multi-Source Metadata',
    description: 'Fetch comprehensive book data from multiple trusted sources.',
    highlights: [
      'Google Books API integration',
      'OpenLibrary database access',
      'Library of Congress catalog',
      'Smart source prioritization'
    ]
  },
  {
    icon: Sparkles,
    title: 'AI-Powered Cleanup',
    description: 'Gemini AI automatically normalizes and enriches metadata.',
    highlights: [
      'Author name standardization',
      'DDC/LCC classification',
      'Language detection',
      'Subject heading extraction'
    ]
  },
  {
    icon: Download,
    title: 'SLiMS Export',
    description: 'Export scan history to SLiMS-compatible CSV format.',
    highlights: [
      'UTF-8 encoding with BOM',
      'Excel-ready formatting',
      'Bulk export support',
      'One-click download'
    ]
  },
  {
    icon: Smartphone,
    title: 'PWA Support',
    description: 'Install Rangkai as a native-like app on any device.',
    highlights: [
      'Offline access capability',
      'Home screen installation',
      'Full-screen camera mode',
      'Background sync'
    ]
  },
  {
    icon: History,
    title: 'Scan History',
    description: 'Cloud-synced history accessible from any device.',
    highlights: [
      'Real-time search and filtering',
      'Edit and update metadata',
      'Delete unwanted scans',
      'Export partial selections'
    ]
  },
  {
    icon: Zap,
    title: 'Edge Performance',
    description: 'Blazing fast global access via Cloudflare Pages.',
    highlights: [
      'Sub-100ms response times',
      'Edge caching for metadata',
      'D1 database on CDN',
      'Zero cold starts'
    ]
  },
  {
    icon: Globe,
    title: 'Indonesian Focus',
    description: 'Tailored specifically for Indonesian library workflows.',
    highlights: [
      'Optimized for local books',
      'SLiMS system compatibility',
      'Indonesian language support',
      'Perpusnas integration ready'
    ]
  }
]
</script>

<template>
  <main class="min-h-screen bg-background">
    <!-- Hero Section -->
    <section class="container mx-auto px-4 py-16 md:py-24 text-center space-y-6">
      <div class="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-medium text-foreground">
        <Sparkles class="h-4 w-4 text-primary" />
        <span class="text-muted-foreground">Powered by Cloudflare Edge + Gemini AI</span>
      </div>
      
      <div class="space-y-4 max-w-3xl mx-auto">
        <h1 class="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground">
          Everything You Need for Modern Cataloging
        </h1>
        <p class="text-xl text-muted-foreground">
          Rangkai combines cutting-edge technology with librarian workflows to make book metadata management effortless.
        </p>
      </div>
    </section>

    <!-- Features Grid -->
    <section class="container mx-auto px-4 py-16 space-y-8">
      <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card 
          v-for="feature in features" 
          :key="feature.title"
          class="transition-all hover:shadow-lg hover:border-primary/50"
        >
          <CardHeader>
            <div class="flex items-start gap-4">
              <div class="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <component :is="feature.icon" class="w-6 h-6 text-primary" />
              </div>
              <div>
                <CardTitle class="text-xl">{{ feature.title }}</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent class="space-y-4">
            <p class="text-muted-foreground">
              {{ feature.description }}
            </p>
            <ul class="space-y-2">
              <li 
                v-for="highlight in feature.highlights" 
                :key="highlight"
                class="flex items-start gap-2 text-sm"
              >
                <span class="text-primary mt-1">✓</span>
                <span class="text-muted-foreground">{{ highlight }}</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="container mx-auto px-4 py-16 md:py-24">
      <div class="rounded-2xl border bg-gradient-to-br from-primary/5 via-background to-background p-8 md:p-12 text-center space-y-6">
        <div class="space-y-4">
          <h2 class="text-3xl md:text-4xl font-bold tracking-tight">
            Ready to Transform Your Cataloging?
          </h2>
          <p class="text-lg text-muted-foreground max-w-2xl mx-auto">
            Join Indonesian librarians who are already using Rangkai to streamline their workflows.
          </p>
        </div>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <UiButton 
            as-child
            size="lg"
            class="text-base"
          >
            <NuxtLink to="/login">
              Get Started Free
            </NuxtLink>
          </UiButton>
          <UiButton 
            as-child
            variant="outline"
            size="lg"
            class="text-base"
          >
            <NuxtLink to="/faq">
              View Tutorials
            </NuxtLink>
          </UiButton>
        </div>
      </div>
    </section>
  </main>
</template>
