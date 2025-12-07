-- Migration: Add exported_at column to scans table
-- Fixes "Failed query" error due to missing column in production DB

ALTER TABLE scans ADD COLUMN exported_at INTEGER;
