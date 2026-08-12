import { Skeleton } from '@/components/ui/skeleton'

export default function DomainPreparationPreviewLoading() {
  return (
    <div className="mx-auto max-w-6xl space-y-6" aria-label="Loading preview">
      <div className="space-y-3">
        <Skeleton className="h-3 w-28" />
        <Skeleton className="h-8 w-80 max-w-full" />
        <Skeleton className="h-4 w-full max-w-xl" />
      </div>
      <div className="overflow-hidden rounded-3xl border bg-white dark:bg-gray-900">
        <div className="flex min-h-96 flex-col items-center justify-center gap-5 p-10">
          <Skeleton className="h-20 w-20 rounded-2xl" />
          <Skeleton className="h-12 w-full max-w-2xl" />
          <Skeleton className="h-5 w-full max-w-xl" />
        </div>
      </div>
    </div>
  )
}

