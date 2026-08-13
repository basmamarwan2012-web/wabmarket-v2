import { redirect } from 'next/navigation'

import { AdminPortfolioManager } from '@/components/portfolio/admin-portfolio-manager'
import { executeAdminPortfolioOperation } from '@/infrastructure/mysql/admin-portfolio.composition'
import { hasPermission } from '@/lib/auth/permissions'
import { verifySession } from '@/lib/auth/session'

export default async function DomainsPage() {
  const session = await verifySession()
  if (!session) redirect('/login')
  const domains = await executeAdminPortfolioOperation(
    session,
    (service, context) => service.list(context)
  )

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Portfolio</h1>
        <p className="mt-1 text-sm text-gray-500">
          Your owned and managed domain inventory.
        </p>
      </header>
      <AdminPortfolioManager
        domains={domains}
        editable={hasPermission(session.role, 'domains.manage')}
      />
    </div>
  )
}
