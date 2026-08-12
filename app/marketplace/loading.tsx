import { Skeleton } from '@/components/ui/skeleton'

export default function MarketplaceLoading() {
  return (
    <main
      className="min-h-screen bg-gray-50 dark:bg-gray-950"
      aria-label="Loading marketplace"
    >
      <div className="border-b bg-white px-6 py-20 dark:border-gray-800 dark:bg-gray-900">
        <div className="mx-auto max-w-7xl space-y-4">
          <Skeleton className="h-4 w-56" />
          <Skeleton className="h-12 w-full max-w-2xl" />
          <Skeleton className="h-6 w-full max-w-xl" />
        </div>
      </div>
      <div className="mx-auto grid max-w-7xl gap-6 px-6 py-12 md:grid-cols-2 xl:grid-cols-3">
        {[0, 1, 2].map((item) => (
          <Skeleton key={item} className="h-96 rounded-2xl" />
        ))}
      </div>
    </main>
  )
}

