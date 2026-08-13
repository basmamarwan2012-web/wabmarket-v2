import { revalidatePath } from 'next/cache'

import { executeAdminMarketplaceOperation } from '@/infrastructure/mysql/admin-marketplace.composition'
import {
  marketplaceAdminError,
  marketplaceAdminSuccess,
  requireMarketplaceAdminSession,
} from '@/lib/marketplace/admin-api'
import { publishAdminMarketplaceSchema } from '@/lib/marketplace/admin.validation'
import { normalizeMarketplaceRouteHostname } from '@/lib/marketplace/route-hostname'
import { PersistenceError } from '@/lib/persistence/errors'

export const runtime = 'nodejs'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ hostname: string }> }
) {
  try {
    const session = await requireMarketplaceAdminSession(true)
    const hostname = normalizeMarketplaceRouteHostname((await params).hostname)
    if (!hostname) throw new PersistenceError('PERSISTENCE_NOT_FOUND')
    const input = publishAdminMarketplaceSchema.parse(await request.json())
    const data = await executeAdminMarketplaceOperation(session, (service, account) =>
      service.publish(account, hostname, input)
    )
    revalidatePath('/marketplace')
    revalidatePath(`/marketplace/domains/${hostname}`)
    revalidatePath('/admin/marketplace')
    revalidatePath(`/admin/marketplace/domains/${hostname}`)
    return marketplaceAdminSuccess(data, 'Marketplace listing published.')
  } catch (error) {
    return marketplaceAdminError(error)
  }
}
