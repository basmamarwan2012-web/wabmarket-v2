import { executeAdminMarketplaceOperation } from '@/infrastructure/mysql/admin-marketplace.composition'
import {
  marketplaceAdminError,
  marketplaceAdminSuccess,
  requireMarketplaceAdminSession,
} from '@/lib/marketplace/admin-api'

export const runtime = 'nodejs'

export async function GET() {
  try {
    const session = await requireMarketplaceAdminSession()
    const data = await executeAdminMarketplaceOperation(session, (service, context) =>
      service.list(context)
    )
    return marketplaceAdminSuccess(data)
  } catch (error) {
    return marketplaceAdminError(error)
  }
}
