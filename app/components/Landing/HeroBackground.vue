<script setup lang="ts">
const appear = ref(false)

onMounted(() => {
  setTimeout(() => {
    appear.value = true
  }, 100)
})
</script>

<template>
  <div
    class="absolute inset-0 -z-10 overflow-hidden"
    :class="appear ? 'opacity-100' : 'opacity-0'"
    style="transition: opacity 1000ms"
  >
    <!-- Gradient Background -->
    <div class="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
    
    <!-- Animated Grid -->
    <div class="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border))_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
    
    <!-- SVG Gradient Overlay (from template) -->
    <div class="absolute w-full -top-px text-primary shrink-0">
      <svg
        viewBox="0 0 1440 181"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        class="pointer-events-none"
      >
        <mask
          id="path-1-inside-1"
          fill="white"
        >
          <path d="M0 0H1440V181H0V0Z" />
        </mask>
        <path
          d="M0 0H1440V181H0V0Z"
          fill="url(#paint0_linear)"
          fill-opacity="0.15"
        />
        <path
          d="M0 2H1440V-2H0V2Z"
          fill="url(#paint1_linear)"
          mask="url(#path-1-inside-1)"
        />
        <defs>
          <linearGradient
            id="paint0_linear"
            x1="720"
            y1="0"
            x2="720"
            y2="181"
            gradientUnits="userSpaceOnUse"
          >
            <stop stop-color="currentColor" />
            <stop
              offset="1"
              stop-color="currentColor"
              stop-opacity="0"
            />
          </linearGradient>
          <linearGradient
            id="paint1_linear"
            x1="0"
            y1="90.5"
            x2="1440"
            y2="90.5"
            gradientUnits="userSpaceOnUse"
          >
            <stop
              stop-color="currentColor"
              stop-opacity="0"
            />
            <stop
              offset="0.395"
              stop-color="currentColor"
            />
            <stop
              offset="1"
              stop-color="currentColor"
              stop-opacity="0"
            />
          </linearGradient>
        </defs>
      </svg>
    </div>
  </div>
</template>
