import type {
  BrandDomainClassification,
  BrandDomainComparatorInput,
  BrandDomainComparison,
} from './comparator.types'
import {
  compactTokens,
  containsEveryToken,
  containsOnlyGenericTokens,
  createContextTokenSequences,
  createContiguousTokenSequences,
  findWholeStemSequenceMatches,
  getBrandTokens,
  getDomainStemTokens,
  normalizeComparatorTokens,
} from './comparator.helpers'

const classifyComparison = (
  containsBrandWord: boolean,
  allTokensPresent: boolean,
  containsPrimaryKeyword: boolean,
  containsCity: boolean,
  onlyGenericTokens: boolean
): BrandDomainClassification => {
  if (containsBrandWord && allTokensPresent) return 'BRANDED'
  if (containsBrandWord) return 'PARTIALLY_BRANDED'
  if (containsPrimaryKeyword || containsCity || onlyGenericTokens)
    return 'GENERIC_KEYWORD'
  return 'UNRELATED'
}

export const compareBrandToDomain = (
  input: BrandDomainComparatorInput
): BrandDomainComparison | null => {
  if (!input || typeof input !== 'object' || !input.analysis) return null

  const primaryKeywordTokens = normalizeComparatorTokens(input.primaryKeyword)
  const cityTokens = normalizeComparatorTokens(input.city)
  if (!primaryKeywordTokens || !cityTokens) return null

  const domainTokens = getDomainStemTokens(
    input.analysis.domain.immediateLeftLabel ?? '',
    input.analysis.domain.rightmostLabel
  )
  const domainTokenSet = new Set(domainTokens)
  const businessTokens =
    input.analysis.business.businessTokensWithoutLegalSuffixes
  const brandTokens = getBrandTokens(
    businessTokens,
    primaryKeywordTokens,
    cityTokens
  )
  const compactDomainStem = compactTokens(domainTokens)
  const businessSequenceMatches = findWholeStemSequenceMatches(
    compactDomainStem,
    createContiguousTokenSequences(businessTokens)
  )
  const contextSequenceMatches = findWholeStemSequenceMatches(
    compactDomainStem,
    createContextTokenSequences(primaryKeywordTokens, cityTokens)
  )
  const compactMatchedTokens = new Set(
    [...businessSequenceMatches, ...contextSequenceMatches].flat()
  )
  const containsKnownToken = (token: string) =>
    domainTokenSet.has(token) || compactMatchedTokens.has(token)
  const containsBrandWord = brandTokens.some(containsKnownToken)
  const containsPrimaryKeyword =
    primaryKeywordTokens.length > 0 &&
    primaryKeywordTokens.every(containsKnownToken)
  const containsCity =
    cityTokens.length > 0 && cityTokens.every(containsKnownToken)
  const allTokensPresent =
    containsEveryToken(domainTokenSet, businessTokens) ||
    compactDomainStem === compactTokens(businessTokens)
  const zeroBrandTokens = !containsBrandWord
  const onlyGenericTokens = containsOnlyGenericTokens(
    domainTokens,
    primaryKeywordTokens,
    cityTokens
  ) || (zeroBrandTokens && contextSequenceMatches.length > 0)

  return Object.freeze({
    containsBrandWord,
    containsPrimaryKeyword,
    containsCity,
    allTokensPresent,
    zeroBrandTokens,
    onlyGenericTokens,
    classification: classifyComparison(
      containsBrandWord,
      allTokensPresent,
      containsPrimaryKeyword,
      containsCity,
      onlyGenericTokens
    ),
  })
}

export type {
  BrandDomainClassification,
  BrandDomainComparatorInput,
  BrandDomainComparison,
} from './comparator.types'
