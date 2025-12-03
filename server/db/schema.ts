import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core'
import { sql } from 'drizzle-orm'

export const scans = sqliteTable('scans', {
  id: integer('id').primaryKey({ autoIncrement: true }).notNull(),
  user_id: text('user_id').notNull(),
  isbn: text('isbn'),
  title: text('title'),
  authors: text('authors'),
  description: text('description'),
  created_at: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  updated_at: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`)
})

export const users = sqliteTable('users', {
  id: text('id').primaryKey().notNull(),
  email: text('email').notNull().unique(),
  name: text('name'),
  created_at: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  updated_at: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`)
})

export const sessions = sqliteTable('sessions', {
  id: text('id').primaryKey().notNull(),
  user_id: text('user_id').notNull(),
  expires_at: integer('expires_at', { mode: 'timestamp' }).notNull(),
  created_at: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`)
})
