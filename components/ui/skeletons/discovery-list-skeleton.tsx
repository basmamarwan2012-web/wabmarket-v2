import { Skeleton } from '../skeleton'

export function DiscoveryListSkeleton() {
  return (
    <div
      className="space-y-6"
      role="status"
      aria-label="Loading Domain Discovery"
    >
      <div className="flex justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-52" />
          <Skeleton className="h-4 w-96 max-w-full" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>
      <div className="overflow-hidden rounded-xl border">
        <Skeleton className="h-12 rounded-none" />
        {[0, 1, 2, 3, 4].map((item) => (
          <Skeleton key={item} className="m-4 h-9" />
        ))}
      </div>
      <span className="sr-only">Loading domain searches...</span>
    </div>
  )
}
