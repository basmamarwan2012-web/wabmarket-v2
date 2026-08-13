import { redirect } from 'next/navigation'

import { AdminOwnedDomainManager } from '@/components/marketplace/admin-owned-domain-manager'
import { executeAdminMarketplaceOperation } from '@/infrastructure/mysql/admin-marketplace.composition'
import { hasPermission } from '@/lib/auth/permissions'
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
      <header><h1 className="text-2xl font-bold">Marketplace operations</h1><p className="mt-1 text-sm text-gray-500">Manage owned domains, preparation, and publication.</p></header>
      <AdminOwnedDomainManager domains={domains} editable={hasPermission(session.role, 'domains.manage')} />
    </div>
  )
}
