import { executeAdminBrandingOperation } from '@/infrastructure/mysql/admin-assets.composition'
import { DOMAIN_ASSET_KINDS, type DomainAssetKind } from '@/lib/assets/asset-metadata.repository'
import { AssetError } from '@/lib/assets/asset.errors'
import { marketplaceAdminError, marketplaceAdminSuccess, requireMarketplaceAdminSession } from '@/lib/marketplace/admin-api'
import { normalizeMarketplaceRouteHostname } from '@/lib/marketplace/route-hostname'
import { PersistenceError } from '@/lib/persistence/errors'

export const runtime = 'nodejs'
interface RouteContext { readonly params: Promise<{ hostname: string }> }

export async function POST(request: Request, context: RouteContext) {
  try {
    const session = await requireMarketplaceAdminSession(true)
    const hostname = normalizeMarketplaceRouteHostname((await context.params).hostname)
    if (!hostname) throw new PersistenceError('PERSISTENCE_NOT_FOUND')
    const body = await request.json() as unknown
    if (!body || typeof body !== 'object' || !('action' in body)) throw new AssetError('ASSET_INVALID_INPUT')
    const action = body.action
    const kind = 'kind' in body ? body.kind : undefined
    const keys = Object.keys(body)
    if (keys.some((key) => key !== 'action' && key !== 'kind')) throw new AssetError('ASSET_INVALID_INPUT')
    if (action !== 'GENERATE_ONE' && action !== 'GENERATE_MISSING') throw new AssetError('ASSET_INVALID_INPUT')
    if (kind !== undefined && (typeof kind !== 'string' || !DOMAIN_ASSET_KINDS.includes(kind as DomainAssetKind))) throw new AssetError('ASSET_INVALID_INPUT')
    const data = await executeAdminBrandingOperation(session, (service, account) => service.generate(account, { hostname, action, kind: kind as DomainAssetKind | undefined }))
    return marketplaceAdminSuccess(data, 'Branding assets generated.')
  } catch (error) { return marketplaceAdminError(error) }
}
