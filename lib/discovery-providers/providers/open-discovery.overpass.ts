import 'server-only'

import { z } from 'zod'
import { DiscoveryProviderError } from '../provider'
import type {
  OpenDiscoveryOverpassElement,
  OpenDiscoveryOverpassResponse,
  OpenDiscoveryOverpassTransportOptions,
} from './open-discovery.overpass.types'
import { OPEN_DISCOVERY_OVERPASS_RESULT_LIMIT } from './open-discovery.overpass.query'

const OVERPASS_TRANSPORT_CONFIGURATION = Object.freeze({
  endpoint: 'https://overpass-api.de/api/interpreter',
  clientTimeoutMs: 12_000,
  userAgent: 'Wabmarket Open Discovery Investigation/1.0',
})

const coordinateSchema = z.object({
  lat: z.number().finite(),
  lon: z.number().finite(),
})

const elementSchema = z.object({
  type: z.enum(['node', 'way', 'relation']),
  id: z.number().finite().int().positive(),
  lat: z.number().finite().optional(),
  lon: z.number().finite().optional(),
  center: coordinateSchema.optional(),
  tags: z.record(z.string()).optional(),
})

const responseSchema = z.object({
  version: z.number().finite(),
  generator: z.string().min(1),
  elements: z.array(elementSchema).max(OPEN_DISCOVERY_OVERPASS_RESULT_LIMIT),
})

const freezeElement = (
  element: z.infer<typeof elementSchema>
): OpenDiscoveryOverpassElement =>
  Object.freeze({
    type: element.type,
    id: element.id,
    ...(element.lat === undefined ? {} : { lat: element.lat }),
    ...(element.lon === undefined ? {} : { lon: element.lon }),
    ...(element.center === undefined
      ? {}
      : { center: Object.freeze({ ...element.center }) }),
    ...(element.tags === undefined
      ? {}
      : { tags: Object.freeze({ ...element.tags }) }),
  })

const validateOverpassResponse = (
  value: unknown
): OpenDiscoveryOverpassResponse => {
  const parsed = responseSchema.safeParse(value)
  if (!parsed.success) {
    throw new DiscoveryProviderError(
      'PROVIDER_INVALID_RESPONSE',
      'Open Discovery returned an invalid response.'
    )
  }

  return Object.freeze({
    version: parsed.data.version,
    generator: parsed.data.generator,
    elements: Object.freeze(parsed.data.elements.map(freezeElement)),
  })
}

export const executeOpenDiscoveryOverpassQuery = async (
  query: string,
  options: OpenDiscoveryOverpassTransportOptions = {}
): Promise<OpenDiscoveryOverpassResponse> => {
  if (options.signal?.aborted) {
    throw new DiscoveryProviderError(
      'PROVIDER_CANCELLED',
      'Open Discovery request was cancelled.'
    )
  }

  const controller = new AbortController()
  let callerCancelled = false
  let clientTimedOut = false

  const cancelFromCaller = () => {
    callerCancelled = true
    controller.abort()
  }
  options.signal?.addEventListener('abort', cancelFromCaller, { once: true })

  const timeout = setTimeout(() => {
    clientTimedOut = true
    controller.abort()
  }, OVERPASS_TRANSPORT_CONFIGURATION.clientTimeoutMs)

  try {
    const response = await fetch(OVERPASS_TRANSPORT_CONFIGURATION.endpoint, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
        'User-Agent': OVERPASS_TRANSPORT_CONFIGURATION.userAgent,
      },
      body: new URLSearchParams({ data: query }).toString(),
      signal: controller.signal,
    })

    if (!response.ok) {
      if (response.status === 429) {
        throw new DiscoveryProviderError(
          'PROVIDER_RATE_LIMITED',
          'Open Discovery is temporarily rate limited.'
        )
      }
      if (response.status === 504) {
        throw new DiscoveryProviderError(
          'PROVIDER_TIMEOUT',
          'Open Discovery request timed out.'
        )
      }
      throw new DiscoveryProviderError(
        'PROVIDER_HTTP_ERROR',
        'Open Discovery request failed.'
      )
    }

    let payload: unknown
    try {
      payload = await response.json()
    } catch {
      throw new DiscoveryProviderError(
        'PROVIDER_INVALID_RESPONSE',
        'Open Discovery returned an invalid response.'
      )
    }

    return validateOverpassResponse(payload)
  } catch (error: unknown) {
    if (error instanceof DiscoveryProviderError) throw error
    if (callerCancelled || options.signal?.aborted) {
      throw new DiscoveryProviderError(
        'PROVIDER_CANCELLED',
        'Open Discovery request was cancelled.'
      )
    }
    if (clientTimedOut) {
      throw new DiscoveryProviderError(
        'PROVIDER_TIMEOUT',
        'Open Discovery request timed out.'
      )
    }
    throw new DiscoveryProviderError(
      'PROVIDER_NETWORK_ERROR',
      'Open Discovery network request failed.'
    )
  } finally {
    clearTimeout(timeout)
    options.signal?.removeEventListener('abort', cancelFromCaller)
  }
}
