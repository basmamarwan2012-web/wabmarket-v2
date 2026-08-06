import type { PersistenceDocumentMetadata, PersistenceMoney } from './base'

export const PROVIDER_CONFIGURATION_SCHEMA_VERSION = 1 as const

/** Platform/admin-authored metadata and safe defaults, not tenant capabilities. */
export interface ProviderConfigurationPersistence extends PersistenceDocumentMetadata {
  readonly provider_identifier: string
  readonly display_name: string
  readonly description: string
  readonly requires_paid_access: boolean
  readonly default_request_cost: PersistenceMoney
  readonly default_currency: string | null
  readonly provider_api_version: string | null
}
