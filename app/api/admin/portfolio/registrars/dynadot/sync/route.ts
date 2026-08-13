import { revalidatePath } from 'next/cache'

import { executeDynadotOwnedDomainSync } from '@/infrastructure/mysql/admin-registrar-sync.composition'
import {
  portfolioAdminError,
  portfolioAdminSuccess,
  requirePortfolioAdminSession,
} from '@/lib/portfolio/admin-api'

export const runtime = 'nodejs'

export async function POST() {
  try {
    const session = await requirePortfolioAdminSession(true)
    const report = await executeDynadotOwnedDomainSync(session)
    revalidatePath('/admin/domains')
    return portfolioAdminSuccess(report, 'Dynadot domains synchronized.')
  } catch (error) {
    return portfolioAdminError(error)
  }
}
