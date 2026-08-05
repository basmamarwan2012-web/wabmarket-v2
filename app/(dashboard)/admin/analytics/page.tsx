'use client'

import { useEffect, useState } from 'react'

import { useAuth } from '@/hooks/use-auth'
import { analyticsService } from '@/services/analytics.service'
import type { Analytics } from '@/types'

const initialAnalytics: Analytics = {
  investment: 0,
  revenue: 0,
  profit: 0,
  roi: 0,
  totalDomains: 0,
  totalLeads: 0,
  conversionRate: 0,
}

export default function AnalyticsPage() {
  const { user } = useAuth()

  const [analytics, setAnalytics] = useState<Analytics>(initialAnalytics)

  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      return
    }

    const fetchAnalytics = async () => {
      try {
        const data = (await analyticsService.getAnalytics(user.uid)) as
          Partial<Analytics> | undefined

        if (data) {
          setAnalytics({
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
        console.error('Failed to load analytics:', error)
      } finally {
        setIsLoading(false)
      }
    }

    void fetchAnalytics()
  }, [user])

  const metrics = [
    {
      label: 'Investment',
      value: `$${analytics.investment.toLocaleString()}`,
    },
    {
      label: 'Revenue',
      value: `$${analytics.revenue.toLocaleString()}`,
    },
    {
      label: 'Profit',
      value: `$${analytics.profit.toLocaleString()}`,
    },
    {
      label: 'ROI',
      value: `${analytics.roi}%`,
    },
    {
      label: 'Total domains',
      value: analytics.totalDomains.toString(),
    },
    {
      label: 'Conversion rate',
      value: `${analytics.conversionRate}%`,
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Analytics</h1>

        <p className="mt-1 text-sm text-gray-500">
          Track the performance of your domain portfolio.
        </p>
      </div>

      {isLoading ? (
        <p className="text-sm text-gray-500">Loading analytics...</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {metrics.map((metric) => (
            <div
              key={metric.label}
              className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900"
            >
              <p className="text-sm text-gray-500">{metric.label}</p>

              <p className="mt-2 text-3xl font-bold">{metric.value}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
