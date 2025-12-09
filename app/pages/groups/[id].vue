<script setup lang="ts">
import { Users, BookOpen, Activity, ArrowLeft, Copy, Download, Trash2, Clock, Settings, Trophy } from 'lucide-vue-next'
import { useClipboard } from '@vueuse/core'

definePageMeta({
  layout: 'app',
  middleware: 'auth'
})

const route = useRoute()
const router = useRouter()
const groupId = computed(() => route.params.id as string)

const { copy } = useClipboard()
const toast = useToast()

// Fetch group data
const { data, pending, error, refresh } = await useFetch(`/api/groups/${groupId.value}`, {
  key: `group-${groupId.value}`
})

const activeTab = ref<'members' | 'books' | 'activity' | 'settings'>('members')
const isMigrating = ref(false)

async function migrateBooks() {
  if (!confirm('Move all your personal books to this group? This cannot be undone efficiently.')) return

  isMigrating.value = true
  try {
    const res = await $fetch<{ moved: number; message: string }>(`/api/groups/${groupId.value}/migrate-scans`, {
      method: 'POST'
    })
    toast.add({ 
      title: 'Success', 
      description: res.message,
      color: 'green' 
    })
    refresh()
    activeTab.value = 'books'
  } catch (e: unknown) {
    const err = e as { data?: { message?: string } }
    toast.add({ 
      title: 'Error', 
      description: err.data?.message || 'Failed to migrate books', 
      color: 'red' 
    })
  } finally {
    isMigrating.value = false
  }
}

// Remove member
const isRemoving = ref(false)
async function removeMember(userId: string, userName: string | null) {
  if (!confirm(`Remove ${userName || 'this member'} from the group? Their books will remain.`)) return
  
  isRemoving.value = true
  try {
    await $fetch(`/api/groups/${groupId.value}/members/${userId}`, {
      method: 'DELETE'
    })
    toast.add({ title: 'Member removed', color: 'green' })
    refresh()
  } catch {
    toast.add({ title: 'Failed to remove member', color: 'red' })
  } finally {
    isRemoving.value = false
  }
}

function copyInviteCode() {
  if (data.value?.group.inviteCode) {
    copy(data.value.group.inviteCode)
    toast.add({ title: 'Invite code copied!', color: 'green' })
  }
}

function exportBooks() {
  window.open(`/api/groups/${groupId.value}/export`, '_blank')
}

function formatDate(date: string | Date) {
  return new Date(date).toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    year: 'numeric'
  })
}

