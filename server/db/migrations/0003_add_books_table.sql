-- Migration: Add books table for deduplication
-- Created: 2025-12-07
-- 
-- This migration adds a `books` table to store unique book metadata,
-- preventing duplication when multiple users scan the same ISBN.

-- =============================================================================
-- BOOKS TABLE (Master book metadata)
-- =============================================================================

CREATE TABLE IF NOT EXISTS books (
  id TEXT PRIMARY KEY NOT NULL,
  isbn TEXT NOT NULL UNIQUE,
  isbn10 TEXT,
  isbn13 TEXT,
  title TEXT NOT NULL,
  authors TEXT,
  publisher TEXT,
  publishedDate TEXT,
  description TEXT,
  pageCount INTEGER,
  categories TEXT,
  thumbnail TEXT,
  language TEXT,
  previewLink TEXT,
  infoLink TEXT,
  source TEXT DEFAULT 'google_books',
  rawMetadata TEXT,
  createdAt INTEGER NOT NULL,
  updatedAt INTEGER NOT NULL
);

-- =============================================================================
-- UPDATE SCANS TABLE (Add bookId foreign key)
-- =============================================================================

-- Create new scans table with bookId
CREATE TABLE IF NOT EXISTS scans_v2 (
  id TEXT PRIMARY KEY NOT NULL,
  user_id TEXT NOT NULL,
  book_id TEXT,
  isbn TEXT NOT NULL,
  title TEXT,
  authors TEXT,
  publisher TEXT,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  notes TEXT,
  exportedAt INTEGER,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE,
  FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE SET NULL
);

-- Copy existing data
INSERT INTO scans_v2 (id, user_id, isbn, title, authors, publisher, description, status, created_at, updated_at)
SELECT id, user_id, isbn, title, authors, publisher, description, status, created_at, updated_at
FROM scans;

-- Drop old table and rename
DROP TABLE IF EXISTS scans;
ALTER TABLE scans_v2 RENAME TO scans;

-- =============================================================================
-- INDEXES
-- =============================================================================

-- Books indexes
CREATE UNIQUE INDEX IF NOT EXISTS idx_books_isbn ON books(isbn);
CREATE INDEX IF NOT EXISTS idx_books_title ON books(title);

-- Scans indexes
CREATE INDEX IF NOT EXISTS idx_scans_userId ON scans(user_id);
CREATE INDEX IF NOT EXISTS idx_scans_bookId ON scans(book_id);
CREATE INDEX IF NOT EXISTS idx_scans_isbn ON scans(isbn);
CREATE INDEX IF NOT EXISTS idx_scans_status ON scans(status);
CREATE INDEX IF NOT EXISTS idx_scans_createdAt ON scans(created_at);

-- Verification index (if missing)
CREATE INDEX IF NOT EXISTS idx_verification_identifier ON verification(identifier);
