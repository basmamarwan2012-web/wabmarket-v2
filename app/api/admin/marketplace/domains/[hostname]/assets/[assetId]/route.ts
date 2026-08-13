import { executeAdminAssetOperation } from '@/infrastructure/mysql/admin-assets.composition'
import { marketplaceAdminError, marketplaceAdminSuccess, requireMarketplaceAdminSession } from '@/lib/marketplace/admin-api'
import { normalizeMarketplaceRouteHostname } from '@/lib/marketplace/route-hostname'
import { PersistenceError } from '@/lib/persistence/errors'

export const runtime = 'nodejs'

interface RouteContext { readonly params: Promise<{ hostname: string; assetId: string }> }

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const session = await requireMarketplaceAdminSession(true)
    const { hostname: rawHostname, assetId } = await context.params
    const hostname = normalizeMarketplaceRouteHostname(rawHostname)
    if (!hostname) throw new PersistenceError('PERSISTENCE_NOT_FOUND')
    const data = await executeAdminAssetOperation(session, (service, account) => service.delete(account, { hostname, assetId }))
    return marketplaceAdminSuccess(data, 'Asset deleted.')
  } catch (error) { return marketplaceAdminError(error) }
}
