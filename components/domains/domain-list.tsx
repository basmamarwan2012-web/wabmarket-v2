'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

import { useCurrentRole } from '@/components/auth/role-provider'
import { canPerformDomainAction } from '@/lib/domains/permissions'
import { domainService } from '@/services/domain.service'
import type { DomainListResult } from '@/types/domain-api'
import type { DomainStatus } from '@/types/domain'
import { DomainActions } from './domain-actions'
import { Spinner } from '@/components/ui/spinner'
import { TransitionLink } from '@/components/ui/transition-link'
import { DomainListSkeleton } from '@/components/ui/skeletons/domain-list-skeleton'
import { useLoading } from '@/hooks/use-loading'
import { useToast } from '@/hooks/use-toast'

const statuses: DomainStatus[] = [
  'opportunity',
  'active',
  'sold',
  'expired',
  'archived',
]

export function DomainList() {
  const role = useCurrentRole()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { beginLoading } = useLoading()
  const { toast } = useToast()
  const queryString = searchParams.toString()
  const [result, setResult] = useState<DomainListResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pendingControl, setPendingControl] = useState<
    'apply' | 'refresh' | null
  >(null)
  const [searchInput, setSearchInput] = useState(
    searchParams.get('search') ?? ''
  )
  const [statusInput, setStatusInput] = useState(
    searchParams.get('status') ?? ''
  )
  const [registrarInput, setRegistrarInput] = useState(
    searchParams.get('registrar') ?? ''
  )
  const rollbackRef = useRef(new Map<string, DomainListResult>())
  const emptiedPageRef = useRef(new Set<string>())
  const requestRef = useRef<AbortController | null>(null)
  const foregroundRef = useRef<{ finish: () => void } | null>(null)
  const canManage = canPerformDomainAction(role, 'create')
  const canTrash = canPerformDomainAction(role, 'trash.read')
  const deleted = searchParams.get('deleted') === 'deleted'

  const load = useCallback(
    async (background = false) => {
      requestRef.current?.abort()
      const controller = new AbortController()
      requestRef.current = controller
      if (!background) setLoading(true)
      setError(null)
      try {
        const data = await domainService.list(
          Object.fromEntries(new URLSearchParams(queryString)),
          controller.signal
        )
        if (!controller.signal.aborted) setResult(data)
      } catch (caught) {
        if (
          !controller.signal.aborted &&
          !(caught instanceof DOMException && caught.name === 'AbortError')
        ) {
          setError(
            caught instanceof Error
              ? caught.message
              : 'Domains could not be loaded.'
          )
          if (background)
            toast({ variant: 'error', message: 'Loading failed.' })
        }
      } finally {
        if (!controller.signal.aborted && !background) setLoading(false)
        if (!controller.signal.aborted) {
          setPendingControl(null)
          foregroundRef.current?.finish()
          foregroundRef.current = null
        }
      }
    },
    [queryString, toast]
  )

  useEffect(() => {
    void load()
    return () => requestRef.current?.abort()
  }, [load])

  useEffect(() => {
    setSearchInput(searchParams.get('search') ?? '')
    setStatusInput(searchParams.get('status') ?? '')
    setRegistrarInput(searchParams.get('registrar') ?? '')
  }, [queryString, searchParams])

  useEffect(() => {
    const currentSearch = searchParams.get('search') ?? ''
    if (searchInput.trim() === currentSearch) return
    const timeout = window.setTimeout(() => {
      const next = new URLSearchParams(searchParams)
      const normalized = searchInput.trim().toLowerCase()
      if (normalized) {
        next.set('search', normalized)
        next.delete('status')
        next.delete('registrar')
        next.set('sort', 'createdAt')
      } else {
        next.delete('search')
      }
      next.delete('cursor')
      router.replace(`${pathname}?${next.toString()}`)
    }, 300)
    return () => window.clearTimeout(timeout)
  }, [pathname, router, searchInput, searchParams])

  const update = (values: Record<string, string | undefined>) => {
    const next = new URLSearchParams(searchParams)
    for (const [key, value] of Object.entries(values)) {
      if (value) next.set(key, value)
      else next.delete(key)
    }
    if (!('cursor' in values)) next.delete('cursor')
    const destination = `${pathname}?${next.toString()}`
    foregroundRef.current?.finish()
    foregroundRef.current = beginLoading({ message: 'Loading...' })
    if (destination === `${pathname}?${queryString}`) void load()
    else router.push(destination)
  }

  const optimisticRemove = (domainId: string) => {
    setResult((current) => {
      if (!current) return current
      rollbackRef.current.set(domainId, current)
      const items = current.items.filter((domain) => domain.id !== domainId)
      if (items.length === 0 && searchParams.has('cursor')) {
        emptiedPageRef.current.add(domainId)
      }
      return { ...current, items }
    })
  }

  const mutationSuccess = (domainId: string) => {
    rollbackRef.current.delete(domainId)
    if (emptiedPageRef.current.delete(domainId)) {
      const next = new URLSearchParams(searchParams)
      next.delete('cursor')
      router.replace(`${pathname}?${next.toString()}`)
      return
    }
    void load(true)
  }

  const mutationFailure = (domainId: string, message: string) => {
    const previous = rollbackRef.current.get(domainId)
    if (previous) setResult(previous)
    rollbackRef.current.delete(domainId)
    emptiedPageRef.current.delete(domainId)
    setError(message)
  }

  const filtered = Boolean(
    searchInput.trim() || statusInput || registrarInput.trim()
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">
            {deleted ? 'Domain trash' : 'Owned Domains'}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Search and manage the tenant domain portfolio.
          </p>
        </div>
        <div className="flex gap-2">
          {canTrash && (
            <button
              type="button"
              onClick={() =>
                update({ deleted: deleted ? undefined : 'deleted' })
              }
              className="rounded-md border px-4 py-2 text-sm"
            >
              {deleted ? 'Active domains' : 'Trash'}
            </button>
          )}
          {canManage && !deleted && (
            <TransitionLink
              href="/admin/domains/new"
              loadingMessage="Loading domain..."
              className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white dark:bg-white dark:text-black"
            >
              Add Domain
            </TransitionLink>
          )}
          <button
            type="button"
            disabled={loading}
            onClick={() => {
              setPendingControl('refresh')
              foregroundRef.current?.finish()
              foregroundRef.current = beginLoading({ message: 'Loading...' })
              void load()
            }}
            className="inline-flex items-center gap-2 rounded-md border px-4 py-2 text-sm disabled:opacity-60"
          >
            {pendingControl === 'refresh' && <Spinner />}
            {pendingControl === 'refresh' ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      <form
        className="grid gap-3 rounded-xl border bg-white p-4 dark:bg-gray-900 md:grid-cols-6"
        onSubmit={(event) => {
          event.preventDefault()
          setPendingControl('apply')
          update({
            status: statusInput || undefined,
            registrar: registrarInput.trim() || undefined,
            sort: filtered
              ? 'createdAt'
              : String(new FormData(event.currentTarget).get('sort')),
            order: String(new FormData(event.currentTarget).get('order')),
            pageSize: String(new FormData(event.currentTarget).get('pageSize')),
          })
        }}
      >
        <label className="md:col-span-2">
          <span className="sr-only">Search domain name</span>
          <input
            maxLength={64}
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Search domain prefix"
            className="w-full rounded-md border bg-transparent px-3 py-2"
          />
        </label>
        <label>
          <span className="sr-only">Status</span>
          <select
            value={statusInput}
            disabled={Boolean(searchInput.trim())}
            onChange={(event) => {
              setStatusInput(event.target.value)
              if (event.target.value) setRegistrarInput('')
            }}
            className="w-full rounded-md border bg-transparent px-3 py-2 disabled:opacity-50 dark:bg-gray-900"
          >
            <option value="">All statuses</option>
            {statuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="sr-only">Registrar</span>
          <input
            value={registrarInput}
            disabled={Boolean(searchInput.trim())}
            onChange={(event) => {
              setRegistrarInput(event.target.value)
              if (event.target.value) setStatusInput('')
            }}
            placeholder="Registrar"
            className="w-full rounded-md border bg-transparent px-3 py-2 disabled:opacity-50"
          />
        </label>
        <label>
          <span className="sr-only">Sort domains</span>
          <select
            name="sort"
            defaultValue={
              filtered ? 'createdAt' : (searchParams.get('sort') ?? 'createdAt')
            }
            disabled={filtered}
            className="w-full rounded-md border bg-transparent px-3 py-2 disabled:opacity-50 dark:bg-gray-900"
          >
            <option value="createdAt">Created date</option>
            <option value="expirationDate">Expiration date</option>
            <option value="flipScore">FlipScore</option>
            <option value="purchasePrice">Purchase price</option>
            <option value="askingPrice">Asking price</option>
          </select>
        </label>
        <button
          className="inline-flex items-center justify-center gap-2 rounded-md border px-3 py-2 text-sm disabled:opacity-60"
          type="submit"
          disabled={pendingControl === 'apply'}
        >
          {pendingControl === 'apply' && <Spinner />}
          {pendingControl === 'apply' ? 'Applying...' : 'Apply'}
        </button>
        <label>
          <span className="sr-only">Sort order</span>
          <select
            name="order"
            defaultValue={searchParams.get('order') ?? 'desc'}
            className="w-full rounded-md border bg-transparent px-3 py-2 dark:bg-gray-900"
          >
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </select>
        </label>
        <label>
          <span className="sr-only">Page size</span>
          <select
            name="pageSize"
            defaultValue={searchParams.get('pageSize') ?? '20'}
            className="w-full rounded-md border bg-transparent px-3 py-2 dark:bg-gray-900"
          >
            <option value="10">10 per page</option>
            <option value="20">20 per page</option>
            <option value="50">50 per page</option>
            <option value="100">100 per page</option>
          </select>
        </label>
      </form>

      {loading && !result && <DomainListSkeleton />}
      {loading && result && (
        <p className="rounded-xl border p-6 text-sm text-gray-500">
          <Spinner />
          {searchInput.trim() ? 'Searching...' : 'Refreshing...'}
        </p>
      )}
      {error && (
        <p
          role="alert"
          className="rounded-xl bg-red-50 p-4 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-300"
        >
          {error}
        </p>
      )}
      {!loading && !error && result?.items.length === 0 && (
        <div className="rounded-xl border p-10 text-center">
          <h2 className="font-semibold">No domains found</h2>
          <p className="mt-2 text-sm text-gray-500">
            Adjust the filters or add the first owned domain.
          </p>
        </div>
      )}
      {!error && result && result.items.length > 0 && (
        <div className="overflow-x-auto rounded-xl border bg-white dark:bg-gray-900">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-gray-50 dark:bg-gray-950">
              <tr>
                <th className="px-4 py-3">Domain</th>
                <th className="px-4 py-3">Registrar</th>
                <th className="px-4 py-3">FlipScore</th>
                <th className="px-4 py-3">Purchase</th>
                <th className="px-4 py-3">Asking</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-gray-800">
              {result.items.map((domain) => (
                <tr key={domain.id}>
                  <td className="px-4 py-3 font-medium">
                    <TransitionLink
                      className="underline"
                      href={`/admin/domains/${domain.id}${deleted ? '?deleted=deleted' : ''}`}
                    >
                      {domain.domainName}
                    </TransitionLink>
                  </td>
                  <td className="px-4 py-3">{domain.registrar ?? '—'}</td>
                  <td className="px-4 py-3">{domain.flipScore}</td>
                  <td className="px-4 py-3">
                    ${domain.purchasePrice.toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    ${domain.askingPrice.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 capitalize">{domain.status}</td>
                  <td className="px-4 py-3">
                    <DomainActions
                      domainId={domain.id}
                      deleted={domain.isDeleted}
                      canDelete={canManage}
                      canRestore={canManage}
                      onOptimisticRemove={optimisticRemove}
                      onSuccess={mutationSuccess}
                      onFailure={mutationFailure}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {result?.hasNextPage && result.nextCursor && (
        <button
          type="button"
          onClick={() => update({ cursor: result.nextCursor! })}
          className="rounded-md border px-4 py-2 text-sm"
        >
          Next page
        </button>
      )}
    </div>
  )
}
