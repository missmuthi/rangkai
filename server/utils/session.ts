import { eq, and, gt } from 'drizzle-orm'
import { v4 as uuidv4 } from 'uuid'
import { randomBytes, createHash } from 'node:crypto'
import type { drizzle } from 'drizzle-orm/d1'
import * as schema from '../db/schema'

// --- PKCE & State Utils ---

export function generateState(): string {
    return uuidv4()
}

export function generateCodeVerifier(): string {
    // Generate random 64 bytes, base64url encoded
    return randomBytes(64).toString('base64url')
}

export function generateCodeChallenge(verifier: string): string {
    return createHash('sha256')
        .update(verifier)
        .digest('base64url')
}

// --- Session DB Utils ---

export async function createSession(db: ReturnType<typeof drizzle>, userId: string, userAgent?: string | null, ipAddress?: string | null) {
    const token = randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7) // 7 days

    const newSession = {
        id: uuidv4(),
        token,
        userId,
        expiresAt,
        createdAt: new Date(),
        updatedAt: new Date(),
        userAgent: userAgent || null,
        ipAddress: ipAddress || null
    }

    await db.insert(schema.session).values(newSession)

    return newSession
}

export async function getSession(db: ReturnType<typeof drizzle>, token: string) {
    const session = await db
        .select()
        .from(schema.session)
        .where(
            and(
                eq(schema.session.token, token),
                gt(schema.session.expiresAt, new Date())
            )
        )
        .get()
    // .get() for D1/SQLite specific single result, or .limit(1)[0] if generic driver

    if (!session) return null

    // Optional: Fetch user details if needed here, or do a join
    const user = await db
        .select()
        .from(schema.user)
        .where(eq(schema.user.id, session.userId))
        .get()

    if (!user) return null

    return { session, user }
}

export async function deleteSession(db: ReturnType<typeof drizzle>, token: string) {
    await db.delete(schema.session).where(eq(schema.session.token, token))
}

export async function invalidateUserSessions(db: ReturnType<typeof drizzle>, userId: string) {
    await db.delete(schema.session).where(eq(schema.session.userId, userId))
}
