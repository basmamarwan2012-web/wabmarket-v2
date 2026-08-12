import type { Metadata } from 'next'

import { DomainLandingPage } from '@/components/domain-preparation/domain-landing-page'
import { generatePreparationAssetsAndContent } from '@/lib/domain-preparation/generation'
import { createLandingPageRenderModel } from '@/lib/domain-preparation/landing-page'
import type { LandingPageRenderModel } from '@/lib/domain-preparation/landing-page.types'

const createPreviewRenderModel = (): LandingPageRenderModel => {
  const generated = generatePreparationAssetsAndContent({
    hostname: 'miamiroofing.example',
    ownershipConfirmed: true,
    category: 'roofing',
    city: 'Miami',
    askingPrice: 2_495,
    currency: 'USD',
    externalSalesUrl: 'https://sales.example/domains/miamiroofing',
  })

  if (!generated) {
    throw new Error('The deterministic preparation preview fixture is invalid.')
  }

  return createLandingPageRenderModel(generated)
}

export function generateMetadata(): Metadata {
  const model = createPreviewRenderModel()
  const openGraphImage =
    model.openGraph.image.state === 'AVAILABLE'
      ? model.openGraph.image.reference
      : null
  const favicon =
    model.favicon.state === 'AVAILABLE' ? model.favicon.reference : null

  return {
    title: model.pageTitle ?? 'Domain preparation preview',
    description: model.metaDescription ?? undefined,
    robots: { index: false, follow: false },
    openGraph: {
      title: model.openGraph.title ?? undefined,
      description: model.openGraph.description ?? undefined,
      images: openGraphImage ? [{ url: openGraphImage }] : undefined,
    },
    icons: favicon ? { icon: favicon } : undefined,
  }
}

export default function DomainPreparationPreviewPage() {
  const model = createPreviewRenderModel()

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-700 dark:text-amber-400">
            Internal preview
          </p>
          <h1 className="mt-2 text-2xl font-bold">Prepared domain landing page</h1>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Deterministic fixture only. This page is authenticated, unpublished,
            and disconnected from Portfolio and marketplace data.
          </p>
        </div>
        <span className="rounded-full border border-gray-300 px-3 py-1 text-xs font-medium text-gray-600 dark:border-gray-700 dark:text-gray-300">
          {model.readiness.state.replaceAll('_', ' ')}
        </span>
      </header>

      {model.readiness.state === 'NOT_RENDERABLE' ? (
        <section className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-900 dark:border-red-900 dark:bg-red-950/30 dark:text-red-200">
          <h2 className="font-semibold">Preview unavailable</h2>
          <p className="mt-2 text-sm">
            The prepared content did not satisfy the landing-page rendering
            requirements.
          </p>
        </section>
      ) : (
        <DomainLandingPage model={model} />
      )}
    </div>
  )
}

