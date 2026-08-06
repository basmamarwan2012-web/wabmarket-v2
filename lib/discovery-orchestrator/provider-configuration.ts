import 'server-only'

import type { DiscoveryProviderCapabilities, DiscoveryProviderIdentifier } from '@/types/discovery-provider'
import type { ProviderDeclaration, ProviderPolicyBundle, ProviderSettings } from '@/types/provider-policy'

const zeroLimit = () => Object.freeze({ amount: 0, currency: null })

export function createDefaultProviderDeclaration(
  capabilities: DiscoveryProviderCapabilities,
  description: string
): ProviderDeclaration {
  return Object.freeze({
    identifier: capabilities.identifier,
    displayName: capabilities.displayName,
    description,
    categories: Object.freeze([...capabilities.categories]),
    capabilities,
    requiresPaidAccess: false,
    defaultRequestCost: zeroLimit(),
    defaultCurrency: null,
    schemaVersion: 1,
  })
}

export function createDefaultProviderSettings(providerIdentifier: DiscoveryProviderIdentifier): ProviderSettings {
  return Object.freeze({ providerIdentifier, enabled: false, priority: null, weight: null, allowedCategories: Object.freeze([]), allowedSearchModes: Object.freeze([]), freeOnly: true, fallbackAllowed: false, aggregationAllowed: false, configurationVersion: 1 })
}

export function createDefaultProviderPolicy(declaration: ProviderDeclaration): ProviderPolicyBundle {
  return Object.freeze({
    declaration,
    settings: createDefaultProviderSettings(declaration.identifier),
    quotas: Object.freeze({ providerDaily: null, providerMonthly: null, tenantDaily: null, tenantMonthly: null }),
    budget: Object.freeze({ paidProvidersEnabled: false, emergencyStop: true, limits: Object.freeze({ providerDaily: zeroLimit(), providerMonthly: zeroLimit(), tenantDaily: zeroLimit(), tenantMonthly: zeroLimit() }) }),
    healthDefaults: Object.freeze({ unknownStateAllowed: false, minimumAvailabilityScore: null }),
  })
}
