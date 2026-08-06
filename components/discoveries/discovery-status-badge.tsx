import type { DiscoveryStatus } from '@/types/discovery'

const presentation: Record<
  DiscoveryStatus,
  { label: string; className: string }
> = {
  queued: {
    label: 'Waiting to start',
    className: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200',
  },
  processing: {
    label: 'Searching for opportunities',
    className: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-200',
  },
  completed: {
    label: 'Search finished',
    className:
      'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-200',
  },
  failed: {
    label: 'Search failed',
    className: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-200',
  },
  cancelled: {
    label: 'Search cancelled',
    className:
      'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200',
  },
}

export function getDiscoveryStatusLabel(status: DiscoveryStatus) {
  return presentation[status].label
}

export function DiscoveryStatusBadge({ status }: { status: DiscoveryStatus }) {
  const value = presentation[status]
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${value.className}`}
    >
      {value.label}
    </span>
  )
}
