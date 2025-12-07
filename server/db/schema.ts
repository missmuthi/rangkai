import { sqliteTable, integer, text, index, uniqueIndex } from 'drizzle-orm/sqlite-core'
import { relations } from 'drizzle-orm'

// =============================================================================
// AUTHENTICATION TABLES (Better Auth Compatible)
// =============================================================================

/**
 * User table - Core authentication entity
 * Compatible with Better Auth and custom Google OAuth
 */
export const user = sqliteTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: integer('emailVerified', { mode: 'boolean' }).notNull().default(false),
  image: text('image'),
  createdAt: integer('createdAt', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updatedAt', { mode: 'timestamp' }).notNull(),
})

/**
 * Session table - Unified session storage for all auth methods
 * Used by both Better Auth (email/pass) and custom Google OAuth
 */
export const session = sqliteTable('session', {
  id: text('id').primaryKey(),
  expiresAt: integer('expiresAt', { mode: 'timestamp' }).notNull(),
  token: text('token').notNull().unique(),
  createdAt: integer('createdAt', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updatedAt', { mode: 'timestamp' }).notNull(),
  ipAddress: text('ipAddress'),
  userAgent: text('userAgent'),
  userId: text('userId').notNull().references(() => user.id, { onDelete: 'cascade' }),
}, (table) => [
  index('idx_session_userId').on(table.userId),
  uniqueIndex('idx_session_token').on(table.token),
])

/**
 * Account table - OAuth provider connections
 * Stores Google OAuth tokens and credentials
 */
export const account = sqliteTable('account', {
  id: text('id').primaryKey(),
  accountId: text('accountId').notNull(),
  providerId: text('providerId').notNull(), // 'google', 'credential'
  userId: text('userId').notNull().references(() => user.id, { onDelete: 'cascade' }),
  accessToken: text('accessToken'),
  refreshToken: text('refreshToken'),
  idToken: text('idToken'),
  accessTokenExpiresAt: integer('accessTokenExpiresAt', { mode: 'timestamp' }),
  refreshTokenExpiresAt: integer('refreshTokenExpiresAt', { mode: 'timestamp' }),
  scope: text('scope'),
  password: text('password'), // Hashed, for credential auth
  createdAt: integer('createdAt', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updatedAt', { mode: 'timestamp' }).notNull(),
}, (table) => [
  index('idx_account_userId').on(table.userId),
  index('idx_account_providerId').on(table.providerId),
])

/**
 * Verification table - Email verification and password reset tokens
 */
export const verification = sqliteTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(), // email or user id
  value: text('value').notNull(), // token value
  expiresAt: integer('expiresAt', { mode: 'timestamp' }).notNull(),
  createdAt: integer('createdAt', { mode: 'timestamp' }),
  updatedAt: integer('updatedAt', { mode: 'timestamp' }),
}, (table) => [
  index('idx_verification_identifier').on(table.identifier),
])

// =============================================================================
// APPLICATION TABLES
// =============================================================================

/**
 * Books table - Master table for book metadata (deduplicated)
 * Stores unique book data by ISBN to prevent duplication
 * When multiple users scan the same book, only one record exists here
 */
