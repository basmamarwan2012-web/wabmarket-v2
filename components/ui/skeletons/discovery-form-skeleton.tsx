import { Skeleton } from '../skeleton'

export function DiscoveryFormSkeleton() {
  return (
    <div
      className="mx-auto max-w-3xl space-y-6"
      role="status"
      aria-label="Loading Domain Discovery form"
    >
      <Skeleton className="h-8 w-56" />
      <Skeleton className="h-4 w-96 max-w-full" />
      <div className="grid gap-5 rounded-xl border p-6 md:grid-cols-2">
        {[0, 1, 2, 3, 4, 5].map((item) => (
          <Skeleton key={item} className="h-16" />
        ))}
      </div>
      <span className="sr-only">Loading domain search form...</span>
    </div>
  )
}
