'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

import { useCurrentRole } from '@/components/auth/role-provider'
import { TransitionLink } from '@/components/ui/transition-link'
import { Spinner } from '@/components/ui/spinner'
import { DiscoveryListSkeleton } from '@/components/ui/skeletons/discovery-list-skeleton'
import { DiscoveryStatusBadge } from './discovery-status-badge'
import { canPerformDiscoveryAction } from '@/lib/discoveries/permissions'
import { discoveryService } from '@/services/discovery.service'
import type { DiscoveryListResult } from '@/types/discovery-api'

export function DiscoveryList() {
  const role = useCurrentRole()
  const requestRef = useRef<AbortController | null>(null)
  const [result, setResult] = useState<DiscoveryListResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [cursor, setCursor] = useState<string | undefined>()

  const load = useCallback(async () => {
    requestRef.current?.abort()
    const controller = new AbortController()
    requestRef.current = controller
    setLoading(true)
    setError(null)
    try {
      const data = await discoveryService.list(
        { order: 'desc', pageSize: 20, cursor },
        controller.signal
      )
      if (!controller.signal.aborted) setResult(data)
    } catch (caught) {
      if (
        !controller.signal.aborted &&
        !(caught instanceof DOMException && caught.name === 'AbortError')
      )
        setError(
          caught instanceof Error
            ? caught.message
            : 'Domain searches could not be loaded.'
        )
    } finally {
      if (!controller.signal.aborted) setLoading(false)
    }
  }, [cursor])

  useEffect(() => {
    void load()
    return () => requestRef.current?.abort()
  }, [load])

  if (loading && !result) return <DiscoveryListSkeleton />

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Domain Discovery</h1>
          <p className="mt-1 text-sm text-gray-500">
            Search for new domain investment opportunities based on keywords,
            locations, and future AI providers.
          </p>
        </div>
        {canPerformDiscoveryAction(role, 'create') && (
          <TransitionLink
            href="/admin/discovery/new"
            loadingMessage="Loading Domain Discovery..."
            className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white dark:bg-white dark:text-black"
          >
            Start New Domain Search
          </TransitionLink>
        )}
      </div>

      {loading && result && (
        <p
          role="status"
          className="flex items-center gap-2 text-sm text-gray-500"
        >
          <Spinner /> Loading searches...
        </p>
      )}
      {error && (
        <div
          role="alert"
          className="rounded-xl bg-red-50 p-4 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-300"
        >
          <p>{error}</p>
          <button
            type="button"
            onClick={() => void load()}
            className="mt-3 rounded-md border px-3 py-2"
          >
            Try again
          </button>
        </div>
      )}
      {!error && result?.items.length === 0 && (
        <div className="rounded-xl border p-10 text-center">
          <h2 className="font-semibold">No searches have been started yet.</h2>
          <p className="mt-2 text-sm text-gray-500">
            Start a Domain Search using a keyword and location.
          </p>
          {canPerformDiscoveryAction(role, 'create') && (
            <TransitionLink
              href="/admin/discovery/new"
              loadingMessage="Loading Domain Discovery..."
              className="mt-5 inline-flex rounded-md bg-black px-4 py-2 text-sm font-medium text-white dark:bg-white dark:text-black"
            >
              Start New Domain Search
            </TransitionLink>
          )}
        </div>
      )}
      {!error && result && result.items.length > 0 && (
        <div className="overflow-x-auto rounded-xl border bg-white dark:bg-gray-900">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-gray-50 dark:bg-gray-950">
              <tr>
                <th className="px-4 py-3">Keyword</th>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Progress</th>
                <th className="px-4 py-3">Created</th>
                <th className="px-4 py-3">Results Found</th>
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-gray-800">
              {result.items.map((discovery) => (
                <tr key={discovery.id}>
                  <td className="px-4 py-3 font-medium">
                    <TransitionLink
                      className="underline"
                      href={`/admin/discovery/${discovery.id}`}
                      loadingMessage="Loading Domain Search..."
                    >
                      {discovery.keyword}
                    </TransitionLink>
                  </td>
                  <td className="px-4 py-3">
                    {[discovery.city, discovery.state, discovery.country]
                      .filter(Boolean)
                      .join(', ')}
                  </td>
                  <td className="px-4 py-3">
                    <DiscoveryStatusBadge status={discovery.status} />
                  </td>
                  <td className="px-4 py-3">{discovery.progress}%</td>
                  <td className="px-4 py-3">
                    {new Date(discovery.createdAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">{discovery.resultsCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {result?.hasNextPage && result.nextCursor && (
        <button
          type="button"
          disabled={loading}
          onClick={() => setCursor(result.nextCursor!)}
          className="rounded-md border px-4 py-2 text-sm disabled:opacity-50"
        >
          Next page
        </button>
      )}
    </div>
  )
}
