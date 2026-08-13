import { executeAdminMarketplaceOperation } from '@/infrastructure/mysql/admin-marketplace.composition'
import {
  marketplaceAdminError,
  marketplaceAdminSuccess,
  requireMarketplaceAdminSession,
} from '@/lib/marketplace/admin-api'
import { createAdminOwnedDomainSchema } from '@/lib/marketplace/admin.validation'
import { revalidatePath } from 'next/cache'

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

export async function POST(request: Request) {
  try {
    const session = await requireMarketplaceAdminSession(true)
    const input = createAdminOwnedDomainSchema.parse(await request.json())
    const data = await executeAdminMarketplaceOperation(
      session,
      (service, context) => service.createOwnedDomain(context, input)
    )
    revalidatePath('/admin/marketplace')
    return marketplaceAdminSuccess(data, 'Owned domain added.')
  } catch (error) {
    return marketplaceAdminError(error)
  }
}
