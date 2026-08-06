import type { DiscoveryProviderCapabilities, DiscoveryProviderCategory, DiscoveryProviderIdentifier, DiscoverySearchMode } from './discovery-provider'
import type { MoneyAmount } from './provider-budget'
import type { QuotaLimits } from './provider-quota'
import type { BudgetPolicy } from './provider-budget'
import type { ProviderHealthDefaults } from './provider-health'

/** Adapter-owned declaration. Tenant settings can never expand these values. */
export interface ProviderDeclaration {
  readonly identifier: DiscoveryProviderIdentifier
  readonly displayName: string
  readonly description: string
  readonly categories: readonly DiscoveryProviderCategory[]
  readonly capabilities: DiscoveryProviderCapabilities
  readonly requiresPaidAccess: boolean
  readonly defaultRequestCost: MoneyAmount
  readonly defaultCurrency: string | null
  readonly schemaVersion: number
}
/** Tenant/provider restrictions only; these cannot grant adapter capabilities. */
export interface ProviderSettings {
  readonly providerIdentifier: DiscoveryProviderIdentifier
  readonly enabled: boolean
  readonly priority: number | null
  readonly weight: number | null
  readonly allowedCategories: readonly DiscoveryProviderCategory[]
  readonly allowedSearchModes: readonly DiscoverySearchMode[]
  readonly freeOnly: boolean
  readonly fallbackAllowed: boolean
  readonly aggregationAllowed: boolean
  readonly configurationVersion: number
}
export interface ProviderPolicyBundle { readonly declaration: ProviderDeclaration; readonly settings: ProviderSettings; readonly budget: BudgetPolicy; readonly quotas: QuotaLimits; readonly healthDefaults: ProviderHealthDefaults }
