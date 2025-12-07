<script setup lang="ts">
import { Search, ScanLine, ArrowRight, Camera } from 'lucide-vue-next'
import Input from '@/components/ui/Input.vue'
import Button from '@/components/ui/Button.vue'

const { handleSearch, openScanner } = useSearchRouting()
const { history, fetchHistory, loading } = useHistory()

const searchQuery = ref('')
const recentScans = computed(() => history.value.slice(0, 5))

onMounted(() => {
  fetchHistory()
})

const onSearch = () => {
  handleSearch(searchQuery.value)
}
</script>

<template>
  <div class="flex flex-1 flex-col items-center justify-center p-4 sm:p-8 space-y-12 min-h-[80vh]">
    
    <!-- Hero Section -->
    <section class="w-full max-w-2xl text-center space-y-6">
      <h1 class="text-4xl sm:text-5xl font-bold tracking-tight text-foreground">
        What are you reading?
      </h1>
      <p class="text-lg text-muted-foreground">
        Catalog your library by scanning ISBNs or searching manually.
      </p>

      <!-- Smart Search Input -->
      <div class="relative w-full max-w-xl mx-auto group">
        <div class="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
          <Search class="h-5 w-5" />
        </div>
        
        <Input 
          v-model="searchQuery"
          @keydown.enter="onSearch"
          class="pl-12 pr-14 h-14 text-lg rounded-full shadow-sm border-muted-foreground/20 focus-visible:ring-primary/20 transition-all group-hover:shadow-md"
          placeholder="Search by Title, Author, or ISBN..."
        />
        
        <div class="absolute right-2 top-1/2 -translate-y-1/2">
          <Button 
            variant="ghost" 
            size="icon" 
            class="h-10 w-10 rounded-full hover:bg-primary/10 hover:text-primary transition-colors"
            @click="openScanner"
            title="Open Camera Scanner"
          >
            <Camera class="h-5 w-5" />
          </Button>
        </div>
      </div>
    </section>

    <!-- Recent Scans / History -->
    <section v-if="loading" class="w-full max-w-2xl">
        <div class="space-y-4">
            <div v-for="i in 3" :key="i" class="h-16 w-full bg-muted/40 animate-pulse rounded-lg" />
        </div>
    </section>

    <section v-else-if="recentScans.length > 0" class="w-full max-w-2xl space-y-4">
      <div class="flex items-center justify-between px-2">
        <h3 class="text-sm font-medium text-muted-foreground uppercase tracking-wider">Recent Scans</h3>
        <NuxtLink to="/history" class="text-sm text-primary hover:underline flex items-center gap-1">
          View All <ArrowRight class="h-3 w-3" />
        </NuxtLink>
      </div>

      <div class="grid gap-3">
        <NuxtLink 
          v-for="scan in recentScans" 
          :key="scan.id" 
          :to="`/book/${scan.isbn}`"
          class="flex items-center gap-4 p-4 rounded-xl border bg-card text-card-foreground shadow-sm hover:shadow-md transition-all hover:border-primary/50 group"
        >
          <div class="h-10 w-10 flex items-center justify-center rounded-full bg-primary/10 text-primary group-hover:scale-110 transition-transform">
            <ScanLine class="h-5 w-5" />
          </div>
          <div class="flex-1 min-w-0">
            <p class="font-medium truncate">{{ scan.title || 'Processing...' }}</p>
            <p class="text-xs text-muted-foreground font-mono">{{ scan.isbn }}</p>
          </div>
          <div class="text-xs text-muted-foreground">
             <UiBadge variant="outline" class="text-[10px]">{{ scan.status }}</UiBadge>
          </div>
        </NuxtLink>
      </div>
    </section>

  </div>
</template>
