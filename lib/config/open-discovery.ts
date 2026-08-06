import 'server-only'

export const OPEN_DISCOVERY_PROVIDER_IDENTIFIER = 'open_discovery' as const

export interface OpenDiscoveryConfigurationDefaults {
  readonly providerIdentifier: typeof OPEN_DISCOVERY_PROVIDER_IDENTIFIER
  readonly accessClassification: 'free'
  readonly requiresPaidAccess: false
  readonly requestCost: Readonly<{
    amount: 0
    currency: null
  }>
  readonly source: null
  readonly endpoint: null
}

export const OPEN_DISCOVERY_CONFIGURATION_DEFAULTS: OpenDiscoveryConfigurationDefaults =
  Object.freeze({
    providerIdentifier: OPEN_DISCOVERY_PROVIDER_IDENTIFIER,
    accessClassification: 'free',
    requiresPaidAccess: false,
    requestCost: Object.freeze({ amount: 0, currency: null }),
    source: null,
    endpoint: null,
  })
