<script setup lang="ts">
import { Upload, FileText, AlertCircle, CheckCircle, Download } from 'lucide-vue-next'

definePageMeta({
  layout: 'app',
  middleware: 'auth'
})

useHead({
  title: 'Import Books - Rangkai'
})

const toast = useToast()
const { groups, fetchGroups } = useGroups()

const fileInput = ref<HTMLInputElement | null>(null)
const file = ref<File | null>(null)
const selectedGroupId = ref<string>('')
const isDragging = ref(false)
const isUploading = ref(false)
const uploadResult = ref<{ 
  success: number, 
  errors: number, 
  total: number,
  logs: Array<{ row: number, isbn?: string, title?: string, message: string }> 
} | null>(null)

function downloadErrorLog() {
  if (!uploadResult.value?.logs) return
  
  const headers = ['Row', 'Message', 'ISBN', 'Title']
  const rows = uploadResult.value.logs.map(l => [
    l.row,
    `"${l.message.replace(/"/g, '""')}"`,
    `"${(l.isbn || '').replace(/"/g, '""')}"`,
    `"${(l.title || '').replace(/"/g, '""')}"`
  ])
  
  const csvContent = [
    headers.join(','),
    ...rows.map(r => r.join(','))
  ].join('\n')
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', `import_errors_${new Date().toISOString().split('T')[0]}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

function downloadTemplate() {
  const headers = ['ISBN', 'Title', 'Author', 'Classification', 'Publisher', 'Year']
  const example = ['9780141036144', '1984', 'George Orwell', '823.912', 'Penguin', '2008']
  const csvContent = [headers.join(','), example.join(',')].join('\n')
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', 'rangkai_import_template.csv')
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// Fetch groups on mount so user can choose target
onMounted(() => {
  fetchGroups()
})

function onFileSelect(event: Event) {
  const input = event.target as HTMLInputElement
  if (input.files && input.files.length > 0) {
    file.value = input.files[0] || null
    uploadResult.value = null
    if (!file.value && fileInput.value) {
      fileInput.value.value = ''
    }
  }
}

function onDrop(event: DragEvent) {
  isDragging.value = false
  const dt = event.dataTransfer
  if (dt && dt.files && dt.files.length > 0) {
    const droppedFile = dt.files[0]
    if (droppedFile && (droppedFile.type === 'text/csv' || droppedFile.name.endsWith('.csv'))) {
      file.value = droppedFile
      uploadResult.value = null
    } else {
      toast.add({ title: 'Please upload a CSV file', color: 'red' })
    }
  }
}

function clearSelectedFile() {
  file.value = null
  if (fileInput.value) {
    fileInput.value.value = ''
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
    const res = await $fetch<{ 
      success: number, 
      errors: number, 
      total: number,
      logs: Array<{ row: number, isbn?: string, title?: string, message: string }> 
    }>('/api/import/slims', {
      method: 'POST',
      body: formData
    })
    uploadResult.value = res
    if (res.errors === 0) {
      toast.add({ title: 'Import successful!', color: 'green' })
    } else if (res.success > 0) {
      toast.add({ title: 'Import completed with some errors', color: 'orange' })
    } else {
      toast.add({ title: 'Import failed completely', color: 'red' })
    }
    clearSelectedFile() // Reset file but show result
  } catch (e) {
    toast.add({ title: 'Upload failed', description: 'Please check your CSV format and try again.', color: 'red' })
  } finally {
    isUploading.value = false
  }
}
</script>

<template>
  <div class="max-w-3xl mx-auto space-y-6">
    <div>
      <h1 class="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
        Import from SLiMS
      </h1>
      <p class="text-gray-500 dark:text-gray-400 mt-1">
        Bulk import your existing library catalog from a SLiMS CSV export.
      </p>
    </div>

    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 md:p-8">
      <!-- Target Library Selection -->
      <div class="mb-8">
        <label class="block text-sm font-medium mb-2">Target Library</label>
        <select 
          v-model="selectedGroupId"
          class="w-full px-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-900 dark:border-gray-600"
        >
          <option value="">My Personal Library</option>
          <option v-for="group in groups" :key="group.id" :value="group.id">
            {{ group.name }} (Group)
          </option>
        </select>
        <p class="text-xs text-gray-500 mt-1">
          Choose to import books into your private collection or a shared group library.
        </p>
      </div>

      <!-- Upload Area -->
      <div
        class="border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer"
        :class="[
          isDragging ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : 'border-gray-300 dark:border-gray-600 hover:border-indigo-400',
          file ? 'bg-green-50 dark:bg-green-900/10 border-green-300' : ''
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
        
        <div v-if="file" class="flex flex-col items-center">
          <FileText class="w-12 h-12 text-green-500 mb-3" />
          <p class="font-medium text-gray-900 dark:text-white">{{ file.name }}</p>
          <p class="text-sm text-gray-500 mb-4">{{ (file.size / 1024).toFixed(1) }} KB</p>
          <button 
            class="text-sm text-red-500 hover:text-red-600"
            @click.stop="clearSelectedFile()"
          >
            Remove file
          </button>
        </div>
        
        <div v-else class="flex flex-col items-center">
          <Upload class="w-12 h-12 text-gray-400 mb-3" />
          <p class="font-medium text-gray-900 dark:text-white">Click to upload or drag and drop</p>
          <p class="text-sm text-gray-500 mt-1">CSV files only (SLiMS Export format)</p>
        </div>
      </div>

      <!-- Action Button -->
      <div class="mt-8 flex justify-end">
        <button
          class="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          :disabled="!file || isUploading"
          @click="handleUpload"
        >
          <div v-if="isUploading" class="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white" />
          <Upload v-else class="w-4 h-4" />
          {{ isUploading ? 'Importing...' : 'Start Import' }}
        </button>
      </div>

      <!-- Result Summary -->
      <div v-if="uploadResult" class="mt-8 space-y-4">
        <div class="p-4 rounded-lg bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700">
          <h3 class="font-semibold mb-3 flex items-center gap-2">
            <CheckCircle v-if="uploadResult.errors === 0" class="w-5 h-5 text-green-500" />
            <AlertCircle v-else class="w-5 h-5 text-orange-500" />
            Import Summary
          </h3>
          <div class="grid grid-cols-3 gap-4 text-center">
            <div class="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
              <div class="text-2xl font-bold text-gray-900 dark:text-white">{{ uploadResult.total }}</div>
              <div class="text-xs text-gray-500 uppercase tracking-wide">Processed</div>
            </div>
            <div class="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
              <div class="text-2xl font-bold text-green-600 dark:text-green-400">{{ uploadResult.success }}</div>
              <div class="text-xs text-gray-500 uppercase tracking-wide">Success</div>
            </div>
            <div class="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
              <div class="text-2xl font-bold text-red-600 dark:text-red-400">{{ uploadResult.errors }}</div>
              <div class="text-xs text-gray-500 uppercase tracking-wide">Errors</div>
            </div>
          </div>
          
          <div v-if="uploadResult.errors > 0" class="mt-4 flex justify-end">
            <button 
              class="text-sm font-medium text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 flex items-center gap-1"
              @click="downloadErrorLog"
            >
              <Download class="w-4 h-4" /> Download Error Log
            </button>
          </div>
        </div>

        <!-- Error Details Preview -->
        <div v-if="uploadResult.logs && uploadResult.logs.length > 0" class="border border-red-100 dark:border-red-900/30 rounded-lg overflow-hidden">
          <div class="bg-red-50 dark:bg-red-900/20 px-4 py-2 border-b border-red-100 dark:border-red-900/30">
            <h4 class="text-sm font-semibold text-red-800 dark:text-red-200">Error Details (First {{ Math.min(uploadResult.logs.length, 5) }} of {{ uploadResult.errors }})</h4>
          </div>
          <div class="max-h-60 overflow-y-auto bg-white dark:bg-gray-800 text-sm">
            <table class="w-full text-left">
              <thead class="bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400">
                <tr>
                  <th class="px-4 py-2 w-16">Row</th>
                  <th class="px-4 py-2">Message</th>
                  <th class="px-4 py-2">Details</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100 dark:divide-gray-700">
                <tr v-for="(log, i) in uploadResult.logs.slice(0, 50)" :key="i" class="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td class="px-4 py-2 font-mono text-gray-500">{{ log.row }}</td>
                  <td class="px-4 py-2 text-red-600 dark:text-red-400">{{ log.message }}</td>
                  <td class="px-4 py-2 text-gray-500">
                    <span v-if="log.isbn" class="mr-2">ISBN: {{ log.isbn }}</span>
                    <span v-if="log.title">Title: {{ log.title }}</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-if="uploadResult.logs.length > 50" class="px-4 py-2 bg-gray-50 dark:bg-gray-900 text-xs text-center text-gray-500">
            ... and {{ uploadResult.errors - 50 }} more errors. Download log to see all.
          </div>
        </div>
      </div>
    </div>

    <!-- Help / Instructions -->
    <div class="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg text-sm text-blue-800 dark:text-blue-200">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h4 class="font-semibold mb-2 flex items-center gap-2">
            <AlertCircle class="w-4 h-4" />
            CSV Format Requirements
          </h4>
          <ul class="list-disc list-inside space-y-1 ml-1 opacity-80">
            <li>File must be a valid CSV (Comma Separated Values)</li>
            <li>Must contain headers row</li>
            <li>Required columns: <strong>ISBN</strong> and <strong>Title</strong> (or "Judul")</li>
            <li>Recommended: Author (Pengarang), Classification (DDC)</li>
          </ul>
        </div>
        <button 
          class="shrink-0 flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-100 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-700 transition-colors text-xs font-semibold"
          @click="downloadTemplate"
        >
          <Download class="w-3 h-3" />
          Download Example CSV
        </button>
      </div>
    </div>
  </div>
</template>
