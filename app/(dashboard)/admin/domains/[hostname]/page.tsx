import { notFound, redirect } from 'next/navigation'

import { AdminDomainProfile } from '@/components/portfolio/admin-domain-profile'
import { executeAdminPortfolioOperation } from '@/infrastructure/mysql/admin-portfolio.composition'
import { hasPermission } from '@/lib/auth/permissions'
import { verifySession } from '@/lib/auth/session'
import { normalizeMarketplaceRouteHostname } from '@/lib/marketplace/route-hostname'

export default async function AdminDomainProfilePage({ params }: Readonly<{ params: Promise<{ hostname: string }> }>) {
  const session = await verifySession()
  if (!session) redirect('/login')
  const hostname = normalizeMarketplaceRouteHostname((await params).hostname)
  if (!hostname) notFound()
  const profile = await executeAdminPortfolioOperation(session, (service, context) => service.get(context, hostname))
  if (!profile) notFound()
  return <div className="mx-auto max-w-6xl"><AdminDomainProfile profile={profile} editable={hasPermission(session.role, 'domains.manage')} /></div>
}
