import { revalidatePath } from 'next/cache'

import { executeAdminPortfolioOperation } from '@/infrastructure/mysql/admin-portfolio.composition'
import {
  portfolioAdminError,
  portfolioAdminSuccess,
  requirePortfolioAdminSession,
} from '@/lib/portfolio/admin-api'
import { createAdminPortfolioDomainSchema } from '@/lib/portfolio/admin.validation'

export const runtime = 'nodejs'

export async function GET() {
  try {
    const session = await requirePortfolioAdminSession()
    const data = await executeAdminPortfolioOperation(
      session,
      (service, context) => service.list(context)
    )
    return portfolioAdminSuccess(data)
  } catch (error) {
    return portfolioAdminError(error)
  }
}

export async function POST(request: Request) {
  try {
    const session = await requirePortfolioAdminSession(true)
    const input = createAdminPortfolioDomainSchema.parse(await request.json())
    const data = await executeAdminPortfolioOperation(
      session,
      (service, context) => service.create(context, input)
    )
    revalidatePath('/admin/domains')
    return portfolioAdminSuccess(data, 'Owned domain added.')
  } catch (error) {
    return portfolioAdminError(error)
  }
}