export const books = sqliteTable('books', {
  id: text('id').primaryKey(), // UUID
  isbn: text('isbn').notNull().unique(), // ISBN-10 or ISBN-13 (normalized)
  isbn10: text('isbn10'), // Original ISBN-10 if available
  isbn13: text('isbn13'), // Original ISBN-13 if available
  title: text('title').notNull(),
  authors: text('authors', { mode: 'json' }).$type<string[]>(), // JSON array
  publisher: text('publisher'),
  publishedDate: text('publishedDate'), // ISO date string or year
  description: text('description'),
  pageCount: integer('pageCount'),
  categories: text('categories', { mode: 'json' }).$type<string[]>(), // JSON array
  thumbnail: text('thumbnail'), // Cover image URL
  language: text('language'), // ISO language code
  previewLink: text('previewLink'), // Google Books preview URL
  infoLink: text('infoLink'), // More info URL
  // SLiMS Bibliographic Fields
  ddc: text('ddc'), // Dewey Decimal Classification
  lcc: text('lcc'), // Library of Congress Classification
  callNumber: text('call_number'), // Full shelf filing code
  subjects: text('subjects'), // Semicolon-separated subject headings
  series: text('series'), // Series title if applicable
  edition: text('edition'), // Edition info (e.g., "3rd Edition")
  collation: text('collation'), // Physical description (e.g., "416 p.")
  gmd: text('gmd').default('text'), // General Material Designation
  publishPlace: text('publish_place'), // Place of publication
  classificationTrust: text('classification_trust'), // "high" | "medium" | "low"
  // AI Enhancement
  isAiEnhanced: integer('is_ai_enhanced', { mode: 'boolean' }).default(false),
  enhancedAt: integer('enhanced_at', { mode: 'timestamp' }),
  aiLog: text('ai_log', { mode: 'json' }).$type<any[]>(), // JSON array of AI changes
  // Metadata source tracking
  source: text('source').default('google_books'), // 'google_books', 'open_library', 'manual'
  rawMetadata: text('rawMetadata'), // Original API response as JSON string
  createdAt: integer('createdAt', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updatedAt', { mode: 'timestamp' }).notNull(),
}, (table) => [
  uniqueIndex('idx_books_isbn').on(table.isbn),
  index('idx_books_title').on(table.title),
  index('idx_books_ddc').on(table.ddc),
  index('idx_books_lcc').on(table.lcc),
])

/**
 * Scans table - User scan history
 * Links users to books with scan-specific metadata
 */
export const scans = sqliteTable('scans', {
  id: text('id').primaryKey(), // UUID
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  bookId: text('book_id').references(() => books.id, { onDelete: 'set null' }), // Optional if book lookup failed
  // Fallback fields if book lookup failed
  isbn: text('isbn').notNull(), // Original scanned ISBN
  title: text('title'), // Manual entry or from failed lookup
  authors: text('authors', { mode: 'json' }).$type<string[]>(), // Manual entry
  publisher: text('publisher'),
  description: text('description'),
  // SLiMS Bibliographic Fields
  ddc: text('ddc'),
  lcc: text('lcc'),
  callNumber: text('call_number'),
  subjects: text('subjects'),
  series: text('series'),
  edition: text('edition'),
  collation: text('collation'),
  gmd: text('gmd').default('text'),
  publishPlace: text('publish_place'),
  classificationTrust: text('classification_trust'),
  // AI Enhancement
  isAiEnhanced: integer('is_ai_enhanced', { mode: 'boolean' }).default(false),
  enhancedAt: integer('enhanced_at', { mode: 'timestamp' }),
  aiLog: text('ai_log', { mode: 'json' }).$type<any[]>(),
  jsonData: text('json_data'), // Full MergedBookData as JSON
  // Scan-specific data
  source: text('source'), // 'google', 'openlibrary', 'ai', 'manual'
  status: text('status').notNull().default('pending'), // 'pending', 'complete', 'error', 'exported'
  notes: text('notes'), // User notes
  exportedAt: integer('exported_at', { mode: 'timestamp' }), // When exported to SLIMS
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
}, (table) => [
  index('idx_scans_userId').on(table.userId),
  index('idx_scans_bookId').on(table.bookId),
  index('idx_scans_isbn').on(table.isbn),
  index('idx_scans_status').on(table.status),
  index('idx_scans_createdAt').on(table.createdAt),
  index('idx_scans_ddc').on(table.ddc),
// ... scans table definition ending ...
  index('idx_scans_lcc').on(table.lcc),
])

/**
 * Scans History table - Version control for book metadata
 */
export const scansHistory = sqliteTable('scans_history', {
  historyId: integer('history_id').primaryKey({ autoIncrement: true }),
  scanId: text('scan_id').notNull().references(() => scans.id, { onDelete: 'cascade' }),
  version: integer('version').notNull(),
  snapshotAt: integer('snapshot_at', { mode: 'timestamp' }).notNull(),
  
  // Snapshot data
  userId: text('user_id').notNull(),
  isbn: text('isbn').notNull(),
  title: text('title'),
  
  // Full metadata snapshot
  authors: text('authors', { mode: 'json' }).$type<string[]>(),
  publisher: text('publisher'),
  description: text('description'),
  pageCount: integer('page_count'),
  categories: text('categories', { mode: 'json' }).$type<string[]>(),
  language: text('language'),
  thumbnail: text('thumbnail'),
  previewLink: text('preview_link'),
  infoLink: text('info_link'),
  
  // Bibliographic fields
  ddc: text('ddc'),
  lcc: text('lcc'),
  callNumber: text('call_number'),
  subjects: text('subjects'),
  series: text('series'),
  edition: text('edition'),
  collation: text('collation'),
  gmd: text('gmd'),
  publishPlace: text('publish_place'),
  classificationTrust: text('classification_trust'),
  
  // AI Meta
  isAiEnhanced: integer('is_ai_enhanced', { mode: 'boolean' }),
  enhancedAt: integer('enhanced_at', { mode: 'timestamp' }),
  aiLog: text('ai_log', { mode: 'json' }).$type<any[]>(),
  jsonData: text('json_data'), // Full MergedBookData as JSON
  
  status: text('status'),
  notes: text('notes'),
  createdAt: integer('created_at', { mode: 'timestamp' }),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
}, (table) => [
  index('idx_scans_history_scan_id').on(table.scanId),
  index('idx_scans_history_version').on(table.scanId, table.version),
])

// =============================================================================
// RELATIONS (Drizzle ORM)
// =============================================================================

export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
  scans: many(scans),
}))

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}))

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}))

