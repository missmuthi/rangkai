<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 sm:pb-0">
    <LayoutHeader />
    <LayoutMobileNav />

    <main>
      <slot />
    </main>

    <LayoutFooter />
    <ReloadPrompt />
  </div>
</template>
