'use client'

import { useRef, useState } from 'react'

import { Spinner } from '@/components/ui/spinner'
import { TransitionLink } from '@/components/ui/transition-link'
import { useLoading } from '@/hooks/use-loading'
import { useToast } from '@/hooks/use-toast'
import {
  canPerformDiscoveryAction,
  getDiscoveryActions,
} from '@/lib/discoveries/permissions'
import type { UserRole } from '@/lib/auth/roles'
import { discoveryService } from '@/services/discovery.service'
import type { Discovery, DiscoveryStatus } from '@/types/discovery'
import {
  DiscoveryStatusBadge,
  getDiscoveryStatusLabel,
} from './discovery-status-badge'

function date(value: string | null) {
  return value ? new Date(value).toLocaleString() : 'Not set'
}

function shortUid(uid: string) {
  return uid.length > 12 ? `${uid.slice(0, 6)}…${uid.slice(-4)}` : uid
}

export function DiscoveryDetail({
  initial,
  role,
}: {
  initial: Discovery
  role: UserRole
}) {
  const [discovery, setDiscovery] = useState(initial)
  const [busyAction, setBusyAction] = useState<string | null>(null)
  const busyRef = useRef(false)
  const { beginLoading } = useLoading()
  const { toast } = useToast()
  const actions = getDiscoveryActions(
    role,
    discovery.status,
    discovery.progress
  )
  const canCancel =
    canPerformDiscoveryAction(role, 'cancel') &&
    ['queued', 'processing'].includes(discovery.status)

  const transition = async (
    status: Extract<DiscoveryStatus, 'processing' | 'completed' | 'failed'>
  ) => {
    if (busyRef.current) return
    busyRef.current = true
    setBusyAction(status)
    const message =
      status === 'processing'
        ? discovery.status === 'queued'
          ? 'Starting domain search...'
          : 'Continuing domain search...'
        : status === 'completed'
          ? 'Finishing domain search...'
          : 'Marking domain search as failed...'
    const operation = beginLoading({ message })
    try {
      const updated = await discoveryService.transition(discovery.id, {
        status,
      })
      setDiscovery(updated)
      toast({
        variant: status === 'failed' ? 'warning' : 'success',
        message:
          status === 'processing'
            ? `Search progress updated to ${updated.progress}%.`
            : status === 'completed'
              ? 'Domain search finished.'
              : 'Domain search marked as failed.',
        dedupeKey: `discovery-${discovery.id}-${status}-${updated.progress}`,
      })
    } catch (caught) {
      toast({
        variant: 'error',
        message:
          caught instanceof Error
            ? caught.message
            : 'Domain search update failed.',
      })
    } finally {
      operation.finish()
      busyRef.current = false
      setBusyAction(null)
    }
  }

  const cancel = async () => {
    if (
      busyRef.current ||
      !window.confirm('Cancel this domain search? This cannot be undone.')
    )
      return
    busyRef.current = true
    setBusyAction('cancelled')
    const operation = beginLoading({ message: 'Cancelling domain search...' })
    try {
      const updated = await discoveryService.cancel(discovery.id)
      setDiscovery(updated)
      toast({
        variant: 'success',
        message: 'Domain search cancelled.',
        dedupeKey: `discovery-cancelled-${discovery.id}`,
      })
    } catch (caught) {
      toast({
        variant: 'error',
        message:
          caught instanceof Error
            ? caught.message
            : 'Domain search cancellation failed.',
      })
    } finally {
      operation.finish()
      busyRef.current = false
      setBusyAction(null)
    }
  }

  const fields = [
    ['Keyword', discovery.keyword],
    [
      'Location',
      [discovery.city, discovery.state, discovery.country]
        .filter(Boolean)
        .join(', '),
    ],
    ['Language', discovery.language ?? 'Not specified'],
    ['Max results', discovery.maxResults],
    ['Search status', getDiscoveryStatusLabel(discovery.status)],
    ['Progress', `${discovery.progress}%`],
    ['Results Found', discovery.resultsCount],
    ['Search message', discovery.error ?? 'None'],
    ['Started', date(discovery.startedAt)],
    ['Completed', date(discovery.completedAt)],
    ['Created', date(discovery.createdAt)],
    ['Created by', shortUid(discovery.createdBy)],
    ['Updated', date(discovery.updatedAt)],
    ['Updated by', shortUid(discovery.updatedBy)],
  ] as const

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <TransitionLink
            href="/admin/discovery"
            className="text-sm text-gray-500 underline"
          >
            Back to Domain Discovery
          </TransitionLink>
          <p className="mt-3 text-xs font-medium uppercase tracking-wide text-gray-500">
            Domain Search
          </p>
          <h1 className="mt-1 text-3xl font-bold">{discovery.keyword}</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          {actions.map((action) => (
            <button
              key={action}
              type="button"
              disabled={busyAction !== null}
              onClick={() => void transition(action)}
              className="inline-flex items-center gap-2 rounded-md border px-4 py-2 text-sm disabled:opacity-50"
            >
              {busyAction === action && <Spinner />}
              {action === 'processing'
                ? discovery.status === 'queued'
                  ? 'Start search'
                  : 'Continue search'
                : action === 'completed'
                  ? 'Finish search'
                  : 'Mark search failed'}
            </button>
          ))}
          {canCancel && (
            <button
              type="button"
              disabled={busyAction !== null}
              onClick={() => void cancel()}
              className="inline-flex items-center gap-2 rounded-md border border-red-300 px-4 py-2 text-sm text-red-700 disabled:opacity-50 dark:border-red-800 dark:text-red-300"
            >
              {busyAction === 'cancelled' && <Spinner />}Cancel
            </button>
          )}
        </div>
      </div>
      <section className="rounded-xl border bg-white p-6 dark:bg-gray-900">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-semibold">Search status</h2>
          <DiscoveryStatusBadge status={discovery.status} />
        </div>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800">
          <div
            className="h-full bg-blue-600 transition-[width] duration-200 motion-reduce:transition-none"
            style={{ width: `${discovery.progress}%` }}
          />
        </div>
      </section>
      <section className="rounded-xl border bg-white p-6 dark:bg-gray-900">
        <h2 className="text-lg font-semibold">Search details</h2>
        <dl className="mt-4 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {fields.map(([label, value]) => (
            <div key={label}>
              <dt className="text-xs uppercase tracking-wide text-gray-500">
                {label}
              </dt>
              <dd className="mt-1 break-words font-medium capitalize">
                {String(value)}
              </dd>
            </div>
          ))}
        </dl>
      </section>
      <p className="text-sm text-gray-500">
        Automatic provider processing will be introduced in a future phase. This
        search currently advances only when you use the available actions.
      </p>
    </div>
  )
}
