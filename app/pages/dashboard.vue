<script setup lang="ts">
import { ArrowRight, BookOpen, LayoutGrid, Search, ScanLine, Sparkles, Upload, Users, Clock3 } from 'lucide-vue-next'
import Input from '@/components/ui/Input.vue'
import Button from '@/components/ui/Button.vue'

definePageMeta({
  middleware: 'auth',
  layout: 'app',
  title: 'Dashboard',
})

useHead({
  htmlAttrs: {
    lang: 'id',
  },
})

useSeoMeta({
  title: 'Dashboard Rangkai | Meja kerja katalog',
  description:
    'Dashboard Rangkai untuk melanjutkan scan, meninjau riwayat, dan mengelola pekerjaan katalog buku.',
})

const { handleSearch, openScanner } = useSearchRouting()
const { history, fetchHistory, loading } = useHistory()
const { groups, fetchGroups } = useGroups()

const searchQuery = ref('')
const recentScans = computed(() => history.value.slice(0, 5))
const stats = computed(() => ({
  total: history.value.length,
  completed: history.value.filter((scan) => scan.status === 'complete').length,
  pending: history.value.filter((scan) => scan.status === 'pending').length,
  groups: groups.value.length,
}))

const quickActions = [
  { title: 'Mulai Memindai', description: 'Buka kamera dan lanjutkan buku berikutnya.', to: '/scan/mobile', icon: ScanLine },
  { title: 'Lihat Riwayat', description: 'Tinjau record yang sudah masuk.', to: '/history', icon: Clock3 },
  { title: 'Kelompok Kerja', description: 'Kelola buku di ruang kerja tim.', to: '/groups', icon: Users },
  { title: 'Impor SLiMS', description: 'Masukkan koleksi dari CSV.', to: '/import', icon: Upload },
]

onMounted(() => {
  fetchHistory()
  fetchGroups()
})

function onSearch() {
  handleSearch(searchQuery.value)
}
</script>

