import type {
  OpenDiscoveryTaxonomyEntry,
  OpenDiscoveryTaxonomyResolution,
  OpenDiscoveryTaxonomySelector,
} from './open-discovery.taxonomy.types'

const ROOFER_SELECTOR = Object.freeze({
  key: 'craft',
  value: 'roofer',
}) satisfies OpenDiscoveryTaxonomySelector

const ROOFER_ENTRY = Object.freeze({
  id: 'roofer',
  canonicalLabel: 'Roofer',
  aliases: Object.freeze(['roofer', 'roofers', 'roofing', 'roof repair']),
  selectors: Object.freeze([ROOFER_SELECTOR]),
  source: 'osm_tag',
  status: 'approved',
}) satisfies OpenDiscoveryTaxonomyEntry

export const OPEN_DISCOVERY_TAXONOMY_ENTRIES = Object.freeze([
  ROOFER_ENTRY,
] as const satisfies readonly OpenDiscoveryTaxonomyEntry[])

export const normalizeOpenDiscoveryTaxonomyAlias = (value: unknown) => {
  if (typeof value !== 'string') return null

  const normalized = value
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[-_\u2010-\u2015]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ')

  return normalized || null
}

const buildApprovedAliasIndex = (
  entries: readonly OpenDiscoveryTaxonomyEntry[]
) => {
  const index: Record<string, OpenDiscoveryTaxonomyEntry> = Object.create(null)

  for (const entry of entries) {
    if (entry.status !== 'approved') continue

    for (const alias of entry.aliases) {
      const normalizedAlias = normalizeOpenDiscoveryTaxonomyAlias(alias)
      if (!normalizedAlias) {
        throw new Error(
          `Invalid Open Discovery taxonomy alias in entry: ${entry.id}`
        )
      }
      if (Object.hasOwn(index, normalizedAlias)) {
        throw new Error(
          `Duplicate Open Discovery taxonomy alias: ${normalizedAlias}`
        )
      }
      index[normalizedAlias] = entry
    }
  }

  return Object.freeze(index)
}

const APPROVED_ALIAS_INDEX = buildApprovedAliasIndex(
  OPEN_DISCOVERY_TAXONOMY_ENTRIES
)
const UNMATCHED_TAXONOMY_RESULT = Object.freeze({
  matched: false,
}) satisfies OpenDiscoveryTaxonomyResolution

export const resolveOpenDiscoveryTaxonomy = (
  keyword: unknown
): OpenDiscoveryTaxonomyResolution => {
  const normalizedAlias = normalizeOpenDiscoveryTaxonomyAlias(keyword)
  if (!normalizedAlias) return UNMATCHED_TAXONOMY_RESULT

  const entry = APPROVED_ALIAS_INDEX[normalizedAlias]
  if (!entry) return UNMATCHED_TAXONOMY_RESULT

  return Object.freeze({ matched: true, entry })
}
