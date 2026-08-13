import type { StoredDomainPreparation } from '@/lib/domain-preparation/preparation.repository'
import type {
  LandingPageRenderAsset,
  LandingPageRenderModel,
} from '@/lib/domain-preparation/landing-page.types'

const privateReference = (
  hostname: string,
  assetId: string | null,
  source: LandingPageRenderAsset
): LandingPageRenderAsset =>
  source.state === 'AVAILABLE' && assetId
    ? Object.freeze({
        state: 'AVAILABLE' as const,
        reference: `/api/admin/marketplace/domains/${encodeURIComponent(hostname)}/assets/${encodeURIComponent(assetId)}/content`,
      })
    : Object.freeze({ state: 'PLACEHOLDER' as const, reference: null })

/** Adapts only private visual references. All content/readiness remains the
 * exact stored canonical render model. */
export const createAdminLandingPreviewModel = (
  stored: StoredDomainPreparation
): LandingPageRenderModel => {
  const model = stored.landingPage
  const hostname = stored.preparation.hostname
  return Object.freeze({
    ...model,
    openGraph: Object.freeze({
      ...model.openGraph,
      image: privateReference(
        hostname,
        stored.assets.openGraphAssetId,
        model.openGraph.image
      ),
    }),
    favicon: privateReference(
      hostname,
      stored.assets.faviconAssetId,
      model.favicon
    ),
    logo: privateReference(
      hostname,
      stored.assets.logoAssetId,
      model.logo
    ),
  })
}

