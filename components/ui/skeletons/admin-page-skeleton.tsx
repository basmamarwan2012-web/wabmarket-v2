import { Skeleton } from '../skeleton'

export function AdminPageSkeleton() {
  return (
    <div className="space-y-6" aria-label="Loading page" role="status">
      <Skeleton className="h-8 w-52" />
      <Skeleton className="h-4 w-80 max-w-full" />
      <div className="grid gap-5 md:grid-cols-3">
        {[0, 1, 2].map((item) => (
          <Skeleton key={item} className="h-32" />
        ))}
      </div>
      <Skeleton className="h-72" />
      <span className="sr-only">Loading...</span>
    </div>
  )
}
