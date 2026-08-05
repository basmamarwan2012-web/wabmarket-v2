import { Skeleton } from '../skeleton'

export function DomainFormSkeleton() {
  return (
    <div
      className="mx-auto max-w-4xl space-y-6"
      aria-label="Loading form"
      role="status"
    >
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-4 w-80 max-w-full" />
      <div className="grid gap-5 rounded-xl border p-6 md:grid-cols-2">
        {Array.from({ length: 10 }, (_, item) => (
          <Skeleton key={item} className="h-16" />
        ))}
      </div>
      <span className="sr-only">Loading form...</span>
    </div>
  )
}
