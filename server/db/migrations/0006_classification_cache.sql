-- Migration: Add classification_cache table for RAG system
-- This table stores verified book classifications for instant lookups
-- and provides context examples for AI classification

CREATE TABLE IF NOT EXISTS classification_cache (
  isbn TEXT PRIMARY KEY NOT NULL,
  title TEXT NOT NULL,
  authors TEXT,
  ddc TEXT, -- Dewey Decimal Classification (e.g., "650.1")
  lcc TEXT, -- Library of Congress Classification (e.g., "HF5386")
  call_number TEXT, -- Formatted call number (e.g., "650.1 NEW")
  subjects TEXT, -- Semicolon-separated subject headings
  source TEXT NOT NULL, -- 'manual', 'ai', 'openlibrary', 'local_cache'
  verified INTEGER DEFAULT 0 NOT NULL, -- 1 if human-verified, 0 if automated
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

-- Index for fast DDC-based RAG lookups (finding similar books)
CREATE INDEX IF NOT EXISTS idx_classification_ddc ON classification_cache(ddc);

-- Index for full-text search on titles
CREATE INDEX IF NOT EXISTS idx_classification_title ON classification_cache(title);
