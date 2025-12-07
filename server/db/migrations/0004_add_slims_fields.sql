-- Migration: Add SLiMS bibliographic fields to books and scans tables
-- This adds library-standard fields required for SLiMS export compatibility

-- ============================================================================
-- BOOKS TABLE ADDITIONS (Master book metadata)
-- ============================================================================

ALTER TABLE books ADD COLUMN ddc TEXT;                    -- Dewey Decimal Classification
ALTER TABLE books ADD COLUMN lcc TEXT;                    -- Library of Congress Classification
ALTER TABLE books ADD COLUMN call_number TEXT;            -- Full shelf filing code
ALTER TABLE books ADD COLUMN subjects TEXT;               -- Semicolon-separated subject headings
ALTER TABLE books ADD COLUMN series TEXT;                 -- Series title if applicable
ALTER TABLE books ADD COLUMN edition TEXT;                -- Edition info (e.g., "3rd Edition")
ALTER TABLE books ADD COLUMN collation TEXT;              -- Physical description (e.g., "416 p.")
ALTER TABLE books ADD COLUMN gmd TEXT DEFAULT 'text';     -- General Material Designation
ALTER TABLE books ADD COLUMN publish_place TEXT;          -- Place of publication
ALTER TABLE books ADD COLUMN classification_trust TEXT;   -- "high" | "medium" | "low"
ALTER TABLE books ADD COLUMN is_ai_enhanced INTEGER DEFAULT 0;  -- Boolean flag
ALTER TABLE books ADD COLUMN enhanced_at INTEGER;         -- Unix timestamp
ALTER TABLE books ADD COLUMN ai_log TEXT;                 -- JSON array of AI changes

-- ============================================================================
-- SCANS TABLE ADDITIONS (User-scoped scan data)
-- ============================================================================

ALTER TABLE scans ADD COLUMN ddc TEXT;
ALTER TABLE scans ADD COLUMN lcc TEXT;
ALTER TABLE scans ADD COLUMN call_number TEXT;
ALTER TABLE scans ADD COLUMN subjects TEXT;
ALTER TABLE scans ADD COLUMN series TEXT;
ALTER TABLE scans ADD COLUMN edition TEXT;
ALTER TABLE scans ADD COLUMN collation TEXT;
ALTER TABLE scans ADD COLUMN gmd TEXT DEFAULT 'text';
ALTER TABLE scans ADD COLUMN publish_place TEXT;
ALTER TABLE scans ADD COLUMN classification_trust TEXT;
ALTER TABLE scans ADD COLUMN is_ai_enhanced INTEGER DEFAULT 0;
ALTER TABLE scans ADD COLUMN enhanced_at INTEGER;
ALTER TABLE scans ADD COLUMN ai_log TEXT;
ALTER TABLE scans ADD COLUMN json_data TEXT;              -- Full MergedBookData as JSON (for flexibility)

-- ============================================================================
-- INDEXES FOR CLASSIFICATION QUERIES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_books_ddc ON books(ddc);
CREATE INDEX IF NOT EXISTS idx_books_lcc ON books(lcc);
CREATE INDEX IF NOT EXISTS idx_scans_ddc ON scans(ddc);
CREATE INDEX IF NOT EXISTS idx_scans_lcc ON scans(lcc);
