<script setup lang="ts">
import { BookOpen, Menu, ScanLine, Search, X } from 'lucide-vue-next'
import { cn } from '~/utils/cn'

interface Props {
  pageTitle?: string
}

const props = withDefaults(defineProps<Props>(), {
  pageTitle: 'Dashboard',
})

const { navItems, isActive } = useNavigation()
const { isLoading: isAuthLoading } = useAuth()
const { isOpen: commandPaletteOpen } = useCommandPalette()
const isMobileMenuOpen = ref(false)
const route = useRoute()

watch(
  () => route.path,
  () => {
    isMobileMenuOpen.value = false
  }
)

const activeLabel = computed(
  () => navItems.find((item) => isActive(item.to))?.label || 'Beranda'
)

function openCommandPalette() {
  commandPaletteOpen.value = true
}
</script>

<template>
  <div class="relative min-h-screen overflow-x-clip bg-background text-foreground">
    <div
      aria-hidden="true"
      class="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(30,64,175,0.07),transparent_32%),linear-gradient(180deg,rgba(255,255,255,0.22),transparent_18%)]"
    />

    <div class="relative flex min-h-screen">
      <aside class="sticky top-0 hidden h-screen w-72 flex-col border-r border-border bg-card/95 backdrop-blur lg:flex">
        <div class="flex h-20 items-center gap-3 border-b border-border px-6 py-5">
          <NuxtLink to="/dashboard" class="flex items-center gap-3 transition-opacity hover:opacity-80">
            <div class="flex h-10 w-10 items-center justify-center rounded-2xl border border-border bg-accent text-accent-foreground">
              <BookOpen class="h-5 w-5" />
            </div>
            <div>
              <p class="text-[0.62rem] uppercase tracking-[0.32em] text-muted-foreground">Meja katalog</p>
              <p class="text-lg font-semibold text-foreground">Rangkai</p>
            </div>
          </NuxtLink>
        </div>

        <div class="border-b border-border px-6 py-4">
          <p class="text-xs uppercase tracking-[0.3em] text-muted-foreground">Ruang kerja aktif</p>
          <p class="mt-2 text-sm leading-6 text-muted-foreground">
            Pindai barcode, rapikan metadata, dan kirim record siap pakai ke SLiMS atau Koha.
          </p>
        </div>

        <nav class="flex-1 space-y-1 px-3 py-4">
          <NuxtLink
            v-for="item in navItems"
            :key="item.to"
            :to="item.to"
            :aria-current="isActive(item.to) ? 'page' : undefined"
            :class="cn(
              'flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-colors',
              isActive(item.to)
                ? 'border border-border bg-accent/70 text-accent-foreground shadow-sm'
                : 'text-muted-foreground hover:bg-muted/70 hover:text-foreground'
            )"
          >
            <component
              :is="item.icon"
              :class="cn(
                'h-5 w-5 shrink-0',
                isActive(item.to) ? 'text-accent-foreground' : 'text-muted-foreground'
              )"
            />
            <span class="truncate">{{ item.label }}</span>
          </NuxtLink>
        </nav>

        <div class="space-y-3 border-t border-border p-4">
          <NuxtLink
            to="/scan/mobile"
            class="flex items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-95"
          >
            <ScanLine class="h-4 w-4" />
            Mulai Memindai
          </NuxtLink>
          <p class="px-1 text-xs leading-5 text-muted-foreground">
            Pindai barcode → metadata dirapikan AI → ekspor ke SLiMS
          </p>
        </div>
      </aside>

      <UiSheet v-model:open="isMobileMenuOpen" side="left" class="w-[19rem] p-0">
        <template #default="{ close }">
          <div class="flex min-h-screen flex-col bg-card text-foreground">
            <div class="flex items-center justify-between border-b border-border px-5 py-4">
              <NuxtLink to="/dashboard" class="flex items-center gap-3" @click="close">
                <div class="flex h-10 w-10 items-center justify-center rounded-2xl border border-border bg-accent text-accent-foreground">
                  <BookOpen class="h-5 w-5" />
                </div>
                <div>
                  <p class="text-[0.62rem] uppercase tracking-[0.28em] text-muted-foreground">Meja katalog</p>
                  <p class="text-lg font-semibold text-foreground">Rangkai</p>
                </div>
              </NuxtLink>
              <button
                type="button"
                class="rounded-full border border-border p-2 text-muted-foreground"
                @click="close"
              >
                <X class="h-5 w-5" />
                <span class="sr-only">Tutup menu</span>
              </button>
            </div>

            <div class="border-b border-border px-5 py-4">
              <p class="text-xs uppercase tracking-[0.3em] text-muted-foreground">Ruang kerja aktif</p>
              <p class="mt-2 text-sm leading-6 text-muted-foreground">
                Pindai barcode, rapikan metadata, dan kirim record siap pakai.
              </p>
            </div>

            <nav class="flex-1 space-y-1 px-3 py-4">
              <NuxtLink
                v-for="item in navItems"
                :key="item.to"
                :to="item.to"
                :aria-current="isActive(item.to) ? 'page' : undefined"
                :class="cn(
                  'flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-colors',
                  isActive(item.to)
                    ? 'border border-border bg-accent/70 text-accent-foreground'
                    : 'text-muted-foreground hover:bg-muted/70 hover:text-foreground'
                )"
                @click="close"
              >
                <component
                  :is="item.icon"
                  :class="cn(
                    'h-5 w-5 shrink-0',
                    isActive(item.to) ? 'text-accent-foreground' : 'text-muted-foreground'
                  )"
                />
                <span class="truncate">{{ item.label }}</span>
              </NuxtLink>
            </nav>

            <div class="space-y-3 border-t border-border p-4">
              <NuxtLink
                to="/scan/mobile"
                class="flex items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground"
                @click="close"
              >
                <ScanLine class="h-4 w-4" />
                Mulai Memindai
              </NuxtLink>
              <p class="px-1 text-xs leading-5 text-muted-foreground">
                Pindai barcode → metadata dirapikan AI → ekspor ke SLiMS
              </p>
            </div>
          </div>
        </template>
      </UiSheet>

      <div class="flex min-h-screen flex-1 flex-col">
        <header class="sticky top-0 z-40 border-b border-border bg-card/90 backdrop-blur">
          <div class="mx-auto flex w-full max-w-[1120px] items-center gap-3 px-4 py-4 sm:px-6 lg:px-8">
            <button
              type="button"
              class="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-border text-muted-foreground transition-colors hover:bg-muted lg:hidden"
              @click="isMobileMenuOpen = true"
            >
              <Menu class="h-5 w-5" />
              <span class="sr-only">Buka menu</span>
            </button>

            <div class="min-w-0">
              <p class="text-[0.62rem] uppercase tracking-[0.3em] text-muted-foreground">
                {{ activeLabel }}
              </p>
              <h1 class="truncate text-xl font-semibold text-foreground sm:text-2xl">
                {{ props.pageTitle }}
              </h1>
            </div>

            <div class="ml-auto flex items-center gap-2">
              <NuxtLink
                to="/scan/mobile"
                class="hidden items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted sm:inline-flex"
              >
                <ScanLine class="h-4 w-4" />
                Mulai Memindai
              </NuxtLink>
              <button
                type="button"
                class="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                @click="openCommandPalette"
              >
                <Search class="h-4 w-4" />
                <span class="hidden sm:inline">Cari</span>
                <UKbd size="xs">⌘K</UKbd>
              </button>
            </div>
          </div>
        </header>

        <main class="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div class="mx-auto w-full max-w-[1120px]">
            <div
              v-if="isAuthLoading"
              class="flex min-h-[60vh] items-center justify-center rounded-[1.75rem] border border-border bg-card/80"
            >
              <div class="space-y-4 text-center">
                <div class="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                <p class="text-sm text-muted-foreground">Memuat ruang kerja...</p>
              </div>
            </div>
            <slot v-else />
          </div>
        </main>
      </div>
    </div>
  </div>
</template>
