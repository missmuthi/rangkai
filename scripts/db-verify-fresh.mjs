#!/usr/bin/env bun
import assert from 'node:assert/strict'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const persistTo = mkdtempSync(path.join(tmpdir(), 'rangkai-d1-'))
const wranglerHome = mkdtempSync(path.join(tmpdir(), 'rangkai-wrangler-home-'))
const canonicalLedger = [
  '0001_init.sql',
  '0002_better_auth.sql',
  '0003_add_books_table.sql',
  '0004_add_slims_fields.sql',
  '0005_add_history_table.sql',
  '0006_classification_cache.sql',
  '0007_add_exported_at.sql',
  '0008_add_groups_and_scan_origin.sql',
]

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
        result.stdout?.trim(),
        result.stderr?.trim(),
      ]
        .filter(Boolean)
        .join('\n\n'),
    )
  }

  if (!json) return result.stdout

  return parseJsonOutput(result.stdout)
}

function parseJsonOutput(output) {
  const lines = output.trim().split(/\r?\n/)
  const startIndex = lines.findIndex((line) => line.trimStart().startsWith('{') || line.trimStart().startsWith('['))

  if (startIndex === -1) {
    throw new Error(`Expected JSON output, received:\n${output}`)
  }

  return JSON.parse(lines.slice(startIndex).join('\n'))
}

function queryLocal(sql) {
  return runWrangler(
    ['d1', 'execute', 'DB', '--local', '--persist-to', persistTo, '--command', sql, '--json'],
    { json: true },
  )
}

function assertTableColumns(tableName, expectedColumns) {
  const response = queryLocal(`PRAGMA table_info('${tableName}');`)
  const rows = response.at(0)?.results ?? []
  const actual = rows.map((row) => row.name)

  assert.deepEqual(
    [...actual].sort(),
    [...expectedColumns].sort(),
    `Unexpected columns for ${tableName}: ${actual.join(', ')}`,
  )
}

function assertHasIndexes(tableName, expectedIndexes) {
  const response = queryLocal(
    `SELECT name FROM sqlite_master WHERE type = 'index' AND tbl_name = '${tableName}' ORDER BY name;`,
  )
  const rows = response.at(0)?.results ?? []
  const actual = rows.map((row) => row.name)

  for (const indexName of expectedIndexes) {
    assert.ok(actual.includes(indexName), `Missing index ${indexName} on ${tableName}`)
  }
}

function assertForeignKeys(tableName, expectedReferences) {
  const response = queryLocal(`PRAGMA foreign_key_list('${tableName}');`)
  const rows = response.at(0)?.results ?? []
  const actual = rows.map((row) => `${row.from}->${row.table}.${row.to}`)

  for (const reference of expectedReferences) {
    assert.ok(actual.includes(reference), `Missing foreign key ${reference} on ${tableName}`)
  }
}

try {
  runWrangler(['d1', 'migrations', 'apply', 'DB', '--local', '--persist-to', persistTo])
  const tableResponse = queryLocal(`SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name;`)
  const tables = new Set((tableResponse.at(0)?.results ?? []).map((row) => row.name))

  for (const tableName of [
    'account',
    'books',
    'classification_cache',
    'd1_migrations',
    'group_members',
    'groups',
    'scans',
    'scans_history',
    'session',
    'user',
    'verification',
    'activity_logs',
  ]) {
    assert.ok(tables.has(tableName), `Missing table ${tableName}`)
  }

  const ledgerResponse = queryLocal(`SELECT name FROM d1_migrations ORDER BY id;`)
  const ledger = (ledgerResponse.at(0)?.results ?? []).map((row) => row.name)
  assert.deepEqual(ledger, canonicalLedger, 'Unexpected migration ledger contents')

  assertTableColumns('groups', [
    'id',
    'name',
    'description',
    'settings',
    'invite_code',
    'owner_id',
    'created_at',
    'updated_at',
  ])

  assertTableColumns('group_members', [
    'id',
    'group_id',
    'user_id',
    'role',
    'joined_at',
  ])

  assertTableColumns('activity_logs', [
    'id',
    'user_id',
    'group_id',
    'action',
    'entity_type',
    'entity_id',
    'details',
    'created_at',
  ])

  assertTableColumns('scans', [
    'id',
    'user_id',
    'group_id',
    'book_id',
    'isbn',
    'title',
    'authors',
    'publisher',
    'description',
    'status',
    'notes',
    'exportedAt',
    'created_at',
    'updated_at',
    'ddc',
    'lcc',
    'call_number',
    'subjects',
    'series',
    'edition',
    'collation',
    'gmd',
    'publish_place',
    'classification_trust',
    'is_ai_enhanced',
    'enhanced_at',
    'ai_log',
    'json_data',
    'exported_at',
    'source',
  ])

  assertHasIndexes('groups', ['groups_invite_code_unique'])
  assertHasIndexes('group_members', ['idx_group_members_group', 'idx_group_members_unique', 'idx_group_members_user'])
  assertHasIndexes('activity_logs', ['idx_activity_created', 'idx_activity_group', 'idx_activity_user'])
  assertHasIndexes('scans', [
    'idx_scans_bookId',
    'idx_scans_createdAt',
    'idx_scans_ddc',
    'idx_scans_groupId',
    'idx_scans_isbn',
    'idx_scans_lcc',
    'idx_scans_status',
    'idx_scans_userId',
  ])

  assertHasIndexes('books', ['idx_books_isbn', 'idx_books_lcc', 'idx_books_title'])
  assertHasIndexes('classification_cache', ['idx_classification_ddc', 'idx_classification_title'])

  assertForeignKeys('group_members', ['group_id->groups.id', 'user_id->user.id'])
  assertForeignKeys('activity_logs', ['user_id->user.id', 'group_id->groups.id'])
  assertForeignKeys('groups', ['owner_id->user.id'])
  assertForeignKeys('scans', ['user_id->user.id', 'book_id->books.id', 'group_id->groups.id'])

  console.log(`Fresh database verification passed using ${persistTo}`)
} finally {
  rmSync(persistTo, { recursive: true, force: true })
}
