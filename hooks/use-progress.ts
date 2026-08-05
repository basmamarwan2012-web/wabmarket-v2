'use client'

import { useContext } from 'react'

import { UXContext } from '@/components/ui/ux-provider'

export function useProgress() {
  const context = useContext(UXContext)
  if (!context) throw new Error('useProgress must be used within UXProvider.')
  return {
    beginProgress: context.beginProgress,
    beginNavigation: context.beginNavigation,
  }
}
