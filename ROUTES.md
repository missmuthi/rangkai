# Rangkai Application Routes

## Frontend Routes

### Public Routes
| Path | Component | Description |
|------|-----------|-------------|
| `/` | `pages/index.vue` | Home page (existing) |
| `/login` | `pages/login.vue` | Authentication page (existing) |

### Protected Routes (Auth Required)
| Path | Component | Description |
|------|-----------|-------------|
| `/scan/mobile` | `pages/scan/mobile.vue` | Mobile barcode scanner with camera |
| `/history` | `pages/history.vue` | Scan history list with search & export |

## API Routes

### Book Metadata
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/book/[isbn]` | Fetch book metadata from 3 sources (cached 24h) |
| POST | `/api/ai/clean` | Rule-based metadata cleanup |

### Scan Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/scans` | List all scans for authenticated user |
| POST | `/api/scans` | Create new scan |
| GET | `/api/scans/[id]` | Get specific scan by ID |
| PATCH | `/api/scans/[id]` | Update scan metadata |
| DELETE | `/api/scans/[id]` | Delete scan |

### Utilities
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/image-proxy` | Proxy external book cover images (CSP compliant) |
| GET | `/api/health` | Health check endpoint |

### Authentication (Existing)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/auth-session` | Get current user session |
| GET | `/api/auth/google` | Google OAuth login |
| POST | `/api/auth/logout` | Sign out |

## Component Usage

### BookCard
Displays book metadata with optional action buttons.

**Props:**
- `book: BookMetadata` - Book data to display
- `showActions?: boolean` - Whether to show Save/Edit buttons

**Events:**
- `@save(book)` - Emitted when Save button clicked
- `@edit(book)` - Emitted when Edit button clicked

### ScanHistory
Displays list of scans with search and delete functionality.

**Features:**
- Auto-fetches scans on mount
- Real-time search filtering
- Delete with confirmation
- Loading/error states

## Composables

### useBookFetch()
Manages book metadata fetching and AI cleanup.

**Returns:**
- `book: Ref<BookMetadata | null>`
- `loading: Ref<boolean>`
- `error: Ref<string | null>`
- `fetchBook(isbn: string): Promise<void>`
- `cleanMetadata(metadata): Promise<BookMetadata>`

### useScans()
Manages scan CRUD operations.

**Returns:**
- `scans: Ref<Scan[]>`
- `loading: Ref<boolean>`
- `error: Ref<string | null>`
- `fetchScans(): Promise<void>`
- `createScan(data): Promise<Scan>`
- `updateScan(id, data): Promise<Scan>`
- `deleteScan(id): Promise<void>`

### useAuth() (Existing)
Manages user authentication state.

**Returns:**
- `user: ComputedRef<User | null>`
- `loading: ComputedRef<boolean>`
- `isAuthenticated: ComputedRef<boolean>`
- `fetchUser(): Promise<void>`
- `loginWithGoogle(): void`
- `logout(): Promise<void>`

## Layouts

### default
Standard application layout (existing).

### scanner
Dark theme layout for scanner pages.
- Full-screen dark background
- Optimized for camera usage
- No navigation chrome

## Middleware

### auth
Protects routes requiring authentication.
- Checks `useAuth().isAuthenticated`
- Redirects to `/login` if not authenticated
- Applied via `definePageMeta({ middleware: 'auth' })`

## Data Flow

### Scanning Flow
1. User visits `/scan/mobile` (auth required)
2. Camera activates via html5-qrcode
3. ISBN scanned → validated (ISBN-10/13 format)
4. Metadata fetched from `/api/book/[isbn]`
5. Optional: AI cleanup via `/api/ai/clean`
6. User saves → creates scan via `POST /api/scans`
7. Redirects to `/history` after 1.5s

### History Management
1. User visits `/history` (auth required)
2. Scans fetched via `GET /api/scans`
3. User can search/filter locally
4. Delete via `DELETE /api/scans/[id]`
5. Export CSV with UTF-8 BOM for Excel

## Type Safety

All shared types in `app/types/book.ts`:
- `BookMetadata` - Book metadata structure
- Matches server-side types in `server/utils/metadata/types.ts`
- Ensures type safety across client/server boundary
