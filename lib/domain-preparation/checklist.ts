import type { NormalizedDomainPreparationInput } from './preparation.helpers'
import type {
  DomainPreparationChecklistResult,
  DomainPreparationReadiness,
  DomainPreparationRequirement,
} from './preparation.types'

/** V1 marketplace requirements, kept separate from future marketing criteria. */
export const MARKETPLACE_PREPARATION_REQUIREMENTS = Object.freeze([
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
] as const satisfies readonly DomainPreparationRequirement[])

/** V1 has no additional marketing-only requirements. */
export const MARKETING_PREPARATION_REQUIREMENTS = Object.freeze(
  [] as const satisfies readonly DomainPreparationRequirement[]
)

const REQUIREMENT_ORDER: Readonly<
  Record<DomainPreparationRequirement, number>
> = Object.freeze(
  Object.fromEntries(
    MARKETPLACE_PREPARATION_REQUIREMENTS.map((requirement, index) => [
      requirement,
      index,
    ])
  ) as Record<DomainPreparationRequirement, number>
)

export const resolveDomainPreparationReadiness = (
  marketplaceMissing: readonly DomainPreparationRequirement[],
  marketingMissing: readonly DomainPreparationRequirement[]
): DomainPreparationReadiness => {
  if (marketplaceMissing.length > 0) return 'NOT_READY'
  if (marketingMissing.length > 0) return 'READY_FOR_MARKETPLACE'
  return 'READY_FOR_MARKETING'
}

export const evaluateDomainPreparationChecklist = (
  input: NormalizedDomainPreparationInput
): DomainPreparationChecklistResult => {
  const marketplaceMissing: DomainPreparationRequirement[] = []
  const facts = input.preparation

  if (!input.ownershipConfirmed)
    marketplaceMissing.push('OWNERSHIP_NOT_CONFIRMED')
  if (!facts.logo.present) marketplaceMissing.push('LOGO_MISSING')
  if (!facts.favicon.present) marketplaceMissing.push('FAVICON_MISSING')
  if (!facts.description.present)
    marketplaceMissing.push('DESCRIPTION_MISSING')
  if (facts.sales.askingPrice === null)
    marketplaceMissing.push('ASKING_PRICE_MISSING')
  if (facts.sales.currency === null)
    marketplaceMissing.push('CURRENCY_MISSING')
  if (!facts.landingPage.present)
    marketplaceMissing.push('LANDING_PAGE_MISSING')
  if (input.externalSalesUrlStatus === 'MISSING')
    marketplaceMissing.push('SALES_URL_MISSING')
  if (input.externalSalesUrlStatus === 'INVALID')
    marketplaceMissing.push('SALES_URL_INVALID')
  if (!facts.sales.ctaConfigured)
    marketplaceMissing.push('CTA_NOT_CONFIGURED')

  const marketingMissing: DomainPreparationRequirement[] = []
  const missingRequirements = Object.freeze(
    [...marketplaceMissing, ...marketingMissing].sort(
      (left, right) => REQUIREMENT_ORDER[left] - REQUIREMENT_ORDER[right]
    )
  )

  return Object.freeze({
    readiness: resolveDomainPreparationReadiness(
      marketplaceMissing,
      marketingMissing
    ),
    missingRequirements,
  })
}

