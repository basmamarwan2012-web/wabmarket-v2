import { Search } from 'lucide-react'

import { TransitionLink } from '@/components/ui/transition-link'

export function OpportunitiesPlaceholder() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Domain Opportunities</h1>
        <p className="mt-1 text-sm text-gray-500">
          Opportunities generated from completed Domain Discovery searches will
          appear here.
        </p>
      </div>
      <section className="flex min-h-80 flex-col items-center justify-center rounded-xl border border-dashed bg-white p-10 text-center dark:bg-gray-900">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300">
          <Search aria-hidden="true" className="h-6 w-6" />
        </div>
        <h2 className="mt-5 text-lg font-semibold">
          No domain opportunities yet
        </h2>
        <p className="mt-2 max-w-md text-sm text-gray-500">
          Complete a Domain Discovery search first. Future provider results will
          be organized here without mixing them with search activity.
        </p>
        <TransitionLink
          href="/admin/discovery"
          loadingMessage="Loading Domain Discovery..."
          className="mt-6 rounded-md bg-black px-4 py-2 text-sm font-medium text-white dark:bg-white dark:text-black"
        >
          Go to Domain Discovery
        </TransitionLink>
      </section>
    </div>
  )
}
