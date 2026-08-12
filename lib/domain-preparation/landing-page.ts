import type { PreparationGenerationResult } from './generation.types'
import {
  freezeLandingPageReasons,
  mapLandingPageRenderAsset,
  validateExactExternalSalesUrl,
  validateGeneratedRenderText,
  validateNormalizedRenderHostname,
  validateRenderCurrency,
} from './landing-page.helpers'
import { LANDING_PAGE_V1_SECTION_ORDER } from './landing-page.sections'
import type {
  LandingPageRenderModel,
  LandingPageRenderReason,
} from './landing-page.types'

export const createLandingPageRenderModel = (
  input: PreparationGenerationResult
): LandingPageRenderModel => {
  const hostname = validateNormalizedRenderHostname(input?.hostname)
  const pageTitle = validateGeneratedRenderText(input?.seo?.title)
  const metaDescription = validateGeneratedRenderText(
    input?.seo?.description
  )
  const openGraphTitle = validateGeneratedRenderText(input?.openGraph?.title)
  const openGraphDescription = validateGeneratedRenderText(
    input?.openGraph?.description
  )
  const heroHeadline = validateGeneratedRenderText(
    input?.landingPage?.headline
  )
  const heroDescription = validateGeneratedRenderText(
    input?.landingPage?.description
  )
  const ctaLabel = validateGeneratedRenderText(input?.landingPage?.cta?.label)
  const askingPrice =
    Number.isFinite(input?.landingPage?.askingPrice) &&
    input.landingPage.askingPrice > 0
      ? input.landingPage.askingPrice
      : null
  const currency = validateRenderCurrency(input?.landingPage?.currency)
  const externalSalesUrl = validateExactExternalSalesUrl(
    input?.landingPage?.cta?.externalSalesUrl
  )

  const logo = mapLandingPageRenderAsset(input?.assets?.logo, 'LOGO_PLACEHOLDER')
  const favicon = mapLandingPageRenderAsset(
    input?.assets?.favicon,
    'FAVICON_PLACEHOLDER'
  )
  const openGraphImage = mapLandingPageRenderAsset(
    input?.openGraph?.image,
    'OPEN_GRAPH_IMAGE_PLACEHOLDER'
  )

  const coreReasons: LandingPageRenderReason[] = []
  if (hostname === null) coreReasons.push('HOSTNAME_INVALID')
  if (pageTitle === null) coreReasons.push('PAGE_TITLE_INVALID')
  if (metaDescription === null)
    coreReasons.push('META_DESCRIPTION_INVALID')
  if (openGraphTitle === null)
    coreReasons.push('OPEN_GRAPH_TITLE_INVALID')
  if (openGraphDescription === null)
    coreReasons.push('OPEN_GRAPH_DESCRIPTION_INVALID')
  if (heroHeadline === null) coreReasons.push('HERO_HEADLINE_INVALID')
  if (heroDescription === null)
    coreReasons.push('HERO_DESCRIPTION_INVALID')
  if (askingPrice === null) coreReasons.push('ASKING_PRICE_INVALID')
  if (currency === null) coreReasons.push('CURRENCY_INVALID')
  if (ctaLabel === null) coreReasons.push('CTA_LABEL_INVALID')
  if (externalSalesUrl === null) coreReasons.push('SALES_URL_INVALID')

  const placeholderReasons = [logo.reason, favicon.reason, openGraphImage.reason]
    .filter((reason): reason is LandingPageRenderReason => reason !== null)
  const reasons = freezeLandingPageReasons([
    ...coreReasons,
    ...placeholderReasons,
  ])
  const readinessState =
    coreReasons.length > 0
      ? 'NOT_RENDERABLE'
      : placeholderReasons.length > 0
        ? 'RENDERABLE_WITH_PLACEHOLDERS'
        : 'FULLY_RENDERABLE'

  return Object.freeze({
    hostname,
    pageTitle,
    metaDescription,
    openGraph: Object.freeze({
      title: openGraphTitle,
      description: openGraphDescription,
      image: openGraphImage.asset,
    }),
    favicon: favicon.asset,
    logo: logo.asset,
    hero: Object.freeze({
      headline: heroHeadline,
      description: heroDescription,
    }),
    domainDisplayName: hostname,
    price: Object.freeze({ askingPrice, currency }),
    cta: Object.freeze({ label: ctaLabel, externalSalesUrl }),
    sectionOrder: LANDING_PAGE_V1_SECTION_ORDER,
    readiness: Object.freeze({ state: readinessState, reasons }),
  })
}

export type {
  LandingPageAssetRenderState,
  LandingPageRenderAsset,
  LandingPageRenderInput,
  LandingPageRenderModel,
  LandingPageRenderReadiness,
  LandingPageRenderReason,
  LandingPageSection,
} from './landing-page.types'

