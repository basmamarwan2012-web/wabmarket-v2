'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

import { useAuth } from '@/hooks/use-auth'
import { domainService } from '@/services/domain.service'
import type { Domain } from '@/types'

export default function DomainsPage() {
  const { user } = useAuth()

  const [domains, setDomains] = useState<Domain[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) {
      return
    }

    const fetchDomains = async () => {
      setError(null)

      try {
        const data = await domainService.getDomains(user.uid)

        setDomains(data as Domain[])
      } catch (fetchError) {
        console.error('Failed to load domains:', fetchError)

        setError('Domains could not be loaded. Check Firestore rules.')
      } finally {
        setIsLoading(false)
      }
    }

    void fetchDomains()
  }, [user])

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Owned Domains</h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage your acquired domain portfolio.
          </p>
        </div>

        <Link
          href="/admin/domains/new"
          className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white dark:bg-white dark:text-black"
        >
          Add domain
        </Link>
      </div>

      {error && (
        <p className="rounded-md bg-red-50 p-4 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-400">
          {error}
        </p>
      )}

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        {isLoading ? (
          <p className="p-6 text-sm text-gray-500">Loading domains...</p>
        ) : domains.length === 0 ? (
          <div className="p-10 text-center">
            <h2 className="font-semibold">No domains yet</h2>

            <p className="mt-2 text-sm text-gray-500">
              Add your first owned domain to start building your portfolio.
            </p>

            <Link
              href="/admin/domains/new"
              className="mt-5 inline-block rounded-md border border-gray-300 px-4 py-2 text-sm font-medium dark:border-gray-700"
            >
              Add first domain
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-950">
                <tr>
                  <th className="px-5 py-3 font-medium">Domain</th>
                  <th className="px-5 py-3 font-medium">FlipScore</th>
                  <th className="px-5 py-3 font-medium">Purchase</th>
                  <th className="px-5 py-3 font-medium">Asking</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {domains.map((domain) => (
                  <tr
                    key={domain.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  >
                    <td className="px-5 py-4">
                      <p className="font-semibold">{domain.domainName}</p>

                      <p className="text-xs text-gray-500">
                        {domain.registrar ?? 'Registrar not specified'}
                      </p>
                    </td>

                    <td className="px-5 py-4">{domain.flipScore ?? 0}</td>

                    <td className="px-5 py-4">
                      {formatMoney(domain.purchasePrice ?? 0)}
                    </td>

                    <td className="px-5 py-4">
                      {formatMoney(domain.askingPrice ?? 0)}
                    </td>

                    <td className="px-5 py-4">
                      <span className="rounded-full bg-gray-100 px-3 py-1 text-xs capitalize dark:bg-gray-800">
                        {domain.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

function formatMoney(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value)
}
