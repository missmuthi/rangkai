
import type { Group } from '../types'

export const useGroups = () => {
  const groups = useState<Group[]>('groups', () => [])
  const isLoading = useState('groups-loading', () => false)

  async function fetchGroups() {
    isLoading.value = true
    try {
      const data = await $fetch<Group[]>('/api/groups')
      groups.value = data
    } catch (e) {
      console.error('Failed to fetch groups', e)
    } finally {
      isLoading.value = false
    }
  }

  async function createGroup(name: string, description?: string) {
    const res = await $fetch<{ success: true, groupId: string }>('/api/groups', {
      method: 'POST',
      body: { name, description }
    })
    await fetchGroups()
    return res
  }

  async function joinGroup(code: string) {
    const res = await $fetch<{ success: true; groupId: string; message?: string }>('/api/groups/join', {
      method: 'POST',
      body: { code }
    })
    await fetchGroups()
    return res
  }

  return {
    groups,
    isLoading,
    fetchGroups,
    createGroup,
    joinGroup
  }
}
