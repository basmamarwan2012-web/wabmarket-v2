export type OpenDiscoveryTaxonomySource =
  'osm_tag' | 'osm_key' | 'future_verified_mapping'

export type OpenDiscoveryTaxonomyStatus = 'approved' | 'proposed' | 'deprecated'

/**
 * A storage-neutral OSM selector. Runtime callers never supply this shape;
 * selectors originate only from the code-owned taxonomy.
 */
export interface OpenDiscoveryTaxonomySelector {
  readonly key: string
  readonly value: string
}

export interface OpenDiscoveryTaxonomyEntry {
  readonly id: string
  readonly canonicalLabel: string
  readonly aliases: readonly string[]
  readonly selectors: readonly OpenDiscoveryTaxonomySelector[]
  readonly source: OpenDiscoveryTaxonomySource
  readonly status: OpenDiscoveryTaxonomyStatus
}

export type OpenDiscoveryTaxonomyResolution =
  | Readonly<{
      matched: true
      entry: OpenDiscoveryTaxonomyEntry
    }>
  | Readonly<{
      matched: false
    }>
