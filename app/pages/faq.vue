<script setup lang="ts">
import { Search, HelpCircle, ScanBarcode, Sparkles, Download, Smartphone, AlertCircle } from 'lucide-vue-next'
import Card from '@/components/ui/Card.vue'

useSeoMeta({
  title: 'FAQ & Tutorials - Rangkai Book Scanner',
  description: 'Learn how to use Rangkai features with step-by-step tutorials and troubleshooting guides.'
})

const searchQuery = ref('')

interface FaqItem {
  question: string
  answer: string
  category: string
  icon?: typeof HelpCircle
}

const faqs: FaqItem[] = [
  // Getting Started
  {
    category: 'Getting Started',
    icon: HelpCircle,
    question: 'How do I sign in to Rangkai?',
    answer: '1. Visit the homepage at rangkai-d3k.pages.dev\n2. Click "Sign In" in the top navigation\n3. Click "Continue with Google"\n4. Select your Google account\n5. You\'ll be redirected to your dashboard'
  },
  {
    category: 'Getting Started',
    icon: HelpCircle,
    question: 'What browsers are supported?',
    answer: 'Rangkai works best on:\n• Google Chrome (desktop & mobile)\n• Microsoft Edge\n• Safari (iOS/macOS)\n• Firefox\n• Brave\n\nFor camera scanning, we recommend Chrome or Safari on mobile devices.'
  },
  
  // Scanning Books
  {
    category: 'Scanning Books',
    icon: ScanBarcode,
    question: 'How do I scan a book barcode?',
    answer: '1. Sign in to your account\n2. Go to Dashboard or click "Start Scanning"\n3. Tap "Scan with Camera"\n4. Allow camera permissions when prompted\n5. Point your camera at the ISBN barcode\n6. The book will be detected automatically\n7. Review metadata and click "Save to History"'
  },
  {
    category: 'Scanning Books',
    icon: ScanBarcode,
    question: 'Can I enter ISBN manually?',
    answer: 'Yes! If camera scanning doesn\'t work:\n1. Click the "Manual Entry" tab\n2. Type or paste the 10 or 13-digit ISBN\n3. Click "Search"\n4. Metadata will be fetched from our sources'
  },
  {
    category: 'Scanning Books',
    icon: ScanBarcode,
    question: 'What ISBN formats are supported?',
    answer: 'Rangkai supports both:\n• ISBN-10 (10 digits, e.g., 0123456789)\n• ISBN-13 (13 digits, e.g., 9780123456789)\n\nThe system automatically detects and validates the format.'
  },
  {
    category: 'Scanning Books',
    icon: ScanBarcode,
    question: 'Why is my book not found?',
    answer: 'Books may not be found if:\n• The ISBN is not in Google Books, OpenLibrary, or Library of Congress databases\n• The barcode is damaged or unclear\n• The ISBN is incorrect\n\nTry:\n1. Manual entry with the correct ISBN\n2. Checking the ISBN on the book\'s copyright page\n3. Using an alternative edition ISBN'
  },
  
  // AI Clean Feature
  {
    category: 'AI Clean',
    icon: Sparkles,
    question: 'What is the AI Clean feature?',
    answer: 'AI Clean uses Google Gemini to:\n• Standardize author names (e.g., "Smith, J." → "John Smith")\n• Extract DDC and LCC classifications\n• Detect language accurately\n• Normalize subject headings\n• Fix formatting inconsistencies\n\nThis ensures consistent, high-quality metadata for cataloging.'
  },
  {
    category: 'AI Clean',
    icon: Sparkles,
    question: 'How do I use AI Clean?',
    answer: '1. After scanning a book, click "Clean with AI" button\n2. Wait 2-5 seconds for processing\n3. Review the cleaned metadata (highlighted changes)\n4. Click "Save" to update your scan history\n\nAI Clean is optional but recommended for better data quality.'
  },
  {
    category: 'AI Clean',
    icon: Sparkles,
    question: 'Can I edit AI-cleaned data?',
    answer: 'Yes! All metadata is editable:\n1. Go to your History page\n2. Click on a book entry\n3. Click "Edit" in the modal\n4. Modify any field\n5. Click "Save Changes"\n\nYour manual edits always take priority over AI suggestions.'
  },
  
  // Exporting Data
  {
    category: 'Exporting Data',
    icon: Download,
    question: 'How do I export to SLiMS?',
    answer: '1. Go to your History page\n2. Click "Export All" button (top right)\n3. A CSV file will download automatically\n4. Open SLiMS admin panel\n5. Go to Bibliography → Import\n6. Upload the CSV file\n7. Map fields if needed\n8. Click "Import"\n\nThe CSV is UTF-8 encoded with BOM for Excel compatibility.'
  },
  {
    category: 'Exporting Data',
    icon: Download,
    question: 'What fields are included in the export?',
    answer: 'The SLiMS export includes:\n• Title\n• Authors (standardized)\n• ISBN\n• Publisher\n• Publication Year\n• Language\n• Page Count\n• DDC/LCC Classification (if available)\n• Subject Headings\n• Cover Image URL\n\nAll fields are SLiMS-compatible for direct import.'
  },
  {
    category: 'Exporting Data',
    icon: Download,
    question: 'Can I export selected books only?',
    answer: 'Currently, Rangkai exports all scans in your history. To export specific books:\n1. Delete unwanted scans from your history\n2. Click "Export All"\n3. Re-scan deleted books later if needed\n\nSelective export is planned for a future update.'
  },
  
  // PWA Installation
  {
    category: 'PWA Installation',
    icon: Smartphone,
    question: 'How do I install Rangkai as an app?',
    answer: 'On Android/Chrome:\n1. Visit Rangkai on Chrome\n2. Tap the install prompt (or ⋮ → "Install app")\n3. Confirm installation\n\nOn iOS/Safari:\n1. Tap the Share button (􀈂)\n2. Scroll and tap "Add to Home Screen" (➕)\n3. Tap "Add"\n\nThe app will appear on your home screen like a native app.'
  },
  {
    category: 'PWA Installation',
    icon: Smartphone,
    question: 'What are the benefits of installing the PWA?',
    answer: '• Offline access to scan history\n• Full-screen camera scanning\n• Faster loading (cached assets)\n• Home screen icon for quick access\n• Background sync for uploads\n• No app store required'
  },
  {
    category: 'PWA Installation',
    icon: Smartphone,
    question: 'Does the PWA work offline?',
    answer: 'Partial offline support:\n• View your scan history without internet\n• Access cached book data\n• UI remains functional\n\nRequires internet for:\n• New book scans (API calls)\n• AI Clean feature\n• Exporting to CSV\n• Syncing new scans'
  },
  
  // Troubleshooting
  {
    category: 'Troubleshooting',
    icon: AlertCircle,
    question: 'Camera won\'t start',
    answer: 'Check the following:\n1. Grant camera permissions in browser settings\n2. Ensure no other app is using the camera\n3. Try refreshing the page\n4. Use HTTPS (required for camera access)\n5. Try a different browser\n\nIf issues persist, use Manual Entry mode instead.'
  },
  {
    category: 'Troubleshooting',
    icon: AlertCircle,
    question: 'Export file won\'t open in Excel',
    answer: 'Try these steps:\n1. Right-click the CSV file\n2. Open with → Notepad (verify it contains data)\n3. In Excel: File → Open → Browse to CSV\n4. Select "CSV UTF-8" as file type\n5. Alternatively, import via Data → From Text/CSV\n\nThe file uses UTF-8 with BOM encoding for compatibility.'
  },
  {
    category: 'Troubleshooting',
    icon: AlertCircle,
    question: 'Scans not saving to history',
    answer: 'Possible causes:\n1. Not signed in (check top right for user menu)\n2. Network connection lost\n3. Browser blocking storage\n\nSolutions:\n1. Sign out and sign back in\n2. Check internet connection\n3. Clear browser cache and try again\n4. Disable browser extensions (ad blockers)\n\nContact support if the issue persists.'
  }
]

