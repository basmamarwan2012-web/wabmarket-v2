import { Skeleton } from '@/components/ui/skeleton'

export default function PublicDomainLoading() {
  return (
    <main className="min-h-screen bg-gray-50 px-6 py-14" aria-label="Loading domain">
      <div className="mx-auto max-w-6xl overflow-hidden rounded-3xl border bg-white">
        <div className="flex min-h-96 flex-col items-center justify-center gap-5 p-10">
          <Skeleton className="h-20 w-20 rounded-2xl" />
          <Skeleton className="h-12 w-full max-w-2xl" />
          <Skeleton className="h-5 w-full max-w-xl" />
        </div>
        <Skeleton className="h-36 w-full rounded-none" />
      </div>
    </main>
  )
}

