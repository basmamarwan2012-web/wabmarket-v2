import type {
  DiscoveryProviderItem,
  DiscoveryProviderRequest,
} from '@/types/discovery-provider'

export interface GooglePlacesTextSearchPlace {
  readonly id?: string
  readonly displayName?: Readonly<{
    text: string
    languageCode?: string
  }>
  readonly formattedAddress?: string
  readonly primaryType?: string
  readonly types?: readonly string[]
  readonly businessStatus?: string
  readonly websiteUri?: string
  readonly pureServiceAreaBusiness?: boolean
}

export interface GooglePlacesTextSearchResponse {
  readonly places: readonly GooglePlacesTextSearchPlace[]
}

export interface GooglePlacesSearchCriteria {
  readonly keyword: string
  readonly city: string
  readonly state: string | null
  readonly country: string
  readonly language: string | null
  readonly maxResults: number
  readonly textQuery: string
}

export interface GooglePlacesDomainAnalysis {
  readonly isDotCom: boolean
  readonly isNonDotCom: boolean
  readonly hasHyphen: boolean
  readonly hasBasicDomainWeakness: boolean
}

export interface GooglePlacesTransientResult extends GooglePlacesDomainAnalysis {
  readonly placeId: string
  readonly displayName: string
  readonly formattedAddress: string | null
  readonly primaryType: string | null
  readonly types: readonly string[]
  readonly businessStatus: 'OPERATIONAL'
  readonly websiteUri: string
  readonly normalizedHostname: string
  readonly pureServiceAreaBusiness: boolean | null
}

export interface GooglePlacesNormalizationDiagnostics {
  readonly received: number
  readonly accepted: number
  readonly rejected: number
  readonly transientResults: readonly GooglePlacesTransientResult[]
}

export interface GooglePlacesNormalizationOutcome {
  readonly items: readonly DiscoveryProviderItem[]
  readonly diagnostics: GooglePlacesNormalizationDiagnostics
}

export interface GooglePlacesProviderRequest extends DiscoveryProviderRequest {
  readonly mode: 'business_upgrade'
}
