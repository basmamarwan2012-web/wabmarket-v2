import { revalidatePath } from 'next/cache'

import { executeAdminDomainPreparationOperation } from '@/infrastructure/mysql/admin-domain-preparation.composition'
import { PrepareDomainError } from '@/lib/domain-preparation/prepare-domain.errors'
import {
  marketplaceAdminError,
  marketplaceAdminSuccess,
  requireMarketplaceAdminSession,
} from '@/lib/marketplace/admin-api'
import { prepareAdminMarketplaceDomainSchema } from '@/lib/marketplace/admin.validation'
import { normalizeMarketplaceRouteHostname } from '@/lib/marketplace/route-hostname'

export const runtime = 'nodejs'

interface RouteContext {
  readonly params: Promise<{ hostname: string }>
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const session = await requireMarketplaceAdminSession(true)
    const hostname = normalizeMarketplaceRouteHostname(
      (await context.params).hostname
    )
    if (!hostname)
      throw new PrepareDomainError('PREPARE_DOMAIN_HOSTNAME_INVALID')
    const input = prepareAdminMarketplaceDomainSchema.parse(await request.json())
    const data = await executeAdminDomainPreparationOperation(
      session,
      (service, account) => service.prepare(account, { hostname, ...input })
    )
    revalidatePath('/admin/marketplace')
    revalidatePath(`/admin/marketplace/domains/${hostname}`)
    revalidatePath(`/admin/marketplace/domains/${hostname}/preview`)
    return marketplaceAdminSuccess(data, 'Domain prepared.')
  } catch (error) {
    return marketplaceAdminError(error)
  }
}