<template>
  <div class="space-y-8">
    <section class="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
      <div class="rounded-[1.75rem] border border-border bg-card/90 p-6 shadow-sm sm:p-8">
        <p class="text-[0.62rem] uppercase tracking-[0.3em] text-muted-foreground">
          Dashboard kerja
        </p>
        <h1 class="mt-4 max-w-2xl text-4xl leading-[1.04] text-foreground sm:text-5xl" style="font-family: var(--font-display)">
          Meja kerja katalog yang tenang untuk buku berikutnya.
        </h1>
        <p class="mt-4 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
          Cari ISBN, lanjutkan scan, dan tinjau record terbaru dari satu ruang kerja yang tetap
          rapi untuk pengguna yang sudah masuk.
        </p>

        <p class="mt-6 inline-flex flex-wrap items-center gap-2 rounded-full border border-border bg-accent/65 px-4 py-2 text-sm text-accent-foreground">
          <span class="font-mono text-xs uppercase tracking-[0.28em]">ALUR</span>
          <span>Pindai barcode</span>
          <span aria-hidden="true">→</span>
          <span>metadata dirapikan AI</span>
          <span aria-hidden="true">→</span>
          <span>ekspor ke SLiMS</span>
        </p>

        <div class="mt-6 flex flex-wrap gap-3">
          <Button type="button" class="gap-2" @click="openScanner">
            <ScanLine class="h-4 w-4" />
            Mulai Memindai
          </Button>
          <NuxtLink
            to="/history"
            class="inline-flex items-center gap-2 rounded-md border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            Lihat Riwayat
            <ArrowRight class="h-4 w-4" />
          </NuxtLink>
        </div>
      </div>

      <aside class="rounded-[1.75rem] border border-border bg-card/90 p-6 shadow-sm">
        <p class="text-[0.62rem] uppercase tracking-[0.3em] text-muted-foreground">
          Pencarian cepat
        </p>
        <form class="mt-4 space-y-4" @submit.prevent="onSearch">
          <div class="relative">
            <Search class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              v-model="searchQuery"
              class="h-12 rounded-2xl pl-10 text-sm"
              placeholder="Cari judul, penulis, atau ISBN"
            />
          </div>
          <Button type="submit" variant="outline" class="w-full justify-center gap-2">
            <Sparkles class="h-4 w-4" />
            Cari di riwayat
          </Button>
        </form>

        <div class="mt-6 grid grid-cols-2 gap-3">
            <div class="rounded-2xl border border-border bg-card p-4">
            <p class="font-mono text-[0.62rem] uppercase tracking-[0.28em] text-muted-foreground">Total</p>
            <p class="mt-2 text-2xl font-semibold text-foreground">{{ stats.total }}</p>
          </div>
            <div class="rounded-2xl border border-border bg-card p-4">
            <p class="font-mono text-[0.62rem] uppercase tracking-[0.28em] text-muted-foreground">Selesai</p>
            <p class="mt-2 text-2xl font-semibold text-foreground">{{ stats.completed }}</p>
          </div>
          <div class="rounded-2xl border border-border bg-card p-4">
            <p class="font-mono text-[0.62rem] uppercase tracking-[0.28em] text-muted-foreground">Menunggu</p>
            <p class="mt-2 text-2xl font-semibold text-foreground">{{ stats.pending }}</p>
          </div>
          <div class="rounded-2xl border border-border bg-card p-4">
            <p class="font-mono text-[0.62rem] uppercase tracking-[0.28em] text-muted-foreground">Kelompok</p>
            <p class="mt-2 text-2xl font-semibold text-foreground">{{ stats.groups }}</p>
          </div>
        </div>
      </aside>
    </section>

    <section class="grid gap-6 lg:grid-cols-[1fr_18rem]">
      <div class="space-y-6">
        <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <article
            v-for="action in quickActions"
            :key="action.title"
            class="rounded-[1.5rem] border border-border bg-card p-5 shadow-sm transition-transform hover:-translate-y-0.5"
          >
            <div class="flex h-10 w-10 items-center justify-center rounded-2xl bg-accent/75 text-accent-foreground">
              <component :is="action.icon" class="h-4 w-4" />
            </div>
            <h2 class="mt-4 text-base font-semibold text-foreground">{{ action.title }}</h2>
            <p class="mt-2 text-sm leading-6 text-muted-foreground">{{ action.description }}</p>
            <NuxtLink :to="action.to" class="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
              Buka
              <ArrowRight class="h-3.5 w-3.5" />
            </NuxtLink>
          </article>
        </div>

        <section class="rounded-[1.75rem] border border-border bg-card/90 p-6 shadow-sm">
          <div class="flex items-center justify-between gap-3">
            <div>
              <p class="text-[0.62rem] uppercase tracking-[0.3em] text-muted-foreground">Scan terbaru</p>
              <h2 class="mt-1 text-xl font-semibold text-foreground">Buku terakhir yang dikerjakan</h2>
            </div>
            <NuxtLink to="/history" class="text-sm font-medium text-primary">
              Semua riwayat
            </NuxtLink>
          </div>

          <div v-if="loading" class="mt-5 grid gap-3">
            <div v-for="i in 3" :key="i" class="h-20 animate-pulse rounded-2xl bg-muted/60" />
          </div>
          <div v-else-if="recentScans.length === 0" class="mt-5 rounded-[1.5rem] border border-dashed border-border p-8 text-center">
            <BookOpen class="mx-auto h-10 w-10 text-muted-foreground" />
            <p class="mt-4 text-sm text-muted-foreground">Belum ada scan. Mulai dari buku pertama di meja Anda.</p>
            <Button class="mt-4" @click="openScanner">Mulai Memindai</Button>
          </div>
          <div v-else class="mt-5 grid gap-3">
            <NuxtLink
              v-for="scan in recentScans"
              :key="scan.id"
              :to="`/book/${scan.isbn}`"
              class="flex items-center justify-between gap-4 rounded-2xl border border-border px-4 py-4 transition-colors hover:bg-muted/50"
            >
              <div class="min-w-0">
                <p class="truncate font-medium text-foreground">{{ scan.title || 'Processing...' }}</p>
                <p class="mt-1 font-mono text-xs text-muted-foreground">{{ scan.isbn }}</p>
              </div>
              <span class="inline-flex shrink-0 rounded-full border border-border px-2.5 py-1 text-xs font-medium text-accent-foreground">
                {{ scan.status }}
              </span>
            </NuxtLink>
          </div>
        </section>
      </div>

      <aside class="space-y-6">
        <section class="rounded-[1.75rem] border border-border bg-card/90 p-6 shadow-sm">
          <div class="flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-2xl bg-accent/75 text-accent-foreground">
              <LayoutGrid class="h-4 w-4" />
            </div>
            <div>
              <p class="text-[0.62rem] uppercase tracking-[0.3em] text-muted-foreground">Ringkasan</p>
              <h2 class="mt-1 text-lg font-semibold text-foreground">Ruang kerja aktif</h2>
            </div>
          </div>

          <div class="mt-5 space-y-3">
            <div class="flex items-center justify-between rounded-2xl border border-border bg-background px-4 py-3">
              <span class="text-sm text-muted-foreground">Riwayat scan</span>
              <span class="font-medium text-foreground">{{ stats.total }}</span>
            </div>
            <div class="flex items-center justify-between rounded-2xl border border-border bg-background px-4 py-3">
              <span class="text-sm text-muted-foreground">Record selesai</span>
              <span class="font-medium text-foreground">{{ stats.completed }}</span>
            </div>
            <div class="flex items-center justify-between rounded-2xl border border-border bg-background px-4 py-3">
              <span class="text-sm text-muted-foreground">Kelompok kerja</span>
              <span class="font-medium text-foreground">{{ stats.groups }}</span>
            </div>
          </div>
        </section>

        <section class="rounded-[1.75rem] border border-border bg-card/90 p-6 shadow-sm">
          <p class="text-[0.62rem] uppercase tracking-[0.3em] text-muted-foreground">Pintasan</p>
          <div class="mt-4 space-y-3">
            <NuxtLink
              to="/history"
              class="flex items-center justify-between rounded-2xl border border-border px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted/50"
            >
              Buka riwayat
              <ArrowRight class="h-4 w-4" />
            </NuxtLink>
            <NuxtLink
              to="/settings"
              class="flex items-center justify-between rounded-2xl border border-border px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted/50"
            >
              Pengaturan
              <ArrowRight class="h-4 w-4" />
            </NuxtLink>
          </div>
        </section>
      </aside>
    </section>
  </div>
</template>
