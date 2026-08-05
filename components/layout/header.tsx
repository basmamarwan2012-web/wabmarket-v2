'use client'

import { logoutUser } from '@/services/auth.service'

export function Header() {
  const handleLogout = async () => {
    try {
      await logoutUser()
      window.location.href = '/login'
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <header className="flex h-16 items-center justify-between border-b px-6">
      <h1 className="text-xl font-semibold">AI Domain Marketplace</h1>

      <button onClick={handleLogout} className="rounded-lg border px-4 py-2">
        Logout
      </button>
    </header>
  )
}
