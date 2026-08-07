import type { DomainOpportunityAnalysis } from './analyzer.types'
import type {
  BrandDomainClassification,
  BrandDomainComparison,
} from './comparator.types'
import type { BrandAlignmentSignals } from './signals.types'

export const createBrandAlignmentSignals = (
  classification: BrandDomainClassification
): BrandAlignmentSignals =>
  Object.freeze({
    branded: classification === 'BRANDED',
    partiallyBranded: classification === 'PARTIALLY_BRANDED',
    genericKeyword: classification === 'GENERIC_KEYWORD',
    unrelated: classification === 'UNRELATED',
  })

export const isCompactBrandDomain = (
  analysis: DomainOpportunityAnalysis,
  comparison: BrandDomainComparison
) => {
  const brandAligned =
    comparison.classification === 'BRANDED' ||
    comparison.classification === 'PARTIALLY_BRANDED'
  if (!brandAligned || !comparison.containsBrandWord) return false

  const domainTokens = analysis.domain.domainTokens
  if (domainTokens.length !== 1) return false

  const compactToken = domainTokens[0]
  return !analysis.business.businessTokensWithoutLegalSuffixes.includes(
    compactToken
  )
}

export const isKeywordOnlyDomain = (comparison: BrandDomainComparison) =>
  comparison.containsPrimaryKeyword &&
  !comparison.containsBrandWord &&
  !comparison.containsCity

export const isCityOnlyDomain = (comparison: BrandDomainComparison) =>
  comparison.containsCity &&
  !comparison.containsBrandWord &&
  !comparison.containsPrimaryKeyword
