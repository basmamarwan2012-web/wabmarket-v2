/**
 * Explicitly dormant transport placeholder. The first selected open-data
 * source will replace this with a source-specific raw contract.
 */
export interface OpenDiscoveryRawResponse {
  readonly sourceRecords: readonly unknown[]
}
