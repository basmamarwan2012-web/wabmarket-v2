import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Middleware function for Wabmarket.
 * Handles route protection, specifically for /admin paths[cite: 8].
 * Ensures that only authenticated users can access the CRM and Dashboard[cite: 12].
 */
export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // Define routes that require authentication
  const isAdminRoute = path.startsWith('/admin')

  // TODO: Phase 2 Authentication - Verify Firebase Auth token here.
  // Example structure for the upcoming Firebase logic:
  /*
  const sessionCookie = request.cookies.get("session")?.value;
  if (isAdminRoute && !sessionCookie) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  */

  return NextResponse.next()
}

/**
 * Matcher configuration
 * Excludes API routes and static Next.js files from running through the middleware to save performance.
 */
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
