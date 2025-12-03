<script setup lang="ts">
type Message = { id: number | string; text: string; created_at?: string | number | Date }
const { data: messages, refresh } = await useFetch<Message[]>('/api/messages')
const newMessage = ref('')

async function sendMessage () {
  if (!newMessage.value.trim()) return
  await $fetch('/api/messages', {
    method: 'POST',
    body: { text: newMessage.value }
  })
  newMessage.value = ''
  await refresh()
}

function formatDate (v?: string | number | Date) {
  return new Date(v ?? Date.now()).toLocaleString('fr-FR')
}
</script>

<template>
  <div>
    <h3>Messages</h3>
    <form @submit.prevent="sendMessage">
      <input v-model="newMessage" placeholder="Type a message" />
      <button type="submit">Send</button>
    </form>

    <p v-for="message of messages" :key="message.id">
      {{ message.text }} - {{ formatDate(message.created_at) }}
    </p>

    <p v-if="!messages?.length">No messages yet</p>
  </div>
</template>
