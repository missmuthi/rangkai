<script setup lang="ts">
import { ScanBarcode, History, LogIn, ArrowRight } from 'lucide-vue-next'
import Button from '@/components/ui/Button.vue'
import Card from '@/components/ui/Card.vue'
import CardContent from '@/components/ui/CardContent.vue'

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
    <section class="container mx-auto px-4 py-24 text-center space-y-8">
      <div class="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-medium text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
        <span class="relative flex h-2 w-2">
          <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
          <span class="relative inline-flex rounded-full h-2 w-2 bg-primary" />
        </span>
        <span class="text-muted-foreground">Version 2.0 - New Architecture</span>
      </div>
      
      <div class="space-y-4">
        <h1 class="text-4xl font-extrabold tracking-tight lg:text-5xl text-foreground">
          📚 Rangkai
        </h1>
        <p class="text-xl text-muted-foreground max-w-2xl mx-auto">
          Book metadata harvester for Indonesian librarians. Scan barcodes, fetch metadata from multiple APIs, and export to SLiMS format.
        </p>
      </div>

      <div class="flex flex-col sm:flex-row gap-4 justify-center items-center">
        <Button 
          v-if="!isAuthenticated" 
          variant="default" 
          class="h-12 px-8 text-lg"
          @click="navigateTo('/login')"
        >
          <LogIn class="mr-2 h-5 w-5" />
          Sign In
        </Button>
        <Button 
          v-else 
          variant="default" 
          class="h-12 px-8 text-lg"
          @click="navigateTo('/dashboard')"
        >
          <ArrowRight class="mr-2 h-5 w-5" />
          Go to Dashboard
        </Button>
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
                <Button variant="link" class="mt-2" @click="navigateTo('/scan/mobile')">
                  Open Mobile Scanner <ArrowRight class="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="container mx-auto px-4 py-24 space-y-12">
      <div class="text-center space-y-4">
        <h2 class="text-3xl font-bold tracking-tight">Features</h2>
        <p class="text-muted-foreground max-w-2xl mx-auto">
          Everything you need to streamline your library cataloging workflow.
        </p>
      </div>
      
      <div class="grid md:grid-cols-3 gap-8">
        <Card>
          <CardContent class="pt-6 space-y-4">
            <div class="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <ScanBarcode class="w-6 h-6 text-primary" />
            </div>
            <h3 class="text-xl font-bold">Barcode Scanner</h3>
            <p class="text-muted-foreground">
              Scan ISBN barcodes with your phone camera for instant book lookup. Supports both ISBN-10 and ISBN-13 formats.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent class="pt-6 space-y-4">
            <div class="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <BookOpen class="w-6 h-6 text-primary" />
            </div>
            <h3 class="text-xl font-bold">Multi-Source API</h3>
            <p class="text-muted-foreground">
              Fetches metadata from Google Books, OpenLibrary, and Library of Congress for comprehensive coverage.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent class="pt-6 space-y-4">
            <div class="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Download class="w-6 h-6 text-primary" />
            </div>
            <h3 class="text-xl font-bold">SLiMS Export</h3>
            <p class="text-muted-foreground">
              Export your scan history to SLiMS-compatible CSV format for seamless library system integration.
            </p>
          </CardContent>
        </Card>
      </div>
    </section>
  </main>
</template>
