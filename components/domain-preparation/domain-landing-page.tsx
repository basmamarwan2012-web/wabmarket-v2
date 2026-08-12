import type { ReactNode } from 'react'

import type {
  LandingPageRenderModel,
  LandingPageSection,
} from '@/lib/domain-preparation/landing-page.types'

interface DomainLandingPageProps {
  model: LandingPageRenderModel
}

const VisualAsset = ({
  asset,
  label,
  className,
}: Readonly<{
  asset: LandingPageRenderModel['logo']
  label: string
  className: string
}>) =>
  asset.state === 'AVAILABLE' && asset.reference ? (
    // Explicit references are supplied by the render model; this component
    // neither validates nor constructs asset locations.
    // eslint-disable-next-line @next/next/no-img-element
    <img src={asset.reference} alt={label} className={className} />
  ) : (
    <div
      aria-label={`${label} placeholder`}
      className={`${className} flex items-center justify-center border border-dashed border-gray-300 bg-gray-50 text-xs font-semibold uppercase tracking-[0.16em] text-gray-400`}
    >
      {label}
    </div>
  )

export function DomainLandingPage({ model }: DomainLandingPageProps) {
  const sections: Readonly<Record<LandingPageSection, ReactNode>> = {
    HERO: (
      <section className="px-6 pb-16 pt-12 text-center sm:px-10 sm:pb-20 sm:pt-16">
        <VisualAsset
          asset={model.logo}
          label="Logo"
          className="mx-auto mb-8 h-20 w-20 rounded-2xl object-contain"
        />
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-amber-700">
          Premium domain
        </p>
        <h1 className="mx-auto mt-4 max-w-4xl text-4xl font-bold tracking-tight text-gray-950 sm:text-6xl">
          {model.hero.headline}
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-gray-600">
          {model.hero.description}
        </p>
      </section>
    ),
    VALUE_PROPOSITION: (
      <section className="border-y border-gray-200 bg-gray-50 px-6 py-10 text-center sm:px-10">
        <p className="mx-auto max-w-2xl text-base leading-7 text-gray-600">
          {model.metaDescription}
        </p>
      </section>
    ),
    DOMAIN_DETAILS: (
      <section className="px-6 py-12 text-center sm:px-10">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
          Domain name
        </p>
        <p className="mt-3 break-all text-3xl font-semibold tracking-tight text-gray-950 sm:text-4xl">
          {model.domainDisplayName}
        </p>
      </section>
    ),
    PRICE: (
      <section className="bg-gray-950 px-6 py-12 text-center text-white sm:px-10">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">
          Asking price
        </p>
        <p className="mt-3 text-4xl font-bold tracking-tight">
          {model.price.currency} {model.price.askingPrice?.toLocaleString('en-US')}
        </p>
      </section>
    ),
    CTA: (
      <section className="px-6 py-12 text-center sm:px-10">
        <a
          href={model.cta.externalSalesUrl ?? undefined}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex rounded-full bg-amber-600 px-7 py-3 text-sm font-semibold text-white transition hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
        >
          {model.cta.label}
        </a>
        <p className="mx-auto mt-4 max-w-lg text-sm text-gray-500">
          The transaction is completed securely on the external sales provider.
        </p>
      </section>
    ),
    FOOTER: (
      <footer className="border-t border-gray-200 bg-gray-50 px-6 py-6 text-center text-xs text-gray-500 sm:px-10">
        Domain presentation powered by Wabmarket
      </footer>
    ),
  }

  return (
    <article className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-xl shadow-gray-200/60">
      {model.sectionOrder.map((section) => (
        <div key={section} data-section={section}>
          {sections[section]}
        </div>
      ))}
    </article>
  )
}

