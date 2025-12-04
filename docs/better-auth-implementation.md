# Better Auth Implementation - Rangkai

This document describes the Better Auth implementation for the Rangkai book scanning app.

## ✅ Implementation Status

Better Auth has been successfully implemented with the following features:

- ✅ Email/Password authentication
- ✅ Google OAuth authentication
- ✅ Session management with cookie caching
- ✅ Protected routes (server and client-side)
- ✅ Auto-fetch session on app load
- ✅ Login and registration pages
- ✅ Database schema with Better Auth tables

## 📁 File Structure

```
server/
├── db/
│   ├── schema.ts              ✅ Better Auth + app tables
│   └── migrations/
│       ├── 0001_init.sql      ✅ Initial migration
│       └── 0002_better_auth.sql ✅ Better Auth migration
├── utils/
│   └── auth.ts                ✅ Better Auth configuration
├── api/
│   └── auth/
│       └── [...all].ts        ✅ Catch-all auth handler
└── middleware/
    └── auth.ts                ✅ Server route protection

app/
├── composables/
│   └── useAuth.ts             ✅ Client auth helper
├── plugins/
│   └── auth.client.ts         ✅ Auto-fetch session
├── middleware/
│   └── auth.ts                ✅ Page protection
└── pages/
    ├── login.vue              ✅ Login page (email + OAuth)
    ├── register.vue           ✅ Registration page
    ├── scan/mobile.vue        ✅ Protected (auth middleware)
    └── history.vue            ✅ Protected (auth middleware)
```

## 🔐 Environment Variables

Create a `.env` file based on `.env.example`:

```bash
# Better Auth Secret (required)
NUXT_AUTH_SECRET=your-secret-key-here

# Google OAuth (optional)
NUXT_OAUTH_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
NUXT_OAUTH_GOOGLE_CLIENT_SECRET=your-google-client-secret

# App URL (required for OAuth redirects)
NUXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Generate Auth Secret

```bash
openssl rand -base64 32
```

## 📊 Database Schema

### Better Auth Tables

- **user** - User accounts
- **session** - Active sessions
- **account** - OAuth provider accounts and credentials
- **verification** - Email verification and password reset tokens

### App Tables

- **scans** - Book scan records (linked to user.id)

## 🚀 Getting Started

### 1. Install Dependencies

Already installed:
```bash
pnpm add better-auth
```

### 2. Set Environment Variables

Copy `.env.example` to `.env` and fill in your values:
```bash
cp .env.example .env
```

### 3. Run Database Migration

```bash
# Local development
npx wrangler d1 execute rangkai-db --local --file=./server/db/migrations/0002_better_auth.sql

# Production
npx wrangler d1 execute rangkai-db --remote --file=./server/db/migrations/0002_better_auth.sql
```

### 4. Start Development Server

```bash
pnpm dev
```

## 📝 Usage

### Client-Side Auth

```typescript
// In any Vue component
const { 
  user,
  isAuthenticated,
  isLoading,
  signIn,
  signUp,
  signInWithOAuth,
  signOut
} = useAuth()

// Email/Password Sign In
await signIn('user@example.com', 'password123')

// Email/Password Sign Up
await signUp('user@example.com', 'password123', 'John Doe')

// OAuth Sign In
signInWithOAuth('google')

