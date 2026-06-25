#!/usr/bin/env bun
import assert from 'node:assert/strict'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const persistTo = mkdtempSync(path.join(tmpdir(), 'rangkai-d1-upgrade-'))
const wranglerHome = mkdtempSync(path.join(tmpdir(), 'rangkai-wrangler-home-'))
const migrationsDir = path.join(repoRoot, 'server/db/migrations')

function runWrangler(args, { json = false } = {}) {
  const result = spawnSync('bunx', ['wrangler', ...args], {
    cwd: repoRoot,
    encoding: 'utf8',
    env: {
      ...process.env,
      CI: '1',
      HOME: wranglerHome,
      XDG_CONFIG_HOME: wranglerHome,
    },
    maxBuffer: 20 * 1024 * 1024,
  })

  if (result.status !== 0) {
    throw new Error(
      [
        `Wrangler command failed: bunx wrangler ${args.join(' ')}`,
        result.error?.message,
        result.stdout?.trim(),
        result.stderr?.trim(),
      ].filter(Boolean).join('\n\n'),
    )
  }

  if (!json) return result.stdout

  const lines = result.stdout.trim().split(/\r?\n/)
  const startIndex = lines.findIndex(line => line.trimStart().startsWith('{') || line.trimStart().startsWith('['))
  assert.notEqual(startIndex, -1, `Expected JSON output:\n${result.stdout}`)
  return JSON.parse(lines.slice(startIndex).join('\n'))
}

function executeFile(filename) {
  return runWrangler([
    'd1',
    'execute',
    'DB',
    '--local',
    '--persist-to',
    persistTo,
    '--file',
    path.join(migrationsDir, filename),
    '--json',
  ], { json: true })
}

function query(sql) {
  const response = runWrangler([
    'd1',
    'execute',
    'DB',
    '--local',
    '--persist-to',
    persistTo,
    '--command',
    sql,
    '--json',
  ], { json: true })

  return response.at(0)?.results ?? []
}

try {
  for (const filename of [
    '0001_init.sql',
    '0002_better_auth.sql',
    '0003_add_books_table.sql',
    '0004_add_slims_fields.sql',
    '0005_add_history_table.sql',
    '0006_classification_cache.sql',
    '0007_add_exported_at.sql',
  ]) {
    executeFile(filename)
  }

  query(`
    INSERT INTO user (id, name, email, emailVerified, createdAt, updatedAt)
    VALUES ('upgrade-user', 'Upgrade User', 'upgrade@example.com', 1, 1700000000, 1700000000);
    INSERT INTO books (id, isbn, title, authors, createdAt, updatedAt)
    VALUES ('upgrade-book', '9780684835396', 'Upgrade Fixture', '["Test Author"]', 1700000000, 1700000000);
    INSERT INTO scans (
      id, user_id, book_id, isbn, title, authors, status, created_at, updated_at
    ) VALUES (
      'upgrade-scan', 'upgrade-user', 'upgrade-book', '9780684835396',
      'Upgrade Fixture', '["Test Author"]', 'complete', 1700000000, 1700000000
    );
  `)

  executeFile('0008_add_groups_and_scan_origin.sql')

  query(`
    INSERT INTO groups (
      id, name, description, settings, invite_code, owner_id, created_at, updated_at
    ) VALUES (
      'upgrade-group', 'Upgrade Group', NULL, '{"showLeaderboard":true}',
      'UPGRADE', 'upgrade-user', 1700000000, 1700000000
    );
    UPDATE scans SET group_id = 'upgrade-group', source = 'manual' WHERE id = 'upgrade-scan';
  `)

  const scan = query(`
    SELECT id, user_id, book_id, isbn, title, group_id, source
    FROM scans
    WHERE id = 'upgrade-scan';
  `).at(0)

  assert.deepEqual(scan, {
    id: 'upgrade-scan',
    user_id: 'upgrade-user',
    book_id: 'upgrade-book',
    isbn: '9780684835396',
    title: 'Upgrade Fixture',
    group_id: 'upgrade-group',
    source: 'manual',
  })

  const foreignKeys = query(`PRAGMA foreign_key_list('scans');`)
    .map(row => `${row.from}->${row.table}.${row.to}:${row.on_delete}`)
  assert.ok(foreignKeys.includes('group_id->groups.id:CASCADE'))

  const indexes = query(`PRAGMA index_list('scans');`).map(row => row.name)
  assert.ok(indexes.includes('idx_scans_groupId'))

  console.log(`Upgrade database verification passed using ${persistTo}`)
} finally {
  rmSync(persistTo, { recursive: true, force: true })
  rmSync(wranglerHome, { recursive: true, force: true })
}
