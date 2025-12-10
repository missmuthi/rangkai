<script setup lang="ts">
import type { BookMetadata } from "~/types";
import { cn } from "~/utils/cn";

const props = defineProps<{
  book: BookMetadata;
  showActions?: boolean;
  isSaved?: boolean;
  class?: string;
}>();

const emit = defineEmits<{
  save: [book: BookMetadata];
  edit: [book: BookMetadata];
}>();

const coverUrl = computed(() => {
  return props.book.thumbnail || "/images/no-cover.svg";
});
</script>

<template>
  <article
    :class="
      cn(
        'bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden',
        props.class
      )
    "
  >
    <div class="flex">
      <!-- Cover Image -->
      <div class="w-24 h-36 flex-shrink-0 bg-gray-100 dark:bg-gray-700">
        <NuxtImg
          :src="coverUrl"
          :alt="book.title || 'Book cover'"
          class="w-full h-full object-cover"
          loading="lazy"
          width="96"
          height="144"
          provider="cloudflare"
          placeholder
        />
      </div>

      <!-- Book Info -->
      <div class="flex-1 p-4 min-w-0">
        <h3 class="font-semibold text-gray-900 dark:text-white truncate">
          {{ book.title }}
        </h3>
        <p class="text-sm text-gray-600 dark:text-gray-300 truncate">
          {{ book.authors?.join(", ") || "Unknown Author" }}
        </p>
        <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {{ book.publisher }} · {{ book.publishedDate }}
        </p>

        <!-- Classification Badges -->
        <div class="flex gap-2 mt-2 flex-wrap">
          <span
            v-if="book.categories && book.categories.length"
            class="px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded"
          >
            {{ book.categories[0] }}
          </span>
        </div>

        <!-- Actions -->
        <div v-if="showActions" class="flex gap-2 mt-3">
          <button
            class="px-3 py-1 text-sm rounded bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-green-600"
            :disabled="isSaved"
            @click="emit('save', book)"
          >
            {{ isSaved ? "Saved ✓" : "Save" }}
          </button>
          <NuxtLink
            :to="`/book/${book.isbn}`"
            class="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700 text-center"
          >
            Details
          </NuxtLink>
        </div>
      </div>
    </div>
  </article>
</template>
