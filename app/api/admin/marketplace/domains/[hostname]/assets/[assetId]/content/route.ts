import { executeAdminPrivateAssetOperation } from '@/infrastructure/mysql/admin-assets.composition'
import {
  marketplaceAdminError,
  requireMarketplaceAdminSession,
} from '@/lib/marketplace/admin-api'
import { normalizeMarketplaceRouteHostname } from '@/lib/marketplace/route-hostname'
import { PersistenceError } from '@/lib/persistence/errors'

export const runtime = 'nodejs'

interface RouteContext {
  readonly params: Promise<{ hostname: string; assetId: string }>
}

export async function GET(_request: Request, context: RouteContext) {
  try {
    const session = await requireMarketplaceAdminSession()
    const { hostname: rawHostname, assetId } = await context.params
    const hostname = normalizeMarketplaceRouteHostname(rawHostname)
    if (!hostname) throw new PersistenceError('PERSISTENCE_NOT_FOUND')
    const asset = await executeAdminPrivateAssetOperation(
      session,
      (service, account) => service.resolve(account, { hostname, assetId })
    )
    if (!asset) return new Response(null, { status: 404 })
    return new Response(Buffer.from(asset.contents), {
      headers: {
        'Content-Type': asset.mimeType,
        'Content-Length': String(asset.byteSize),
        'Cache-Control': 'private, no-store',
        'X-Content-Type-Options': 'nosniff',
      },
    })
  } catch (error) {
    return marketplaceAdminError(error)
  }
}
