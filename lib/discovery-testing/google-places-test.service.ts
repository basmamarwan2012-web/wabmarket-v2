import 'server-only'

import { DiscoveryProviderError } from '@/lib/discovery-providers/provider'
import { GooglePlacesDiscoveryProvider } from '@/lib/discovery-providers/providers/google-places.provider'
import type {
  GooglePlacesTestReport,
  GooglePlacesTestRequest,
} from './google-places-test.types'

export async function executeGooglePlacesTest(
  request: GooglePlacesTestRequest
): Promise<GooglePlacesTestReport> {
  const provider = new GooglePlacesDiscoveryProvider()
  const response = await provider.search(request)
  const outcome = provider.normalizeWithDiagnostics(response, request)
  const { transientResults, received, accepted, rejected } = outcome.diagnostics
  const uniqueDomains = new Set(
    transientResults.map((result) => result.normalizedHostname)
  ).size
  const dotComDomains = transientResults.filter(
    (result) => result.isDotCom
  ).length
  const nonDotComDomains = transientResults.filter(
    (result) => result.isNonDotCom
  ).length
  const hyphenatedDomains = transientResults.filter(
    (result) => result.hasHyphen
  ).length
  const basicWeakDomainCandidates = transientResults.filter(
    (result) => result.hasBasicDomainWeakness
  ).length

  const countsAreConsistent =
    received === accepted + rejected &&
    accepted === transientResults.length &&
    uniqueDomains === accepted &&
    dotComDomains + nonDotComDomains === accepted &&
    basicWeakDomainCandidates ===
      transientResults.filter(
        (result) => result.isNonDotCom || result.hasHyphen
      ).length

  if (!countsAreConsistent)
    throw new DiscoveryProviderError(
      'PROVIDER_INVALID_RESPONSE',
      'Google Places diagnostics are inconsistent.'
    )

  return Object.freeze({
    provider: 'google_places',
    received,
    accepted,
    rejected,
    uniqueDomains,
    dotComDomains,
    nonDotComDomains,
    hyphenatedDomains,
    basicWeakDomainCandidates,
    results: Object.freeze(
      transientResults.map((result) =>
        Object.freeze({
          placeId: result.placeId,
          name: result.displayName,
          domain: result.normalizedHostname,
          primaryType: result.primaryType,
          isDotCom: result.isDotCom,
          hasHyphen: result.hasHyphen,
          hasBasicDomainWeakness: result.hasBasicDomainWeakness,
        })
      )
    ),
  })
}
