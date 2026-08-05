'use client'

import * as React from 'react'
import { ThemeProvider as NextThemesProvider } from 'next-themes'

import { UXProvider } from '@/components/ui/ux-provider'

/**
 * Providers component
 * Wraps the application to provide global states like Theme.
 * Satisfies the requirement: support light/dark/system mode, light by default, persistent[cite: 3].
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="light" // Light mode is enabled by default[cite: 3]
      enableSystem // Supports automatic system mode[cite: 3]
      disableTransitionOnChange
    >
      <UXProvider>{children}</UXProvider>
    </NextThemesProvider>
  )
}
