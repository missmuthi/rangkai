/**
 * Open Library Classification Fetcher
 * Fetches DDC and LCC classifications from Open Library API (free tier)
 */

export interface OpenLibraryClassification {
  title: string | null
  ddc: string | null
  lcc: string | null
  subjects: string[]
}

export async function fetchOpenLibraryClassification(isbn: string): Promise<OpenLibraryClassification | null> {
  const url = `https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&jscmd=data&format=json`
  
  try {
    console.info(`[OpenLibrary] Fetching classification for ISBN: ${isbn}`)
    
    const data = await $fetch<any>(url)
    const book = data[`ISBN:${isbn}`]
    
    if (!book) {
      console.info(`[OpenLibrary] No data found for ISBN: ${isbn}`)
      return null
    }

    // Extract classifications
    const ddc = book.classifications?.dewey_decimal_class?.[0] || null
    const lcc = book.classifications?.lc_classifications?.[0] || null
    const subjects = book.subjects?.map((s: any) => s.name).slice(0, 7) || []

    console.info(`[OpenLibrary] Found - DDC: ${ddc}, LCC: ${lcc}`)

    return {
      title: book.title || null,
      ddc,
      lcc,
      subjects
    }
  } catch (error) {
    console.error('[OpenLibrary] Fetch failed:', error)
    return null
  }
}
