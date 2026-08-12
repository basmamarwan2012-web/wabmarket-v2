export const DOMAIN_PREPARATION_READINESS_STATES = Object.freeze([
  'NOT_READY',
  'READY_FOR_MARKETPLACE',
  'READY_FOR_MARKETING',
] as const)

export type DomainPreparationReadiness =
  (typeof DOMAIN_PREPARATION_READINESS_STATES)[number]

export const DOMAIN_PREPARATION_REQUIREMENTS = Object.freeze([
  'OWNERSHIP_NOT_CONFIRMED',
  'LOGO_MISSING',
  'FAVICON_MISSING',
  'DESCRIPTION_MISSING',
  'ASKING_PRICE_MISSING',
  'CURRENCY_MISSING',
  'LANDING_PAGE_MISSING',
  'SALES_URL_MISSING',
  'SALES_URL_INVALID',
  'CTA_NOT_CONFIGURED',
] as const)

export type DomainPreparationRequirement =
  (typeof DOMAIN_PREPARATION_REQUIREMENTS)[number]

export interface PreparationAssetFact {
  readonly present: boolean
  readonly reference: string | null
}

export interface PreparationDescriptionFact {
  readonly present: boolean
  readonly contentOrReference: string | null
}

export interface PreparationSalesFact {
  /** Intended resale price, never acquisition cost or acquisition budget. */
  readonly askingPrice: number | null
  readonly currency: string | null
  /** Explicit external destination only; Wabmarket never constructs this URL. */
  readonly externalSalesUrl: string | null
  readonly ctaConfigured: boolean
}

export interface DomainPreparationFacts {
  readonly logo: PreparationAssetFact
  readonly favicon: PreparationAssetFact
  readonly description: PreparationDescriptionFact
  readonly landingPage: PreparationAssetFact
  readonly sales: PreparationSalesFact
}

export interface DomainPreparationChecklistResult {
  readonly readiness: DomainPreparationReadiness
  readonly missingRequirements: readonly DomainPreparationRequirement[]
}

export interface DomainPreparation {
  readonly hostname: string
  /** Explicit upstream confirmation; never inferred from Portfolio or Opportunity. */
  readonly ownershipConfirmed: boolean
  /** Optional discovery provenance only; it does not prove ownership. */
  readonly sourceOpportunityId: string | null
  readonly preparation: DomainPreparationFacts
  readonly readiness: DomainPreparationChecklistResult
}

export interface DomainPreparationInput {
  readonly hostname: string
  readonly ownershipConfirmed: boolean
  readonly sourceOpportunityId?: string | null
  readonly preparation: DomainPreparationFacts
}

