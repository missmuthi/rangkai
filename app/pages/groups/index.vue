<script setup lang="ts">
import { Users, Plus, LogIn, Copy } from 'lucide-vue-next'
import { useClipboard } from '@vueuse/core'

definePageMeta({
  layout: 'app',
  middleware: 'auth'
})

useHead({
  title: 'Library Groups - Rangkai'
})

const { groups, isLoading, fetchGroups, createGroup, joinGroup } = useGroups()
const { copy } = useClipboard()
const toast = useToast()

const isCreateModalOpen = ref(false)
const isJoinModalOpen = ref(false)
const newGroupName = ref('')
const newGroupDesc = ref('')
const inviteCode = ref('')
const isSubmitting = ref(false)

onMounted(() => {
  fetchGroups()
})

async function handleCreate() {
  if (!newGroupName.value) return
  isSubmitting.value = true
  try {
    await createGroup(newGroupName.value, newGroupDesc.value)
    isCreateModalOpen.value = false
    newGroupName.value = ''
    newGroupDesc.value = ''
    toast.add({ title: 'Group created successfully!', color: 'green' })
  } catch (e) {
    toast.add({ title: 'Failed to create group', color: 'red' })
  } finally {
    isSubmitting.value = false
  }
}

async function handleJoin() {
  if (!inviteCode.value) return
  isSubmitting.value = true
  try {
    const res = await joinGroup(inviteCode.value)
    if (res.message) {
        toast.add({ title: res.message, color: 'orange' })
    } else {
        toast.add({ title: 'Joined group successfully!', color: 'green' })
    }
    isJoinModalOpen.value = false
    inviteCode.value = ''
  } catch (e) {
    toast.add({ title: 'Invalid invite code', color: 'red' })
  } finally {
    isSubmitting.value = false
  }
}

function copyCode(code: string) {
  copy(code)
  toast.add({ title: 'Invite code copied!', color: 'green' })
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 class="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
          Library Groups
        </h1>
        <p class="text-gray-500 dark:text-gray-400 mt-1">
          Collaborate with your team to build a shared library catalog.
        </p>
      </div>
      <div class="flex gap-2 w-full sm:w-auto">
        <button
          @click="isJoinModalOpen = true"
          class="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          <LogIn class="w-4 h-4" />
          Join Group
        </button>
        <button
          @click="isCreateModalOpen = true"
          class="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus class="w-4 h-4" />
          Create Group
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading && groups.length === 0" class="flex justify-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
    </div>

    <!-- Empty State -->
    <div v-else-if="groups.length === 0" class="text-center py-12 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
      <Users class="w-12 h-12 mx-auto text-gray-400 mb-4" />
      <h3 class="text-lg font-medium text-gray-900 dark:text-white">No Groups Yet</h3>
      <p class="text-gray-500 dark:text-gray-400 max-w-sm mx-auto mt-2">
        Create a new group for your library or ask a colleague for an invite code to join theirs.
      </p>
      <div class="mt-6 flex justify-center gap-3">
        <button @click="isCreateModalOpen = true" class="text-indigo-600 hover:underline text-sm font-medium">Create Group</button>
        <span class="text-gray-300">|</span>
        <button @click="isJoinModalOpen = true" class="text-indigo-600 hover:underline text-sm font-medium">Join Group</button>
      </div>
    </div>

    <!-- Groups Grid -->
    <div v-else class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <NuxtLink
        v-for="group in groups"
        :key="group.id"
        :to="`/groups/${group.id}`"
        class="block bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-600 transition-all"
      >
        <div class="flex justify-between items-start mb-4">
          <div class="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg">
            <Users class="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <span 
            class="text-xs font-medium px-2 py-1 rounded-full"
            :class="group.role === 'owner' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'"
          >
            {{ group.role === 'owner' ? 'Owner' : 'Member' }}
          </span>
        </div>
        
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-1">{{ group.name }}</h3>
        <p class="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-2">{{ group.description || 'No description' }}</p>
        
        <div class="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
          <div class="text-xs text-gray-500">
            <div class="flex items-center gap-1 mb-1">
              <span>Code:</span>
              <code class="bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded font-mono">{{ group.inviteCode }}</code>
              <button class="p-1 hover:text-indigo-600" title="Copy Code" @click.prevent="copyCode(group.inviteCode)">
                <Copy class="w-3 h-3" />
              </button>
            </div>
            Updated: {{ new Date(group.updatedAt).toLocaleDateString() }}
          </div>
          
          <span class="text-sm font-medium text-indigo-600 hover:text-indigo-500">
            Open →
          </span>
        </div>
      </NuxtLink>
    </div>

    <!-- Create Modal -->
    <UModal v-model="isCreateModalOpen">
      <div class="p-6">
        <h3 class="text-lg font-semibold mb-4">Create New Library Group</h3>
        <form @submit.prevent="handleCreate" class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-1">Group Name</label>
            <input v-model="newGroupName" type="text" class="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600" placeholder="e.g. City Public Library" required>
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Description (Optional)</label>
            <textarea v-model="newGroupDesc" rows="3" class="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 resize-none" placeholder="Brief description of this library..."></textarea>
          </div>
          <div class="flex justify-end gap-3 pt-2">
            <button type="button" @click="isCreateModalOpen = false" class="px-4 py-2 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 rounded-lg">Cancel</button>
            <button type="submit" :disabled="isSubmitting" class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50">
              {{ isSubmitting ? 'Creating...' : 'Create Group' }}
            </button>
          </div>
        </form>
      </div>
    </UModal>

    <!-- Join Modal -->
    <UModal v-model="isJoinModalOpen">
      <div class="p-6">
        <h3 class="text-lg font-semibold mb-4">Join Existing Group</h3>
        <form @submit.prevent="handleJoin" class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-1">Invite Code</label>
            <input v-model="inviteCode" type="text" class="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 font-mono uppercase" placeholder="XXXXXX" maxlength="6" required>
            <p class="text-xs text-gray-500 mt-1">Ask the group owner for the 6-character invite code.</p>
          </div>
          <div class="flex justify-end gap-3 pt-2">
            <button type="button" @click="isJoinModalOpen = false" class="px-4 py-2 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 rounded-lg">Cancel</button>
            <button type="submit" :disabled="isSubmitting" class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50">
              {{ isSubmitting ? 'Joining...' : 'Join Group' }}
            </button>
          </div>
        </form>
      </div>
    </UModal>
  </div>
</template>
