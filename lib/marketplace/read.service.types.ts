import type {
  MarketplacePublicRecord,
  MarketplaceReadCursor,
  MarketplaceReadPage,
} from './read.repository'

export interface ListPublishedMarketplaceInput {
  readonly limit?: number
  readonly after?: MarketplaceReadCursor | null
}

export interface MarketplaceReadServiceContract {
  listPublished(
    input?: ListPublishedMarketplaceInput
  ): Promise<MarketplaceReadPage>
  resolvePublishedHostname(
    hostname: string
  ): Promise<MarketplacePublicRecord | null>
}

export type {
  MarketplacePublicRecord,
  MarketplaceReadCursor,
  MarketplaceReadPage,
}
