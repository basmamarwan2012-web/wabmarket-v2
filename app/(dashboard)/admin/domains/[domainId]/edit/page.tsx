import { notFound, redirect } from 'next/navigation'

import { DomainForm } from '@/components/domains/domain-form'
import { verifySession } from '@/lib/auth/session'
import { canPerformDomainAction } from '@/lib/domains/permissions'
import { DomainError } from '@/lib/domains/errors'
import { domainServerService } from '@/services/domain.server'

export default async function EditDomainPage({
  params,
}: {
  params: Promise<{ domainId: string }>
}) {
  const session = await verifySession()
  if (!session) redirect('/login')
  if (!canPerformDomainAction(session.role, 'update'))
    redirect('/admin/domains')
  try {
    const { domainId } = await params
    const detail = await domainServerService.get(session, domainId)
    return (
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold">
            Edit {detail.domain.domainName}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Update permitted domain fields.
          </p>
        </div>
        <DomainForm mode="edit" role={session.role} domain={detail.domain} />
      </div>
    )
  } catch (error) {
    if (error instanceof DomainError && error.status === 404) notFound()
    throw error
  }
}
