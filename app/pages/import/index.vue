<script setup lang="ts">
import { AlertCircle, CheckCircle2, Download, FileText, Upload } from 'lucide-vue-next'

definePageMeta({
  layout: 'app',
  middleware: 'auth',
  title: 'Impor',
})

useSeoMeta({
  title: 'Impor SLiMS - Rangkai',
  description: 'Impor katalog CSV dari SLiMS ke ruang kerja Rangkai.',
})

const toast = useToast()
const { groups, fetchGroups } = useGroups()

const fileInput = ref<HTMLInputElement | null>(null)
const file = ref<File | null>(null)
const selectedGroupId = ref('')
const isDragging = ref(false)
const isUploading = ref(false)
const uploadResult = ref<{
  success: number
  errors: number
  total: number
  logs: Array<{ row: number; isbn?: string; title?: string; message: string }>
} | null>(null)

onMounted(() => {
  fetchGroups()
})

function resetFile() {
  file.value = null
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

function downloadText(filename: string, text: string) {
  const blob = new Blob([text], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

function downloadTemplate() {
  downloadText(
    'rangkai_import_template.csv',
    ['ISBN,Title,Author,Classification,Publisher,Year', '9780141036144,1984,George Orwell,823.912,Penguin,2008'].join('\n')
  )
}

function downloadErrorLog() {
  if (!uploadResult.value?.logs?.length) return

  const rows = uploadResult.value.logs.map((log) => [
    log.row,
    `"${log.message.replace(/"/g, '""')}"`,
    `"${(log.isbn || '').replace(/"/g, '""')}"`,
    `"${(log.title || '').replace(/"/g, '""')}"`,
  ])

  downloadText(
    `import_errors_${new Date().toISOString().split('T')[0]}.csv`,
    ['Row,Message,ISBN,Title', ...rows.map((row) => row.join(','))].join('\n')
  )
}

function onFileSelect(event: Event) {
  const input = event.target as HTMLInputElement
  const selected = input.files?.[0] || null
  file.value = selected
  uploadResult.value = null
}

function onDrop(event: DragEvent) {
  isDragging.value = false
  const droppedFile = event.dataTransfer?.files?.[0] || null
  if (!droppedFile) return

  if (droppedFile.type === 'text/csv' || droppedFile.name.toLowerCase().endsWith('.csv')) {
    file.value = droppedFile
    uploadResult.value = null
  } else {
    toast.add({ title: 'Gunakan file CSV', color: 'red' })
  }
}

async function handleUpload() {
  if (!file.value) return

  isUploading.value = true
  const formData = new FormData()
  formData.append('file', file.value)
  if (selectedGroupId.value) {
    formData.append('groupId', selectedGroupId.value)
  }

  try {
    const result = await $fetch<{
      success: number
      errors: number
      total: number
      logs: Array<{ row: number; isbn?: string; title?: string; message: string }>
    }>('/api/import/slims', {
      method: 'POST',
      body: formData,
    })

    uploadResult.value = result

    if (result.errors === 0) {
      toast.add({ title: 'Impor selesai', color: 'green' })
    } else if (result.success > 0) {
      toast.add({ title: 'Impor selesai dengan catatan', color: 'orange' })
    } else {
      toast.add({ title: 'Impor gagal', color: 'red' })
    }

    resetFile()
  } catch {
    toast.add({
      title: 'Unggah gagal',
      description: 'Periksa format CSV dan coba lagi.',
      color: 'red',
    })
  } finally {
    isUploading.value = false
  }
}
</script>

<template>
  <div class="space-y-8">
    <section class="rounded-[1.75rem] border border-border bg-card/90 p-6 shadow-sm sm:p-8">
      <p class="text-[0.62rem] uppercase tracking-[0.3em] text-muted-foreground">
        Impor katalog
      </p>
      <div class="mt-4 grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
        <div>
          <h1 class="max-w-2xl text-4xl leading-[1.05] text-foreground sm:text-5xl" style="font-family: var(--font-display)">
            Masukkan CSV SLiMS ke meja kerja Rangkai.
          </h1>
          <p class="mt-4 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
            Cocok untuk memindahkan katalog lama, melanjutkan backlog, atau memeriksa file impor
            sebelum masuk ke alur kerja yang lebih rapi.
          </p>
        </div>

        <div class="rounded-[1.5rem] border border-border bg-muted/40 p-5">
          <p class="font-mono text-[0.62rem] uppercase tracking-[0.28em] text-muted-foreground">
            Syarat berkas
          </p>
          <ul class="mt-3 space-y-2 text-sm leading-6 text-foreground">
            <li>• CSV valid dengan header</li>
            <li>• ISBN dan Title wajib</li>
            <li>• Author, Classification, Publisher, dan Year membantu hasil lebih lengkap</li>
          </ul>
        </div>
      </div>
    </section>

    <section class="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <div class="space-y-6 rounded-[1.75rem] border border-border bg-card p-6 shadow-sm">
        <div class="space-y-2">
          <p class="text-[0.62rem] uppercase tracking-[0.3em] text-muted-foreground">
            Target impor
          </p>
          <label class="block text-sm font-medium text-foreground" for="group-select">
            Pilih ruang kerja
          </label>
          <select
            id="group-select"
            v-model="selectedGroupId"
            class="h-12 w-full rounded-2xl border border-border bg-background px-4 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
          >
            <option value="">Koleksi pribadi</option>
            <option v-for="group in groups" :key="group.id" :value="group.id">
              {{ group.name }} (Grup)
            </option>
          </select>
          <p class="text-sm leading-6 text-muted-foreground">
            Pilih koleksi pribadi atau grup agar import langsung masuk ke ruang kerja yang tepat.
          </p>
        </div>

        <div
          class="rounded-[1.5rem] border border-dashed p-8 text-center transition-colors"
          :class="[
            isDragging ? 'border-primary bg-primary/5' : 'border-border bg-muted/20',
            file ? 'border-emerald-300 bg-emerald-50/60 dark:bg-emerald-950/20' : '',
          ]"
          @dragover.prevent="isDragging = true"
          @dragleave.prevent="isDragging = false"
          @drop.prevent="onDrop"
          @click="fileInput?.click()"
        >
          <input
            ref="fileInput"
            type="file"
            accept=".csv"
            class="hidden"
            @change="onFileSelect"
          >

          <div v-if="file" class="space-y-3">
            <FileText class="mx-auto h-12 w-12 text-emerald-600" />
            <div>
              <p class="font-medium text-foreground">{{ file.name }}</p>
              <p class="mt-1 text-sm text-muted-foreground">
                {{ (file.size / 1024).toFixed(1) }} KB
              </p>
            </div>
            <button
              class="text-sm font-medium text-primary underline-offset-4 hover:underline"
              @click.stop="resetFile"
            >
              Hapus file
            </button>
          </div>

          <div v-else class="space-y-3">
            <Upload class="mx-auto h-12 w-12 text-muted-foreground" />
            <div>
              <p class="font-medium text-foreground">Klik untuk unggah atau seret CSV ke sini</p>
              <p class="mt-1 text-sm text-muted-foreground">
                Gunakan file ekspor SLiMS yang sudah Anda miliki.
              </p>
            </div>
          </div>
        </div>

        <div class="flex justify-end">
          <button
            class="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50"
            :disabled="!file || isUploading"
            @click="handleUpload"
          >
            <span
              v-if="isUploading"
              class="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground"
            />
            <Upload v-else class="h-4 w-4" />
            {{ isUploading ? 'Memproses...' : 'Mulai Impor' }}
          </button>
        </div>
      </div>

      <div class="space-y-6">
        <section class="rounded-[1.75rem] border border-border bg-card p-6 shadow-sm">
          <div class="flex items-start justify-between gap-3">
            <div>
              <p class="text-[0.62rem] uppercase tracking-[0.3em] text-muted-foreground">
                Hasil
              </p>
              <h2 class="mt-1 text-xl font-semibold text-foreground">Ringkasan impor</h2>
            </div>
            <button
              v-if="uploadResult?.logs?.length"
              class="text-sm font-medium text-primary"
              @click="downloadErrorLog"
            >
              Unduh log
            </button>
          </div>

          <div v-if="uploadResult" class="mt-5 grid grid-cols-3 gap-3">
            <div class="rounded-2xl border border-border bg-muted/40 p-4">
              <p class="font-mono text-[0.62rem] uppercase tracking-[0.28em] text-muted-foreground">Diproses</p>
              <p class="mt-2 text-2xl font-semibold text-foreground">{{ uploadResult.total }}</p>
            </div>
            <div class="rounded-2xl border border-border bg-muted/40 p-4">
              <p class="font-mono text-[0.62rem] uppercase tracking-[0.28em] text-muted-foreground">Berhasil</p>
              <p class="mt-2 text-2xl font-semibold text-emerald-600">{{ uploadResult.success }}</p>
            </div>
            <div class="rounded-2xl border border-border bg-muted/40 p-4">
              <p class="font-mono text-[0.62rem] uppercase tracking-[0.28em] text-muted-foreground">Galat</p>
              <p class="mt-2 text-2xl font-semibold text-red-600">{{ uploadResult.errors }}</p>
            </div>
          </div>

          <div
            v-if="uploadResult && uploadResult.errors > 0"
            class="mt-4 flex items-center gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
          >
            <AlertCircle class="h-4 w-4 shrink-0" />
            <span>Beberapa baris perlu diperiksa ulang sebelum masuk ke katalog.</span>
          </div>
        </section>

        <section v-if="uploadResult?.logs?.length" class="rounded-[1.75rem] border border-border bg-card p-6 shadow-sm">
          <p class="text-[0.62rem] uppercase tracking-[0.3em] text-muted-foreground">
            Detail galat
          </p>
          <div class="mt-4 max-h-72 overflow-auto rounded-2xl border border-border">
            <table class="w-full text-left text-sm">
              <thead class="bg-muted/50 text-muted-foreground">
                <tr>
                  <th class="px-4 py-3 font-medium">Baris</th>
                  <th class="px-4 py-3 font-medium">Pesan</th>
                  <th class="px-4 py-3 font-medium">Keterangan</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-border">
                <tr v-for="log in uploadResult.logs.slice(0, 50)" :key="`${log.row}-${log.message}`" class="align-top">
                  <td class="px-4 py-3 font-mono text-xs text-muted-foreground">{{ log.row }}</td>
                  <td class="px-4 py-3 text-red-600">{{ log.message }}</td>
                  <td class="px-4 py-3 text-muted-foreground">
                    <span v-if="log.isbn" class="mr-2">ISBN: {{ log.isbn }}</span>
                    <span v-if="log.title">Judul: {{ log.title }}</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </section>

    <section class="rounded-[1.75rem] border border-border bg-card/90 p-6 shadow-sm">
      <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div class="space-y-2">
          <p class="text-[0.62rem] uppercase tracking-[0.3em] text-muted-foreground">
            Bantuan
          </p>
          <h2 class="text-xl font-semibold text-foreground">Gunakan contoh CSV jika ingin mulai cepat</h2>
          <p class="max-w-2xl text-sm leading-6 text-muted-foreground">
            Format SLiMS bisa berbeda antarinstalasi. Jika ragu, unduh contoh dulu lalu sesuaikan
            nama kolomnya dengan ekspor Anda sendiri.
          </p>
        </div>
        <button
          class="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          @click="downloadTemplate"
        >
          <Download class="h-4 w-4" />
          Unduh contoh CSV
        </button>
      </div>
    </section>
  </div>
</template>
