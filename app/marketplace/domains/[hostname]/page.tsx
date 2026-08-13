import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { cache } from 'react'

import { DomainLandingPage } from '@/components/domain-preparation/domain-landing-page'
import { resolvePublishedMarketplaceHostnameFromMySql } from '@/infrastructure/mysql/marketplace-read.composition'
import { normalizeMarketplaceRouteHostname } from '@/lib/marketplace/route-hostname'

interface PublicDomainPageProps {
  readonly params: Promise<{ hostname: string }>
}

const resolvePersistedPublicLanding = cache(async (routeHostname: string) => {
  const hostname = normalizeMarketplaceRouteHostname(routeHostname)
  if (!hostname) return null

  return resolvePublishedMarketplaceHostnameFromMySql(hostname)
})

export async function generateMetadata({
  params,
}: PublicDomainPageProps): Promise<Metadata> {
  const { hostname } = await params
  const record = await resolvePersistedPublicLanding(hostname)
  if (!record) notFound()

  const model = record.landingPage
  const openGraphImage =
    model.openGraph.image.state === 'AVAILABLE'
      ? model.openGraph.image.reference
      : null
  const favicon =
    model.favicon.state === 'AVAILABLE' ? model.favicon.reference : null

  return {
    title: model.pageTitle ?? undefined,
    description: model.metaDescription ?? undefined,
    openGraph: {
      title: model.openGraph.title ?? undefined,
      description: model.openGraph.description ?? undefined,
      images: openGraphImage ? [{ url: openGraphImage }] : undefined,
    },
    icons: favicon ? { icon: favicon } : undefined,
  }
}

export default async function PublicDomainPage({ params }: PublicDomainPageProps) {
  const { hostname } = await params
  const record = await resolvePersistedPublicLanding(hostname)
  if (!record) notFound()

  return (
    <main className="min-h-screen bg-gray-50 text-gray-950">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <Link href="/" className="text-xl font-bold">
            Wabmarket
          </Link>
          <Link
            href="/marketplace"
            className="rounded-full border border-gray-300 px-4 py-2 text-sm font-medium transition hover:bg-gray-50"
          >
            Back to marketplace
          </Link>
        </div>
      </header>
      <div className="mx-auto max-w-6xl px-6 py-10 sm:py-14">
        <DomainLandingPage model={record.landingPage} />
      </div>
    </main>
  )
}
