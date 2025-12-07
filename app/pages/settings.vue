<script setup lang="ts">
/**
 * Settings Page
 * 
 * Allows users to configure app preferences and install the PWA.
 */
import { Download, CheckCircle2, Smartphone, Moon, Sun, Monitor, LogOut } from 'lucide-vue-next'

const { canInstall, isInstalled, install } = usePwaInstall()
const colorMode = useColorMode()
const { signOut, user } = useAuth()

// Track installation state
const isInstalling = ref(false)

const handleInstall = async () => {
  isInstalling.value = true
  await install()
  isInstalling.value = false
}

const handleSignOut = async () => {
  await signOut()
  navigateTo('/login')
}
</script>

<template>
  <div class="container py-8 max-w-2xl mx-auto space-y-8">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Settings</h1>
        <p class="text-slate-500 dark:text-slate-400 mt-2">
          Manage your preferences and app settings
        </p>
      </div>
    </div>

    <!-- PWA Install Section -->
    <section class="space-y-4">
      <div>
        <h2 class="text-xl font-semibold text-slate-900 dark:text-white">App Installation</h2>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Install Rangkai for a better experience
        </p>
      </div>

      <!-- Install Button (shows when installable) -->
      <div
        v-if="canInstall && !isInstalled"
        class="border border-dashed border-slate-300 dark:border-slate-700 rounded-lg p-6 flex items-start gap-4 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
      >
        <div class="flex-shrink-0">
          <div class="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center">
            <Smartphone class="w-6 h-6 text-blue-500" />
          </div>
        </div>
        
        <div class="flex-1">
          <h3 class="font-medium mb-1 text-slate-900 dark:text-white">Install Rangkai App</h3>
          <p class="text-sm text-slate-500 dark:text-slate-400 mb-4">
            Add to your home screen for fullscreen camera access, offline support, and faster loading.
          </p>
          
          <button
            @click="handleInstall"
            :disabled="isInstalling"
            class="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white text-sm font-medium rounded-md transition-colors shadow-sm"
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
        class="border border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-950/20 rounded-lg p-6 flex items-start gap-4"
      >
        <div class="flex-shrink-0">
          <CheckCircle2 class="w-6 h-6 text-green-600 dark:text-green-500" />
        </div>
        
        <div>
          <h3 class="font-medium text-green-900 dark:text-green-100 mb-1">
            App Installed
          </h3>
          <p class="text-sm text-green-700 dark:text-green-400">
            Rangkai is installed on your device. Enjoy the native app experience!
          </p>
        </div>
      </div>

      <!-- iOS / Safari Manual Instructions -->
      <div
        v-else
        class="border border-slate-200 dark:border-slate-700 rounded-lg p-6"
      >
        <h3 class="font-medium text-slate-900 dark:text-white mb-2">Installation Status</h3>
        <p class="text-sm text-slate-500 dark:text-slate-400 mb-3">
          To install on iOS Safari: Tap the Share button <span class="inline-block px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs border border-slate-300 dark:border-slate-700">􀈂</span> then "Add to Home Screen" <span class="inline-block px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs border border-slate-300 dark:border-slate-700">➕</span>
        </p>
        <p class="text-xs text-slate-400 dark:text-slate-500">
          Note: This browser may not support automatic installation prompts.
        </p>
      </div>
    </section>

    <hr class="border-slate-200 dark:border-slate-800" />

    <!-- Appearance Section -->
    <section class="space-y-4">
      <div>
        <h2 class="text-xl font-semibold text-slate-900 dark:text-white">Appearance</h2>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Customize how Rangkai looks on your device
        </p>
      </div>

      <div class="grid grid-cols-3 gap-3">
        <button
          @click="colorMode.preference = 'system'"
          :class="[
            'flex flex-col items-center justify-center p-4 rounded-lg border text-sm font-medium transition-all',
            colorMode.preference === 'system'
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
              : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-700 dark:text-slate-300'
          ]"
        >
          <Monitor class="w-6 h-6 mb-2" />
          System
        </button>
        <button
          @click="colorMode.preference = 'light'"
          :class="[
            'flex flex-col items-center justify-center p-4 rounded-lg border text-sm font-medium transition-all',
            colorMode.preference === 'light'
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
              : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-700 dark:text-slate-300'
          ]"
        >
          <Sun class="w-6 h-6 mb-2" />
          Light
        </button>
        <button
          @click="colorMode.preference = 'dark'"
          :class="[
            'flex flex-col items-center justify-center p-4 rounded-lg border text-sm font-medium transition-all',
            colorMode.preference === 'dark'
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
              : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-700 dark:text-slate-300'
          ]"
        >
          <Moon class="w-6 h-6 mb-2" />
          Dark
        </button>
      </div>
    </section>

    <hr class="border-slate-200 dark:border-slate-800" />

    <!-- Account Section -->
    <section class="space-y-4">
      <div>
        <h2 class="text-xl font-semibold text-slate-900 dark:text-white">Account</h2>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Manage your account session
        </p>
      </div>

      <div class="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-4">
        <div class="flex items-center gap-4 mb-4">
          <div class="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-lg">
            {{ user?.name?.charAt(0) || 'U' }}
          </div>
          <div>
            <div class="font-medium text-slate-900 dark:text-white">{{ user?.name || 'User' }}</div>
            <div class="text-sm text-slate-500 dark:text-slate-400">{{ user?.email }}</div>
          </div>
        </div>

        <button
          @click="handleSignOut"
          class="w-full flex items-center justify-center gap-2 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-sm font-medium"
        >
          <LogOut class="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </section>
  </div>
</template>
