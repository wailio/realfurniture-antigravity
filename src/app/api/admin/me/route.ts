import { NextRequest, NextResponse } from 'next/server'
import { verifySessionToken, SESSION_COOKIE_NAME, KNOWN_USERS } from '@/lib/admin-auth'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  const session = request.cookies.get(SESSION_COOKIE_NAME)?.value
  if (!session) {
    return NextResponse.json({ authenticated: false }, { status: 401 })
  }

  const payload = await verifySessionToken(session)
  if (!payload) {
    return NextResponse.json({ authenticated: false }, { status: 401 })
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
