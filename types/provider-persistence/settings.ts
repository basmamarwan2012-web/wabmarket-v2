import type { DiscoveryProviderCategory, DiscoverySearchMode } from '../discovery-provider'
import type { PersistenceDocumentMetadata } from './base'

export const PROVIDER_SETTINGS_SCHEMA_VERSION = 1 as const

/** Tenant restrictions only; adapter capabilities remain code-authoritative. */
export interface ProviderSettingsPersistence extends PersistenceDocumentMetadata {
  readonly provider_identifier: string
  readonly enabled: boolean
  readonly priority: number | null
  readonly weight: number | null
  readonly restricted_categories: readonly DiscoveryProviderCategory[]
  readonly restricted_search_modes: readonly DiscoverySearchMode[]
  readonly quota_policy_reference: string | null
  readonly budget_policy_reference: string | null
  readonly fallback_allowed: boolean
  readonly aggregation_allowed: boolean
  readonly configuration_version: number
}
