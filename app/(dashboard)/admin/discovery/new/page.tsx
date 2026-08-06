import { redirect } from 'next/navigation'

import { DiscoveryForm } from '@/components/discoveries/discovery-form'
import { verifySession } from '@/lib/auth/session'
import { canPerformDiscoveryAction } from '@/lib/discoveries/permissions'

export default async function NewDomainSearchPage() {
  const session = await verifySession()
  if (!session) redirect('/login')
  if (!canPerformDiscoveryAction(session.role, 'create'))
    redirect('/admin/discovery')
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
          Domain Discovery
        </p>
        <h1 className="mt-1 text-2xl font-bold">Start New Domain Search</h1>
        <p className="mt-1 text-sm text-gray-500">
          Define the keyword and location criteria for this domain search.
        </p>
      </div>
      <DiscoveryForm />
    </div>
  )
}
