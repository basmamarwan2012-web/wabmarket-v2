import { revalidatePath } from 'next/cache'

import { executeAdminMarketplaceOperation } from '@/infrastructure/mysql/admin-marketplace.composition'
import {
  marketplaceAdminError,
  marketplaceAdminSuccess,
  requireMarketplaceAdminSession,
} from '@/lib/marketplace/admin-api'
import { unpublishAdminMarketplaceSchema } from '@/lib/marketplace/admin.validation'
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
    const input = unpublishAdminMarketplaceSchema.parse(await request.json())
    const data = await executeAdminMarketplaceOperation(session, async (service, account) => {
      const detail = await service.get(account, hostname)
      if (detail.listingId !== input.listingId)
        throw new PersistenceError('PERSISTENCE_NOT_FOUND')
      return service.unpublish(account, input)
    })
    revalidatePath('/marketplace')
    revalidatePath(`/marketplace/domains/${hostname}`)
    revalidatePath('/admin/marketplace')
    revalidatePath(`/admin/marketplace/domains/${hostname}`)
    return marketplaceAdminSuccess(data, 'Marketplace listing unpublished.')
  } catch (error) {
    return marketplaceAdminError(error)
  }
}
