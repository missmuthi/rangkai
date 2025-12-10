export type PerpusnasEndpoint = {
  name: string
  url: string
  metadataPrefix?: 'marcxml' | 'oai_dc'
  region?: string
  priority: number
  status?: 'active' | 'unknown'
  aggregator?: boolean
  notes?: string
}

// Base registry (ordered by priority)
export const ENDPOINTS: PerpusnasEndpoint[] = [
  {
    name: 'INLISLite v3 Demo (Official)',
    url: 'http://demo.inlislitev3.perpusnas.go.id/opac/oai',
    metadataPrefix: 'marcxml',
    region: 'Jakarta',
    priority: 1,
    status: 'active'
  },
  {
    name: 'BP Batam',
    url: 'http://opacinlis.bpbatam.go.id/oaipmh/oai.aspx',
    metadataPrefix: 'marcxml',
    region: 'Batam',
    priority: 2,
    status: 'active'
  },
  {
    name: 'Pekanbaru',
    url: 'http://pustaka-srv.pekanbaru.go.id:4580/inlislite3/opac/oai',
    metadataPrefix: 'marcxml',
    region: 'Riau',
    priority: 3,
    status: 'active'
  },
  {
    name: 'Permata Cendekia',
    url: 'https://perpustakaanpermatacendekia.com/inlislite3/opac/',
    metadataPrefix: 'oai_dc',
    region: 'School',
    priority: 4,
    status: 'active'
  },
  {
    name: 'Kabupaten Bone',
    url: 'https://inlislite-dispeka.bone.go.id/opac/oai',
    metadataPrefix: 'oai_dc',
    region: 'Sulsel',
    priority: 5,
    status: 'active'
  },
  {
    name: 'Samarinda',
    url: 'http://inlislite.samarindakota.go.id:8123/inlislite3/opac/oai',
    metadataPrefix: 'marcxml',
    region: 'Kaltim',
    priority: 6,
    status: 'active'
  },
  {
    name: 'Banjarmasin',
    url: 'http://125.167.232.208:12345/opac/oaipmh/oai.aspx',
    metadataPrefix: 'marcxml',
    region: 'Kalsel',
    priority: 7,
    status: 'active'
  },
  {
    name: 'OneSearch (Aggregator)',
    url: 'https://onesearch.id',
    metadataPrefix: 'oai_dc',
    region: 'National',
    priority: 8,
    status: 'active',
    aggregator: true,
    notes: 'Discovery index; not always ISBN-direct'
  },
  {
    name: 'Perpusnas E-Journal',
    url: 'https://ejournal.perpusnas.go.id/mp/oai',
    metadataPrefix: 'oai_dc',
    region: 'E-Journal',
    priority: 9,
    status: 'active',
    aggregator: true,
    notes: 'Articles; not for books'
  }
]

const parseEnvList = (value?: string) =>
  (value || '')
    .split(',')
    .map(v => v.trim())
    .filter(Boolean)
    .map((url, idx) => ({
      name: `Env endpoint ${idx + 1}`,
      url,
      metadataPrefix: url.includes('perpusnas') || url.includes('inlislite') ? 'marcxml' : 'oai_dc',
      priority: idx + 1,
      status: 'active' as const
    }))

/**
 * Returns endpoints sorted by priority.
 * - Env overrides (PERPUSNAS_OAI_ENDPOINTS) are placed first, then defaults, then PERPUSNAS_OAI_FALLBACKS.
 * - Set includeAggregators=false to skip OneSearch/E-Journal.
 */
export function getEndpointsByPriority(includeAggregators = false): PerpusnasEndpoint[] {
  const envPreferred = parseEnvList(process.env.PERPUSNAS_OAI_ENDPOINTS)
  const envFallbacks = parseEnvList(process.env.PERPUSNAS_OAI_FALLBACKS)
  const base = [...ENDPOINTS].sort((a, b) => a.priority - b.priority)
  const combined = [...envPreferred, ...base, ...envFallbacks]
  return includeAggregators ? combined : combined.filter(ep => !ep.aggregator)
}

/**
 * Build an OAI-PMH URL for a given endpoint/verb.
 * Adds metadataPrefix and any extra params you pass.
 */
export function buildOaiUrl(
  endpoint: PerpusnasEndpoint,
  verb: 'Identify' | 'ListRecords' | 'ListIdentifiers' | 'GetRecord',
  params?: Record<string, string | undefined>
): string {
  const search = new URLSearchParams({
    verb,
    metadataPrefix: endpoint.metadataPrefix || 'marcxml',
    ...Object.fromEntries(
      Object.entries(params || {}).filter(([, v]) => v !== undefined && v !== null)
    )
  })
  return `${endpoint.url}?${search.toString()}`
}
