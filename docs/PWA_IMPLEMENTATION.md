# PWA Implementation Guide - Rangkai

This document describes the PWA (Progressive Web App) setup for Rangkai.

## 📱 Features

- **Standalone Mode**: Runs fullscreen without browser UI (critical for camera scanner)
- **Install Prompt**: Custom install button in settings/sidebar
- **Offline Shell**: App loads instantly even on slow/offline connections
- **Update Notifications**: Non-intrusive notifications when new versions are available
- **Portrait Lock**: Keeps orientation stable during scanning

---

## 🖼️ Required Icon Assets

Place these icons in the `public/` directory:

### Standard Icons (Required)

| Filename          | Size      | Purpose         | Notes             |
| ----------------- | --------- | --------------- | ----------------- |
| `pwa-192x192.png` | 192×192px | Android, Chrome | Standard app icon |
| `pwa-512x512.png` | 512×512px | Android, Chrome | High-res app icon |

### Maskable Icons (Recommended for Android)

| Filename                   | Size      | Purpose               | Notes                         |
| -------------------------- | --------- | --------------------- | ----------------------------- |
| `pwa-maskable-192x192.png` | 192×192px | Android Adaptive Icon | Safe zone: 160×160px centered |
| `pwa-maskable-512x512.png` | 512×512px | Android Adaptive Icon | Safe zone: 427×427px centered |

### Maskable Icon Guidelines

Maskable icons are used by Android for adaptive icons (circular, squircle, rounded square, etc.).

**Design Requirements:**

- Image canvas: 192×192px or 512×512px
- Safe zone (important content): 160×160px centered (for 192px) or 427×427px centered (for 512px)
- Background: Should extend to full canvas (will be visible in some shapes)
- Foreground: Keep important elements (logo, text) within safe zone

**Tools:**

- [Maskable.app](https://maskable.app/editor) - Preview and test your icons
- Figma/Photoshop: Use guides for safe zone

---

## 🚀 Implementation

### 1. Configuration

The PWA is configured in `nuxt.config.ts`:

```typescript
pwa: {
  registerType: 'prompt', // Manual updates (better for scanner UX)
  manifest: {
    name: 'Rangkai',
    theme_color: '#0f172a', // Dark mode
    display: 'standalone', // Fullscreen
    orientation: 'portrait' // Locked orientation
  },
  workbox: {
    runtimeCaching: [
      {
        // CRITICAL: API routes always fetch fresh data
        urlPattern: /^https?:\/\/.*\/api\/.*/i,
        handler: 'NetworkOnly'
      }
    ]
  }
}
```

### 2. Install Button

Use the `usePwaInstall` composable in any component:

```vue
<script setup lang="ts">
const { canInstall, isInstalled, install } = usePwaInstall();
</script>

<template>
  <div v-if="canInstall && !isInstalled">
    <button @click="install" class="btn">📱 Install App</button>
  </div>
  <div v-else-if="isInstalled">
    <p>✅ App Installed</p>
  </div>
</template>
```

### 3. Update Notifications

Add `<ReloadPrompt />` to your root layout:

```vue
<!-- app/layouts/default.vue -->
<template>
  <div>
    <!-- Your layout content -->
    <slot />

    <!-- PWA update notification -->
    <ReloadPrompt />
  </div>
</template>
```

---

## 🧪 Testing

### Local Development

PWA features are enabled in dev mode:

```bash
pnpm dev
```

Visit `http://localhost:3000` and:

1. Open DevTools → Application → Manifest
2. Verify manifest values
3. Check Service Worker status

### Production Testing

```bash
pnpm build
pnpm preview
```

Then:

1. Open in Chrome/Edge
2. Look for install icon in address bar
3. Install app
4. Verify standalone mode works

### Mobile Testing

Deploy to staging and test on real devices:

**Android (Chrome):**

- Install prompt appears automatically or via custom button
- Check "Add to Home Screen"
- Verify fullscreen mode after install

**iOS (Safari):**

- Tap Share button → "Add to Home Screen"
- Note: iOS doesn't support `beforeinstallprompt`, manual only
- Verify standalone mode and portrait lock

---

## 🛠️ Troubleshooting

### Install prompt not appearing

**Causes:**

1. App already installed
2. Not served over HTTPS (required in production)
3. Service worker not registered
4. Missing required manifest fields

**Solutions:**

- Check DevTools → Application → Manifest for errors
- Verify `https://` URL in production
- Check Console for SW registration errors

### Icons not displaying

**Check:**

1. Files exist in `public/` folder
2. Filenames match exactly (case-sensitive)
3. PNG format (not JPEG or WebP)
4. No console errors for 404s

### Service worker caching API calls

**Issue:** `/api/*` routes are being cached when they shouldn't be.

**Fix:** Verify `runtimeCaching` in `nuxt.config.ts`:

```typescript
{
  urlPattern: /^https?:\/\/.*\/api\/.*/i,
  handler: 'NetworkOnly' // ← Must be NetworkOnly
}
```

### Update not showing

**Check:**

1. New deployment actually changed files
2. Service worker cache was cleared (`cleanupOutdatedCaches: true`)
3. Browser isn't aggressively caching the SW itself
4. Try hard refresh (Ctrl+Shift+R)

---

## 📊 Cache Strategy

| Resource Type | Strategy            | Reason                    |
| ------------- | ------------------- | ------------------------- |
| **JS/CSS**    | Precached           | App shell loads instantly |
| **Fonts**     | CacheFirst (1 year) | Google Fonts static       |
| **API Calls** | NetworkOnly         | Always fresh data         |
| **Images**    | Default (Network)   | Not critical path         |

---

## 🔒 Security Notes

- Service workers require HTTPS in production
- `scope: '/'` means SW controls entire domain
- Be careful with cache strategies (stale data = bad UX)
- Always exclude sensitive endpoints from cache

---

## 📚 References

- [@vite-pwa/nuxt Documentation](https://vite-pwa-org.netlify.app/frameworks/nuxt.html)
- [Web App Manifest (MDN)](https://developer.mozilla.org/en-US/docs/Web/Manifest)
- [Maskable Icons Guide](https://web.dev/maskable-icon/)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)

---

## ✅ Checklist

- [ ] Icons created and placed in `public/`
- [ ] `nuxt.config.ts` updated
- [ ] `usePwaInstall` composable created
- [ ] `ReloadPrompt` component created
- [ ] `<ReloadPrompt />` added to layout
- [ ] Install button added to Settings/Sidebar
- [ ] Tested on local dev
- [ ] Tested on production build
- [ ] Tested on real Android device
- [ ] Tested on real iOS device
