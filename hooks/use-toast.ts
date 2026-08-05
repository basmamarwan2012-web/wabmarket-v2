'use client'

import { useContext } from 'react'

import { UXContext } from '@/components/ui/ux-provider'

export function useToast() {
  const context = useContext(UXContext)
  if (!context) throw new Error('useToast must be used within UXProvider.')
  return { toast: context.toast, dismissToast: context.dismissToast }
}
