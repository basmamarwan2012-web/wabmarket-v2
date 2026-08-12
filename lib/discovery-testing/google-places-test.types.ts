import type { DiscoveryProviderRequest } from '@/types/discovery-provider'
import type { FlipScorePriority } from '@/lib/flipscore/engine.types'

export interface GooglePlacesTestRequest extends DiscoveryProviderRequest {
  readonly mode: 'business_upgrade'
  readonly criteria: Readonly<{
    keyword: string
    city: string
    state: string | null
    country: string
    language: string | null
    maxResults: number
  }>
}

export interface GooglePlacesSafeTestResult {
  readonly placeId: string
  readonly name: string
  readonly domain: string
  readonly primaryType: string | null
  readonly flipScore: number
  readonly priority: FlipScorePriority
  readonly breakdown: Readonly<{
    need: number
    impact: number
    confidence: number
  }>
  readonly reasons: readonly string[]
}

export interface GooglePlacesTestReport {
  readonly provider: 'google_places'
  readonly received: number
  readonly accepted: number
  readonly rejected: number
  readonly uniqueDomains: number
  readonly dotComDomains: number
  readonly nonDotComDomains: number
  readonly hyphenatedDomains: number
  readonly basicWeakDomainCandidates: number
  readonly totalAccepted: number
  readonly criticalCount: number
  readonly highCount: number
  readonly mediumCount: number
  readonly lowCount: number
  readonly averageFlipScore: number
  readonly results: readonly GooglePlacesSafeTestResult[]
}
