'use client'

import { useEffect } from 'react'
import { useAuthState } from 'react-firebase-hooks/auth'

import { auth } from '@/firebase/client'
import { useAuthStore } from '@/store/auth.store'

export function useAuth() {
  const [user, loading, error] = useAuthState(auth)
  const setUserId = useAuthStore((state) => state.setUserId)

  useEffect(() => {
    setUserId(user?.uid ?? null)
  }, [user, setUserId])

  return {
    user,
    userId: user?.uid ?? null,
    loading,
    error,
    isAuthenticated: Boolean(user),
  }
}
