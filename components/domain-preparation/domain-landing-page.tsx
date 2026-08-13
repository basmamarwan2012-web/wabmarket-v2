import type { ReactNode } from 'react'

import { resolveLandingPagePresentationFacts } from '@/lib/domain-preparation/landing-page.helpers'
import type {
  LandingPageRenderAsset,
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
  fallback,
}: Readonly<{
  asset: LandingPageRenderAsset
  label: string
  className: string
  fallback: string
}>) =>
  asset.state === 'AVAILABLE' && asset.reference ? (
    // The canonical render model supplies explicit references. This component
    // neither validates nor constructs asset locations.
    // eslint-disable-next-line @next/next/no-img-element
    <img src={asset.reference} alt={label} className={className} />
  ) : (
    <div
      aria-label={`${label} placeholder`}
      className={`${className} flex items-center justify-center border border-white/15 bg-white/10 font-semibold uppercase tracking-[0.16em] text-white/70`}
    >
      {fallback}
    </div>
  )

const Detail = ({ label, value }: Readonly<{ label: string; value: ReactNode }>) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
    <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{label}</dt>
    <dd className="mt-2 break-words text-base font-semibold text-slate-950">{value}</dd>
  </div>
)

const displayContext = (value: string | null) =>
  value ? value.replace(/\b\w/g, (letter) => letter.toUpperCase()) : null

export function DomainLandingPage({ model }: DomainLandingPageProps) {
  const { publicContext, productFacts, sectionOrder } =
    resolveLandingPagePresentationFacts(model)
  const domain = model.domainDisplayName ?? model.hostname ?? 'Domain'
  const price =
    model.price.currency && model.price.askingPrice
      ? `${model.price.currency} ${model.price.askingPrice.toLocaleString('en-US')}`
      : 'Price available on request'
  const initial = domain.charAt(0).toUpperCase()

  const sections: Readonly<Record<LandingPageSection, ReactNode>> = {
    HERO: (
      <section className="relative overflow-hidden bg-slate-950 px-6 py-12 text-white sm:px-10 sm:py-16 lg:px-16 lg:py-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(245,158,11,0.24),transparent_42%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.16),transparent_38%)]" />
        <div className="relative grid items-center gap-10 lg:grid-cols-[1fr_20rem]">
          <div>
            <div className="flex items-center gap-4">
              <VisualAsset asset={model.logo} label={`${domain} logo`} fallback={initial} className="h-16 w-16 rounded-2xl object-contain text-xl" />
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-300">Premium domain for sale</p>
            </div>
            <h1 className="mt-8 break-all text-4xl font-bold tracking-[-0.04em] sm:text-6xl lg:text-7xl">{domain}</h1>
            <p className="mt-5 max-w-2xl text-xl font-medium text-white">{model.hero.headline}</p>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">{model.hero.description}</p>
          </div>
          <aside className="rounded-3xl border border-white/15 bg-white/10 p-6 shadow-2xl backdrop-blur-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">Asking price</p>
            <p className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">{price}</p>
            <a href={model.cta.externalSalesUrl ?? undefined} target="_blank" rel="noopener noreferrer" className="mt-7 flex w-full items-center justify-center rounded-full bg-amber-400 px-6 py-3.5 text-sm font-bold text-slate-950 transition hover:bg-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-300 focus:ring-offset-2 focus:ring-offset-slate-950">{model.cta.label}</a>
            <p className="mt-4 text-center text-xs leading-5 text-slate-400">Purchase is completed on the external sales provider.</p>
          </aside>
        </div>
      </section>
    ),
    DOMAIN_VALUE: (
      <section className="bg-white px-6 py-14 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-5xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">Domain value facts</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">Why this domain stands out</h2>
          <p className="mt-3 max-w-3xl leading-7 text-slate-600">Straightforward characteristics of the domain and its explicitly prepared context—without traffic, ranking, or valuation claims.</p>
          <ul className="mt-8 grid gap-4 md:grid-cols-2">
            {productFacts.valuePoints.map((point) => <li key={point} className="flex gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm leading-6 text-slate-700"><span aria-hidden="true" className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-amber-500" />{point}</li>)}
          </ul>
        </div>
      </section>
    ),
    DOMAIN_DETAILS: (
      <section className="border-y border-slate-200 bg-slate-50 px-6 py-14 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-5xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Domain details</p>
          <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Detail label="Domain" value={domain} />
            <Detail label="Extension" value={productFacts.extension ? `.${productFacts.extension}` : 'Not available'} />
            <Detail label="Sale status" value="Available for acquisition" />
            <Detail label="Asking price" value={price} />
            {publicContext.category && <Detail label="Category" value={displayContext(publicContext.category)} />}
            {publicContext.primaryKeyword && <Detail label="Keyword" value={displayContext(publicContext.primaryKeyword)} />}
            {publicContext.city && <Detail label="Location context" value={displayContext(publicContext.city)} />}
          </div>
        </div>
      </section>
    ),
    BRAND_PREVIEW: (
      <section className="bg-white px-6 py-14 sm:px-10 lg:px-16">
        <div className="mx-auto grid max-w-5xl items-center gap-10 lg:grid-cols-2">
          <div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">Brand preview</p><h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">A visual starting point for the domain</h2><p className="mt-4 leading-7 text-slate-600">These prepared visual assets accompany the domain presentation. They are product concepts, not claims about an operating company.</p></div>
          <div className="grid grid-cols-[1fr_auto] items-center gap-4 rounded-3xl bg-slate-950 p-8 text-white shadow-xl">
            <VisualAsset asset={model.logo} label={`${domain} logo`} fallback={initial} className="h-32 w-full rounded-2xl object-contain text-3xl" />
            <VisualAsset asset={model.favicon} label={`${domain} favicon`} fallback={initial} className="h-16 w-16 rounded-xl object-contain text-sm" />
          </div>
        </div>
      </section>
    ),
    USE_CASE: (
      <section className="bg-amber-50 px-6 py-14 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-4xl text-center"><p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-800">Positioning</p><h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">A domain ready for its next project</h2><p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-700">{productFacts.useCase}</p></div>
      </section>
    ),
    PURCHASE_CTA: (
      <section className="bg-slate-950 px-6 py-14 text-center text-white sm:px-10 lg:px-16">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-300">External purchase</p>
        <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Interested in {domain}?</h2>
        <p className="mx-auto mt-4 max-w-2xl leading-7 text-slate-300">Review the purchase options and complete any transaction directly with the external sales provider.</p>
        <a href={model.cta.externalSalesUrl ?? undefined} target="_blank" rel="noopener noreferrer" className="mt-8 inline-flex rounded-full bg-amber-400 px-8 py-3.5 text-sm font-bold text-slate-950 transition hover:bg-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-300 focus:ring-offset-2 focus:ring-offset-slate-950">{model.cta.label}</a>
      </section>
    ),
    FOOTER: (
      <footer className="border-t border-slate-200 bg-white px-6 py-8 text-center text-xs leading-5 text-slate-500 sm:px-10">Listed through the Wabmarket domain marketplace. Wabmarket presents the domain; the transaction occurs on the external sales destination.</footer>
    ),
  }

  return (
    <article className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-2xl shadow-slate-300/40">
      {sectionOrder.map((section) => <div key={section} data-section={section}>{sections[section]}</div>)}
    </article>
  )
}
