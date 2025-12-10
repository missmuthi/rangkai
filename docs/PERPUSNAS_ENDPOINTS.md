# 🇮🇩 Perpusnas OAI-PMH Endpoints – Complete Registry

This registry lists reliable Indonesian INLIS/Perpusnas OAI-PMH endpoints for the book scanner, plus helper config files you can drop into Nuxt/Nitro. Use the CSV/JSON files for quick imports and the TypeScript helpers for prioritized fallback logic.

---

## 📌 Quick Answer – Comma-Separated Lists

**Main INLIS endpoints (7 total, recommended for the scanner)**  
`http://demo.inlislitev3.perpusnas.go.id/opac/oai, http://opacinlis.bpbatam.go.id/oaipmh/oai.aspx, http://pustaka-srv.pekanbaru.go.id:4580/inlislite3/opac/oai, https://perpustakaanpermatacendekia.com/inlislite3/opac/, https://inlislite-dispeka.bone.go.id/opac/oai, http://inlislite.samarindakota.go.id:8123/inlislite3/opac/oai, http://125.167.232.208:12345/opac/oaipmh/oai.aspx`

**All endpoints (incl. aggregators, 9 total)**  
`http://demo.inlislitev3.perpusnas.go.id/opac/oai, http://opacinlis.bpbatam.go.id/oaipmh/oai.aspx, http://pustaka-srv.pekanbaru.go.id:4580/inlislite3/opac/oai, https://perpustakaanpermatacendekia.com/inlislite3/opac/, https://inlislite-dispeka.bone.go.id/opac/oai, http://inlislite.samarindakota.go.id:8123/inlislite3/opac/oai, http://125.167.232.208:12345/opac/oaipmh/oai.aspx, https://onesearch.id, https://ejournal.perpusnas.go.id/mp/oai`

---

## 📊 Endpoint Summary

| # | Library | Endpoint | Prefix | Status | Region | Priority |
|---|---------|----------|--------|--------|--------|----------|
| 1 | INLISLite v3 Demo (Official) ⭐ | `demo.inlislitev3.perpusnas.go.id/opac/oai` | marcxml | Active | Jakarta | 1 (start) |
| 2 | BP Batam 🏢 | `opacinlis.bpbatam.go.id/oaipmh/oai.aspx` | marcxml | Active | Batam | 2 |
| 3 | Pekanbaru | `pustaka-srv.pekanbaru.go.id:4580/inlislite3/opac/oai` | marcxml | Active | Riau | 3 |
| 4 | Permata Cendekia | `perpustakaanpermatacendekia.com/inlislite3/opac/` | oai_dc | Active | School | 4 |
| 5 | Kabupaten Bone | `inlislite-dispeka.bone.go.id/opac/oai` | oai_dc | Active | Sulsel | 5 |
| 6 | Samarinda | `inlislite.samarindakota.go.id:8123/inlislite3/opac/oai` | marcxml | Active | Kaltim | 6 |
| 7 | Banjarmasin | `125.167.232.208:12345/opac/oaipmh/oai.aspx` | marcxml | Active | Kalsel | 7 |
| 8 | OneSearch (Aggregator) 🌐 | `onesearch.id` | oai_dc/marcxml | Active | National | Discovery |
| 9 | Perpusnas E-Journal | `ejournal.perpusnas.go.id/mp/oai` | oai_dc | Active | E-Journal | Not for books |

---

## 🚀 How to Use in Nuxt/Nitro

1) **Drop in the TypeScript config**  
Copy `server/utils/perpusnas-config.ts` (already added) and adjust if needed. It exposes:
- `ENDPOINTS`: typed registry (priority, prefix, aggregator flag)
- `getEndpointsByPriority(includeAggregators?: boolean)`: returns filtered, priority-sorted list; env overrides allowed via `PERPUSNAS_OAI_ENDPOINTS` (preferred, comma-separated) and `PERPUSNAS_OAI_FALLBACKS` (appended).
- `buildOaiUrl(endpoint, verb, params?)`: builds a verb URL with sensible defaults.

2) **Use in your API handler**

```ts
// server/api/book/[isbn].get.ts
import { buildOaiUrl, getEndpointsByPriority } from '~/server/utils/perpusnas-config'

export default defineEventHandler(async (event) => {
  const isbn = getRouterParam(event, 'isbn')
  const endpoints = getEndpointsByPriority(false) // exclude aggregators by default

  for (const endpoint of endpoints) {
    try {
      const url = buildOaiUrl(endpoint, 'ListRecords', { metadataPrefix: endpoint.metadataPrefix || 'marcxml' })
      const response = await $fetch<string>(url, { timeout: 6000 })
      return { success: true, data: response, source: endpoint.name, endpoint: endpoint.url }
    } catch (error) {
      console.warn(`[Perpusnas] Failed with ${endpoint.name}:`, error)
    }
  }

  throw createError({ statusCode: 404, statusMessage: 'Book not found across Perpusnas endpoints' })
})
```

3) **Configure with env for experiments**  
```
PERPUSNAS_OAI_ENDPOINTS="http://demo.inlislitev3.perpusnas.go.id/opac/oai, http://opacinlis.bpbatam.go.id/oaipmh/oai.aspx"
PERPUSNAS_OAI_FALLBACKS="https://onesearch.id, https://ejournal.perpusnas.go.id/mp/oai"
```

---

## 📁 Files Included

| File | Purpose | Format |
|------|---------|--------|
| docs/PERPUSNAS_ENDPOINTS.md | Human-friendly registry & usage guide | Markdown |
| server/utils/perpusnas-config.ts | Ready-to-use TypeScript helpers and endpoint registry | TypeScript |
| docs/perpusnas_endpoints.csv | Machine-readable registry for spreadsheets | CSV |
| docs/perpusnas_endpoints.json | Machine-readable registry for APIs | JSON |

---

## 🔍 Quick Testing Snippets

```bash
# Test endpoint 1 (demo)
curl "http://demo.inlislitev3.perpusnas.go.id/opac/oai?verb=Identify"

# Test endpoint 2 (BP Batam)
curl "http://opacinlis.bpbatam.go.id/oaipmh/oai.aspx?verb=ListRecords&metadataPrefix=marcxml" | head

# Loop through all main endpoints
for ep in \
  "http://demo.inlislitev3.perpusnas.go.id/opac/oai" \
  "http://opacinlis.bpbatam.go.id/oaipmh/oai.aspx" \
  "http://pustaka-srv.pekanbaru.go.id:4580/inlislite3/opac/oai" \
  "https://perpustakaanpermatacendekia.com/inlislite3/opac/" \
  "https://inlislite-dispeka.bone.go.id/opac/oai" \
  "http://inlislite.samarindakota.go.id:8123/inlislite3/opac/oai" \
  "http://125.167.232.208:12345/opac/oaipmh/oai.aspx"
do
  echo "Testing: $ep"
  curl -s "$ep?verb=Identify" | head -20
  echo ""
done
```

---

## ✅ What You Get

- Complete list of active Perpusnas/INLIS OAI-PMH endpoints (plus two aggregators)
- Prioritized fallback strategy with env-based overrides
- TypeScript helpers for Nuxt/Nitro
- CSV/JSON exports for tooling and ops

If you hit new working hosts, add them to `PERPUSNAS_OAI_ENDPOINTS` (preferred) or `PERPUSNAS_OAI_FALLBACKS` and rerun diagnostics.***
