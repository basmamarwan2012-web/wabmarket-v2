import { Skeleton } from '@/components/ui/skeleton'

export default function AdminDomainPreviewLoading() {
  return (
    <div className="mx-auto max-w-6xl space-y-6" aria-label="Loading domain preview">
      <Skeleton className="h-8 w-64" />
      <div className="rounded-3xl border p-10">
        <div className="flex min-h-96 flex-col items-center justify-center gap-5">
          <Skeleton className="h-20 w-20 rounded-2xl" />
          <Skeleton className="h-12 w-full max-w-2xl" />
          <Skeleton className="h-5 w-full max-w-xl" />
        </div>
      </div>
    </div>
  )
}