function formatRelativeTime(date: string | Date) {
  const now = new Date()
  const then = new Date(date)
  const diffMs = now.getTime() - then.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)
  
  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`

  return formatDate(date)
}

const showLeaderboard = ref(data.value?.group.settings?.showLeaderboard !== false)

async function toggleLeaderboard() {
  const newValue = !showLeaderboard.value
  showLeaderboard.value = newValue
  
  try {
    await $fetch(`/api/groups/${groupId.value}/settings`, {
      method: 'PUT',
      body: { showLeaderboard: newValue }
    })
    refresh()
    toast.add({ title: 'Settings updated', color: 'green' })
  } catch (e) {
    showLeaderboard.value = !newValue // revert
    toast.add({ title: 'Failed to update settings', color: 'red' })
  }
}

useHead({
  title: computed(() => data.value?.group.name ? `${data.value.group.name} - Rangkai` : 'Group - Rangkai')
})
</script>

<template>
  <div class="space-y-6">
    <!-- Loading -->
    <div v-if="pending" class="flex justify-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
    </div>

    <!-- Error -->
    <div v-else-if="error" class="text-center py-12">
      <p class="text-red-500">{{ error.message || 'Failed to load group' }}</p>
      <button class="mt-4 text-indigo-600 hover:underline" @click="router.push('/groups')">
        Back to Groups
      </button>
    </div>

    <!-- Content -->
    <template v-else-if="data">
      <!-- Migration Banner (Proactive UX) -->
      <div v-if="data.personalScanCount > 0" class="mb-6 bg-indigo-600 rounded-xl p-4 text-white flex items-center justify-between shadow-lg ring-4 ring-indigo-50 dark:ring-indigo-900/20">
         <div class="flex items-center gap-4">
            <div class="p-2 bg-white/20 rounded-lg">
              <BookOpen class="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 class="font-bold text-lg">
                 You have {{ data.personalScanCount }} personal books
              </h3>
              <p class="text-indigo-100 text-sm">Move them to this group so everyone can access them.</p>
            </div>
         </div>
         <button @click="activeTab = 'settings'" class="bg-white text-indigo-600 px-4 py-2 rounded-lg text-sm font-bold hover:bg-indigo-50 shadow-sm transition-colors">
            Review & Move
         </button>
      </div>
      <!-- Header -->
      <div class="flex items-start justify-between">
        <div class="flex items-center gap-4">
          <button 
            class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            @click="router.push('/groups')"
          >
            <ArrowLeft class="w-5 h-5" />
          </button>
          <div>
            <div class="flex items-center gap-3">
              <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
                {{ data.group.name }}
              </h1>
              <span 
                class="text-xs font-medium px-2 py-1 rounded-full"
                :class="data.isOwner 
                  ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' 
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'"
              >
                {{ data.isOwner ? 'Owner' : 'Member' }}
              </span>
            </div>
            <p class="text-gray-500 dark:text-gray-400 mt-1">
              {{ data.group.description || 'No description' }}
            </p>
          </div>
        </div>
        
        <div class="flex items-center gap-2">
          <!-- Invite Code -->
          <div class="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <span class="text-xs text-gray-500">Code:</span>
            <code class="font-mono font-bold">{{ data.group.inviteCode }}</code>
            <button 
              class="p-1 hover:text-indigo-600 transition-colors" 
              title="Copy invite code"
              @click="copyInviteCode"
            >
              <Copy class="w-4 h-4" />
            </button>
          </div>
          
          <!-- Export -->
          <button
            class="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            @click="exportBooks"
          >
            <Download class="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      <!-- Tabs -->
      <div class="border-b border-gray-200 dark:border-gray-700">
        <nav class="flex gap-6">
          <button
            v-for="tab in [
              { id: 'members', label: 'Members', icon: Users, count: data.members.length },
              { id: 'books', label: 'Books', icon: BookOpen, count: data.scans.length },
              { id: 'activity', label: 'Activity', icon: Activity },
              { id: 'settings', label: 'Settings', icon: Settings }
            ]"
            :key="tab.id"
            class="flex items-center gap-2 py-3 border-b-2 transition-colors"
            :class="activeTab === tab.id 
              ? 'border-indigo-600 text-indigo-600' 
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'"
            @click="activeTab = tab.id as typeof activeTab"
          >
            <component :is="tab.icon" class="w-4 h-4" />
            {{ tab.label }}
            <span v-if="tab.count !== undefined" class="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">
              {{ tab.count }}
            </span>
          </button>
        </nav>
      </div>

      <!-- Tab Content -->
      <div class="min-h-[400px]">
        <!-- Members Tab -->
        <div v-if="activeTab === 'members'" class="space-y-6">
           <!-- Leaderboard Widget -->
           <div v-if="data.leaderboard && data.leaderboard.length > 0 && showLeaderboard" class="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 p-6 rounded-xl border border-amber-100 dark:border-amber-900/50">
              <h3 class="font-bold text-amber-800 dark:text-amber-200 mb-4 flex items-center gap-2">
                 <Trophy class="w-5 h-5" /> Top Contributors
              </h3>
              <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                 <div v-for="(u, idx) in data.leaderboard" :key="u.userId" class="flex items-center gap-3 bg-white/60 dark:bg-black/20 p-3 rounded-lg backdrop-blur-sm border border-white/20">
                    <div class="font-black text-lg w-8 text-center flex items-center justify-center shrink-0" 
                         :class="{ 'text-amber-500 text-2xl': idx===0, 'text-gray-400': idx>0 }">
                         <span v-if="idx===0">👑</span>
                         <span v-else>#{{ idx+1 }}</span>
                    </div>
                    <div class="flex-1 min-w-0">
                      <div class="truncate font-bold text-gray-900 dark:text-gray-100">{{ u.userName || 'Unknown' }}</div>
                      <div class="text-xs text-gray-500 dark:text-gray-400">Contributor</div>
                    </div>
                    <div class="text-sm font-bold bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 px-2.5 py-1 rounded-full whitespace-nowrap">{{ u.count }} books</div>
                 </div>
              </div>
           </div>

           <!-- Members List -->
           <div class="space-y-3">
          <div
            v-for="member in data.members"
            :key="member.id"
            class="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
          >
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold">
                {{ (member.name || 'U').charAt(0).toUpperCase() }}
              </div>
              <div>
                <p class="font-medium text-gray-900 dark:text-white">
                  {{ member.name || 'Unknown User' }}
                  <span v-if="member.userId === data.group.ownerId" class="text-xs text-purple-600 ml-1">(You)</span>
                </p>
                <p class="text-sm text-gray-500">{{ member.email }}</p>
              </div>
            </div>
            
            <div class="flex items-center gap-3">
              <span 
                class="text-xs font-medium px-2 py-1 rounded-full"
                :class="member.role === 'owner' 
                  ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' 
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'"
              >
                {{ member.role === 'owner' ? 'Owner' : 'Member' }}
              </span>
              <span class="text-xs text-gray-500">
                Joined {{ formatDate(member.joinedAt) }}
              </span>
              
              <!-- Remove button (owner only, can't remove self) -->
              <button
                v-if="data.isOwner && member.role !== 'owner'"
                class="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                :disabled="isRemoving"
                title="Remove member"
                @click="removeMember(member.userId, member.name)"
              >
                <Trash2 class="w-4 h-4" />
              </button>
            </div>
          </div>
            </div>
          </div>


        <!-- Books Tab -->
        <div v-else-if="activeTab === 'books'" class="space-y-3">
          <div v-if="data.scans.length === 0" class="text-center py-12 text-gray-500">
            <BookOpen class="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No books in this group yet.</p>
            <p class="text-sm mt-1">Use the scanner or import to add books.</p>
          </div>
          
          <div
            v-for="scan in data.scans"
            :key="scan.id"
            class="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-indigo-300 transition-colors cursor-pointer"
            @click="$router.push(`/book/${scan.isbn}`)"
          >
            <div class="flex-1 min-w-0">
              <p class="font-medium text-gray-900 dark:text-white truncate">
                {{ scan.title || 'Untitled' }}
              </p>
              <div class="flex items-center gap-3 mt-1 text-sm text-gray-500">
                <span class="font-mono">{{ scan.isbn }}</span>
                <span v-if="scan.ddc" class="px-1.5 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded text-xs">
                  DDC: {{ scan.ddc }}
                </span>
              </div>
            </div>
            
            <div class="text-right text-sm text-gray-500 ml-4">
              <p>Added by <span class="font-medium">{{ scan.addedBy }}</span></p>
              <p class="text-xs">{{ formatDate(scan.createdAt) }}</p>
            </div>
          </div>
        </div>

        <!-- Activity Tab -->
        <div v-else-if="activeTab === 'activity'" class="space-y-3">
          <div v-if="data.activities.length === 0" class="text-center py-12 text-gray-500">
            <Activity class="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No activity yet.</p>
          </div>
          
          <div
            v-for="(activity, idx) in data.activities"
            :key="idx"
            class="flex items-start gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
          >
            <div 
              class="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
              :class="activity.type === 'join' 
                ? 'bg-green-100 dark:bg-green-900/30 text-green-600' 
                : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600'"
            >
              <Users v-if="activity.type === 'join'" class="w-4 h-4" />
              <BookOpen v-else class="w-4 h-4" />
            </div>
            
            <div class="flex-1">
              <p class="text-gray-900 dark:text-white">
                <span class="font-medium">{{ activity.userName }}</span>
                <template v-if="activity.type === 'join'">
                  joined the group
                </template>
                <template v-else>
                  added <span class="font-medium">"{{ activity.data?.title || activity.data?.isbn }}"</span>
                </template>
              </p>
              <p class="text-xs text-gray-500 flex items-center gap-1 mt-1">
                <Clock class="w-3 h-3" />
                {{ formatRelativeTime(activity.timestamp) }}
              </p>
            </div>
          </div>
        </div>


        <!-- Settings Tab -->
        <div v-else-if="activeTab === 'settings'" class="space-y-4">
          <!-- Migration Card -->
          <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">Migrate Personal Books</h3>
            <p class="text-gray-500 dark:text-gray-400 mb-6">
              Move your personal scan history to this group. This action updates your books to be owned by this group.
            </p>

            <!-- Stats Card -->
            <div class="grid grid-cols-3 gap-4 mb-6">
              <div class="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg text-center">
                <div class="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{{ data.personalScanCount }}</div>
                <div class="text-xs text-gray-500 uppercase font-medium mt-1">Available to Migrate</div>
              </div>
              <div class="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg text-center">
                <div class="text-2xl font-bold text-gray-900 dark:text-white">{{ data.totalScanCount }}</div>
                <div class="text-xs text-gray-500 uppercase font-medium mt-1">Total History</div>
              </div>
              <div class="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg text-center">
                <div class="text-2xl font-bold text-green-600 dark:text-green-400">{{ data.totalScanCount - data.personalScanCount }}</div>
                <div class="text-xs text-gray-500 uppercase font-medium mt-1">Already in Groups</div>
              </div>
            </div>
            
            <div v-if="data.personalScanCount === 0" class="p-4 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg mb-4 text-sm flex items-start gap-2">
              <BookOpen class="w-5 h-5 flex-shrink-0" />
              <p>
                <strong>No books to migrate.</strong><br>
                All your books are already assigned to a group (either this one or another). 
                If you see books in your history, they are already shared!
              </p>
            </div>

            <button
              class="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-full justify-center sm:w-auto"
              :disabled="isMigrating || data.personalScanCount === 0"
              @click="migrateBooks"
            >
              <BookOpen class="w-4 h-4" />
              {{ isMigrating ? 'Migrating...' : `Move ${data.personalScanCount} Books to This Group` }}
            </button>
          </div>

          <!-- Display Settings (Owner Only) -->
          <div v-if="data.isOwner" class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Display Settings</h3>
            <div class="flex items-center justify-between">
              <div>
                <div class="font-medium text-gray-900 dark:text-white">Show Leaderboard</div>
                <div class="text-sm text-gray-500">Display top contributors widget in the members tab</div>
              </div>
              <button 
                @click="toggleLeaderboard" 
                class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                :class="showLeaderboard ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-700'"
              >
                <span 
                  class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ease-in-out shadow-sm" 
                  :class="showLeaderboard ? 'translate-x-6' : 'translate-x-1'"
                />
              </button>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
