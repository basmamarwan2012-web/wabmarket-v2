import { executeAdminBrandingOperation } from '@/infrastructure/mysql/admin-assets.composition'
import { normalizeMarketplaceRouteHostname } from '@/lib/marketplace/route-hostname'
import { PersistenceError } from '@/lib/persistence/errors'
import { portfolioAdminError, portfolioAdminSuccess, requirePortfolioAdminSession } from '@/lib/portfolio/admin-api'

export const runtime = 'nodejs'
interface RouteContext { readonly params: Promise<{ hostname: string }> }

export async function POST(_request: Request, context: RouteContext) {
  try {
    const session = await requirePortfolioAdminSession(true)
    const hostname = normalizeMarketplaceRouteHostname((await context.params).hostname)
    if (!hostname) throw new PersistenceError('PERSISTENCE_NOT_FOUND')
    const data = await executeAdminBrandingOperation(session, (service, account) => service.generate(account, { hostname, action: 'GENERATE_ONE', kind: 'LOGO' }))
    return portfolioAdminSuccess(data, 'Logo generated.')
  } catch (error) { return portfolioAdminError(error) }
}
