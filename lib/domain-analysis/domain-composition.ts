import {
  CONTROLLED_DOMAIN_BUSINESS_TERMS,
  containsTokenSequence,
  countTokenSequence,
  getCompositionDomainStemTokens,
  hasRepeatedKnownToken,
  isControlledCompactBusinessDomain,
  normalizeCompositionContextTokens,
  recognizeControlledDomainTokens,
} from './domain-composition.helpers'
import type {
  DomainCompositionInput,
  DomainCompositionIntelligence,
} from './domain-composition.types'

export const analyzeDomainComposition = (
  input: DomainCompositionInput
): DomainCompositionIntelligence | null => {
  if (!input || typeof input !== 'object' || !input.analysis) return null

  const primaryKeywordTokens = normalizeCompositionContextTokens(
    input.primaryKeyword
  )
  const cityTokens = normalizeCompositionContextTokens(input.city)
  if (!primaryKeywordTokens || !cityTokens) return null

  const businessTokens =
    input.analysis.business.businessTokensWithoutLegalSuffixes
  const allBusinessTokens = input.analysis.business.businessTokens
  const domainStemTokens = getCompositionDomainStemTokens(
    input.analysis.domain.immediateLeftLabel ?? '',
    input.analysis.domain.rightmostLabel
  )
  const vocabulary = Object.freeze([
    ...new Set([
      ...allBusinessTokens,
      ...primaryKeywordTokens,
      ...cityTokens,
      ...CONTROLLED_DOMAIN_BUSINESS_TERMS,
    ]),
  ])
  const recognizedTokens = recognizeControlledDomainTokens(
    domainStemTokens,
    vocabulary
  )
  const containsPrimaryKeyword = containsTokenSequence(
    recognizedTokens,
    primaryKeywordTokens
  )
  const containsCity = containsTokenSequence(recognizedTokens, cityTokens)
  const repeatedKeyword =
    countTokenSequence(recognizedTokens, primaryKeywordTokens) > 1
  const repeatedCity = countTokenSequence(recognizedTokens, cityTokens) > 1
  const repeatedBusinessToken = hasRepeatedKnownToken(
    recognizedTokens,
    businessTokens
  )
  const compactStem = domainStemTokens.join('')

  return Object.freeze({
    businessTerms: Object.freeze({
      containsLLC: recognizedTokens.includes('llc'),
      containsINC: recognizedTokens.includes('inc'),
      containsCORP: recognizedTokens.includes('corp'),
      containsCOMPANY: recognizedTokens.includes('company'),
      containsCO: recognizedTokens.includes('co'),
    }),
    keywordComposition: Object.freeze({
      containsPrimaryKeyword,
      containsCity,
    }),
    structure: Object.freeze({
      repeatedKeyword,
      repeatedCity,
      repeatedBusinessToken,
    }),
    domainStyle: Object.freeze({
      compactBrandDomain: isControlledCompactBusinessDomain(
        compactStem,
        domainStemTokens,
        businessTokens
      ),
      keywordStuffedDomain: repeatedKeyword,
    }),
  })
}

export type {
  DomainBusinessTermFacts,
  DomainCompositionInput,
  DomainCompositionIntelligence,
  DomainKeywordCompositionFacts,
  DomainStructureFacts,
  DomainStyleFacts,
} from './domain-composition.types'
