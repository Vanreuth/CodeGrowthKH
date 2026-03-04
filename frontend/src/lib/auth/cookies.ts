// lib/auth/cookies.ts
// Client-side cookie helpers (document.cookie)
// For server-side (Server Actions / Route Handlers) use next/headers cookies()

export const COOKIE_ACCESS  = "access_token";
export const COOKIE_REFRESH = "refresh_token";

const BASE_OPTS = `path=/; SameSite=Lax${
  process.env.NODE_ENV === "production" ? "; Secure" : ""
}`;

export function setCookie(name: string, value: string, maxAgeSeconds: number) {
  document.cookie = `${name}=${value}; Max-Age=${maxAgeSeconds}; ${BASE_OPTS}`;
}

export function getCookie(name: string): string | undefined {
  return document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`))
    ?.split("=")[1];
}

export function deleteCookie(name: string) {
  document.cookie = `${name}=; Max-Age=0; ${BASE_OPTS}`;
}

export function setTokenCookies(accessToken: string) {
  setCookie(COOKIE_ACCESS, accessToken, 60 * 15); // 15 min
  // refresh_token is set as HttpOnly by Spring Boot via Set-Cookie header
}

export function clearTokenCookies() {
  deleteCookie(COOKIE_ACCESS);
  deleteCookie(COOKIE_REFRESH);
}