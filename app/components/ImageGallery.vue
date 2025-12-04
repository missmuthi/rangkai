<script setup lang="ts">
// Image upload is disabled - R2 blob storage not configured
const isEnabled = false
</script>

<template>
  <div v-if="isEnabled">
    <h3>Images</h3>
    <p class="text-gray-500">Image upload requires R2 blob storage to be enabled.</p>
  </div>
</template>
