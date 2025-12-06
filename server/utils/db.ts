import { drizzle } from 'drizzle-orm/d1'
import { hubDatabase } from '#imports'
import * as schema from '../db/schema'

export function useDb() {
  // hubDatabase() is provided by NuxtHub runtime
  const db = hubDatabase()
  // return a drizzle instance bound to the D1 database
  return drizzle(db, { schema })
}
