import { NextRequest, NextResponse } from 'next/server'
import { verifySessionToken, SESSION_COOKIE_NAME } from '@/lib/admin-auth'

// Routes that don't require auth
const PUBLIC_ADMIN_ROUTES = ['/admin/login', '/api/admin/login', '/api/admin/logout']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Only protect /admin/* and /api/admin/* routes
  if (!pathname.startsWith('/admin') && !pathname.startsWith('/api/admin')) {
    return NextResponse.next()
  }

  // Allow public auth routes through
  if (PUBLIC_ADMIN_ROUTES.some((r) => pathname === r || pathname.startsWith(r))) {
    return NextResponse.next()
  }

  // Root /admin route: if not logged in, redirect to /admin/login
  const session = request.cookies.get(SESSION_COOKIE_NAME)?.value
  if (!session) {
    if (pathname.startsWith('/api/admin')) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }
    return NextResponse.redirect(new URL('/admin/login', request.url))
  }

  // Validate session token with HMAC and expiration check
  const payload = await verifySessionToken(session)
  if (!payload) {
    if (pathname.startsWith('/api/admin')) {
      const res = NextResponse.json({ error: 'Session expirée' }, { status: 401 })
      res.cookies.delete(SESSION_COOKIE_NAME)
      return res
    }
    const res = NextResponse.redirect(new URL('/admin/login', request.url))
    res.cookies.delete(SESSION_COOKIE_NAME)
    return res
  }

  // Add user info to headers so server components / route handlers can read it
  const response = NextResponse.next()
  response.headers.set('x-admin-user', payload.u)
  response.headers.set('x-admin-role', payload.r)
  return response
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
}
