import { normalizeHostname } from '../domain-analysis/analyzer.helpers'
import { getMarketplaceFixtureRecords } from './fixtures'
import type { MarketplacePublicLandingRecord } from './public-landing.types'

export const normalizeMarketplaceRouteHostname = (value: unknown) => {
  if (typeof value !== 'string') return null
  let decoded: string
  try {
    decoded = decodeURIComponent(value)
  } catch {
    return null
  }

  const normalized = normalizeHostname(decoded)
  return normalized !== null && normalized === decoded.toLowerCase()
    ? normalized
    : null
}

export const resolveMarketplacePublicLanding = (
  routeHostname: unknown
): MarketplacePublicLandingRecord | null => {
  const hostname = normalizeMarketplaceRouteHostname(routeHostname)
  if (!hostname) return null

  const record = getMarketplaceFixtureRecords().find(
    (fixture) => fixture.hostname === hostname
  )
  if (
    !record ||
    record.listing.publication.state !== 'ELIGIBLE' ||
    record.landingPage.readiness.state === 'NOT_RENDERABLE'
  )
    return null

  return record
}

export type { MarketplacePublicLandingRecord } from './public-landing.types'

