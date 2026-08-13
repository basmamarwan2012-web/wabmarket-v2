import { getMarketplaceFixtureRecords } from './fixtures'
import type { MarketplacePublicLandingRecord } from './public-landing.types'
import { normalizeMarketplaceRouteHostname } from './route-hostname'

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
export { normalizeMarketplaceRouteHostname } from './route-hostname'
