import { executeAdminAssetOperation } from '@/infrastructure/mysql/admin-assets.composition'
import { AssetError } from '@/lib/assets/asset.errors'
import { normalizeMarketplaceRouteHostname } from '@/lib/marketplace/route-hostname'
import { PersistenceError } from '@/lib/persistence/errors'
import { portfolioAdminError, portfolioAdminSuccess, requirePortfolioAdminSession } from '@/lib/portfolio/admin-api'

export const runtime = 'nodejs'
interface RouteContext { readonly params: Promise<{ hostname: string }> }

export async function POST(request: Request, context: RouteContext) {
  try {
    const session = await requirePortfolioAdminSession(true)
    const hostname = normalizeMarketplaceRouteHostname((await context.params).hostname)
    if (!hostname) throw new PersistenceError('PERSISTENCE_NOT_FOUND')
    const contentLength = Number(request.headers.get('content-length') ?? '0')
    if (!Number.isFinite(contentLength) || contentLength <= 0 || contentLength > 6 * 1024 * 1024) throw new AssetError('ASSET_TOO_LARGE')
    const form = await request.formData()
    const file = form.get('file')
    if (!(file instanceof File)) throw new AssetError('ASSET_INVALID_INPUT')
    const contents = new Uint8Array(await file.arrayBuffer())
    const data = await executeAdminAssetOperation(session, (service, account) => service.upload(account, { hostname, kind: 'LOGO', file: { declaredMimeType: file.type, contents } }))
    return portfolioAdminSuccess(data, 'Logo uploaded.')
  } catch (error) { return portfolioAdminError(error) }
}
