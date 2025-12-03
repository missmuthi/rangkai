export function isValidISBN10(isbn: string): boolean {
  const cleaned = isbn.replace(/[-\s]/g, '')
  if (!/^\d{9}[\dXx]$/.test(cleaned)) return false

  let sum = 0
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleaned.charAt(i)) * (10 - i)
  }
  const check = cleaned.charAt(9).toUpperCase()
  sum += check === 'X' ? 10 : parseInt(check)

  return sum % 11 === 0
}

export function isValidISBN13(isbn: string): boolean {
  const cleaned = isbn.replace(/[-\s]/g, '')
  if (!/^97[89]\d{10}$/.test(cleaned)) return false

  let sum = 0
  for (let i = 0; i < 12; i++) {
    sum += parseInt(cleaned.charAt(i)) * (i % 2 === 0 ? 1 : 3)
  }
  const check = (10 - (sum % 10)) % 10

  return parseInt(cleaned.charAt(12)) === check
}

export function normalizeISBN(isbn: string): string {
  return isbn.replace(/[-\s]/g, '').toUpperCase()
}

export function isValidISBN(isbn: string): boolean {
  const cleaned = normalizeISBN(isbn)
  return isValidISBN10(cleaned) || isValidISBN13(cleaned)
}
