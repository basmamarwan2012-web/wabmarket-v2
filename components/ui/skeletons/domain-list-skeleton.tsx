import { Skeleton } from '../skeleton'

export function DomainListSkeleton() {
  return (
    <div className="space-y-6" aria-label="Loading domains" role="status">
      <div className="flex justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-10 w-28" />
      </div>
      <Skeleton className="h-28" />
      <div className="overflow-hidden rounded-xl border">
        <Skeleton className="h-12 rounded-none" />
        {[0, 1, 2, 3, 4].map((item) => (
          <Skeleton key={item} className="m-4 h-8" />
        ))}
      </div>
      <span className="sr-only">Loading domains...</span>
    </div>
  )
}
