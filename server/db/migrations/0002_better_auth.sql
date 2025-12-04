-- Better Auth migration
-- Adds account and verification tables, updates existing tables to match Better Auth schema
-- Created: 2024-12-04

-- Drop old tables if they exist (for clean migration)
DROP TABLE IF EXISTS sessions;
DROP TABLE IF EXISTS users;

-- Better Auth user table
CREATE TABLE IF NOT EXISTS user (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  emailVerified INTEGER NOT NULL DEFAULT 0,
  image TEXT,
  createdAt INTEGER NOT NULL,
  updatedAt INTEGER NOT NULL
);

-- Better Auth session table
CREATE TABLE IF NOT EXISTS session (
  id TEXT PRIMARY KEY NOT NULL,
  expiresAt INTEGER NOT NULL,
  token TEXT NOT NULL UNIQUE,
  createdAt INTEGER NOT NULL,
  updatedAt INTEGER NOT NULL,
  ipAddress TEXT,
  userAgent TEXT,
  userId TEXT NOT NULL,
  FOREIGN KEY (userId) REFERENCES user(id) ON DELETE CASCADE
);

-- Better Auth account table (for OAuth and credentials)
CREATE TABLE IF NOT EXISTS account (
  id TEXT PRIMARY KEY NOT NULL,
  accountId TEXT NOT NULL,
  providerId TEXT NOT NULL,
  userId TEXT NOT NULL,
  accessToken TEXT,
  refreshToken TEXT,
  idToken TEXT,
  accessTokenExpiresAt INTEGER,
  refreshTokenExpiresAt INTEGER,
  scope TEXT,
  password TEXT,
  createdAt INTEGER NOT NULL,
  updatedAt INTEGER NOT NULL,
  FOREIGN KEY (userId) REFERENCES user(id) ON DELETE CASCADE
);

-- Better Auth verification table (for email verification, password reset)
CREATE TABLE IF NOT EXISTS verification (
  id TEXT PRIMARY KEY NOT NULL,
  identifier TEXT NOT NULL,
  value TEXT NOT NULL,
  expiresAt INTEGER NOT NULL,
  createdAt INTEGER,
  updatedAt INTEGER
);

-- Update scans table to reference new user table and change id to text
CREATE TABLE IF NOT EXISTS scans_new (
  id TEXT PRIMARY KEY NOT NULL,
  user_id TEXT NOT NULL,
  isbn TEXT NOT NULL,
  title TEXT,
  authors TEXT,
  publisher TEXT,
  description TEXT,
  status TEXT DEFAULT 'pending',
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
);

-- Copy data from old scans table if it exists
INSERT OR IGNORE INTO scans_new (id, user_id, isbn, title, authors, description, created_at, updated_at)
SELECT
  CAST(id AS TEXT) as id,
  user_id,
  COALESCE(isbn, '') as isbn,
  title,
  authors,
  description,
  created_at,
  updated_at
FROM scans;

-- Drop old scans table and rename new one
DROP TABLE IF EXISTS scans;
ALTER TABLE scans_new RENAME TO scans;

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_session_userId ON session(userId);
CREATE INDEX IF NOT EXISTS idx_session_token ON session(token);
CREATE INDEX IF NOT EXISTS idx_account_userId ON account(userId);
CREATE INDEX IF NOT EXISTS idx_scans_user_id ON scans(user_id);
CREATE INDEX IF NOT EXISTS idx_scans_isbn ON scans(isbn);
