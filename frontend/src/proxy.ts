import { NextRequest, NextResponse } from 'next/server'
import {
  PUBLIC_ROUTES,
  ADMIN_ROUTES,
  USER_ROUTES,
} from './constants/routes'

// ── Route matching ─────────────────────────────────────────────────────────
function isMatch(pathname: string, routes: string[]): boolean {
  return routes.some(
    (r) => pathname === r || pathname.startsWith(`${r}/`)
  )
}

// ── Redirects ──────────────────────────────────────────────────────────────
function redirect(url: string, req: NextRequest): NextResponse {
  return NextResponse.redirect(new URL(url, req.url))
}

function redirectToLogin(pathname: string, req: NextRequest): NextResponse {
  const url = new URL('/login', req.url)
  url.searchParams.set('callbackUrl', pathname)
  return NextResponse.redirect(url)
}

// ── JWT helpers ────────────────────────────────────────────────────────────
function normalizeRole(role: string): string {
  return role.startsWith('ROLE_') ? role : `ROLE_${role}`
}

function decodeRoles(token: string): string[] {
  try {
    const payload = JSON.parse(
      Buffer.from(token.split('.')[1], 'base64url').toString()
    )
    const roles: string[] = payload.roles ?? []
    return roles.map(normalizeRole)
  } catch {
    return []
  }
}

function hasRole(roles: string[], role: string): boolean {
  return roles.includes(normalizeRole(role))
}

function getDefaultRoute(roles: string[]): string {
  if (hasRole(roles, 'ADMIN'))       return '/dashboard'
  return '/account'
}

// ── Open redirect guard ────────────────────────────────────────────────────
function safeCallback(raw: string | null, fallback: string): string {
  if (!raw)                                    return fallback
  if (raw.startsWith('/') && !raw.startsWith('//')) return raw
  return fallback
}

// ── Middleware ─────────────────────────────────────────────────────────────
export function proxy(req: NextRequest): NextResponse {
  const { pathname } = req.nextUrl

  // Read tokens
  const accessToken  = req.cookies.get('access_token')?.value
  const refreshToken = req.cookies.get('refresh_token')?.value
  const roles        = accessToken ? decodeRoles(accessToken) : []

  // Session states
  const isLoggedIn = !!accessToken                   // confirmed session
  const canRefresh = !accessToken && !!refreshToken  // stale, recoverable
  const appRoute   = getDefaultRoute(roles)

  // Route types
  const isPublic     = isMatch(pathname, PUBLIC_ROUTES)
  const isAdmin      = isMatch(pathname, ADMIN_ROUTES)
  const isUser       = isMatch(pathname, USER_ROUTES)
  const isProtected  = isAdmin || isUser

  // ── 1. Logged-in → away from public pages ─────────────────────────────
  if (isLoggedIn && isPublic) {
    const cb = req.nextUrl.searchParams.get('callbackUrl')
    return redirect(safeCallback(cb, appRoute), req)
  }

  // ── 2. Can refresh → away from public pages ───────────────────────────
  if (canRefresh && isPublic) {
    const cb = req.nextUrl.searchParams.get('callbackUrl')
    return redirect(safeCallback(cb, '/account'), req)
  }

  // ── 3. Guest → blocked from protected pages ───────────────────────────
  if (!isLoggedIn && !canRefresh && isProtected) {
    return redirectToLogin(pathname, req)
  }

  // ── 4. canRefresh → let through (useAuth will silently refresh) ────────
  if (canRefresh && isProtected) {
    return NextResponse.next()
  }

  // ── 5. Wrong role → redirect to own area ──────────────────────────────
  if (isLoggedIn && isAdmin      && !hasRole(roles, 'ADMIN'))       return redirect(appRoute, req)
  if (isLoggedIn && isUser       && hasRole(roles, 'ADMIN')) return redirect(appRoute, req)

  // ── 6. All good ────────────────────────────────────────────────────────
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)).*)',
  ],
}
