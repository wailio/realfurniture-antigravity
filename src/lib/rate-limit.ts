import { NextRequest } from 'next/server'

interface RateLimitRecord {
  timestamps: number[]
}

// In-memory sliding window cache per IP (edge instance local)
const ipMap = new Map<string, RateLimitRecord>()

// Clean up stale entries every 5 minutes to avoid memory accumulation
const CLEANUP_INTERVAL = 5 * 60 * 1000
let lastCleanup = Date.now()

function cleanupStale(windowMs: number) {
  const now = Date.now()
  if (now - lastCleanup < CLEANUP_INTERVAL) return
  lastCleanup = now

  for (const [ip, record] of ipMap.entries()) {
    record.timestamps = record.timestamps.filter((ts) => now - ts < windowMs)
    if (record.timestamps.length === 0) {
      ipMap.delete(ip)
    }
  }
}

export function getClientIp(request: NextRequest): string {
  // Cloudflare Pages & edge proxies pass these headers
  const cfIp = request.headers.get('cf-connecting-ip')
  if (cfIp) return cfIp.trim()

  const xRealIp = request.headers.get('x-real-ip')
  if (xRealIp) return xRealIp.trim()

  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }

  return 'unknown'
}

export interface RateLimitOptions {
  maxRequests: number
  windowMs: number
  endpointName?: string
}

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetMs: number
}

/**
 * Edge-compatible sliding-window rate limiter.
 * Protects serverless functions and Supabase from automated DDoS/spam attacks.
 */
export function checkRateLimit(
  request: NextRequest,
  options: RateLimitOptions
): RateLimitResult {
  const { maxRequests, windowMs, endpointName = 'default' } = options
  const ip = getClientIp(request)
  const key = `${endpointName}:${ip}`
  const now = Date.now()

  cleanupStale(windowMs)

  let record = ipMap.get(key)
  if (!record) {
    record = { timestamps: [] }
    ipMap.set(key, record)
  }

  // Filter timestamps within the current sliding window
  record.timestamps = record.timestamps.filter((ts) => now - ts < windowMs)

  if (record.timestamps.length >= maxRequests) {
    const oldest = record.timestamps[0]
    const resetMs = Math.max(0, windowMs - (now - oldest))
    return {
      allowed: false,
      remaining: 0,
      resetMs,
    }
  }

  record.timestamps.push(now)
  return {
    allowed: true,
    remaining: maxRequests - record.timestamps.length,
    resetMs: windowMs,
  }
}

/**
 * Checks for hidden bot honeypot fields.
 * If a bot fills any of these dummy fields, the request is flagged as spam.
 */
export function isBotHoneypotTriggered(body: any, honeypotFields: string[] = ['website', 'company_fax', 'nobot']): boolean {
  if (!body || typeof body !== 'object') return false
  for (const field of honeypotFields) {
    if (body[field] && typeof body[field] === 'string' && body[field].trim().length > 0) {
      return true
    }
  }
  return false
}
