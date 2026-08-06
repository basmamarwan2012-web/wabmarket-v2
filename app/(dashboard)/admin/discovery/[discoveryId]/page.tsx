import { notFound, redirect } from 'next/navigation'

import { DiscoveryDetail } from '@/components/discoveries/discovery-detail'
import { verifySession } from '@/lib/auth/session'
import { DiscoveryError } from '@/lib/discoveries/errors'
import { discoveryServerService } from '@/services/discovery.server'

export default async function DomainSearchPage({
  params,
}: {
  params: Promise<{ discoveryId: string }>
}) {
  const session = await verifySession()
  if (!session) redirect('/login')
  try {
    const { discoveryId } = await params
    const discovery = await discoveryServerService.get(session, discoveryId)
    return <DiscoveryDetail initial={discovery} role={session.role} />
  } catch (error) {
    if (error instanceof DiscoveryError && error.status === 404) notFound()
    throw error
  }
}
