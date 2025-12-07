export function useSearchRouting() {
  const router = useRouter()

  function handleSearch(query: string) {
    const cleanQuery = query.trim()
    if (!cleanQuery) return

    // ISBN-10 or ISBN-13 check (digits, potentially with dashes, but we strip them for check?)
    // User said "Sanitize: Remove dashes/spaces"
    const sanitized = cleanQuery.replace(/[-\s]/g, '')
    const isISBN = /^\d{10}$|^\d{13}$/.test(sanitized)

    if (isISBN) {
      router.push(`/book/${sanitized}`)
    } else {
      router.push({ path: '/search', query: { q: cleanQuery } })
    }
  }

  function openScanner() {
    router.push('/scan/mobile')
  }

  return {
    handleSearch,
    openScanner
  }
}
