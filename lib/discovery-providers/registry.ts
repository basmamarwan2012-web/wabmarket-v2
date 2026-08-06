import 'server-only'

import type { DiscoveryProviderIdentifier } from '@/types/discovery-provider'
import { DiscoveryProviderError, type DiscoveryProvider } from './provider'

export class DiscoveryProviderRegistry {
  private readonly entries = new Map<
    DiscoveryProviderIdentifier,
    DiscoveryProvider
  >()

  constructor(providers: readonly DiscoveryProvider[] = []) {
    providers.forEach((provider) => this.register(provider))
  }

  register(provider: DiscoveryProvider) {
    const identifier = provider.name().trim()
    if (!identifier || provider.capabilities.identifier !== identifier) {
      throw new DiscoveryProviderError(
        'PROVIDER_INVALID_CONFIGURATION',
        'The provider identifier is invalid or inconsistent.'
      )
    }
    if (this.entries.has(identifier)) {
      throw new DiscoveryProviderError(
        'PROVIDER_DUPLICATE',
        `A provider is already registered with identifier "${identifier}".`
      )
    }
    this.entries.set(identifier, provider)
  }

  get(identifier: DiscoveryProviderIdentifier) {
    const provider = this.entries.get(identifier)
    if (!provider) {
      throw new DiscoveryProviderError(
        'PROVIDER_UNKNOWN',
        `No discovery provider is registered with identifier "${identifier}".`
      )
    }
    return provider
  }

  has(identifier: DiscoveryProviderIdentifier) {
    return this.entries.has(identifier)
  }

  get providers(): readonly DiscoveryProvider[] {
    return Object.freeze(Array.from(this.entries.values()))
  }

  get identifiers(): readonly DiscoveryProviderIdentifier[] {
    return Object.freeze(Array.from(this.entries.keys()))
  }
}
