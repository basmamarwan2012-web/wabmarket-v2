import { redirect } from 'next/navigation'

import { AdminSellingWorkspace } from '@/components/marketplace/admin-selling-workspace'
import { executeAdminMarketplaceOperation } from '@/infrastructure/mysql/admin-marketplace.composition'
import { verifySession } from '@/lib/auth/session'

export default async function AdminMarketplacePage() {
  const session = await verifySession()
  if (!session) redirect('/login')
  const domains = await executeAdminMarketplaceOperation(
    session,
    (service, context) => service.list(context)
  )
  return (
    <div className="space-y-6">
      <header><h1 className="text-2xl font-bold">Marketplace selling workspace</h1><p className="mt-1 text-sm text-gray-500">Domains being prepared or managed for sale.</p></header>
      <AdminSellingWorkspace domains={domains} />
    </div>
  )
}
