import 'server-only'

import { performance } from 'node:perf_hooks'
import { OpenDiscoveryProvider } from '@/lib/discovery-providers/providers/open-discovery.provider'
import type { OpenDiscoveryOverpassElement } from '@/lib/discovery-providers/providers/open-discovery.overpass.types'
import { DiscoveryProviderError } from '@/lib/discovery-providers/provider'
import type {
  OpenDiscoveryTestRequest,
  OpenDiscoveryTestResult,
} from './open-discovery-test.types'

interface MutableDiagnosticCounts {
  nodes: number
  ways: number
  relations: number
  recordsWithWebsite: number
  recordsWithName: number
  recordsWithCoordinates: number
}

const websiteTagNames = Object.freeze([
  'website',
  'contact:website',
  'url',
  'contact:url',
] as const)

const isNonEmptyText = (value: unknown) =>
  typeof value === 'string' && value.trim().length > 0

const hasWebsite = (element: OpenDiscoveryOverpassElement) =>
  websiteTagNames.some((tagName) => isNonEmptyText(element.tags?.[tagName]))

const hasName = (element: OpenDiscoveryOverpassElement) =>
  isNonEmptyText(element.tags?.name)

const hasCoordinates = (element: OpenDiscoveryOverpassElement) =>
  (Number.isFinite(element.lat) && Number.isFinite(element.lon)) ||
  (Number.isFinite(element.center?.lat) && Number.isFinite(element.center?.lon))

const aggregateElement = (
  counts: MutableDiagnosticCounts,
  element: OpenDiscoveryOverpassElement
) => {
  if (element.type === 'node') counts.nodes += 1
  else if (element.type === 'way') counts.ways += 1
  else counts.relations += 1

  if (hasWebsite(element)) counts.recordsWithWebsite += 1
  if (hasName(element)) counts.recordsWithName += 1
  if (hasCoordinates(element)) counts.recordsWithCoordinates += 1
  return counts
}

const validateCountInvariants = (
  elementsReceived: number,
  counts: Readonly<MutableDiagnosticCounts>
) => {
  const aggregateCounts = [
    counts.nodes,
    counts.ways,
    counts.relations,
    counts.recordsWithWebsite,
    counts.recordsWithName,
    counts.recordsWithCoordinates,
  ]
  const countsAreBounded = aggregateCounts.every(
    (count) =>
      Number.isSafeInteger(count) && count >= 0 && count <= elementsReceived
  )
  const typesAreComplete =
    elementsReceived === counts.nodes + counts.ways + counts.relations

  if (
    !Number.isSafeInteger(elementsReceived) ||
    elementsReceived < 0 ||
    !countsAreBounded ||
    !typesAreComplete
  ) {
    throw new DiscoveryProviderError(
      'PROVIDER_INVALID_RESPONSE',
      'Open Discovery returned an invalid response.'
    )
  }
}

export async function executeOpenDiscoveryTest(
  request: OpenDiscoveryTestRequest
): Promise<OpenDiscoveryTestResult> {
  const provider = new OpenDiscoveryProvider()
  const startedAt = performance.now()
  const response = await provider.search(request)
  const durationMs = Math.max(0, Math.round(performance.now() - startedAt))

  const counts = response.elements.reduce<MutableDiagnosticCounts>(
    aggregateElement,
    {
      nodes: 0,
      ways: 0,
      relations: 0,
      recordsWithWebsite: 0,
      recordsWithName: 0,
      recordsWithCoordinates: 0,
    }
  )
  const elementsReceived = response.elements.length
  validateCountInvariants(elementsReceived, counts)

  return Object.freeze({
    provider: 'open_discovery',
    elementsReceived,
    ...counts,
    durationMs,
  })
}
