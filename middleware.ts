import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// This middleware is prepared for i18n but currently pass-through
// To enable full i18n routing, the app directory needs to be restructured with [locale] segments
export function middleware(request: NextRequest) {
  // For now, just pass through all requests
  // The locale switcher component will handle client-side language switching
  return NextResponse.next()
}

export const config = {
  // Don't run middleware on API routes, static files, or images
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
