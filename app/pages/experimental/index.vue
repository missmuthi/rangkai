<script setup lang="ts">
definePageMeta({
  layout: 'app',
  middleware: 'auth',
  title: 'Eksperimental',
})

useSeoMeta({
  title: 'Eksperimental Rangkai | Alat uji dan diagnostik',
  description: 'Kumpulan halaman diagnostik untuk memeriksa integrasi kamera, autentikasi, dan metadata.',
})

const experimentalRoutes = [
  {
    title: 'Pemeriksaan Kamera',
    description: 'Uji izin kamera, perangkat yang tersedia, dan kesiapan pemindai barcode.',
    to: '/diagnostics/camera',
    badge: 'Perangkat',
  },
  {
    title: 'Status Penyedia Auth',
    description: 'Lihat provider login yang aktif di deployment saat ini.',
    to: '/diagnostics/auth-providers',
    badge: 'Auth',
  },
  {
    title: 'Tes Perpusnas',
    description: 'Coba jalur metadata Perpusnas dalam mode terpisah tanpa menyimpan data.',
    to: '/diagnostics/perpusnas',
    badge: 'Metadata',
  },
]
</script>

<template>
  <div class="space-y-8">
    <section class="rounded-[1.75rem] border border-border bg-card/90 p-6 shadow-sm sm:p-8">
      <p class="text-[0.62rem] uppercase tracking-[0.3em] text-muted-foreground">
        Area eksperimental
      </p>
      <div class="mt-4 grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
        <div>
          <h1 class="max-w-2xl text-4xl leading-[1.05] text-foreground sm:text-5xl" style="font-family: var(--font-display)">
            Ruang uji untuk kamera, auth, dan metadata.
          </h1>
          <p class="mt-4 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
            Halaman ini dipakai untuk memeriksa komponen yang belum masuk ke alur utama katalog,
            tanpa mengganggu riwayat scan atau record yang sudah tersimpan.
          </p>
        </div>

        <div class="rounded-[1.5rem] border border-border bg-muted/40 p-5">
          <p class="font-mono text-[0.62rem] uppercase tracking-[0.28em] text-muted-foreground">
            Catatan
          </p>
          <p class="mt-3 text-sm leading-6 text-foreground">
            Semua halaman di sini tetap memakai shell Rangkai yang sama, supaya uji coba terasa
            seperti bagian dari ruang kerja yang sama.
          </p>
        </div>
      </div>
    </section>

    <section class="grid gap-4 lg:grid-cols-3">
      <article
        v-for="item in experimentalRoutes"
        :key="item.to"
        class="rounded-[1.5rem] border border-border bg-card p-5 shadow-sm transition-transform hover:-translate-y-0.5"
      >
        <span class="inline-flex rounded-full border border-border bg-accent/70 px-2.5 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-accent-foreground">
          {{ item.badge }}
        </span>
        <h2 class="mt-4 text-xl font-semibold text-foreground">
          {{ item.title }}
        </h2>
        <p class="mt-2 text-sm leading-6 text-muted-foreground">
          {{ item.description }}
        </p>
        <NuxtLink
          :to="item.to"
          class="mt-5 inline-flex items-center gap-2 text-sm font-medium text-primary"
        >
          Buka halaman
          <span aria-hidden="true">→</span>
        </NuxtLink>
      </article>
    </section>
  </div>
</template>
