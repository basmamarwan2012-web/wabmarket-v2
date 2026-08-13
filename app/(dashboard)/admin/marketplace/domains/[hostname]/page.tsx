import { notFound, redirect } from 'next/navigation'
import { TransitionLink } from '@/components/ui/transition-link'

import { AdminPreparationForm } from '@/components/marketplace/admin-preparation-form'
import { executeAdminMarketplaceOperation } from '@/infrastructure/mysql/admin-marketplace.composition'
import { verifySession } from '@/lib/auth/session'
import { normalizeMarketplaceRouteHostname } from '@/lib/marketplace/route-hostname'
import { PersistenceError } from '@/lib/persistence/errors'

export default async function AdminMarketplaceDomainPage({
  params,
}: Readonly<{ params: Promise<{ hostname: string }> }>) {
  const session = await verifySession()
  if (!session) redirect('/login')
  const hostname = normalizeMarketplaceRouteHostname((await params).hostname)
  if (!hostname) notFound()

  try {
    const detail = await executeAdminMarketplaceOperation(
      session,
      (service, context) => service.get(context, hostname)
    )
    return (
      <div className="mx-auto max-w-5xl space-y-6">
        <nav aria-label="Breadcrumb" className="flex flex-wrap gap-2 text-sm text-gray-500">
          <TransitionLink href="/admin/domains">Portfolio</TransitionLink><span>/</span>
          <TransitionLink href={`/admin/domains/${detail.hostname}`}>{detail.hostname}</TransitionLink><span>/</span>
          <span>Prepare for Sale</span>
        </nav>
        <header>
          <h1 className="text-2xl font-bold">Prepare {detail.hostname}</h1>
          <p className="mt-1 text-sm text-gray-500">Sales details → Prepare domain → Preview → Publish</p>
        </header>
        {!detail.ownershipConfirmed && (
          <p role="alert" className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm">Ownership is not confirmed. Preparation and publication remain blocked.</p>
        )}
        {detail.missingRequirements.length > 0 && (
          <section className="rounded-md border p-4">
            <h2 className="font-semibold">Missing requirements</h2>
            <ul className="mt-2 list-disc pl-5 text-sm text-gray-600">
              {detail.missingRequirements.map((requirement) => (
                <li key={requirement}>{requirement.replaceAll('_', ' ').toLowerCase()}</li>
              ))}
            </ul>
          </section>
        )}
        <AdminPreparationForm detail={detail} role={session.role} />
        <div className="flex flex-wrap gap-2">
          <TransitionLink href={`/admin/domains/${detail.hostname}`} className="rounded-md border px-4 py-2 text-sm">Back to Domain Profile</TransitionLink>
          <TransitionLink href="/admin/domains" className="rounded-md border px-4 py-2 text-sm">Back to Portfolio</TransitionLink>
          <TransitionLink href="/admin/marketplace" className="rounded-md border px-4 py-2 text-sm">Marketplace</TransitionLink>
        </div>
      </div>
    )
  } catch (error) {
    if (error instanceof PersistenceError && error.code === 'PERSISTENCE_NOT_FOUND') notFound()
    throw error
  }
}
