'use client'

import type { ReactNode } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useTheme } from 'next-themes'

import type { UserRole } from '@/lib/auth/roles'
import { logoutUser } from '@/services/auth.service'
import { RoleProvider } from '@/components/auth/role-provider'
import { Spinner } from '@/components/ui/spinner'
import { TransitionLink } from '@/components/ui/transition-link'
import { useLoading } from '@/hooks/use-loading'
import { useToast } from '@/hooks/use-toast'
import { useState } from 'react'

const navItems = [
  { name: 'Dashboard', href: '/admin/dashboard' },
  { name: 'Portfolio', href: '/admin/domains' },
  { name: 'Marketplace', href: '/admin/marketplace' },
  { name: 'Domain Discovery', href: '/admin/discovery' },
  { name: 'Opportunities', href: '/admin/opportunities' },
  { name: 'Leads', href: '/admin/leads' },
  { name: 'Campaigns', href: '/admin/campaigns' },
  { name: 'Analytics', href: '/admin/analytics' },
  { name: 'Settings', href: '/admin/settings' },
]

interface AdminShellProps {
  children: ReactNode
  email: string | null
  role: UserRole
}

export function AdminShell({ children, email, role }: AdminShellProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { setTheme } = useTheme()
  const { beginLoading } = useLoading()
  const { toast } = useToast()
  const [loggingOut, setLoggingOut] = useState(false)

  const handleLogout = async () => {
    if (loggingOut) return
    setLoggingOut(true)
    const operation = beginLoading({ message: 'Please wait...' })
    try {
      await logoutUser()
      router.replace('/login')
      router.refresh()
    } catch (error) {
      console.error('Logout failed:', error)
      toast({ variant: 'error', message: 'Logout failed.' })
    } finally {
      operation.finish()
      setLoggingOut(false)
    }
  }

  return (
    <RoleProvider role={role}>
      <div className="flex min-h-screen bg-gray-50 text-gray-900 transition-colors dark:bg-gray-950 dark:text-gray-100">
        <aside className="w-64 flex-shrink-0 border-r border-gray-200 bg-white px-4 py-6 dark:border-gray-800 dark:bg-gray-900">
          <div className="mb-8 px-2">
            <TransitionLink
              href="/admin/dashboard"
              className="text-xl font-bold"
            >
              Wabmarket
            </TransitionLink>
            <p className="mt-1 text-xs capitalize text-gray-500">{role}</p>
          </div>

          <nav className="space-y-1" aria-label="Admin navigation">
            {navItems.map((item) => {
              const active =
                pathname === item.href || pathname.startsWith(`${item.href}/`)

              return (
                <TransitionLink
                  key={item.href}
                  href={item.href}
                  className={`block rounded-md px-3 py-2 text-sm font-medium ${
                    active
                      ? 'bg-gray-100 dark:bg-gray-800'
                      : 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800'
                  }`}
                >
                  {item.name}
                </TransitionLink>
              )
            })}
          </nav>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-8 dark:border-gray-800 dark:bg-gray-900">
            <div>
              <p className="text-sm font-medium">AI Domain Marketplace</p>
              <p className="text-xs text-gray-500">
                {email ?? 'Authenticated user'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              {(['light', 'dark', 'system'] as const).map((theme) => (
                <button
                  key={theme}
                  type="button"
                  onClick={() => setTheme(theme)}
                  className="rounded-md border px-2 py-1 text-xs capitalize"
                >
                  {theme}
                </button>
              ))}
              <button
                type="button"
                disabled={loggingOut}
                onClick={handleLogout}
                className="inline-flex items-center gap-2 rounded-md border border-gray-300 px-4 py-2 text-sm font-medium disabled:opacity-60 dark:border-gray-700"
              >
                {loggingOut && <Spinner />}
                {loggingOut ? 'Logging out...' : 'Logout'}
              </button>
            </div>
          </header>

          <main className="flex-1 p-8">{children}</main>
        </div>
      </div>
    </RoleProvider>
  )
}
