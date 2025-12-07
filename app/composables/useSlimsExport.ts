import type { Scan } from '~/types'

export function useSlimsExport() {
  
  function exportToCSV(scans: Scan[]) {
    const headers = ['ISBN', 'Title', 'Authors', 'Publisher', 'Date']
    const rows = scans.map(s => [
      s.isbn,
      s.title,
      s.authors,
      s.publisher,
      new Date(s.created_at).toISOString()
    ])

    const csv = [headers, ...rows]
      .map(r => r.map(c => `"${c || ''}"`).join(','))
      .join('\n')
    
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)

    const a = document.createElement('a')
    a.href = url
    a.download = `rangkai-scans-${new Date().toISOString().slice(0, 10)}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // Placeholder for future API integration
  async function exportToSlimsApi(scans: Scan[], slimsConfig: Record<string, unknown>) {
    // TODO: Implement SLIMS API push
    console.log('Exporting to SLIMS API...', scans.length)
  }

  return {
    exportToCSV,
    exportToSlimsApi
  }
}