// Sign Out
await signOut()
```

### Protect Pages

Add to page's `<script setup>`:
```typescript
definePageMeta({
  middleware: 'auth'
})
```

### Server-Side Auth

```typescript
// In API routes
export default defineEventHandler(async (event) => {
  // Get user from session
  const user = await getUserFromEvent(event)
  
  // Require authentication
  const user = await requireAuth(event)
  
  // Get full session
  const session = await getServerSession(event)
})
```

## 🎨 Login/Register Pages

### Login Page (`/login`)

Features:
- Google OAuth button
- Email/Password form
- Link to registration
- Auto-redirect if already authenticated
- Error handling

### Register Page (`/register`)

Features:
- Google OAuth button
- Email/Password form with name field
- Link to login
- Password validation (min 8 characters)
- Auto-redirect if already authenticated
- Success/Error messaging

## 🔒 Security Features

- **Secure cookies** - Enabled in production with HTTPS
- **Cookie prefix** - Custom prefix 'rangkai' to avoid conflicts
- **CSRF protection** - Built into Better Auth
- **Session expiry** - 7 days with 24-hour update age
- **Cookie caching** - 5-minute cache to reduce DB queries
- **Trusted origins** - Validates request origins

## 🛣️ Protected Routes

### Server Routes (API)

Public routes (no auth required):
- `/api/auth/*` - Auth endpoints
- `/api/health` - Health check
- `/api/book/*` - Book metadata lookup

Protected routes (auth required):
- All other `/api/*` routes

### Client Routes (Pages)

Public pages:
- `/` - Landing page
- `/login` - Login page
- `/register` - Registration page

Protected pages:
- `/scan/mobile` - Scanner page
- `/history` - Scan history

## 🐛 Troubleshooting

### 1. 401 Unauthorized on all requests

**Check:**
- `/api/auth` is in `publicRoutes` array in server middleware
- Cookies are being set (browser dev tools → Application → Cookies)
- `credentials: 'include'` is set on `$fetch` calls

**Fix:**
```typescript
// In useAuth composable
await $fetch('/api/auth/get-session', {
  credentials: 'include', // Required!
})
```

### 2. OAuth redirect issues

**Check:**
- `NUXT_PUBLIC_SITE_URL` matches your domain
- Google OAuth redirect URIs include `https://yourdomain.com/api/auth/callback/google`
- `trustedOrigins` in auth config includes your domain

**Fix in Google Console:**
1. Go to Google Cloud Console
2. APIs & Services → Credentials
3. Edit OAuth client
4. Add redirect URI: `https://yourdomain.com/api/auth/callback/google`

### 3. Session not persisting

**Check:**
- `NUXT_AUTH_SECRET` is set and doesn't change between restarts
- Cookies are enabled in browser
- `useSecureCookies` is `false` in development (HTTP) or `true` in production (HTTPS)

**Fix:**
```bash
# Generate and set a permanent secret
openssl rand -base64 32
# Add to .env
NUXT_AUTH_SECRET=<generated-secret>
```

### 4. Database errors

**Check:**
- Migration `0002_better_auth.sql` has been run
- D1 database is accessible via `hubDatabase()`

**Fix:**
```bash
# Run migration
npx wrangler d1 execute rangkai-db --local --file=./server/db/migrations/0002_better_auth.sql
```

## 📚 API Endpoints

Better Auth provides these endpoints automatically:

### Authentication
- `POST /api/auth/sign-up/email` - Email/password signup
- `POST /api/auth/sign-in/email` - Email/password signin
- `GET /api/auth/sign-in/social` - OAuth signin redirect
- `GET /api/auth/callback/google` - OAuth callback
- `POST /api/auth/sign-out` - Sign out

### Session
- `GET /api/auth/get-session` - Get current session

## 🔄 Migration from Old Auth

If you're migrating from the old auth system:

1. **Run migration** - The `0002_better_auth.sql` migration handles schema updates
2. **Data migration** - Existing scan data is preserved
3. **User re-authentication** - Users need to sign in again (sessions are cleared)

## 📖 References

- [Better Auth Documentation](https://www.better-auth.com)
- [Better Auth Nuxt Guide](https://www.better-auth.com/docs/frameworks/nuxt)
- [Drizzle ORM](https://orm.drizzle.team)
- [NuxtHub Database](https://hub.nuxt.com/docs/features/database)

## 🎯 Next Steps

1. ✅ Email verification (verification table ready)
2. ✅ Password reset (verification table ready)
3. ✅ Remember me functionality
4. ✅ Multi-factor authentication
5. ✅ Social providers (GitHub, etc.)

To enable these features, refer to the [Better Auth documentation](https://www.better-auth.com/docs).
