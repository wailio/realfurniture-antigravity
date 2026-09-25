import { NextResponse } from 'next/server'
import { SESSION_COOKIE_NAME } from '@/lib/admin-auth'

export const runtime = 'edge'

export async function POST() {
  const response = NextResponse.json({ success: true })
  response.cookies.set(SESSION_COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 0,
    path: '/',
    expires: new Date(0),
  })
  return response
}
