import { revalidatePath } from 'next/cache'

import { executeDynadotOwnedDomainSync } from '@/infrastructure/mysql/admin-registrar-sync.composition'
import {
  marketplaceAdminError,
  marketplaceAdminSuccess,
  requireMarketplaceAdminSession,
} from '@/lib/marketplace/admin-api'

export const runtime = 'nodejs'

export async function POST() {
  try {
    const session = await requireMarketplaceAdminSession(true)
    const report = await executeDynadotOwnedDomainSync(session)
    revalidatePath('/admin/marketplace')
    return marketplaceAdminSuccess(report, 'Dynadot domains synchronized.')
  } catch (error) {
    return marketplaceAdminError(error)
  }
}
