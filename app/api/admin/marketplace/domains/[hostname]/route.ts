import { executeAdminMarketplaceOperation } from '@/infrastructure/mysql/admin-marketplace.composition'
import {
  marketplaceAdminError,
  marketplaceAdminSuccess,
  requireMarketplaceAdminSession,
} from '@/lib/marketplace/admin-api'
import { saveAdminMarketplacePreparationSchema } from '@/lib/marketplace/admin.validation'
import { normalizeMarketplaceRouteHostname } from '@/lib/marketplace/route-hostname'
import { PersistenceError } from '@/lib/persistence/errors'

export const runtime = 'nodejs'

interface RouteContext {
  readonly params: Promise<{ hostname: string }>
}

const hostnameFrom = async (context: RouteContext) => {
  const hostname = normalizeMarketplaceRouteHostname((await context.params).hostname)
  if (!hostname) throw new PersistenceError('PERSISTENCE_NOT_FOUND')
  return hostname
}

export async function GET(_request: Request, context: RouteContext) {
  try {
    const session = await requireMarketplaceAdminSession()
    const hostname = await hostnameFrom(context)
    const data = await executeAdminMarketplaceOperation(session, (service, account) =>
      service.get(account, hostname)
    )
    return marketplaceAdminSuccess(data)
  } catch (error) {
    return marketplaceAdminError(error)
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const session = await requireMarketplaceAdminSession(true)
    const hostname = await hostnameFrom(context)
    const input = saveAdminMarketplacePreparationSchema.parse(await request.json())
    const data = await executeAdminMarketplaceOperation(session, (service, account) =>
      service.save(account, hostname, input)
    )
    return marketplaceAdminSuccess(data, 'Preparation saved.')
  } catch (error) {
    return marketplaceAdminError(error)
  }
}
