import { redirect } from 'next/navigation'
import { TransitionLink } from '@/components/ui/transition-link'
import { executeAdminMarketplaceOperation } from '@/infrastructure/mysql/admin-marketplace.composition'
import { verifySession } from '@/lib/auth/session'

export default async function AdminMarketplacePage() {
  const session = await verifySession()
  if (!session) redirect('/login')
  const domains = await executeAdminMarketplaceOperation(session, (service, context) => service.list(context))
  return <div className="space-y-6"><div><h1 className="text-2xl font-bold">Marketplace operations</h1><p className="mt-1 text-sm text-gray-500">Prepare, publish, and unpublish owned domains.</p></div>{domains.length === 0 ? <div className="rounded-xl border border-dashed p-10 text-center"><h2 className="font-semibold">No SQL-owned domains yet</h2><p className="mt-2 text-sm text-gray-500">Confirm ownership in the relational domain inventory before preparation.</p></div> : <div className="overflow-hidden rounded-xl border bg-white dark:bg-gray-900">{domains.map((domain) => <div key={domain.ownedDomainId} className="flex flex-wrap items-center justify-between gap-4 border-b p-5 last:border-0"><div><p className="font-semibold">{domain.hostname}</p><p className="mt-1 text-xs text-gray-500">{domain.ownershipConfirmed ? domain.preparationReadiness : 'Ownership not confirmed'} · {domain.publicationState}</p></div><TransitionLink href={`/admin/marketplace/domains/${domain.hostname}`} className="rounded-md border px-4 py-2 text-sm">Manage</TransitionLink></div>)}</div>}</div>
}
