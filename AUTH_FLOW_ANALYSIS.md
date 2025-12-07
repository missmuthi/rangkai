# Authentication Flow Analysis - Rangkai

## Executive Summary

Your project now operates on a **Hybrid Authentication System**.

- **Email/Password**: Managed by **Better Auth**.
- **Google OAuth**: Managed by **Manual Server Routes** (for granular control & security).
- **Session Management**: Unified via **Drizzle ORM** (Both systems write to the same `session` table).
- **Core Infrastructure**: **Cloudflare D1 database** + **Nuxt Server Routes**.

All components are integrated and share the same database schema. ✅

---

## 1. LOGIN FLOW ANALYSIS

### 1.1 Frontend Login Page (`app/pages/login.vue`)

**Status: ✅ WORKING**

**Supported Login Methods:**

- **Email/Password** - Traditional form (Better Auth)
- **Google OAuth** - Manual Secure Flow (Custom Routes)

**Key Components:**

```
LoginPage
├── Email/Password Form
│   ├── Submit -> useAuth().signIn()
│   └── Better Auth Endpoint (/api/auth/sign-in/email)
└── Google OAuth Button
    └── Redirects to `/api/auth/google` (Manual Endpoint)

Error Handling:
- URL Query Params (e.g., `?error=oauth_state_mismatch`)
- Mapped to user-friendly messages
```

**Authentication Flow (Google):**

```
User Click -> /api/auth/google
    ↓
Server generates PKCE/State -> Sets HttpOnly Cookies
    ↓
Redirect to Google
    ↓
Google redirects to /api/auth/callback/google
    ↓
Server validates State/PKCE -> Exchanges Token
    ↓
Server upserts User -> Creates DB Session
    ↓
Server sets 'session' Cookie -> Redirects to Home
```

**Composable Used: `useAuth()`**

- `signIn(email, password)` - Better Auth wrapper
- `signOut()` - Calls `/api/auth/sign-out`

---

## 2. PROFILE MANAGEMENT ANALYSIS

### 2.2 Profile Page (`app/pages/profile.vue`)

**Status: ✅ WORKING**

**Features:**

- Protected by `auth` middleware
- Fetches profile via `GET /api/profile`

### 2.3 Profile API Endpoints

#### GET `/api/profile` ✅

**File:** `server/api/profile.get.ts`

- **Auth:** Uses `requireAuth` (validates `event.context.session` injected by global middleware)

#### PATCH `/api/profile` ✅

**File:** `server/api/profile.patch.ts`

- **Auth:** Uses `requireAuth`
- **Function:** Updates user profile in DB

---

## 3. DATABASE ANALYSIS (Unchanged)

### 3.1 Database Configuration

- **Binding:** `DB` (D1)
- **Schema:** Shared schema for Better Auth and Manual Flow.

### 3.2 Database Schema (`server/db/schema.ts`)

**1. `user` Table**: Stores all users (email + manual OAuth).
**2. `session` Table**: Unified session store.
**3. `account` Table**: Used by Better Auth (Email/Pass).
**4. `scans` Table**: App data.

---

## 4. AUTHENTICATION BACKEND ANALYSIS

### 4.1 Hybrid Architecture

#### A. Better Auth (Legacy/Email)

**File:** `server/utils/auth.ts`

- Handles Email/Password login.
- Has Google provider configured but **bypassed** by manual routes.

#### B. Manual Google OAuth (New)

**Files:**

- `server/api/auth/google.get.ts`: Initiation.
- `server/api/auth/callback/google.get.ts`: Callback & Session Creation.
- `server/utils/session.ts`: DB Helpers (`createSession`, `getSession`) & PKCE crypto.

### 4.2 Global Middleware

**File:** `server/middleware/auth.ts`
**Role:** Central Auth Gatekeeper

1. **Asset Bypass**: Skips auth for `/_nuxt/`, `/public/`, etc.
2. **Session Hydration**: Reads `session` cookie -> Validates against DB -> Injects `event.context.user`.
3. **Rate Limiting**: Protects auth endpoints (In-Memory).

---

## 5. AUTH API ENDPOINTS ANALYSIS

### 5.1 Manual Routes (Primary)

- `GET /api/auth/google`: Start OAuth flow.
- `GET /api/auth/callback/google`: Handle OAuth return.
- `POST /api/auth/sign-out`: Clear session (Origin-checked).

### 5.2 Better Auth Routes (Secondary)

- `POST /api/auth/sign-in/email`: Handled by `[...all].ts`.
- `POST /api/auth/sign-up/email`: Handled by `[...all].ts`.

---

## 6. COMPOSABLE ANALYSIS (Unchanged)

`useAuth()` remains the frontend interface, abstracting the difference between flows where possible.

---

## 7. MIDDLEWARE ANALYSIS

**File:** `server/middleware/auth.ts` replaces reliance on Better Auth hooks for session injection. It runs on **every request** to populate context.

---

## 10. CONFIGURATION CHECKLIST

### Required Environment Variables:

```env
# Auth
AUTH_SECRET=...
OAUTH_GOOGLE_CLIENT_ID=...
OAUTH_GOOGLE_CLIENT_SECRET=...

# Site
NUXT_PUBLIC_SITE_URL=...

# Environment (New)
ENVIRONMENT="production" # For secure cookie detection
```

---

## 11. ISSUES & RECOMMENDATIONS

### Current Status: ✅ HYBRID SYSTEM OPERATIONAL

### Implemented Improvements:

1. **Secure Google Flow**: PKCE, State validation, and strict cookie policies implemented manually.
2. **Global Middleware**: Asset blocking issue resolved via strict whitelist.
3. **Rate Limiting**: Basic in-memory limiting added to auth routes.

### Future Recommendations:

1. **Consolidate**: Eventually migrate Email/Password to manual routes or fully embrace Better Auth if its customization improves.
2. **Persistent Rate Limiting**: Move rate limit storage to Cloudflare KV (currently in-memory, resets on deploy).
3. **Account Linking**: Current logic creates new user if email matches. Ensure security if linking accounts (e.g. verifying email first).

---

## 12. QUICK HEALTH CHECK

```bash
# Verify Google Config
echo $OAUTH_GOOGLE_CLIENT_ID

# Verify DB Sessions (Manual & BetterAuth share this)
wrangler d1 execute rangkai-db --remote --command "SELECT * FROM session LIMIT 5"

# Test Endpoint
curl -I http://localhost:3000/api/auth/google
```

## Summary

The system successfully bridges **Better Auth** (for low-code email auth) with a **Custom Secure Flow** (for Google OAuth), sharing a single database backbone.
