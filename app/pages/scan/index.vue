<script setup lang="ts">
definePageMeta({
  middleware: [
    function (to, from) {
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
