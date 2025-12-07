<script setup lang="ts">
import { Book, CheckCircle, Clock } from 'lucide-vue-next'

definePageMeta({
  middleware: 'auth',
  layout: 'app',
  title: 'My Profile'
})

const { user } = useAuth()
const { history, fetchHistory, loading } = useHistory()

onMounted(() => {
  fetchHistory()
})

const stats = computed(() => {
  const total = history.value.length
  const completed = history.value.filter(s => s.status === 'complete').length
  const pending = history.value.filter(s => s.status === 'pending').length
  
  return { total, completed, pending }
})
</script>

<template>
  <div class="max-w-4xl mx-auto py-8 px-4 space-y-8">
    <!-- Header -->
    <div class="flex items-center gap-6">
      <div class="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center text-4xl font-bold text-primary border-4 border-background shadow-xl">
        <img v-if="(user as any)?.image" :src="(user as any).image" class="h-full w-full rounded-full object-cover" />
        <span v-else>{{ user?.name?.charAt(0) || 'U' }}</span>
      </div>
      <div>
        <h1 class="text-3xl font-bold">{{ user?.name || 'User' }}</h1>
        <p class="text-muted-foreground">{{ user?.email }}</p>
      </div>
    </div>

    <!-- Stats Grid -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <UiCard>
        <UiCardHeader class="flex flex-row items-center justify-between pb-2">
          <UiCardTitle class="text-sm font-medium">Total Books</UiCardTitle>
          <Book class="h-4 w-4 text-muted-foreground" />
        </UiCardHeader>
        <UiCardContent>
          <div class="text-2xl font-bold">{{ stats.total }}</div>
          <p class="text-xs text-muted-foreground">Scanned library items</p>
        </UiCardContent>
      </UiCard>

      <UiCard>
        <UiCardHeader class="flex flex-row items-center justify-between pb-2">
          <UiCardTitle class="text-sm font-medium">Cataloged</UiCardTitle>
          <CheckCircle class="h-4 w-4 text-green-500" />
        </UiCardHeader>
        <UiCardContent>
          <div class="text-2xl font-bold">{{ stats.completed }}</div>
          <p class="text-xs text-muted-foreground">Successfully processed</p>
        </UiCardContent>
      </UiCard>

      <UiCard>
        <UiCardHeader class="flex flex-row items-center justify-between pb-2">
          <UiCardTitle class="text-sm font-medium">Pending</UiCardTitle>
          <Clock class="h-4 w-4 text-yellow-500" />
        </UiCardHeader>
        <UiCardContent>
          <div class="text-2xl font-bold">{{ stats.pending }}</div>
          <p class="text-xs text-muted-foreground">Awaiting metadata</p>
        </UiCardContent>
      </UiCard>
    </div>

    <!-- Recent Activity Preview -->
    <div class="space-y-4">
      <div class="flex items-center justify-between">
         <h2 class="text-xl font-semibold">Library Activity</h2>
         <NuxtLink to="/history">
           <Button variant="outline">View Full History</Button>
         </NuxtLink>
      </div>
      
      <div v-if="loading" class="h-24 bg-muted animate-pulse rounded-lg" />
      <div v-else-if="history.length === 0" class="text-center py-12 bg-muted/20 rounded-lg">
         <p class="text-muted-foreground">No books scanned yet.</p>
         <Button class="mt-4" as-child>
           <NuxtLink to="/scan/mobile">Start Scanning</NuxtLink>
         </Button>
      </div>
      <div v-else class="grid gap-2">
         <!-- Simple list of last 3 items -->
         <div v-for="scan in history.slice(0, 3)" :key="scan.id" class="flex items-center justify-between p-4 border rounded-lg bg-card">
           <div class="flex items-center gap-3">
             <div class="h-10 w-10 bg-primary/10 rounded-md flex items-center justify-center">
               <Book class="h-5 w-5 text-primary" />
             </div>
             <div>
               <p class="font-medium line-clamp-1">{{ scan.title || 'Unknown Title' }}</p>
               <p class="text-xs text-muted-foreground">{{ new Date(scan.created_at).toLocaleDateString() }}</p>
             </div>
           </div>
           <UiBadge>{{ scan.status }}</UiBadge>
         </div>
      </div>
    </div>

  </div>
</template>
