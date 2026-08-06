import 'server-only'

import type {
  DiscoveryProviderCapabilities,
  DiscoveryProviderExecutionContext,
  DiscoveryProviderItem,
  DiscoveryProviderRequest,
} from '@/types/discovery-provider'
import { DiscoveryProviderError, type DiscoveryProvider } from '../provider'

const supportedModes = Object.freeze(['business_upgrade', 'local_seo'] as const)

export class GoogleDiscoveryProvider implements DiscoveryProvider<unknown> {
  readonly capabilities: DiscoveryProviderCapabilities = Object.freeze({
    identifier: 'google',
    displayName: 'Google',
    supportedSearchModes: supportedModes,
    categories: Object.freeze(['business_discovery'] as const),
    operations: Object.freeze({
      registrationPricing: false,
      renewalPricing: false,
      buyNowInventory: false,
      brokerage: false,
      batchRequests: false,
    }),
  })

  name() {
    return this.capabilities.identifier
  }

  supports(request: DiscoveryProviderRequest) {
    if (
      !supportedModes.includes(request.mode as (typeof supportedModes)[number])
    )
      return false
    const keyword = request.criteria.keyword?.trim()
    const city = request.criteria.city?.trim()
    const country = request.criteria.country?.trim()
    return Boolean(keyword && city && country)
  }

  async search(
    _request: DiscoveryProviderRequest,
    _context?: Readonly<DiscoveryProviderExecutionContext>
  ): Promise<unknown> {
    throw new DiscoveryProviderError(
      'PROVIDER_NOT_IMPLEMENTED',
      'Not implemented'
    )
  }

  normalize(
    _response: unknown,
    _request: DiscoveryProviderRequest
  ): readonly DiscoveryProviderItem[] {
    return []
  }
}
