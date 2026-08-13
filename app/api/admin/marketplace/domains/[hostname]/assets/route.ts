import { executeAdminAssetOperation } from '@/infrastructure/mysql/admin-assets.composition'
import { AssetError } from '@/lib/assets/asset.errors'
import type { DomainAssetKind } from '@/lib/assets/asset-metadata.repository'
import { marketplaceAdminError, marketplaceAdminSuccess, requireMarketplaceAdminSession } from '@/lib/marketplace/admin-api'
import { normalizeMarketplaceRouteHostname } from '@/lib/marketplace/route-hostname'
import { PersistenceError } from '@/lib/persistence/errors'

export const runtime = 'nodejs'

interface RouteContext { readonly params: Promise<{ hostname: string }> }
const kinds = new Set<DomainAssetKind>(['LOGO', 'FAVICON', 'OPEN_GRAPH_IMAGE'])

export async function POST(request: Request, context: RouteContext) {
  try {
    const session = await requireMarketplaceAdminSession(true)
    const hostname = normalizeMarketplaceRouteHostname((await context.params).hostname)
    if (!hostname) throw new PersistenceError('PERSISTENCE_NOT_FOUND')
    const contentLength = Number(request.headers.get('content-length') ?? '0')
    if (!Number.isFinite(contentLength) || contentLength <= 0 || contentLength > 6 * 1024 * 1024) throw new AssetError('ASSET_TOO_LARGE')
    const form = await request.formData()
    const kind = form.get('kind')
    const file = form.get('file')
    if (typeof kind !== 'string' || !kinds.has(kind as DomainAssetKind) || !(file instanceof File)) throw new AssetError('ASSET_INVALID_INPUT')
    const contents = new Uint8Array(await file.arrayBuffer())
    const data = await executeAdminAssetOperation(session, (service, account) => service.upload(account, {
      hostname,
      kind: kind as DomainAssetKind,
      file: { declaredMimeType: file.type, contents },
    }))
    return marketplaceAdminSuccess(data, 'Asset uploaded.')
  } catch (error) { return marketplaceAdminError(error) }
}
