import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

import { SESSION_COOKIE_NAME } from '@/lib/auth/config'

/**
 * Middleware function for Wabmarket.
 * Handles route protection, specifically for /admin paths[cite: 8].
 * Ensures that only authenticated users can access the CRM and Dashboard[cite: 12].
 */
export function middleware(request: NextRequest) {
  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin')

  // Middleware performs presence checking only. Firebase Admin performs full
  // verification in the Node.js admin layout before protected content renders.
  if (isAdminRoute && !request.cookies.has(SESSION_COOKIE_NAME)) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

/**
 * Matcher configuration
 * Excludes API routes and static Next.js files from running through the middleware to save performance.
 */
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
