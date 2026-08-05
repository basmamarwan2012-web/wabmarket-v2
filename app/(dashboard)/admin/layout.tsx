'use client'

import type { ReactNode } from 'react'
import { useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

import { useAuth } from '@/hooks/use-auth'
import { logoutUser } from '@/services/auth.service'

interface AdminLayoutProps {
  children: ReactNode
}

const navItems = [
  {
    name: 'Dashboard',
    href: '/admin/dashboard',
  },
  {
    name: 'Domains',
    href: '/admin/domains',
  },
  {
    name: 'Leads',
    href: '/admin/leads',
  },
  {
    name: 'Analytics',
    href: '/admin/analytics',
  },
  {
    name: 'Settings',
    href: '/admin/settings',
  },
]

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, loading } = useAuth()

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login')
    }
  }, [loading, user, router])

  const handleLogout = async () => {
    try {
      await logoutUser()
      router.replace('/login')
      router.refresh()
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-gray-500">Checking authentication...</p>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-900 transition-colors dark:bg-gray-950 dark:text-gray-100">
      <aside className="w-64 flex-shrink-0 border-r border-gray-200 bg-white px-4 py-6 dark:border-gray-800 dark:bg-gray-900">
        <div className="mb-8 px-2">
          <Link
            href="/admin/dashboard"
            className="text-xl font-bold text-gray-900 dark:text-white"
          >
            Wabmarket
          </Link>

          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            AI Domain Marketplace
          </p>
        </div>

        <nav className="space-y-1" aria-label="Admin navigation">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(`${item.href}/`)

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`block rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-white'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white'
                }`}
              >
                {item.name}
              </Link>
            )
          })}
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-8 dark:border-gray-800 dark:bg-gray-900">
          <div>
            <h1 className="text-lg font-semibold">AI Domain Marketplace</h1>

            <p className="text-xs text-gray-500 dark:text-gray-400">
              Manage domains, leads, campaigns, and analytics
            </p>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium transition-colors hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
          >
            Logout
          </button>
        </header>

        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  )
}
