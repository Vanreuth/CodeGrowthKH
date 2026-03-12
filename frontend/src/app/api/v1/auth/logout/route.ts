/**
 * POST /api/v1/auth/logout
 * Calls Spring Boot to invalidate the refresh token, then force-expires both
 * auth cookies so the browser cannot reuse a stale session.
 */
import { NextRequest, NextResponse } from 'next/server'
import { proxyToBackend } from '@/lib/proxy'
import { expireAuthCookies } from '@/lib/cookies'

export async function POST(request: NextRequest) {
  // Best-effort backend call — cookies are expired regardless of outcome.
  // Any non-2xx (e.g. 500 when token already expired) is normalised to 200
  // so Axios on the client never throws and the logout flow always completes.
  let response: NextResponse
  try {
    const upstream = await proxyToBackend(request, '/api/v1/auth/logout')
    response = upstream.ok
      ? upstream
      : NextResponse.json({ message: 'Logged out' }, { status: 200 })
  } catch {
    response = NextResponse.json({ message: 'Logged out' }, { status: 200 })
  }

  expireAuthCookies(response)

  return response
}
