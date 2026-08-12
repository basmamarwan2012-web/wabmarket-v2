import type { LandingPageRenderModel } from '@/lib/domain-preparation/landing-page.types'
import type { PersistenceAccountContext } from '@/lib/persistence/context'
import type { MarketplaceListing } from './listing.types'

export const MARKETPLACE_PUBLICATION_STATES = Object.freeze([
  'DRAFT',
  'PUBLISHED',
  'UNPUBLISHED',
] as const)
export type MarketplacePublicationState =
  (typeof MARKETPLACE_PUBLICATION_STATES)[number]

export interface MarketplacePublicationWrite {
  readonly ownedDomainId: string
  readonly listing: MarketplaceListing
  readonly landingPage: LandingPageRenderModel
  /** null creates the first record; replacements require the current version. */
  readonly expectedVersion: number | null
}

export interface MarketplacePublicationRecord {
  readonly listingId: string
  readonly ownedDomainId: string
  readonly hostname: string
  readonly eligibility: MarketplaceListing['publication']
  readonly state: MarketplacePublicationState
  readonly version: number
  readonly publishedAt: string | null
  readonly unpublishedAt: string | null
  readonly createdAt: string
  readonly updatedAt: string
}

export interface MarketplacePublicationRepository {
  saveDraft(
    context: PersistenceAccountContext,
    input: MarketplacePublicationWrite
  ): Promise<MarketplacePublicationRecord>
  publish(
    context: PersistenceAccountContext,
    input: MarketplacePublicationWrite
  ): Promise<MarketplacePublicationRecord>
  unpublish(
    context: PersistenceAccountContext,
    listingId: string,
    expectedVersion: number
  ): Promise<MarketplacePublicationRecord>
}
