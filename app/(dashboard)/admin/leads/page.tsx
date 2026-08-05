'use client'

import { useEffect, useState } from 'react'

import { useAuth } from '@/hooks/use-auth'
import { leadService } from '@/services/lead.service'
import type { Lead } from '@/types'

export default function LeadsPage() {
  const { user } = useAuth()

  const [leads, setLeads] = useState<Lead[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      return
    }

    const fetchLeads = async () => {
      try {
        const data = await leadService.getLeads(user.uid)
        setLeads(data as Lead[])
      } catch (error) {
        console.error('Failed to load leads:', error)
      } finally {
        setIsLoading(false)
      }
    }

    void fetchLeads()
  }, [user])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Leads</h1>

        <p className="mt-1 text-sm text-gray-500">
          Manage potential buyers for your domains.
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        {isLoading ? (
          <p className="p-6 text-sm text-gray-500">Loading leads...</p>
        ) : leads.length === 0 ? (
          <div className="p-10 text-center">
            <h2 className="font-semibold">No leads yet</h2>

            <p className="mt-2 text-sm text-gray-500">
              Generated and imported leads will appear here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-800">
            {leads.map((lead) => (
              <div
                key={lead.id}
                className="flex items-center justify-between p-5"
              >
                <div>
                  <p className="font-semibold">{lead.companyName}</p>

                  <p className="text-sm text-gray-500">{lead.email}</p>
                </div>

                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs capitalize dark:bg-gray-800">
                  {lead.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
