'use client'

import { createContext, useContext, type ReactNode } from 'react'

import type { UserRole } from '@/lib/auth/roles'

const RoleContext = createContext<UserRole | null>(null)

export function RoleProvider({
  role,
  children,
}: {
  role: UserRole
  children: ReactNode
}) {
  return <RoleContext.Provider value={role}>{children}</RoleContext.Provider>
}

export function useCurrentRole() {
  const role = useContext(RoleContext)
  if (!role) throw new Error('RoleProvider is missing.')
  return role
}
