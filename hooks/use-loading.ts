'use client'

import { useCallback, useContext, useEffect, useRef } from 'react'

import {
  UXContext,
  type LoadingOptions,
  type OperationHandle,
} from '@/components/ui/ux-provider'

export function useLoading() {
  const context = useContext(UXContext)
  const owned = useRef(new Set<OperationHandle>())
  if (!context) throw new Error('useLoading must be used within UXProvider.')

  useEffect(
    () => () => {
      owned.current.forEach((operation) => operation.finish())
      owned.current.clear()
    },
    []
  )

  const beginLoading = useCallback(
    (options?: LoadingOptions) => {
      const operation = context.beginLoading(options)
      owned.current.add(operation)
      return {
        finish: () => {
          operation.finish()
          owned.current.delete(operation)
        },
      }
    },
    [context]
  )

  return { beginLoading }
}
