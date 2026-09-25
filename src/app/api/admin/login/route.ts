import { NextRequest, NextResponse } from 'next/server'
import {
  KNOWN_USERS,
  AUTH_SALT,
  sha256,
  safeEqual,
  createSessionToken,
  SESSION_COOKIE_NAME,
} from '@/lib/admin-auth'

export const runtime = 'edge'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, password } = body as { username?: string; password?: string }

    if (!username || !password) {
      return NextResponse.json({ error: 'Identifiant et mot de passe requis' }, { status: 400 })
    }

    const cleanUser = username.toLowerCase().trim()
    const user = KNOWN_USERS[cleanUser]

    if (!user) {
      // Artificial delay to prevent timing attacks / user enumeration
      await delay(250)
      return NextResponse.json({ error: 'Identifiants incorrects' }, { status: 401 })
    }

    // Hash incoming password with salt
    const incomingHash = await sha256(password + AUTH_SALT)

    if (!safeEqual(incomingHash, user.passwordHash)) {
      await delay(250)
      return NextResponse.json({ error: 'Identifiants incorrects' }, { status: 401 })
    }

    // Create HMAC-signed session token
    const token = await createSessionToken(user)

    const response = NextResponse.json({
      success: true,
      user: {
        username: user.username,
        role: user.role,
        displayName: user.displayName,
      },
    })

    // Set secure httpOnly cookie (valid for 24 hours)
    response.cookies.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/',
    })

    return response
  } catch (err) {
    console.error('Admin login error:', err)
    return NextResponse.json({ error: 'Erreur lors de la connexion' }, { status: 500 })
  }
}

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms))
}
