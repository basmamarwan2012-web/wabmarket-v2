import 'server-only'

import { and, eq } from 'drizzle-orm'

import type { PublicAssetRepository } from '@/lib/assets/public-asset.repository'
import type { WabmarketMySqlDatabase } from '../client'
import { domainAssets, marketplaceListings } from '../schema'

export class MySqlPublicAssetRepository implements PublicAssetRepository {
  constructor(private readonly database: WabmarketMySqlDatabase) {}

  async findPublishedReference(assetId: string) {
    const publicReference = `/media/domain-assets/${assetId}`
    const rows = await this.database.select({
      kind: domainAssets.kind,
      storageKey: domainAssets.storageKey,
      mimeType: domainAssets.mimeType,
      byteSize: domainAssets.byteSize,
      checksum: domainAssets.checksum,
      snapshot: marketplaceListings.publicSnapshot,
    }).from(domainAssets).innerJoin(
      marketplaceListings,
      eq(marketplaceListings.ownedDomainId, domainAssets.ownedDomainId)
    ).where(and(
      eq(domainAssets.id, assetId),
      eq(domainAssets.status, 'AVAILABLE'),
      eq(domainAssets.publicReference, publicReference),
      eq(marketplaceListings.publicationState, 'PUBLISHED')
    ))
    const row = rows.find(({ snapshot }) =>
      [snapshot.logo, snapshot.favicon, snapshot.openGraphImage].some(
        (asset) => asset.state === 'AVAILABLE' && asset.reference === publicReference
      )
    )
    return row ? Object.freeze({ kind: row.kind, storageKey: row.storageKey, mimeType: row.mimeType, byteSize: row.byteSize, checksum: row.checksum }) : null
  }
}
