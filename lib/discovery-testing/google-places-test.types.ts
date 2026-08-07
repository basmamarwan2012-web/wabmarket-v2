import type { DiscoveryProviderRequest } from '@/types/discovery-provider'

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
  readonly isDotCom: boolean
  readonly hasHyphen: boolean
  readonly hasBasicDomainWeakness: boolean
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
  readonly results: readonly GooglePlacesSafeTestResult[]
}
