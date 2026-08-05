'use client'

import { useEffect, useState } from 'react'

import { useAuth } from '@/hooks/use-auth'
import { analyticsService } from '@/services/analytics.service'
import type { Analytics } from '@/types'

const initialStats: Analytics = {
  investment: 0,
  revenue: 0,
  profit: 0,
  roi: 0,
  totalDomains: 0,
  totalLeads: 0,
  conversionRate: 0,
}

export default function DashboardPage() {
  const { user } = useAuth()

  const [stats, setStats] = useState<Analytics>(initialStats)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      return
    }

    const fetchStats = async () => {
      try {
        const data = (await analyticsService.getAnalytics(user.uid)) as
          Partial<Analytics> | undefined

        if (data) {
          setStats({
            investment: data.investment ?? 0,
            revenue: data.revenue ?? 0,
            profit: data.profit ?? 0,
            roi: data.roi ?? 0,
            totalDomains: data.totalDomains ?? 0,
            totalLeads: data.totalLeads ?? 0,
            conversionRate: data.conversionRate ?? 0,
          })
        }
      } catch (error) {
        console.error('Failed to load dashboard statistics:', error)
      } finally {
        setIsLoading(false)
      }
    }

    void fetchStats()
  }, [user])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>

        <p className="mt-1 text-sm text-gray-500">
          Overview of your domain business.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Domains"
          value={isLoading ? '...' : stats.totalDomains.toString()}
        />

        <StatCard
          title="Leads"
          value={isLoading ? '...' : stats.totalLeads.toString()}
        />

        <StatCard
          title="Revenue"
          value={
            isLoading
              ? '...'
              : new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD',
                }).format(stats.revenue)
          }
        />

        <StatCard title="ROI" value={isLoading ? '...' : `${stats.roi}%`} />
      </div>
    </div>
  )
}

function StatCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400">
        {title}
      </h2>

      <p className="mt-2 text-3xl font-bold">{value}</p>
    </div>
  )
}
