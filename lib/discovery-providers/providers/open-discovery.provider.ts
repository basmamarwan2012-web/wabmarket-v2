import 'server-only'

import { OPEN_DISCOVERY_PROVIDER_IDENTIFIER } from '@/lib/config/open-discovery'
import type {
  DiscoveryProviderCapabilities,
  DiscoveryProviderExecutionContext,
  DiscoveryProviderItem,
  DiscoveryProviderRequest,
} from '@/types/discovery-provider'
import { DiscoveryProviderError, type DiscoveryProvider } from '../provider'
import {
  isOpenDiscoveryRequestSupported,
  OPEN_DISCOVERY_SUPPORTED_MODES,
} from './open-discovery.helpers'
import type { OpenDiscoveryRawResponse } from './open-discovery.types'

const EMPTY_OPEN_DISCOVERY_ITEMS = Object.freeze(
  []
) as readonly DiscoveryProviderItem[]

export class OpenDiscoveryProvider
  implements DiscoveryProvider<OpenDiscoveryRawResponse>
{
  readonly capabilities: DiscoveryProviderCapabilities = Object.freeze({
    identifier: OPEN_DISCOVERY_PROVIDER_IDENTIFIER,
    displayName: 'Open Discovery',
    supportedSearchModes: OPEN_DISCOVERY_SUPPORTED_MODES,
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
    return isOpenDiscoveryRequestSupported(request)
  }

  async search(
    _request: DiscoveryProviderRequest,
    _context?: Readonly<DiscoveryProviderExecutionContext>
  ): Promise<OpenDiscoveryRawResponse> {
    throw new DiscoveryProviderError(
      'PROVIDER_NOT_IMPLEMENTED',
      'Not implemented'
    )
  }

  normalize(
    _response: OpenDiscoveryRawResponse,
    _request: DiscoveryProviderRequest
  ): readonly DiscoveryProviderItem[] {
    return EMPTY_OPEN_DISCOVERY_ITEMS
  }
}
