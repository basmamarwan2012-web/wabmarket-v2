import type { ReactNode } from 'react'
import { redirect } from 'next/navigation'

import { AdminShell } from '@/components/layout/admin-shell'
import { hasPermission } from '@/lib/auth/permissions'
import { verifySession } from '@/lib/auth/session'

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await verifySession()

  if (!session || !hasPermission(session.role, 'admin.access')) {
    redirect('/login')
  }

  return (
    <AdminShell email={session.email} role={session.role}>
      {children}
    </AdminShell>
  )
}
