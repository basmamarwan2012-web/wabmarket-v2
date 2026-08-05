import { redirect } from 'next/navigation'

import { DomainForm } from '@/components/domains/domain-form'
import { verifySession } from '@/lib/auth/session'
import { canPerformDomainAction } from '@/lib/domains/permissions'

export default async function NewDomainPage() {
  const session = await verifySession()
  if (!session || !canPerformDomainAction(session.role, 'create'))
    redirect('/admin/domains')
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Add owned domain</h1>
        <p className="mt-1 text-sm text-gray-500">
          Create a canonical owned-domain record.
        </p>
      </div>
      <DomainForm mode="create" role={session.role} />
    </div>
  )
}
