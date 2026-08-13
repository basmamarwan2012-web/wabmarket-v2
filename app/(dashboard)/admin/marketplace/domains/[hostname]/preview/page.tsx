import { notFound, redirect } from 'next/navigation'
import { TransitionLink } from '@/components/ui/transition-link'

import { DomainLandingPage } from '@/components/domain-preparation/domain-landing-page'
import { executeAdminMarketplaceOperation } from '@/infrastructure/mysql/admin-marketplace.composition'
import { verifySession } from '@/lib/auth/session'
import { normalizeMarketplaceRouteHostname } from '@/lib/marketplace/route-hostname'
import { PersistenceError } from '@/lib/persistence/errors'

export default async function AdminDomainPreviewPage({
  params,
}: Readonly<{ params: Promise<{ hostname: string }> }>) {
  const session = await verifySession()
  if (!session) redirect('/login')
  const hostname = normalizeMarketplaceRouteHostname((await params).hostname)
  if (!hostname) notFound()

  try {
    const preview = await executeAdminMarketplaceOperation(
      session,
      (service, context) => service.preview(context, hostname)
    )
    return (
      <div className="mx-auto max-w-6xl space-y-6">
        <nav aria-label="Breadcrumb" className="flex flex-wrap gap-2 text-sm text-gray-500">
          <TransitionLink href="/admin/domains">Portfolio</TransitionLink><span>/</span>
          <TransitionLink href={`/admin/domains/${preview.hostname}`}>{preview.hostname}</TransitionLink><span>/</span>
          <TransitionLink href={`/admin/marketplace/domains/${preview.hostname}`}>Preparation</TransitionLink><span>/</span><span>Preview</span>
        </nav>
        <header>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-700 dark:text-amber-400">Internal preview · Not published by this action</p>
          <h1 className="mt-2 text-2xl font-bold">{preview.hostname}</h1>
        </header>
        <DomainLandingPage model={preview.model} />
        <div className="flex flex-wrap gap-2">
          <TransitionLink href={`/admin/marketplace/domains/${preview.hostname}`} className="rounded-md border px-4 py-2 text-sm">Back to Preparation</TransitionLink>
          <TransitionLink href={`/admin/domains/${preview.hostname}`} className="rounded-md border px-4 py-2 text-sm">Back to Domain Profile</TransitionLink>
        </div>
      </div>
    )
  } catch (error) {
    if (error instanceof PersistenceError && error.code === 'PERSISTENCE_NOT_FOUND') notFound()
    throw error
  }
}
