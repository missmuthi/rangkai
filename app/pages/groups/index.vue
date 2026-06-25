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
    <div class="flex flex-col gap-4 rounded-[1.75rem] border border-border bg-card/90 p-6 shadow-sm sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 class="text-2xl font-semibold text-foreground">
          Library Groups
        </h1>
        <p class="mt-1 text-sm text-muted-foreground">
          Collaborate with your team to build a shared library catalog.
        </p>
      </div>
      <div class="flex gap-2 w-full sm:w-auto">
        <button
          class="flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-xl border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          @click="isJoinModalOpen = true"
        >
          <LogIn class="w-4 h-4" />
          Join Group
        </button>
        <button
          class="flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:opacity-95"
          @click="isCreateModalOpen = true"
        >
          <Plus class="w-4 h-4" />
          Create Group
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading && groups.length === 0" class="flex justify-center py-12">
      <div class="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
    </div>

    <!-- Empty State -->
    <div v-else-if="groups.length === 0" class="rounded-[1.75rem] border border-dashed border-border bg-card/70 py-12 text-center">
      <Users class="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
      <h3 class="text-lg font-medium text-foreground">No Groups Yet</h3>
      <p class="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
        Create a new group for your library or ask a colleague for an invite code to join theirs.
      </p>
      <div class="mt-6 flex justify-center gap-3">
        <button class="text-sm font-medium text-primary underline-offset-4 hover:underline" @click="isCreateModalOpen = true">Create Group</button>
        <span class="text-muted-foreground">|</span>
        <button class="text-sm font-medium text-primary underline-offset-4 hover:underline" @click="isJoinModalOpen = true">Join Group</button>
      </div>
    </div>

    <!-- Groups Grid -->
    <div v-else class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <NuxtLink
        v-for="group in groups"
        :key="group.id"
        :to="`/groups/${group.id}`"
        class="block rounded-[1.5rem] border border-border bg-card p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
      >
        <div class="flex justify-between items-start mb-4">
          <div class="rounded-2xl bg-accent px-2.5 py-2 text-accent-foreground">
            <Users class="w-6 h-6" />
          </div>
          <span 
            class="text-xs font-medium px-2 py-1 rounded-full"
            :class="group.role === 'owner' ? 'bg-accent text-accent-foreground' : 'bg-muted text-muted-foreground'"
          >
            {{ group.role === 'owner' ? 'Owner' : 'Member' }}
          </span>
        </div>
        
        <h3 class="mb-1 text-lg font-semibold text-foreground">{{ group.name }}</h3>
        <p class="mb-4 line-clamp-2 text-sm text-muted-foreground">{{ group.description || 'No description' }}</p>
        
        <div class="flex items-center justify-between border-t border-border pt-4">
          <div class="text-xs text-muted-foreground">
            <div class="flex items-center gap-1 mb-1">
              <span>Code:</span>
              <code class="rounded bg-muted px-1.5 py-0.5 font-mono">{{ group.inviteCode }}</code>
              <button class="p-1 hover:text-primary" title="Copy Code" @click.prevent="copyCode(group.inviteCode)">
                <Copy class="w-3 h-3" />
              </button>
            </div>
            Updated: {{ new Date(group.updatedAt).toLocaleDateString() }}
          </div>
          
          <span class="text-sm font-medium text-primary hover:underline">
            Open →
          </span>
        </div>
      </NuxtLink>
    </div>

    <!-- Create Modal -->
  <UModal v-model="isCreateModalOpen">
      <div class="p-6">
        <h3 class="mb-4 text-lg font-semibold text-foreground">Create New Library Group</h3>
        <form class="space-y-4" @submit.prevent="handleCreate">
          <div>
            <label class="mb-1 block text-sm font-medium text-foreground">Group Name</label>
            <input v-model="newGroupName" type="text" class="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground" placeholder="e.g. City Public Library" required>
          </div>
          <div>
            <label class="mb-1 block text-sm font-medium text-foreground">Description (Optional)</label>
            <textarea v-model="newGroupDesc" rows="3" class="w-full resize-none rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground" placeholder="Brief description of this library..."/>
          </div>
          <div class="flex justify-end gap-3 pt-2">
            <button type="button" class="rounded-xl px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted" @click="isCreateModalOpen = false">Cancel</button>
            <button type="submit" :disabled="isSubmitting" class="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-95 disabled:opacity-50">
              {{ isSubmitting ? 'Creating...' : 'Create Group' }}
            </button>
          </div>
        </form>
      </div>
    </UModal>

    <!-- Join Modal -->
  <UModal v-model="isJoinModalOpen">
      <div class="p-6">
        <h3 class="mb-4 text-lg font-semibold text-foreground">Join Existing Group</h3>
        <form class="space-y-4" @submit.prevent="handleJoin">
          <div>
            <label class="mb-1 block text-sm font-medium text-foreground">Invite Code</label>
            <input v-model="inviteCode" type="text" class="w-full rounded-xl border border-border bg-background px-3 py-2 font-mono uppercase text-sm text-foreground" placeholder="XXXXXX" maxlength="6" required>
            <p class="mt-1 text-xs text-muted-foreground">Ask the group owner for the 6-character invite code.</p>
          </div>
          <div class="flex justify-end gap-3 pt-2">
            <button type="button" class="rounded-xl px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted" @click="isJoinModalOpen = false">Cancel</button>
            <button type="submit" :disabled="isSubmitting" class="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-95 disabled:opacity-50">
              {{ isSubmitting ? 'Joining...' : 'Join Group' }}
            </button>
          </div>
        </form>
      </div>
    </UModal>
  </div>
</template>
