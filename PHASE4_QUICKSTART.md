# Quick Start Guide - Phase 4 Frontend

## Development

Start the development server:
```bash
pnpm dev
```

Visit http://localhost:3000

## Available Routes

### Public Pages
- `/` - Home page
- `/login` - Authentication page

### Protected Pages (require login)
- `/scan/mobile` - Mobile barcode scanner
- `/history` - Scan history with search and export

## Using the Scanner

1. Navigate to `/scan/mobile`
2. Grant camera permissions when prompted
3. Point camera at ISBN barcode
4. Metadata will automatically fetch and display
5. Toggle "Auto-clean metadata with AI" for improved data quality
6. Click "Save" to add to history

## Managing Scans

1. Navigate to `/history`
2. Use search bar to filter by title, ISBN, or author
3. Click delete icon to remove a scan
4. Click "Export CSV" to download all scans

## Component Usage

### BookCard Component
```vue
<BookCard 
  :book="bookData" 
  :show-actions="true" 
  @save="handleSave"
  @edit="handleEdit"
/>
```

### ScanHistory Component
```vue
<ScanHistory />
```
Auto-fetches scans on mount.

## Composables

### useBookFetch
```typescript
const { book, loading, error, fetchBook, cleanMetadata } = useBookFetch()

// Fetch book by ISBN
await fetchBook('9780134685991')

// Clean metadata
const cleaned = await cleanMetadata(book.value)
```

### useScans
```typescript
const { scans, loading, error, fetchScans, createScan, updateScan, deleteScan } = useScans()

// Fetch all scans
await fetchScans()

// Create new scan
await createScan({
  isbn: '9780134685991',
  title: 'Effective Java',
  authors: 'Joshua Bloch',
  publisher: 'Addison-Wesley',
  status: 'complete'
})

// Delete scan
await deleteScan(scanId)
```

## Type Definitions

All types are in `app/types/book.ts`:

```typescript
interface BookMetadata {
  isbn: string
  title: string | null
  subtitle: string | null
  authors: string[]
  publisher: string | null
  publishedDate: string | null
  description: string | null
  pageCount: number | null
  categories: string[]
  language: string | null
  thumbnail: string | null
  source: 'google' | 'openlibrary' | 'loc'
}
```

## Production Deployment

1. Build:
   ```bash
   pnpm build
   ```

2. Preview:
   ```bash
   npx wrangler pages dev dist
   ```

3. Deploy to Cloudflare Pages:
   ```bash
   npx wrangler pages deploy dist
   ```

## Troubleshooting

### Camera not working
- Check browser permissions
- Ensure HTTPS (camera API requires secure context)
- Try different browsers (Chrome/Safari recommended)

### Images not loading
- Check image proxy whitelist in `server/api/image-proxy.get.ts`
- Verify CSP headers allow proxied domains

### Auth middleware blocking public pages
- Check `definePageMeta({ middleware: 'auth' })` only on protected pages
- Ensure `useAuth()` composable returns correct `isAuthenticated` value

### Type errors
- Run `pnpm typecheck` to identify issues
- Ensure `app/types/book.ts` is used for shared types
- Check imports use `~/types/book` not `~/server/utils/metadata/types`
