/**
 * constants/routes.ts
 *
 * Single source of truth for every application route.
 * Import ROUTES (or the grouped arrays) instead of hard-coding path strings.
 *
 * Usage:
 *   import { ROUTES, PUBLIC_ROUTES } from '@/constants/routes'
 *   router.push(ROUTES.DASHBOARD)
 */

export const ROUTES = {
  // ── Public ────────────────────────────────────────────────
  HOME          : '/',
  LOGIN         : '/login',
  REGISTER      : '/register',
  FORGOT_PW     : '/forgot-password',
  VERIFY_EMAIL  : '/verify-email',
  SETUP_2FA     : '/setup-2fa',

  // ── Authenticated (any role) ───────────────────────────────
  ACCOUNT       : '/account',

  // ── Role-specific ─────────────────────────────────────────
  DASHBOARD     : '/dashboard',   // ROLE_ADMIN

  // ── Content ───────────────────────────────────────────────
  COURSES       : '/courses',
  ROADMAP       : '/roadmap',
  ABOUT         : '/about',
  CONTACT       : '/contact',

  // ── OAuth2 callback ───────────────────────────────────────
  OAUTH2_REDIRECT: '/oauth2/redirect',
} as const

/** Union type of every valid route string in the app. */
export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES]

// ── Route groups used by proxy.ts / middleware guards ─────────────────────────

export const PUBLIC_ROUTES: string[] = [
  ROUTES.LOGIN,
  ROUTES.REGISTER,
  ROUTES.FORGOT_PW,
  ROUTES.VERIFY_EMAIL,
  ROUTES.SETUP_2FA,
]

export const ADMIN_ROUTES: string[] = [
  ROUTES.DASHBOARD,
]

export const USER_ROUTES: string[] = [
  ROUTES.ACCOUNT,
]

/** All routes that require a logged-in session. */
export const PROTECTED_ROUTES: string[] = [
  ...ADMIN_ROUTES,
  ...USER_ROUTES,
]
