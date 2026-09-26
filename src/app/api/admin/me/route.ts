import { NextRequest, NextResponse } from 'next/server'
import { verifySessionToken, SESSION_COOKIE_NAME, KNOWN_USERS } from '@/lib/admin-auth'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  const session = request.cookies.get(SESSION_COOKIE_NAME)?.value
  if (!session) {
    return NextResponse.json({ authenticated: false }, { status: 401 })
  }

  // Decode URL-encoding that cookies might have
  const decoded = decodeURIComponent(session)
  const payload = await verifySessionToken(decoded)
  if (!payload) {
    const res = NextResponse.json({ authenticated: false }, { status: 401 })
    // Clear the stale cookie
    res.cookies.set(SESSION_COOKIE_NAME, '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0,
      path: '/',
      expires: new Date(0),
    })
    return res
  }

  const user = KNOWN_USERS[payload.u]
  return NextResponse.json({
    authenticated: true,
    user: {
      username: payload.u,
      role: payload.r,
      displayName: user?.displayName || payload.u,
    },
  })
}
