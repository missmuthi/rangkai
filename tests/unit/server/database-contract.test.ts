import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { getTableConfig } from 'drizzle-orm/sqlite-core'

import { scans } from '../../../server/db/schema'

describe('database contract', () => {
  it('defines the intended scan group and source fields', () => {
    const config = getTableConfig(scans)
    const columns = new Map(config.columns.map(column => [column.name, column]))
    const indexNames = config.indexes.map(index => index.config.name)
    const groupForeignKey = config.foreignKeys.find(foreignKey =>
      foreignKey.reference().columns.some(column => column.name === 'group_id')
    )

    expect(columns.get('group_id')).toMatchObject({
      notNull: false,
    })
    expect(columns.get('source')).toMatchObject({
      notNull: false,
      default: 'manual',
    })
    expect(indexNames).toContain('idx_scans_groupId')
    expect(groupForeignKey?.onDelete).toBe('cascade')
  })

  it('keeps preview and production D1 IDs separate', () => {
    const wrangler = readFileSync('wrangler.toml', 'utf8')
    const productionId = wrangler.match(/database_id = "([^"]+)"/)?.[1]
    const previewId = wrangler.match(/preview_database_id = "([^"]+)"/)?.[1]

    expect(productionId).toBe('ff59aaac-cf7a-44f2-8f94-1d71482389c9')
    expect(previewId).toBe('6ca0ee68-8492-4106-b684-546979875b14')
    expect(previewId).not.toBe(productionId)
  })

  it('has a forward migration for group and source parity', () => {
    const migration = readFileSync(
      'server/db/migrations/0008_add_groups_and_scan_origin.sql',
      'utf8',
    )

    expect(migration).toContain('ALTER TABLE scans ADD COLUMN group_id')
    expect(migration).toContain("ALTER TABLE scans ADD COLUMN source TEXT DEFAULT 'manual'")
    expect(migration).toContain('CREATE INDEX IF NOT EXISTS idx_scans_groupId')
  })
})
