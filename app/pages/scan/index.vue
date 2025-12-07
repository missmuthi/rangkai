<script setup lang="ts">
definePageMeta({
  middleware: [
    function (to, _from) {
      if (to.path === '/scan') {
        return navigateTo('/scan/mobile')
      }
    }
  ]
})
</script>

<template>
  <div>Redirecting...</div>
</template>
