import { NextRequest, NextResponse } from 'next/server'
import {
  AUTH_SALT,
  sha256,
  safeEqual,
  createSessionToken,
  SESSION_COOKIE_NAME,
  findUser,
} from '@/lib/admin-auth'
import { checkRateLimit } from '@/lib/rate-limit'

export const runtime = 'edge'

export async function POST(request: NextRequest) {
  try {
    // Brute-force protection: max 5 login attempts per 15 minutes per IP
    const rl = checkRateLimit(request, {
      endpointName: 'admin-login',
      maxRequests: 5,
      windowMs: 15 * 60 * 1000,
    })
    if (!rl.allowed) {
      return NextResponse.json(
        { error: 'Trop de tentatives. Réessayez dans 15 minutes.' },
        { status: 429 }
      )
    }

    const body = await request.json()
    const { username, password } = body as { username?: string; password?: string }

    if (!username || !password) {
      return NextResponse.json({ error: 'Identifiant et mot de passe requis' }, { status: 400 })
    }

    const cleanUser = username.toLowerCase().trim()
    const user = await findUser(cleanUser)

    if (!user) {
      await delay(250)
      return NextResponse.json({ error: 'Identifiants incorrects' }, { status: 401 })
    }

    if (user.status === 'suspended') {
      return NextResponse.json({ error: 'Ce compte utilisateur est suspendu' }, { status: 403 })
    }

    // Hash incoming password with salt
    const incomingHash = await sha256(password + AUTH_SALT)

    if (!safeEqual(incomingHash, user.passwordHash)) {
      await delay(250)
      return NextResponse.json({ error: 'Identifiants incorrects' }, { status: 401 })
    }

    // Create HMAC-signed session token
    const token = await createSessionToken(user)

    const permissions = Array.isArray(user.permissions)
      ? user.permissions
      : user.role === 'developer' || user.username === 'toweradmin'
      ? ['dashboard', 'products', 'orders', 'sales', 'website-info', 'users']
      : ['products', 'orders', 'sales', 'website-info']

    const response = NextResponse.json({
      success: true,
      user: {
        username: user.username,
        role: user.role,
        displayName: user.displayName,
        permissions,
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
