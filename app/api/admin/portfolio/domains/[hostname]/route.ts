import { revalidatePath } from 'next/cache'

import { executeAdminPortfolioOperation } from '@/infrastructure/mysql/admin-portfolio.composition'
import { normalizeMarketplaceRouteHostname } from '@/lib/marketplace/route-hostname'
import { PersistenceError } from '@/lib/persistence/errors'
import {
  portfolioAdminError,
  portfolioAdminSuccess,
  requirePortfolioAdminSession,
} from '@/lib/portfolio/admin-api'

export const runtime = 'nodejs'

interface RouteContext {
  readonly params: Promise<{ hostname: string }>
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const session = await requirePortfolioAdminSession(true)
    const hostname = normalizeMarketplaceRouteHostname(
      (await context.params).hostname
    )
    if (!hostname) throw new PersistenceError('PERSISTENCE_NOT_FOUND')
    const data = await executeAdminPortfolioOperation(
      session,
      (service, account) => service.delete(account, hostname)
    )
    revalidatePath('/admin/domains')
    return portfolioAdminSuccess(data, 'Owned domain deleted.')
  } catch (error) {
    return portfolioAdminError(error)
  }
}
