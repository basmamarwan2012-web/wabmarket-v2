import 'server-only'

import type {
  DiscoveryProviderCapabilities,
  DiscoveryProviderExecutionContext,
  DiscoveryProviderItem,
  DiscoveryProviderRequest,
} from '@/types/discovery-provider'
import { DiscoveryProviderError, type DiscoveryProvider } from '../provider'

const supportedModes = Object.freeze([
  'available_domains',
  'hyphen_upgrade',
  'alternative_extension',
  'auction',
  'closeout',
  'expired',
  'premium',
] as const)

export class DynadotDiscoveryProvider implements DiscoveryProvider<unknown> {
  readonly capabilities: DiscoveryProviderCapabilities = Object.freeze({
    identifier: 'dynadot',
    displayName: 'Dynadot',
    supportedSearchModes: supportedModes,
    categories: Object.freeze([
      'registration',
      'auction',
      'closeout',
      'premium',
      'availability_verification',
    ] as const),
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
    const hasSeed = Boolean(
      request.criteria.keyword?.trim() ||
      request.criteria.currentDomain?.trim() ||
      request.criteria.candidateDomain?.trim()
    )
    if (!hasSeed) return false
    if (request.mode === 'alternative_extension') {
      return Boolean(request.criteria.extensions?.length)
    }
    return true
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
