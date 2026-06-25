export function normalizeISBN(isbn: string): string {
  return isbn.replace(/[-\s]/g, '').toUpperCase()
}

export function isValidISBN10(isbn: string): boolean {
  const cleaned = normalizeISBN(isbn)
  if (!/^\d{9}[\dX]$/.test(cleaned)) return false

  let sum = 0
  for (let index = 0; index < 9; index++) {
    sum += Number.parseInt(cleaned.charAt(index), 10) * (10 - index)
  }

  const checkDigit = cleaned.charAt(9)
  sum += checkDigit === 'X' ? 10 : Number.parseInt(checkDigit, 10)

  return sum % 11 === 0
}

export function isValidISBN13(isbn: string): boolean {
  const cleaned = normalizeISBN(isbn)
  if (!/^97[89]\d{10}$/.test(cleaned)) return false

  let sum = 0
  for (let index = 0; index < 12; index++) {
    sum += Number.parseInt(cleaned.charAt(index), 10) * (index % 2 === 0 ? 1 : 3)
  }

  return Number.parseInt(cleaned.charAt(12), 10) === (10 - (sum % 10)) % 10
}

export function isValidISBN(isbn: string): boolean {
  const cleaned = normalizeISBN(isbn)
  return isValidISBN10(cleaned) || isValidISBN13(cleaned)
}
