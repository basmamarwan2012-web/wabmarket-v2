import { notFound, redirect } from 'next/navigation'
import { AdminPreparationForm } from '@/components/marketplace/admin-preparation-form'
import { executeAdminMarketplaceOperation } from '@/infrastructure/mysql/admin-marketplace.composition'
import { verifySession } from '@/lib/auth/session'
import { normalizeMarketplaceRouteHostname } from '@/lib/marketplace/route-hostname'
import { PersistenceError } from '@/lib/persistence/errors'

export default async function AdminMarketplaceDomainPage({ params }: { params: Promise<{ hostname: string }> }) {
  const session = await verifySession(); if (!session) redirect('/login')
  const hostname = normalizeMarketplaceRouteHostname((await params).hostname); if (!hostname) notFound()
  try { const detail = await executeAdminMarketplaceOperation(session, (service, context) => service.get(context, hostname)); return <div className="mx-auto max-w-5xl space-y-6"><div><h1 className="text-2xl font-bold">Prepare {detail.hostname}</h1><p className="mt-1 text-sm text-gray-500">Readiness: {detail.preparationReadiness} · Publication: {detail.publicationState}</p></div>{!detail.ownershipConfirmed && <p role="alert" className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm">Ownership is not confirmed. Preparation and publication remain blocked.</p>}{detail.missingRequirements.length > 0 && <div className="rounded-md border p-4"><h2 className="font-semibold">Missing requirements</h2><ul className="mt-2 list-disc pl-5 text-sm text-gray-600">{detail.missingRequirements.map((requirement) => <li key={requirement}>{requirement.replaceAll('_', ' ').toLowerCase()}</li>)}</ul></div>}<AdminPreparationForm detail={detail} role={session.role} /></div> } catch (error) { if (error instanceof PersistenceError && error.code === 'PERSISTENCE_NOT_FOUND') notFound(); throw error }
}
