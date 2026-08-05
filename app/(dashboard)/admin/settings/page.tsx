'use client'

import { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'

import { useAuth } from '@/hooks/use-auth'

export default function SettingsPage() {
  const { user } = useAuth()
  const { theme, setTheme } = useTheme()

  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>

        <p className="mt-1 text-sm text-gray-500">
          Manage your account and application preferences.
        </p>
      </div>

      <section className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
        <h2 className="text-lg font-semibold">Account</h2>

        <div className="mt-4">
          <p className="text-sm text-gray-500">Email</p>

          <p className="mt-1 font-medium">
            {user?.email ?? 'No email available'}
          </p>
        </div>
      </section>

      <section className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
        <h2 className="text-lg font-semibold">Theme</h2>

        <p className="mt-1 text-sm text-gray-500">
          Choose the appearance of the Wabmarket dashboard.
        </p>

        {mounted && (
          <div className="mt-4 flex flex-wrap gap-3">
            {['light', 'dark', 'system'].map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setTheme(option)}
                className={`rounded-md border px-4 py-2 text-sm capitalize ${
                  theme === option
                    ? 'border-black bg-black text-white dark:border-white dark:bg-white dark:text-black'
                    : 'border-gray-300 dark:border-gray-700'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
