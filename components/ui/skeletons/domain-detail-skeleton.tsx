import { Skeleton } from '../skeleton'

export function DomainDetailSkeleton() {
  return (
    <div className="space-y-6" aria-label="Loading domain" role="status">
      <Skeleton className="h-4 w-28" />
      <div className="flex justify-between">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-10 w-32" />
      </div>
      <Skeleton className="h-72" />
      <Skeleton className="h-32" />
      <div className="grid gap-6 lg:grid-cols-2">
        <Skeleton className="h-64" />
        <Skeleton className="h-64" />
      </div>
      <span className="sr-only">Loading domain...</span>
    </div>
  )
}
