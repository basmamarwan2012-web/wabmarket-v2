import 'server-only'

import { analyzeDomainOpportunity } from '@/lib/domain-analysis/analyzer'
import { compareBrandToDomain } from '@/lib/domain-analysis/comparator'
import { analyzeDomainComposition } from '@/lib/domain-analysis/domain-composition'
import { createDomainSignalImportance } from '@/lib/domain-analysis/importance'
import { createDomainSignals } from '@/lib/domain-analysis/signals'
import { DiscoveryProviderError } from '@/lib/discovery-providers/provider'
import { GooglePlacesDiscoveryProvider } from '@/lib/discovery-providers/providers/google-places.provider'
import type { GooglePlacesNormalizationDiagnostics } from '@/lib/discovery-providers/providers/google-places.types'
import { calculateFlipScore } from '@/lib/flipscore/engine'
import { createFlipScorePolicy } from '@/lib/flipscore/policy'
import { createFlipScoreWeightPolicy } from '@/lib/flipscore/weights'
import type {
  GooglePlacesSafeTestResult,
  GooglePlacesTestReport,
  GooglePlacesTestRequest,
} from './google-places-test.types'

const invalidDiagnostics = () =>
  new DiscoveryProviderError(
    'PROVIDER_INVALID_RESPONSE',
    'Google Places diagnostics are inconsistent.'
  )

const analyzeTransientResult = (
  result: GooglePlacesNormalizationDiagnostics['transientResults'][number],
  request: GooglePlacesTestRequest
): GooglePlacesSafeTestResult => {
  const analyzed = analyzeDomainOpportunity({
    businessName: result.displayName,
    domain: result.normalizedHostname,
  })
  if (!analyzed.success) throw invalidDiagnostics()

  const comparison = compareBrandToDomain({
    analysis: analyzed.analysis,
    primaryKeyword: request.criteria.keyword,
    city: request.criteria.city,
  })
  if (!comparison) throw invalidDiagnostics()

  const signals = createDomainSignals({
    analysis: analyzed.analysis,
    comparison,
  })
  const importance = createDomainSignalImportance({ signals })
  const composition = analyzeDomainComposition({
    analysis: analyzed.analysis,
    primaryKeyword: request.criteria.keyword,
    city: request.criteria.city,
  })
  if (!composition) throw invalidDiagnostics()

  const policy = createFlipScorePolicy({
    importance,
    composition,
    signals,
    comparison,
  })
  const weights = createFlipScoreWeightPolicy({ policy })
  const score = calculateFlipScore({ policy, weights })

  return Object.freeze({
    placeId: result.placeId,
    name: result.displayName,
    domain: result.normalizedHostname,
    primaryType: result.primaryType,
    flipScore: score.flipScore,
    priority: score.priority,
    breakdown: Object.freeze({
      need: score.needScore,
      impact: score.impactScore,
      confidence: score.confidenceScore,
    }),
    reasons: score.reasons,
  })
}

const countPriority = (
  results: readonly GooglePlacesSafeTestResult[],
  priority: GooglePlacesSafeTestResult['priority']
) => results.filter((result) => result.priority === priority).length

export function createGooglePlacesTestReport(
  request: GooglePlacesTestRequest,
  diagnostics: GooglePlacesNormalizationDiagnostics
): GooglePlacesTestReport {
  const { transientResults, received, accepted, rejected } = diagnostics
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
  const scoredResults = transientResults.map((result, originalIndex) =>
    Object.freeze({
      originalIndex,
      result: analyzeTransientResult(result, request),
    })
  )
  const results = Object.freeze(
    [...scoredResults]
      .sort(
        (left, right) =>
          right.result.flipScore - left.result.flipScore ||
          left.originalIndex - right.originalIndex
      )
      .map(({ result }) => result)
  )
  const criticalCount = countPriority(results, 'CRITICAL')
  const highCount = countPriority(results, 'HIGH')
  const mediumCount = countPriority(results, 'MEDIUM')
  const lowCount = countPriority(results, 'LOW')
  const averageFlipScore =
    accepted === 0
      ? 0
      : Math.round(
          (results.reduce((total, result) => total + result.flipScore, 0) /
            accepted) *
            100
        ) / 100

  const countsAreConsistent =
    received === accepted + rejected &&
    accepted === transientResults.length &&
    uniqueDomains === accepted &&
    dotComDomains + nonDotComDomains === accepted &&
    basicWeakDomainCandidates ===
      transientResults.filter(
        (result) => result.isNonDotCom || result.hasHyphen
      ).length &&
    results.length === accepted &&
    criticalCount + highCount + mediumCount + lowCount === accepted

  if (!countsAreConsistent) throw invalidDiagnostics()

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
    totalAccepted: accepted,
    criticalCount,
    highCount,
    mediumCount,
    lowCount,
    averageFlipScore,
    results,
  })
}

export async function executeGooglePlacesTest(
  request: GooglePlacesTestRequest
): Promise<GooglePlacesTestReport> {
  const provider = new GooglePlacesDiscoveryProvider()
  const response = await provider.search(request)
  const outcome = provider.normalizeWithDiagnostics(response, request)
  return createGooglePlacesTestReport(request, outcome.diagnostics)
}
