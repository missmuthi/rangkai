import { describe, it, expect } from 'vitest'
import { isValidISBN10, isValidISBN13, normalizeISBN, isValidISBN } from '~/utils/isbn'

describe('ISBN Validation', () => {
  describe('isValidISBN10', () => {
    it('validates correct ISBN-10', () => {
      expect(isValidISBN10('0-306-40615-2')).toBe(true)
      expect(isValidISBN10('0306406152')).toBe(true)
    })

    it('validates ISBN-10 with X check digit', () => {
      expect(isValidISBN10('0-8044-2957-X')).toBe(true)
      expect(isValidISBN10('080442957x')).toBe(true)
    })

    it('rejects invalid ISBN-10', () => {
      expect(isValidISBN10('0-306-40615-3')).toBe(false)
      expect(isValidISBN10('1234567890')).toBe(false)
    })

    it('rejects malformed input', () => {
      expect(isValidISBN10('')).toBe(false)
      expect(isValidISBN10('abc')).toBe(false)
      expect(isValidISBN10('12345')).toBe(false)
    })
  })

  describe('isValidISBN13', () => {
    it('validates correct ISBN-13', () => {
      expect(isValidISBN13('978-0-306-40615-7')).toBe(true)
      expect(isValidISBN13('9780306406157')).toBe(true)
    })

    it('validates 979 prefix ISBN-13', () => {
      expect(isValidISBN13('979-10-90636-07-1')).toBe(true)
    })

    it('rejects invalid ISBN-13', () => {
      expect(isValidISBN13('978-0-306-40615-8')).toBe(false)
      expect(isValidISBN13('9781234567890')).toBe(false)
    })

    it('rejects non-978/979 prefix', () => {
      expect(isValidISBN13('9770306406157')).toBe(false)
    })
  })

  describe('normalizeISBN', () => {
    it('removes hyphens and spaces', () => {
      expect(normalizeISBN('978-0-306-40615-7')).toBe('9780306406157')
      expect(normalizeISBN('978 0 306 40615 7')).toBe('9780306406157')
    })

    it('uppercases X check digit', () => {
      expect(normalizeISBN('0-8044-2957-x')).toBe('080442957X')
    })
  })

  describe('isValidISBN', () => {
    it('validates ISBN-10 and ISBN-13', () => {
      expect(isValidISBN('0-306-40615-2')).toBe(true)
      expect(isValidISBN('978-0-306-40615-7')).toBe(true)
      expect(isValidISBN('invalid')).toBe(false)
    })
  })
})
