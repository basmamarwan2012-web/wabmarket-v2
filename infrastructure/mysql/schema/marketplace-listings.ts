import {
  decimal,
  index,
  int,
  json,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from 'drizzle-orm/mysql-core'

import type { LandingPageRenderModel } from '@/lib/domain-preparation/landing-page.types'
import type {
  MarketplaceListingAsset,
  MarketplacePublicationReason,
} from '@/lib/marketplace/listing.types'
import { ownedDomains } from './owned-domains'
import { domainPreparations } from './domain-preparations'

export interface PublicListingSnapshot {
  readonly listingId: string
  readonly hostname: string
  readonly displayName: string
  readonly askingPrice: number
  readonly currency: string
  readonly description: string
  readonly logo: MarketplaceListingAsset
  readonly favicon: MarketplaceListingAsset
  readonly openGraphImage: MarketplaceListingAsset
  readonly landingPageReference: string | null
  readonly externalSalesUrl: string
  readonly externalSalesCtaLabel: string
}

export const marketplaceListings = mysqlTable(
  'marketplace_listings',
  {
    listingId: varchar('listing_id', { length: 72 }).primaryKey(),
    ownedDomainId: varchar('owned_domain_id', { length: 36 })
      .notNull()
      .references(() => ownedDomains.id, { onDelete: 'cascade' }),
    preparationId: varchar('preparation_id', { length: 36 })
      .notNull()
      .references(() => domainPreparations.id, { onDelete: 'restrict' }),
    normalizedHostname: varchar('normalized_hostname', { length: 253 }).notNull(),
    /** Non-null only while PUBLISHED; unique enforces one live public hostname. */
    publishedHostname: varchar('published_hostname', { length: 253 }),
    publicationState: mysqlEnum('publication_state', [
      'DRAFT',
      'PUBLISHED',
      'UNPUBLISHED',
    ])
      .notNull()
      .default('DRAFT'),
    eligibilityState: mysqlEnum('eligibility_state', [
      'NOT_ELIGIBLE',
      'ELIGIBLE_WITH_PLACEHOLDERS',
      'ELIGIBLE',
    ]).notNull(),
    eligibilityReasons: json('eligibility_reasons')
      .$type<readonly MarketplacePublicationReason[]>()
      .notNull(),
    displayName: varchar('display_name', { length: 253 }).notNull(),
    askingPrice: decimal('asking_price', { precision: 18, scale: 2 }).notNull(),
    currency: varchar('currency', { length: 3 }).notNull(),
    description: text('description').notNull(),
    landingPageReference: varchar('landing_page_reference', { length: 2048 }),
    externalSalesUrl: varchar('external_sales_url', { length: 2048 }).notNull(),
    externalSalesCtaLabel: varchar('external_sales_cta_label', { length: 255 })
      .notNull(),
    publicSnapshot: json('public_snapshot').$type<PublicListingSnapshot>().notNull(),
    landingPageSnapshot: json('landing_page_snapshot')
      .$type<LandingPageRenderModel>()
      .notNull(),
    version: int('version', { unsigned: true }).notNull().default(1),
    publishedAt: timestamp('published_at', { mode: 'date', fsp: 3 }),
    unpublishedAt: timestamp('unpublished_at', { mode: 'date', fsp: 3 }),
    createdAt: timestamp('created_at', { mode: 'date', fsp: 3 })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { mode: 'date', fsp: 3 })
      .notNull()
      .defaultNow()
      .onUpdateNow(),
  },
  (table) => [
    uniqueIndex('marketplace_listings_owned_domain_uq').on(table.ownedDomainId),
    uniqueIndex('marketplace_listings_published_hostname_uq').on(
      table.publishedHostname
    ),
    index('marketplace_listings_state_hostname_idx').on(
      table.publicationState,
      table.normalizedHostname
    ),
  ]
)
