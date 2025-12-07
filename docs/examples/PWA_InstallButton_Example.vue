<script setup lang="ts">
/**
 * Example: Adding PWA Install Button to Settings Page
 * 
 * File: app/pages/settings.vue (or wherever you want the install button)
 */
import { Download, CheckCircle2, Smartphone } from 'lucide-vue-next'

const { canInstall, isInstalled, install } = usePwaInstall()

// Track installation state
const isInstalling = ref(false)

const handleInstall = async () => {
  isInstalling.value = true
  await install()
  isInstalling.value = false
}
</script>

<template>
  <main class="flex-1 space-y-8 p-8 pt-6">
    <div>
      <h1 class="text-3xl font-bold tracking-tight">Settings</h1>
      <p class="text-muted-foreground mt-2">
        Manage your preferences and app settings
      </p>
    </div>

    <!-- Existing settings sections... -->

    <!-- PWA Install Section -->
    <section class="space-y-4">
      <div>
        <h2 class="text-xl font-semibold">Progressive Web App</h2>
        <p class="text-sm text-muted-foreground mt-1">
          Install Rangkai for a native app experience
        </p>
      </div>

      <!-- Install Button (shows when installable) -->
      <div
        v-if="canInstall && !isInstalled"
        class="border border-dashed rounded-lg p-6 flex items-start gap-4"
      >
        <div class="flex-shrink-0">
          <div class="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center">
            <Smartphone class="w-6 h-6 text-blue-500" />
          </div>
        </div>
        
        <div class="flex-1">
          <h3 class="font-medium mb-1">Install Rangkai App</h3>
          <p class="text-sm text-muted-foreground mb-4">
            Add to your home screen for fullscreen camera access and faster loading.
          </p>
          
          <button
            @click="handleInstall"
            :disabled="isInstalling"
            class="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white text-sm font-medium rounded-md transition-colors"
          >
            <Download v-if="!isInstalling" class="w-4 h-4" />
            <span v-if="isInstalling">Installing...</span>
            <span v-else>Install App</span>
          </button>
        </div>
      </div>

      <!-- Already Installed (shows when installed) -->
      <div
        v-else-if="isInstalled"
        class="border border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-950/30 rounded-lg p-6 flex items-start gap-4"
      >
        <div class="flex-shrink-0">
          <CheckCircle2 class="w-6 h-6 text-green-600 dark:text-green-500" />
        </div>
        
        <div>
          <h3 class="font-medium text-green-900 dark:text-green-100 mb-1">
            App Installed
          </h3>
          <p class="text-sm text-green-700 dark:text-green-300">
            Rangkai is installed on your device. Enjoy the native app experience!
          </p>
        </div>
      </div>

      <!-- Not Available (iOS manual install or already installed via browser) -->
      <div
        v-else
        class="border rounded-lg p-6"
      >
        <h3 class="font-medium mb-1">Install Instructions</h3>
        <p class="text-sm text-muted-foreground mb-3">
          On iOS Safari: Tap the Share button, then "Add to Home Screen"
        </p>
        <p class="text-xs text-muted-foreground">
          The app appears to be already installed or your browser doesn't support install prompts.
        </p>
      </div>
    </section>
  </main>
</template>
