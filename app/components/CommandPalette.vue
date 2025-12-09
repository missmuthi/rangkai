<script setup lang="ts">
import type { CommandPaletteAction } from '~/composables/useCommandPalette'

const { isOpen, navigationActions, executeAction } = useCommandPalette()

const searchQuery = ref('')

// Filter actions based on search query
const filteredActions = computed(() => {
  if (!searchQuery.value) {
    return navigationActions.value
  }
  
  const query = searchQuery.value.toLowerCase()
  return navigationActions.value.filter((action: CommandPaletteAction) => 
    action.label.toLowerCase().includes(query)
  )
})

// Group actions by section
const groupedActions = computed(() => {
  const groups = new Map<string, CommandPaletteAction[]>()
  
  filteredActions.value.forEach((action: CommandPaletteAction) => {
    const section = action.section || 'Other'
    if (!groups.has(section)) {
      groups.set(section, [])
    }
    groups.get(section)!.push(action)
  })
  
  return Array.from(groups.entries()).map(([label, items]) => ({
    label,
    items
  }))
})

// Reset search when closed
watch(isOpen, (newValue) => {
  if (!newValue) {
    searchQuery.value = ''
  }
})

function handleSelect(action: CommandPaletteAction) {
  executeAction(action)
}
</script>

<template>
  <UModal v-model="isOpen" :ui="{ width: 'sm:max-w-2xl' }">
    <UCard
:ui="{ 
      ring: '', 
      divide: 'divide-y divide-gray-200 dark:divide-gray-800',
      body: { padding: 'p-0' }
    }">
      <!-- Search Input -->
      <template #header>
        <UInput
          v-model="searchQuery"
          icon="i-lucide-search"
          size="lg"
          placeholder="Search pages, actions..."
          autofocus
          :ui="{ 
            icon: { trailing: { pointer: '' } },
            base: 'border-0 ring-0 focus:ring-0'
          }"
        >
          <template #trailing>
            <UKbd value="ESC" />
          </template>
        </UInput>
      </template>

      <!-- Results -->
      <div class="max-h-96 overflow-y-auto">
        <div v-if="groupedActions.length === 0" class="p-8 text-center text-sm text-gray-500 dark:text-gray-400">
          No results found
        </div>
        
        <div v-else>
          <div 
            v-for="(group, index) in groupedActions" 
            :key="group.label"
            :class="{ 'border-t border-gray-200 dark:border-gray-800': index > 0 }"
          >
            <div class="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-gray-50 dark:bg-gray-900/50">
              {{ group.label }}
            </div>
            
            <div class="p-2 space-y-1">
              <button
                v-for="action in group.items"
                :key="action.id"
                class="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:bg-gray-100 dark:focus:bg-gray-800"
                @click="handleSelect(action)"
              >
                <UIcon 
                  v-if="action.icon" 
                  :name="action.icon" 
                  class="w-5 h-5 text-gray-400 dark:text-gray-500" 
                />
                <span class="flex-1 text-left">{{ action.label }}</span>
                <UIcon 
                  name="i-lucide-arrow-right" 
                  class="w-4 h-4 text-gray-400 dark:text-gray-500" 
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <template #footer>
        <div class="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <div class="flex items-center gap-4">
            <div class="flex items-center gap-1">
              <UKbd>↑</UKbd>
              <UKbd>↓</UKbd>
              <span>Navigate</span>
            </div>
            <div class="flex items-center gap-1">
              <UKbd>↵</UKbd>
              <span>Select</span>
            </div>
          </div>
          <div class="flex items-center gap-1">
            <UKbd>⌘</UKbd>
            <UKbd>K</UKbd>
            <span>to toggle</span>
          </div>
        </div>
      </template>
    </UCard>
  </UModal>
</template>
