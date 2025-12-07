-- Migration: Add scans_history table for version control
-- Tracks full history of changes to scan metadata

CREATE TABLE scans_history (
  history_id INTEGER PRIMARY KEY AUTOINCREMENT,
  scan_id TEXT NOT NULL REFERENCES scans(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  snapshot_at INTEGER NOT NULL, -- Unix timestamp
  
  -- Snapshot of specific scan state
  user_id TEXT NOT NULL,
  isbn TEXT NOT NULL,
  title TEXT,
  
  -- SLiMS & Metadata fields (snapshot)
  authors TEXT,
  publisher TEXT,
  description TEXT, 
  page_count INTEGER,
  categories TEXT,
  language TEXT,
  thumbnail TEXT,
  preview_link TEXT,
  info_link TEXT,
  
  -- Bibliographic fields
  ddc TEXT,
  lcc TEXT,
  call_number TEXT,
  subjects TEXT,
  series TEXT,
  edition TEXT,
  collation TEXT,
  gmd TEXT,
  publish_place TEXT,
  classification_trust TEXT,
  
  -- AI Meta
  is_ai_enhanced INTEGER,
  enhanced_at INTEGER,
  ai_log TEXT,
  json_data TEXT, -- Full snapshot as JSON
  
  status TEXT,
  notes TEXT,
  created_at INTEGER,
  updated_at INTEGER
);

CREATE INDEX idx_scans_history_scan_id ON scans_history(scan_id);
CREATE INDEX idx_scans_history_version ON scans_history(scan_id, version);
