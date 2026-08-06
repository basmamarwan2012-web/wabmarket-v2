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
  buildOpenDiscoveryOverpassQuery,
  getOpenDiscoveryOverpassCriteria,
  OPEN_DISCOVERY_OVERPASS_SUPPORTED_MODES,
} from './open-discovery.overpass.query'
import { executeOpenDiscoveryOverpassQuery } from './open-discovery.overpass'
import type { OpenDiscoveryOverpassResponse } from './open-discovery.overpass.types'

const EMPTY_OPEN_DISCOVERY_ITEMS = Object.freeze(
  []
) as readonly DiscoveryProviderItem[]

export class OpenDiscoveryProvider implements DiscoveryProvider<OpenDiscoveryOverpassResponse> {
  readonly capabilities: DiscoveryProviderCapabilities = Object.freeze({
    identifier: OPEN_DISCOVERY_PROVIDER_IDENTIFIER,
    displayName: 'Open Discovery',
    supportedSearchModes: OPEN_DISCOVERY_OVERPASS_SUPPORTED_MODES,
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
    return getOpenDiscoveryOverpassCriteria(request) !== null
  }

  async search(
    request: DiscoveryProviderRequest,
    context?: Readonly<DiscoveryProviderExecutionContext>
  ): Promise<OpenDiscoveryOverpassResponse> {
    const criteria = getOpenDiscoveryOverpassCriteria(request)
    if (!criteria) {
      throw new DiscoveryProviderError(
        'PROVIDER_UNSUPPORTED_REQUEST',
        'Open Discovery does not support this request.'
      )
    }

    return executeOpenDiscoveryOverpassQuery(
      buildOpenDiscoveryOverpassQuery(criteria),
      { signal: context?.signal }
    )
  }

  normalize(
    _response: OpenDiscoveryOverpassResponse,
    _request: DiscoveryProviderRequest
  ): readonly DiscoveryProviderItem[] {
    return EMPTY_OPEN_DISCOVERY_ITEMS
  }
}
