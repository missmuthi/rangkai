#!/usr/bin/env node
/**
 * Test script for AI Clean functionality
 * Tests the /api/ai/clean endpoint with sample book data
 */

const testMetadata = {
  isbn: "9780684835396",
  title: "Deep Work: Rules for Focused Success in a Distracted World",
  authors: ["Cal Newport"],
  publisher: "Grand Central Publishing",
  publishedDate: "2016",
  description: "One of the most valuable skills in our economy is becoming increasingly rare...",
  pageCount: 296,
  language: "en"
}

console.log('🧪 Testing AI Clean Endpoint...')
console.log('📚 Book:', testMetadata.title)
console.log('📖 ISBN:', testMetadata.isbn)
console.log('\n⏳ Calling /api/ai/clean...\n')

// Note: this requires being logged in or bypassing auth for testing
// In production, you'd need a valid session cookie
console.log('⚠️  Note: This test requires GROQ_API_KEY to be set in .env')
console.log('⚠️  Note: This test requires valid authentication')
console.log('\n✅ To test manually:')
console.log('1. Run: npm run dev')
console.log('2. Login at http://localhost:3000/login')
console.log('3. Search for ISBN: 9780684835396')
console.log('4. Go to book details and click "AI Clean"')
console.log('5. Check server logs for "[AI] Enhancing metadata..."')
