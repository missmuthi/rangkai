<script setup lang="ts">
type RedirectsText = { text: string }
const redirects = ref<RedirectsText>({ text: '' })
const { data, refresh } = await useFetch<{ [key: string]: string }>('/api/redirects', {
  transform: (data) => ({ text: Object.entries(data).map(([from, to]) => `${from} ${to}`).join('\n') })
})
watchEffect(() => {
  if (data?.value) redirects.value = data.value as RedirectsText
})

async function updateRedirects () {
  const body = Object.fromEntries(
    redirects.value.text.split('\n').filter(Boolean).map(line => line.split(' '))
  )
  await $fetch('/api/redirects', {
    method: 'PUT',
    body
  })
  await refresh()
}
</script>

<template>
  <div>
    <h3>Server redirects</h3>
    <form @submit.prevent="updateRedirects">
      <p><textarea v-model="redirects.text" rows="6" placeholder="/from /to (one redirect per line)" style="width: 300px;" /></p>
      <button type="submit">
        Save redirects
      </button>
    </form>
  </div>
</template>
