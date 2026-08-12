import { createHash } from 'node:crypto'

import { normalizeHostname } from '../domain-analysis/analyzer.helpers'
import {
  normalizeExternalSalesUrl,
  normalizePreparationCurrency,
} from '../domain-preparation/preparation.helpers'
import type { LandingPageRenderAsset } from '../domain-preparation/landing-page.types'
import type {
  MarketplaceListingAsset,
  MarketplaceListingInput,
} from './listing.types'

const MAXIMUM_PUBLIC_TEXT_LENGTH = 20_000

const encodeIdentityParts = (parts: readonly string[]) =>
  parts.map((part) => `${part.length}:${part}`).join('|')

export const createMarketplaceListingId = (hostname: string) => {
  const canonicalTuple = encodeIdentityParts([
    'marketplace-listing:v1',
    hostname,
  ])
  return `listing_${createHash('sha256')
    .update(canonicalTuple, 'utf8')
    .digest('hex')}`
}

export const normalizeMarketplacePublicText = (value: unknown) => {
  if (typeof value !== 'string') return null
  const normalized = value.normalize('NFKC').trim().replace(/\s+/g, ' ')
  return normalized.length > 0 &&
    normalized.length <= MAXIMUM_PUBLIC_TEXT_LENGTH
    ? normalized
    : null
}

export const normalizeLandingPageReference = (
  value: unknown
): Readonly<{
  status: 'MISSING' | 'INVALID' | 'VALID'
  reference: string | null
}> => {
  if (value === null || value === undefined || value === '')
    return Object.freeze({ status: 'MISSING', reference: null })
  if (typeof value !== 'string')
    return Object.freeze({ status: 'INVALID', reference: null })

  const marketplacePrefix = '/marketplace/domains/'
  if (value.startsWith(marketplacePrefix)) {
    const hostnameSegment = value.slice(marketplacePrefix.length)
    const normalizedHostname = normalizeHostname(hostnameSegment)
    const validInternalReference =
      hostnameSegment.length > 0 &&
      !hostnameSegment.includes('/') &&
      !hostnameSegment.includes('?') &&
      !hostnameSegment.includes('#') &&
      !hostnameSegment.includes('%') &&
      normalizedHostname !== null &&
      normalizedHostname === hostnameSegment

    return validInternalReference
      ? Object.freeze({ status: 'VALID', reference: value })
      : Object.freeze({ status: 'INVALID', reference: null })
  }

  if (value.startsWith('/') || value.startsWith('//'))
    return Object.freeze({ status: 'INVALID', reference: null })

  const validated = normalizeExternalSalesUrl(value)
  return validated.status === 'VALID' && validated.value === value
    ? Object.freeze({ status: 'VALID', reference: value })
    : Object.freeze({ status: 'INVALID', reference: null })
}

export const freezeMarketplaceListingAsset = (
  asset: LandingPageRenderAsset
): MarketplaceListingAsset | null => {
  if (
    asset?.state === 'AVAILABLE' &&
    typeof asset.reference === 'string' &&
    asset.reference.length > 0
  )
    return Object.freeze({ state: 'AVAILABLE', reference: asset.reference })
  if (asset?.state === 'PLACEHOLDER' && asset.reference === null)
    return Object.freeze({ state: 'PLACEHOLDER', reference: null })
  return null
}

export interface NormalizedMarketplaceListingProjection {
  readonly hostname: string
  readonly displayName: string
  readonly askingPrice: number
  readonly currency: string
  readonly description: string
  readonly logo: MarketplaceListingAsset
  readonly favicon: MarketplaceListingAsset
  readonly openGraphImage: MarketplaceListingAsset
  readonly landingPageReference: string | null
  readonly landingPageReferenceStatus: 'MISSING' | 'INVALID' | 'VALID'
  readonly externalSalesUrl: string
  readonly externalSalesCtaLabel: string
  readonly sourcePreparationOpportunityId: string | null
  readonly upstreamFactsMatch: boolean
  readonly visualAssetsComplete: boolean
}

export const normalizeMarketplaceListingProjection = (
  input: MarketplaceListingInput
): NormalizedMarketplaceListingProjection | null => {
  if (
    !input ||
    typeof input !== 'object' ||
    !input.preparation ||
    !input.generation ||
    !input.landingPage
  )
    return null

  const hostname = normalizeHostname(input.landingPage.hostname)
  const displayName = normalizeMarketplacePublicText(
    input.landingPage.domainDisplayName
  )
  const description = normalizeMarketplacePublicText(input.generation.description?.value)
  const ctaLabel = normalizeMarketplacePublicText(input.landingPage.cta?.label)
  const currency = normalizePreparationCurrency(input.landingPage.price?.currency)
  const externalSalesUrl = normalizeExternalSalesUrl(
    input.landingPage.cta?.externalSalesUrl
  )
  const logo = freezeMarketplaceListingAsset(input.landingPage.logo)
  const favicon = freezeMarketplaceListingAsset(input.landingPage.favicon)
  const openGraphImage = freezeMarketplaceListingAsset(
    input.landingPage.openGraph?.image
  )
  const landingPageReference = normalizeLandingPageReference(
    input.landingPageReference
  )
  const askingPrice = input.landingPage.price?.askingPrice

  if (
    hostname === null ||
    input.landingPage.hostname !== hostname ||
    displayName === null ||
    description === null ||
    ctaLabel === null ||
    currency === null ||
    currency === undefined ||
    typeof askingPrice !== 'number' ||
    !Number.isFinite(askingPrice) ||
    askingPrice <= 0 ||
    externalSalesUrl.status !== 'VALID' ||
    externalSalesUrl.value === null ||
    externalSalesUrl.value !== input.landingPage.cta.externalSalesUrl ||
    logo === null ||
    favicon === null ||
    openGraphImage === null
  )
    return null

  const preparationSales = input.preparation.preparation?.sales
  const generationSales = input.generation.landingPage
  const upstreamFactsMatch =
    input.preparation.hostname === hostname &&
    input.generation.hostname === hostname &&
    input.landingPage.domainDisplayName === hostname &&
    preparationSales?.askingPrice === askingPrice &&
    generationSales?.askingPrice === askingPrice &&
    preparationSales?.currency === currency &&
    generationSales?.currency === currency &&
    preparationSales?.externalSalesUrl === externalSalesUrl.value &&
    generationSales?.cta?.externalSalesUrl === externalSalesUrl.value &&
    input.generation.description.value === input.landingPage.hero.description &&
    input.generation.landingPage.cta.label.value === ctaLabel

  return Object.freeze({
    hostname,
    displayName,
    askingPrice,
    currency,
    description,
    logo,
    favicon,
    openGraphImage,
    landingPageReference: landingPageReference.reference,
    landingPageReferenceStatus: landingPageReference.status,
    externalSalesUrl: externalSalesUrl.value,
    externalSalesCtaLabel: ctaLabel,
    sourcePreparationOpportunityId:
      input.preparation.sourceOpportunityId ?? null,
    upstreamFactsMatch,
    visualAssetsComplete:
      logo.state === 'AVAILABLE' &&
      favicon.state === 'AVAILABLE' &&
      openGraphImage.state === 'AVAILABLE',
  })
}
