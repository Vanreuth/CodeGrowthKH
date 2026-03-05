import { NextRequest, NextResponse } from 'next/server'

// ─────────────────────────────────────────────────────────────
//  Route definitions
// ─────────────────────────────────────────────────────────────

const PUBLIC_ROUTES = ['/login', '/register', '/forgot-password']
const ADMIN_ROUTES  = ['/dashboard']
const AUTH_ROUTES   = ['/account', '/profile', '/settings']

// ─────────────────────────────────────────────────────────────
//  Helpers
// ─────────────────────────────────────────────────────────────

function isMatch(pathname: string, routes: string[]): boolean {
  return routes.some((r) => pathname === r || pathname.startsWith(`${r}/`))
}

function redirect(url: string, request: NextRequest): NextResponse {
  return NextResponse.redirect(new URL(url, request.url))
}

// ─────────────────────────────────────────────────────────────
//  Proxy (replaces deprecated middleware)
// ─────────────────────────────────────────────────────────────

export function proxy(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl

  // ✅ access_token  — set by Spring Boot (HttpOnly)
  // ✅ userRole      — set by AuthContext.login() as plain cookie
  const accessToken = request.cookies.get('access_token')?.value
  const userRole    = request.cookies.get('userRole')?.value

  const isLoggedIn    = !!accessToken
  // ✅ matches what AuthContext writes: 'ADMIN' or 'USER'
  const isAdmin       = userRole === 'ADMIN'

  const isPublicRoute = isMatch(pathname, PUBLIC_ROUTES)
  const isAdminRoute  = isMatch(pathname, ADMIN_ROUTES)
  const isAuthRoute   = isMatch(pathname, AUTH_ROUTES)

  // 1. Logged-in user visits /login or /register → bounce home
  if (isLoggedIn && isPublicRoute) {
    return redirect(isAdmin ? '/dashboard' : '/account', request)
  }

  // 2. Guest visits protected user pages → /login?callbackUrl=
  if (!isLoggedIn && isAuthRoute) {
    const url = new URL('/login', request.url)
    url.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(url)
  }

  // 3. Guest visits admin pages → /login?callbackUrl=
  if (isAdminRoute && !isLoggedIn) {
    const url = new URL('/login', request.url)
    url.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(url)
  }

  // 4. Logged-in non-admin visits /dashboard → /account
  if (isAdminRoute && isLoggedIn && !isAdmin) {
    return redirect('/account', request)
  }

  // 5. All good
  return NextResponse.next()
}

// ─────────────────────────────────────────────────────────────
//  Matcher — skip all static assets
// ─────────────────────────────────────────────────────────────

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)).*)',
  ],
}
