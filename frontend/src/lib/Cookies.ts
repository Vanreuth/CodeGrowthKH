/**
 * Cookie utilities — thin helpers used by AuthContext
 * to write/clear non-HttpOnly cookies that middleware can read.
 *
 * NOTE: access_token and refresh_token are HttpOnly (set by Spring Boot).
 *       Only userRole is written by the client.
 */

export function setRoleCookie(isAdmin: boolean): void {
  if (typeof document === 'undefined') return
  document.cookie = `userRole=${isAdmin ? 'ADMIN' : 'USER'}; path=/; SameSite=Strict`
}

export function clearRoleCookie(): void {
  if (typeof document === 'undefined') return
  document.cookie = 'userRole=; path=/; max-age=0'
}

export function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`))
  return match ? decodeURIComponent(match[1]) : null
}








