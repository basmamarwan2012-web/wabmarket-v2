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

import type { DomainPreparation } from '@/lib/domain-preparation/preparation.types'
import type { PreparationGenerationResult } from '@/lib/domain-preparation/generation.types'
import type { LandingPageRenderModel } from '@/lib/domain-preparation/landing-page.types'
import { ownedDomains } from './owned-domains'
import { domainAssets } from './domain-assets'

export const domainPreparations = mysqlTable(
  'domain_preparations',
  {
    id: varchar('id', { length: 36 }).primaryKey(),
    ownedDomainId: varchar('owned_domain_id', { length: 36 })
      .notNull()
      .references(() => ownedDomains.id, { onDelete: 'cascade' }),
    hostname: varchar('hostname', { length: 253 }).notNull(),
    ownershipConfirmed: int('ownership_confirmed', { unsigned: true })
      .notNull()
      .default(0),
    readiness: mysqlEnum('readiness', [
      'NOT_READY',
      'READY_FOR_MARKETPLACE',
      'READY_FOR_MARKETING',
    ]).notNull(),
    askingPrice: decimal('asking_price', { precision: 18, scale: 2 }),
    currency: varchar('currency', { length: 3 }),
    externalSalesUrl: varchar('external_sales_url', { length: 2048 }),
    ctaConfigured: int('cta_configured', { unsigned: true })
      .notNull()
      .default(0),
    description: text('description'),
    landingPageReference: varchar('landing_page_reference', { length: 2048 }),
    logoAssetId: varchar('logo_asset_id', { length: 36 }).references(
      () => domainAssets.id,
      { onDelete: 'set null' }
    ),
    faviconAssetId: varchar('favicon_asset_id', { length: 36 }).references(
      () => domainAssets.id,
      { onDelete: 'set null' }
    ),
    openGraphAssetId: varchar('open_graph_asset_id', { length: 36 }).references(
      () => domainAssets.id,
      { onDelete: 'set null' }
    ),
    sourceOpportunityId: varchar('source_opportunity_id', { length: 256 }),
    preparationSnapshot: json('preparation_snapshot')
      .$type<DomainPreparation>()
      .notNull(),
    generationSnapshot: json('generation_snapshot')
      .$type<PreparationGenerationResult>()
      .notNull(),
    landingPageSnapshot: json('landing_page_snapshot')
      .$type<LandingPageRenderModel>()
      .notNull(),
    version: int('version', { unsigned: true }).notNull().default(1),
    createdAt: timestamp('created_at', { mode: 'date', fsp: 3 })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { mode: 'date', fsp: 3 })
      .notNull()
      .defaultNow()
      .onUpdateNow(),
  },
  (table) => [
    uniqueIndex('domain_preparations_owned_domain_uq').on(table.ownedDomainId),
    index('domain_preparations_readiness_idx').on(table.readiness),
  ]
)
