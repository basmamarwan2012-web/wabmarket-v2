import { Skeleton } from '../skeleton'

export function DiscoveryDetailSkeleton() {
  return (
    <div className="space-y-6" role="status" aria-label="Loading Domain Search">
      <Skeleton className="h-4 w-36" />
      <div className="flex justify-between">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-10 w-48" />
      </div>
      <Skeleton className="h-24" />
      <Skeleton className="h-72" />
      <span className="sr-only">Loading domain search...</span>
    </div>
  )
}
