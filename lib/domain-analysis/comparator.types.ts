import type { DomainOpportunityAnalysis } from './analyzer.types'

export const BRAND_DOMAIN_CLASSIFICATIONS = Object.freeze([
  'BRANDED',
  'PARTIALLY_BRANDED',
  'GENERIC_KEYWORD',
  'UNRELATED',
] as const)

export type BrandDomainClassification =
  (typeof BRAND_DOMAIN_CLASSIFICATIONS)[number]

export interface BrandDomainComparatorInput {
  readonly analysis: DomainOpportunityAnalysis
  readonly primaryKeyword: string
  readonly city: string
}

export interface BrandDomainComparison {
  readonly containsBrandWord: boolean
  readonly containsPrimaryKeyword: boolean
  readonly containsCity: boolean
  readonly allTokensPresent: boolean
  readonly zeroBrandTokens: boolean
  readonly onlyGenericTokens: boolean
  readonly classification: BrandDomainClassification
}
