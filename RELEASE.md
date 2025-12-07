# Release v0.0.5 - "The Persistence Update"

**Date:** 2025-12-08
**Tag:** `v0.0.5`

## 🚨 Critical Fixes

### 1. persistence of AI-Cleaned Data

- **Issue:** AI-cleaned fields (DDC, LCC, Source) vanished after refreshing due to not merging `scans` table data with cached `books` table data.
- **Fix:** Implemented a **Waterfall Merge Strategy** in `server/api/book/[isbn].get.ts`. The API now effectively says: _"If the user has a personal scan with overrides, use THAT instead of the generic cache."_

### 2. Legacy Data Normalization (Crash Fix)

- **Issue:** Frontend crashed ("white screen") for books scanned before v0.0.3 because `aiLog` was saved as an array of strings, but the UI expected an array of objects.
- **Fix:** Added a **Normalization Layer** in the API. It detects legacy formats on-the-fly and converts them to the new schema transparently. No database migration required.

### 3. Double-Encoded JSON Fix

- **Issue:** `authors` and `categories` were sometimes stored as stringified strings (e.g., `'["Author"]'`) in the DB.
- **Fix:** Added safe parsing logic to handle both Arrays and JSON-Strings, making the app robust against bad data ingestion history.

## 🛠️ Changes

- **Schema:** Added `source` column to `scans` table (Migration `0008`).
- **Types:** Updated `BookMetadata` to include `local_cache` and `ai` as valid sources.
- **Docs:** Updated `GEMINI.md`, `ARCHITECTURE.md`, and `E2E_TESTING_GUIDE.md` to reflect these data flow rules.

## 📦 Database & Migration

This release requires migration `0008_add_source_to_scans.sql`.

```bash
npx wrangler d1 execute rangkai-db --remote --file=server/db/migrations/0008_add_source_to_scans.sql
```

_(Note: This migration has already been applied to production.)_
