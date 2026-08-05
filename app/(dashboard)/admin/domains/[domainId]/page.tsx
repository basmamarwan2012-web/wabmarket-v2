import { notFound, redirect } from 'next/navigation'

import { DomainDetail } from '@/components/domains/domain-detail'
import { verifySession } from '@/lib/auth/session'
import { canPerformDomainAction } from '@/lib/domains/permissions'
import { DomainError } from '@/lib/domains/errors'
import { domainServerService } from '@/services/domain.server'

export default async function DomainDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ domainId: string }>
  searchParams: Promise<{ deleted?: string }>
}) {
  const session = await verifySession()
  if (!session) redirect('/login')
  const { domainId } = await params
  const includeDeleted = (await searchParams).deleted === 'deleted'
  try {
    const detail = await domainServerService.get(
      session,
      domainId,
      includeDeleted
    )
    return (
      <DomainDetail
        detail={detail}
        canEdit={canPerformDomainAction(session.role, 'update')}
        canDelete={canPerformDomainAction(session.role, 'delete')}
        canRestore={canPerformDomainAction(session.role, 'restore')}
      />
    )
  } catch (error) {
    if (
      error instanceof DomainError &&
      (error.status === 403 || error.status === 404)
    )
      notFound()
    throw error
  }
}