const categories = computed(() => {
  const cats = [...new Set(faqs.map(f => f.category))]
  return cats
})

const filteredFaqs = computed(() => {
  if (!searchQuery.value) return faqs
  
  const query = searchQuery.value.toLowerCase()
  return faqs.filter(faq => 
    faq.question.toLowerCase().includes(query) ||
    faq.answer.toLowerCase().includes(query) ||
    faq.category.toLowerCase().includes(query)
  )
})

const faqsByCategory = computed(() => {
  const grouped: Record<string, FaqItem[]> = {}
  
  filteredFaqs.value.forEach(faq => {
    if (!grouped[faq.category]) {
      grouped[faq.category] = []
    }
    grouped[faq.category]!.push(faq)
  })
  
  return grouped
})

const openItems = ref<Set<string>>(new Set())

function toggleItem(question: string) {
  if (openItems.value.has(question)) {
    openItems.value.delete(question)
  } else {
    openItems.value.add(question)
  }
}

function isOpen(question: string) {
  return openItems.value.has(question)
}
</script>

<template>
  <main class="min-h-screen bg-background">
    <!-- Hero Section -->
    <section class="container mx-auto px-4 py-16 md:py-24 space-y-8">
      <div class="text-center space-y-4 max-w-3xl mx-auto">
        <h1 class="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground">
          Frequently Asked Questions
        </h1>
        <p class="text-xl text-muted-foreground">
          Learn how to use Rangkai with step-by-step tutorials and troubleshooting guides.
        </p>
      </div>

      <!-- Search Bar -->
      <div class="max-w-2xl mx-auto">
        <div class="relative">
          <Search class="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <UiInput
            v-model="searchQuery"
            type="text"
            placeholder="Search tutorials and FAQs..."
            class="pl-12 h-14 text-lg"
          />
        </div>
      </div>
    </section>

    <!-- FAQ Content -->
    <section class="container mx-auto px-4 pb-24 space-y-12">
      <div v-if="Object.keys(faqsByCategory).length === 0" class="text-center py-12">
        <Search class="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <h3 class="text-xl font-semibold text-foreground mb-2">No results found</h3>
        <p class="text-muted-foreground">
          Try a different search term or browse all categories.
        </p>
      </div>

      <div v-for="category in categories" :key="category" class="space-y-4">
        <div v-if="faqsByCategory[category]" class="space-y-4">
          <div class="flex items-center gap-3">
            <component 
              :is="faqsByCategory[category]?.[0]?.icon" 
              v-if="faqsByCategory[category]?.[0]?.icon" 
              class="h-6 w-6 text-primary" 
            />
            <h2 class="text-2xl font-bold tracking-tight text-foreground">
              {{ category }}
            </h2>
          </div>

          <div class="space-y-2">
            <Card
              v-for="faq in faqsByCategory[category]"
              :key="faq.question"
              class="overflow-hidden transition-all"
              :class="isOpen(faq.question) ? 'ring-2 ring-primary/20' : ''"
            >
              <button
                class="w-full text-left p-6 hover:bg-accent/50 transition-colors"
                @click="toggleItem(faq.question)"
              >
                <div class="flex items-start justify-between gap-4">
                  <h3 class="font-semibold text-lg text-foreground pr-8">
                    {{ faq.question }}
                  </h3>
                  <div 
                    class="flex-shrink-0 transition-transform"
                    :class="isOpen(faq.question) ? 'rotate-180' : ''"
                  >
                    <svg class="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </button>
              
              <div
                v-if="isOpen(faq.question)"
                class="px-6 pb-6 pt-0"
              >
                <div class="prose prose-sm dark:prose-invert max-w-none">
                  <p class="text-muted-foreground whitespace-pre-line leading-relaxed">{{ faq.answer }}</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="container mx-auto px-4 pb-24">
      <div class="rounded-2xl border bg-gradient-to-br from-primary/5 via-background to-background p-8 md:p-12 text-center space-y-6">
        <div class="space-y-4">
          <h2 class="text-3xl md:text-4xl font-bold tracking-tight">
            Still Have Questions?
          </h2>
          <p class="text-lg text-muted-foreground max-w-2xl mx-auto">
            Check out our features page or start scanning to experience Rangkai firsthand.
          </p>
        </div>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <UiButton 
            as-child
            size="lg"
            class="text-base"
          >
            <NuxtLink to="/">
              Back to Home
            </NuxtLink>
          </UiButton>
          <UiButton 
            as-child
            variant="outline"
            size="lg"
            class="text-base"
          >
            <NuxtLink to="/dashboard">
              Start Scanning
            </NuxtLink>
          </UiButton>
        </div>
      </div>
    </section>
  </main>
</template>
