<script setup lang="ts">
interface ProfileData {
  id: string
  email: string
  name: string | null
}

const props = defineProps<{
  profile: ProfileData
}>()

const emit = defineEmits<{
  save: [profile: ProfileData]
}>()

const localProfile = ref({ ...props.profile })
const isSaving = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

watch(() => props.profile, (newProfile) => {
  localProfile.value = { ...newProfile }
}, { deep: true })

async function handleSave() {
  isSaving.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    await $fetch('/api/profile', {
      method: 'PATCH',
      body: {
        name: localProfile.value.name,
      },
      credentials: 'include',
    })

    successMessage.value = 'Profile updated successfully'
    emit('save', localProfile.value)

    setTimeout(() => {
      successMessage.value = ''
    }, 3000)
  } catch (error: unknown) {
    const err = error as { data?: { message?: string } }
    errorMessage.value = err?.data?.message || 'Failed to update profile'
  } finally {
    isSaving.value = false
  }
}
</script>

<template>
  <div class="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
    <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
      Edit Profile
    </h3>

    <form class="space-y-4" @submit.prevent="handleSave">
      <div>
        <label for="name" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Name
        </label>
        <input
          id="name"
          v-model="localProfile.name"
          type="text"
          class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
          placeholder="Enter your name"
        >
      </div>

      <div>
        <label for="email" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Email
        </label>
        <input
          id="email"
          :value="localProfile.email"
          type="email"
          disabled
          class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-gray-100 dark:bg-gray-900 text-gray-500 dark:text-gray-400 cursor-not-allowed"
        >
        <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Email cannot be changed
        </p>
      </div>

      <div v-if="errorMessage" class="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-md">
        <p class="text-sm text-red-600 dark:text-red-400">{{ errorMessage }}</p>
      </div>

      <div v-if="successMessage" class="p-3 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-md">
        <p class="text-sm text-green-600 dark:text-green-400">{{ successMessage }}</p>
      </div>

      <div class="flex justify-end">
        <button
          type="submit"
          :disabled="isSaving"
          class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {{ isSaving ? 'Saving...' : 'Save Changes' }}
        </button>
      </div>
    </form>
  </div>
</template>
