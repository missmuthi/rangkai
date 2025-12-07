<script setup lang="ts">
import { Moon, Sun, Monitor, User as UserIcon, LogOut } from 'lucide-vue-next'
import Button from '@/components/ui/Button.vue'
// Separator not available, using <hr>


definePageMeta({
  middleware: 'auth',
  layout: 'app',
  title: 'Settings'
})

const colorMode = useColorMode()
const { user, logout } = useAuth()
const router = useRouter()

const handleLogout = async () => {
  await logout()
  router.push('/login')
}
</script>

<template>
  <div class="max-w-2xl mx-auto space-y-8 py-6">
    
    <!-- Appearance -->
    <section class="space-y-4">
      <div>
        <h3 class="text-lg font-medium">Appearance</h3>
        <p class="text-sm text-muted-foreground">Customize the interface theme.</p>
      </div>
      <hr class="border-border" />
      
      <div class="grid grid-cols-3 gap-4">
        <button 
          :class="['flex flex-col items-center justify-between rounded-md border-2 p-4 hover:bg-accent hover:text-accent-foreground', colorMode.preference === 'light' ? 'border-primary' : 'border-muted']"
          @click="colorMode.preference = 'light'"
        >
          <Sun class="mb-2 h-6 w-6" />
          <span class="text-xs font-medium">Light</span>
        </button>
        <button 
          :class="['flex flex-col items-center justify-between rounded-md border-2 p-4 hover:bg-accent hover:text-accent-foreground', colorMode.preference === 'dark' ? 'border-primary' : 'border-muted']"
          @click="colorMode.preference = 'dark'"
        >
          <Moon class="mb-2 h-6 w-6" />
          <span class="text-xs font-medium">Dark</span>
        </button>
        <button 
          :class="['flex flex-col items-center justify-between rounded-md border-2 p-4 hover:bg-accent hover:text-accent-foreground', colorMode.preference === 'system' ? 'border-primary' : 'border-muted']"
          @click="colorMode.preference = 'system'"
        >
          <Monitor class="mb-2 h-6 w-6" />
          <span class="text-xs font-medium">System</span>
        </button>
      </div>
    </section>

    <!-- Account -->
    <section class="space-y-4">
      <div>
        <h3 class="text-lg font-medium">Account</h3>
        <p class="text-sm text-muted-foreground">Manage your account information.</p>
      </div>
      <hr class="border-border" />

      <div class="flex items-center gap-4 rounded-lg border p-4">
        <div class="h-12 w-12 rounded-full overflow-hidden bg-muted flex items-center justify-center">
            <img v-if="(user as any)?.image" :src="(user as any).image" alt="Avatar" class="h-full w-full object-cover">
            <UserIcon v-else class="h-6 w-6 text-muted-foreground" />
        </div>
        <div class="flex-1">
          <p class="font-medium">{{ user?.name || 'User' }}</p>
          <p class="text-sm text-muted-foreground">{{ user?.email }}</p>
        </div>
      </div>

      <div class="flex justify-start">
        <Button variant="destructive" class="gap-2" @click="handleLogout">
           <LogOut class="h-4 w-4" />
           Sign Out
        </Button>
      </div>
    </section>

  </div>
</template>
