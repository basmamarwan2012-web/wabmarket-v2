import Link from 'next/link'

export default function PublicDomainNotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-6 text-gray-950">
      <section className="max-w-lg rounded-2xl border border-gray-200 bg-white p-10 text-center shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-700">
          Marketplace
        </p>
        <h1 className="mt-3 text-3xl font-bold">Domain page unavailable</h1>
        <p className="mt-3 text-sm leading-6 text-gray-600">
          This domain is not currently available in the public marketplace.
        </p>
        <Link
          href="/marketplace"
          className="mt-6 inline-flex rounded-full bg-gray-950 px-5 py-2.5 text-sm font-semibold text-white"
        >
          Browse marketplace
        </Link>
      </section>
    </main>
  )
}