export const booksRelations = relations(books, ({ many }) => ({
  scans: many(scans),
}))

export const scansRelations = relations(scans, ({ one, many }) => ({
  user: one(user, {
    fields: [scans.userId],
    references: [user.id],
  }),
// ... scans relations ...
  book: one(books, {
    fields: [scans.bookId],
    references: [books.id],
  }),
  history: many(scansHistory)
}))

export const scansHistoryRelations = relations(scansHistory, ({ one }) => ({
  scan: one(scans, {
    fields: [scansHistory.scanId],
    references: [scans.id],
  }),
}))

// =============================================================================
// TYPE EXPORTS
// =============================================================================

export type User = typeof user.$inferSelect
export type NewUser = typeof user.$inferInsert

export type Session = typeof session.$inferSelect
export type NewSession = typeof session.$inferInsert

export type Account = typeof account.$inferSelect
export type NewAccount = typeof account.$inferInsert

export type Book = typeof books.$inferSelect
export type NewBook = typeof books.$inferInsert

export type Scan = typeof scans.$inferSelect
export type NewScan = typeof scans.$inferInsert

export type ScansHistory = typeof scansHistory.$inferSelect
export type NewScansHistory = typeof scansHistory.$inferInsert

// ============================================================================
// CLASSIFICATION CACHE TABLE (RAG System)
// =============================================================================

/**
 * Classification Cache - RAG system for fast book classification lookups
 * Stores verified classifications to avoid redundant API calls
 */
export const classificationCache = sqliteTable('classification_cache', {
  isbn: text('isbn').primaryKey(),
  title: text('title').notNull(),
  authors: text('authors'),
  ddc: text('ddc'), // Dewey Decimal Classification
  lcc: text('lcc'), // Library of Congress Classification
  callNumber: text('call_number'),
  subjects: text('subjects'), // Semicolon-separated
  source: text('source').notNull(), // 'manual', 'ai', 'openlibrary', 'local_cache'
  verified: integer('verified', { mode: 'boolean' }).default(false).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull()
}, (table) => ({
  ddcIdx: index('idx_classification_ddc').on(table.ddc),
  titleIdx: index('idx_classification_title').on(table.title)
}))

export type ClassificationCache = typeof classificationCache.$inferSelect
export type NewClassificationCache = typeof classificationCache.$inferInsert
