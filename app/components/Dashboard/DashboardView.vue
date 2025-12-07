<script setup lang="ts">
import { BookPlus, ScanLine } from 'lucide-vue-next'
</script>

<template>
  <div class="flex flex-1 items-center justify-center">
    <UiCard class="w-full max-w-md border-dashed bg-slate-50/50 dark:bg-slate-900/50">
      <UiCardHeader class="items-center text-center">
        <div class="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-950">
          <BookPlus class="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
        </div>
        <UiCardTitle class="text-lg">No scans yet</UiCardTitle>
      </UiCardHeader>
      <UiCardContent class="text-center">
        <p class="mb-6 text-sm text-slate-500 dark:text-slate-400">
          Start by scanning a book's ISBN barcode to build your catalog.
        </p>
        <NuxtLink to="/scan/mobile">
          <UiButton class="gap-2">
            <ScanLine class="h-4 w-4" />
            Start Scanning
          </UiButton>
        </NuxtLink>
      </UiCardContent>
    </UiCard>
  </div>
</template>
