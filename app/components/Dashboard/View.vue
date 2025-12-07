<script setup lang="ts">
import { BookOpen, CheckCircle2, Clock, AlertCircle, ScanBarcode, ArrowRight } from 'lucide-vue-next'
import Button from '@/components/ui/Button.vue'
import DashboardEmptyState from './EmptyState.vue'

const { history, loading, fetchHistory } = useHistory()

// Computed stats
const stats = computed(() => ({
  total: history.value.length,
  completed: history.value.filter(s => s.status === 'complete').length,
  pending: history.value.filter(s => s.status === 'pending').length,
  errors: history.value.filter(s => s.status === 'error').length
}))

// Get recent 5 items
const recentScans = computed(() => history.value.slice(0, 5))

onMounted(() => {
  fetchHistory()
})
</script>

<template>
  <div v-if="loading" class="flex items-center justify-center p-8">
     <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
  </div>

  <div v-else-if="history.length > 0" class="space-y-8">
    <!-- Stats Overview -->
    <section class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <UiCard>
        <UiCardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <UiCardTitle class="text-sm font-medium">Total Scans</UiCardTitle>
          <BookOpen class="h-4 w-4 text-muted-foreground" />
        </UiCardHeader>
        <UiCardContent>
          <div class="text-2xl font-bold">{{ stats.total }}</div>
          <p class="text-xs text-muted-foreground">Lifetime volume</p>
        </UiCardContent>
      </UiCard>

      <UiCard>
        <UiCardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <UiCardTitle class="text-sm font-medium">Completed</UiCardTitle>
          <CheckCircle2 class="h-4 w-4 text-green-500" />
        </UiCardHeader>
        <UiCardContent>
          <div class="text-2xl font-bold">{{ stats.completed }}</div>
          <p class="text-xs text-muted-foreground">Ready for export</p>
        </UiCardContent>
      </UiCard>

      <UiCard>
        <UiCardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <UiCardTitle class="text-sm font-medium">Pending</UiCardTitle>
          <Clock class="h-4 w-4 text-yellow-500" />
        </UiCardHeader>
        <UiCardContent>
          <div class="text-2xl font-bold">{{ stats.pending }}</div>
          <p class="text-xs text-muted-foreground">Awaiting metadata</p>
        </UiCardContent>
      </UiCard>

      <UiCard>
        <UiCardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <UiCardTitle class="text-sm font-medium">Errors</UiCardTitle>
          <AlertCircle class="h-4 w-4 text-red-500" />
        </UiCardHeader>
        <UiCardContent>
          <div class="text-2xl font-bold">{{ stats.errors }}</div>
          <p class="text-xs text-muted-foreground">Requires attention</p>
        </UiCardContent>
      </UiCard>
    </section>

    <!-- Recent Activity -->
    <section class="space-y-4">
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-medium">Recent Scans</h3>
        <Button variant="ghost" as-child size="sm">
          <NuxtLink to="/history" class="gap-2">
            View All <ArrowRight class="h-4 w-4" />
          </NuxtLink>
        </Button>
      </div>

      <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <!-- Scan Cards -->
        <UiCard v-for="scan in recentScans" :key="scan.id" class="flex flex-col">
          <UiCardHeader>
            <UiCardTitle class="text-base line-clamp-1" :title="scan.title || 'Unknown Title'">
              {{ scan.title || 'Unknown Title' }}
            </UiCardTitle>
            <p class="text-xs text-muted-foreground">ISBN: {{ scan.isbn }}</p>
          </UiCardHeader>
          <UiCardContent class="flex-1">
            <div class="flex items-center gap-2 text-sm">
               <UiBadge :variant="scan.status === 'complete' ? 'default' : 'secondary'">
                 {{ scan.status }}
               </UiBadge>
               <span class="text-muted-foreground text-xs">
                 {{ new Date(scan.created_at).toLocaleDateString() }}
               </span>
            </div>
          </UiCardContent>
        </UiCard>
        
        <!-- Quick Action Card -->
        <UiCard class="flex flex-col items-center justify-center border-dashed bg-muted/50 hover:bg-muted/80 transition-colors cursor-pointer group">
          <NuxtLink to="/scan/mobile" class="flex flex-col items-center p-6 w-full h-full">
            <div class="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
              <ScanBarcode class="h-6 w-6 text-primary" />
            </div>
            <p class="font-medium">New Scan</p>
          </NuxtLink>
        </UiCard>
      </div>
    </section>
  </div>

  <!-- Empty State Fallback -->
  <DashboardEmptyState v-else />
</template>
