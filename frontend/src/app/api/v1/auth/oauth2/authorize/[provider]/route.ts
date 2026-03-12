/**
 * GET /api/v1/auth/oauth2/authorize/[provider]
 * Initiates the OAuth2 authorization flow for the given provider.
 * Spring Security returns a 302 → Google; we must relay that redirect
 * back to the browser (redirect: 'manual') instead of following it.
 */
import { NextRequest, NextResponse } from 'next/server'
import { BACKEND } from '@/lib/proxy'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ provider: string }> }
) {
  const { provider } = await params
  const url = `${BACKEND}/oauth2/authorization/${provider}`

  let upstream: Response
  try {
    upstream = await fetch(url, {
      method  : 'GET',
      redirect: 'manual',   // do NOT follow — let the browser do it
      headers : { cookie: request.headers.get('cookie') ?? '' },
    })
  } catch {
    return NextResponse.json({ message: 'Backend unreachable' }, { status: 502 })
  }

  const location = upstream.headers.get('location')
  if (location) {
    return NextResponse.redirect(location, { status: upstream.status })
  }

  // Unexpected: Spring Boot didn't redirect — surface the raw response
  return new NextResponse(await upstream.arrayBuffer(), {
    status : upstream.status,
    headers: { 'content-type': upstream.headers.get('content-type') ?? 'application/json' },
  })
}
