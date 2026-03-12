import { cookies }      from 'next/headers'
import { NextResponse } from 'next/server'

// ── Constants ──────────────────────────────────────────────────────────────

const COOKIE_NAME = {
  ACCESS  : 'access_token',
  REFRESH : 'refresh_token',
} as const

// Fallback TTL — only used if JWT has no exp claim
const FALLBACK_TTL = {
  ACCESS  : 60 * 15,           // 15 min
  REFRESH : 60 * 60 * 24 * 7, // 7 days
}

const COOKIE_BASE = {
  httpOnly : true,
  secure   : process.env.NODE_ENV === 'production',
  sameSite : 'lax' as const,
  path     : '/',
}

// ── JWT exp reader ─────────────────────────────────────────────────────────

/**
 * Read exp from JWT payload → return remaining seconds.
 * This ensures Next.js cookie lifetime always matches the JWT exactly.
 */
function getTokenTTL(token: string, fallback: number): number {
  try {
    const payload = JSON.parse(
      Buffer.from(token.split('.')[1], 'base64url').toString()
    )

    if (!payload.exp) return fallback

    const remaining = payload.exp - Math.floor(Date.now() / 1000)

    if (remaining <= 0)                     return 0        // already expired
    if (remaining > 60 * 60 * 24 * 30)     return fallback // cap at 30 days

    return remaining
  } catch {
    return fallback
  }
}

// ── Read ───────────────────────────────────────────────────────────────────

export async function getAccessToken(): Promise<string | null> {
  return (await cookies()).get(COOKIE_NAME.ACCESS)?.value ?? null
}

export async function getRefreshToken(): Promise<string | null> {
  return (await cookies()).get(COOKIE_NAME.REFRESH)?.value ?? null
}

export async function getAuthTokens() {
  const jar = await cookies()
  return {
    accessToken  : jar.get(COOKIE_NAME.ACCESS)?.value  ?? null,
    refreshToken : jar.get(COOKIE_NAME.REFRESH)?.value ?? null,
  }
}

// ── Write — TTL read from JWT exp ──────────────────────────────────────────

/** Set access_token cookie — maxAge derived from JWT exp */
export async function setAccessToken(token: string): Promise<void> {
  (await cookies()).set(COOKIE_NAME.ACCESS, token, {
    ...COOKIE_BASE,
    maxAge: getTokenTTL(token, FALLBACK_TTL.ACCESS),
    // ↑ reads exp from token itself — always in sync with Spring Boot ✅
  })
}

/** Set refresh_token cookie — maxAge derived from JWT exp */
export async function setRefreshToken(token: string): Promise<void> {
  (await cookies()).set(COOKIE_NAME.REFRESH, token, {
    ...COOKIE_BASE,
    maxAge: getTokenTTL(token, FALLBACK_TTL.REFRESH),
    // ↑ reads exp from token itself — always in sync with Spring Boot ✅
  })
}

/** Set both tokens at once */
export async function setAuthTokens(
  accessToken  : string,
  refreshToken : string,
): Promise<void> {
  await Promise.all([
    setAccessToken(accessToken),
    setRefreshToken(refreshToken),
  ])
}

// ── Delete ─────────────────────────────────────────────────────────────────

export async function clearAuthCookies(): Promise<void> {
  const jar = await cookies()
  jar.delete(COOKIE_NAME.ACCESS)
  jar.delete(COOKIE_NAME.REFRESH)
}

// ── Response-level expiry ──────────────────────────────────────────────────

export function expireCookie(response: NextResponse, name: string): void {
  response.headers.append(
    'set-cookie',
    `${name}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`,
  )
}

export function expireAuthCookies(response: NextResponse): void {
  expireCookie(response, COOKIE_NAME.ACCESS)
  expireCookie(response, COOKIE_NAME.REFRESH)
}