# PWA Icon Assets - Quick Reference

## 📋 Required Files

Place these 4 files in the `public/` directory:

```
public/
├── pwa-192x192.png          # 192×192px standard icon
├── pwa-512x512.png          # 512×512px standard icon
├── pwa-maskable-192x192.png # 192×192px with safe zone
└── pwa-maskable-512x512.png # 512×512px with safe zone
```

---

## 🎨 Design Specifications

### Standard Icons

- **Canvas Size**: 192×192px and 512×512px
- **Content**: Full bleed, logo can use entire canvas
- **Format**: PNG with transparency
- **Usage**: General app icon (Chrome, Edge, Android launcher)

### Maskable Icons

- **Canvas Size**: 192×192px and 512×512px
- **Safe Zone**:
  - 192px icon → Keep important content in centered 160×160px
  - 512px icon → Keep important content in centered 427×427px
- **Background**: Must fill entire canvas (will show through adaptive shapes)
- **Usage**: Android adaptive icons (circular, squircle, rounded square, teardrop)

---

## 🛠️ Creation Tools

### Option 1: PWA Asset Generator (Automated)

```bash
# Install PWA asset generator
npm install -g pwa-asset-generator

# Generate all icons from a single source image (1024×1024px recommended)
npx pwa-asset-generator source-icon.png public/ \
  --icon-only \
  --padding "calc(50vh - 25%) calc(50vw - 25%)" \
  --background "#0f172a"
```

### Option 2: Online Tools

- [PWA Image Generator](https://www.pwabuilder.com/imageGenerator) - Upload source, download all sizes
- [Maskable.app Editor](https://maskable.app/editor) - Test maskable icon safe zones

### Option 3: Manual (Photoshop/Figma)

**Steps:**

1. Create 512×512px canvas
2. Add your logo/icon centered
3. For maskable: Keep logo within centered 427×427px circle
4. For maskable: Extend background to full 512×512px
5. Export as PNG
6. Resize to 192×192px for smaller versions

---

## ✅ Verification Checklist

After creating icons:

- [ ] All 4 files exist in `public/` folder
- [ ] Filenames match exactly (case-sensitive)
- [ ] Format is PNG (not JPG/WebP)
- [ ] Standard icons look good full-bleed
- [ ] Maskable icons tested at [maskable.app](https://maskable.app)
- [ ] No transparent gaps in maskable backgrounds

---

## 🧪 Testing Your Icons

### Chrome DevTools

1. Open `chrome://extensions`
2. Enable "Developer mode"
3. Load your app
4. Open DevTools → Application → Manifest
5. Click "Maskable icon" toggle to test

### Real Device

1. Deploy to staging
2. Install app on Android
3. Check launcher icon in different shapes:
   - Settings → Home screen → Icon shape
   - Try: Circle, Squircle, Rounded Square

---

## 📐 Icon Safe Zones (Visual Guide)

```
┌─────────────────────────────────────┐
│ 192×192px Canvas (Maskable)         │
│  ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓   │
│  ┃ Background (full canvas)    ┃   │
│  ┃  ┌───────────────────────┐  ┃   │
│  ┃  │ Safe Zone 160×160px   │  ┃   │← Keep logo here
│  ┃  │   (your logo/text)    │  ┃   │
│  ┃  └───────────────────────┘  ┃   │
│  ┃                             ┃   │
│  ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛   │
└─────────────────────────────────────┘
     ^                        ^
   16px margin            16px margin
```

For 512×512px:

- Safe Zone: 427×427px centered
- Margins: 42.5px on all sides
