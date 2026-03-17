import { NextRequest, NextResponse } from 'next/server'

// ── Config ─────────────────────────────────────────────────────────────────

export const BACKEND = (
  process.env.NEXT_PUBLIC_API_URL ??
  process.env.API_BASE_URL ?? ''
).replace(/\/$/, '')

const HOP_BY_HOP = new Set([
  'connection',
  'keep-alive',
  'proxy-authenticate',
  'proxy-authorization',
  'te',
  'trailers',
  'transfer-encoding',
  'upgrade',
  'x-middleware-subrequest',
  'x-middleware-invoke',
])

// ── Types ──────────────────────────────────────────────────────────────────

export interface ProxyOptions {
  /** Override HTTP method (default: mirror request method) */
  method?  : string
  /** Override request body */
  body?    : BodyInit
  /** Extra headers to merge into upstream request */
  headers? : Record<string, string>
}

// ── Core ───────────────────────────────────────────────────────────────────

/**
 * Forward a Next.js request to the Spring Boot backend and relay
 * the full response — including ALL Set-Cookie headers — back to the browser.
 *
 * Handles:
 *   ✅ Streaming request body (no memory overhead for large uploads)
 *   ✅ Both access_token + refresh_token Set-Cookie headers
 *   ✅ Correct content-type passthrough
 *   ✅ 502 fallback when backend is unreachable
 *
 * @param request     Incoming Next.js request
 * @param backendPath Backend path e.g. '/api/v1/auth/login'
 * @param options     Optional method / body / header overrides
 */
export async function proxyToBackend(
  request     : NextRequest,
  backendPath : string,
  options     : ProxyOptions = {},
): Promise<NextResponse> {

  const url = `${BACKEND}${backendPath}${request.nextUrl.search}`

  // ── 1. Build upstream headers ──────────────────────────────────────────
  const upstreamHeaders = buildUpstreamHeaders(request, options.headers)

  // ── 2. Call Spring Boot ────────────────────────────────────────────────
  let upstream: Response
  try {
    upstream = await fetch(url, {
      method : options.method ?? request.method,
      headers: upstreamHeaders,
      body   : resolveBody(request, options.method ?? request.method, options.body),
      // @ts-expect-error — Node 18+ fetch requires duplex for streaming request.body
      duplex : 'half',
    })
  } catch (err) {
    console.error(`[bff] unreachable → ${url}`, err)
    return NextResponse.json(
      { message: 'Backend unreachable' },
      { status: 502 },
    )
  }

  // ── 3. Build + return response ─────────────────────────────────────────
  return buildResponse(upstream)
}

// ── Helpers ────────────────────────────────────────────────────────────────

/**
 * Build clean upstream headers:
 *   - Strip hop-by-hop headers (connection-level, not app-level)
 *   - Strip host (let fetch set the correct backend host automatically)
 *   - Always forward cookies (access_token + refresh_token)
 *   - Merge any caller-supplied extra headers
 */
function buildUpstreamHeaders(
  request : NextRequest,
  extras? : Record<string, string>,
): Headers {
  const headers = new Headers()

  for (const [key, value] of request.headers.entries()) {
    const lower = key.toLowerCase()
    if (HOP_BY_HOP.has(lower)) continue  // never forward connection headers
    if (lower === 'host')       continue  // let fetch set correct backend host
    headers.set(key, value)
  }

  // Explicitly forward cookies so Spring Boot can read access_token
  const cookie = request.headers.get('cookie')
  if (cookie) headers.set('cookie', cookie)

  // Merge caller overrides last (highest priority)
  if (extras) {
    for (const [key, value] of Object.entries(extras)) {
      headers.set(key, value)
    }
  }

  return headers
}

/**
 * Resolve request body:
 *   - GET / HEAD → never have a body
 *   - Everything else → stream request.body directly (no JSON.parse overhead)
 *     This supports large file uploads without loading into memory.
 */
function resolveBody(
  request  : NextRequest,
  method   : string,
  override?: BodyInit,
): BodyInit | undefined {
  if (['GET', 'HEAD'].includes(method.toUpperCase())) return undefined
  return override ?? request.body ?? undefined
}

/**
 * Build the NextResponse from the upstream response:
 *   - Mirror exact status code
 *   - Copy safe response headers
 *   - Skip content-encoding (fetch already decoded the body)
 *   - Forward ALL Set-Cookie headers using getSetCookie()
 *     because Headers.get('set-cookie') only returns the FIRST one
 */
async function buildResponse(upstream: Response): Promise<NextResponse> {
  const body = await upstream.arrayBuffer()
  // arrayBuffer handles any content type: JSON, files, images, binary

  const response = new NextResponse(body, {
    status  : upstream.status,
    headers : {
      'content-type': upstream.headers.get('content-type') ?? 'application/json',
    },
  })

  // Copy safe response headers
  for (const [key, value] of upstream.headers.entries()) {
    const lower = key.toLowerCase()
    if (HOP_BY_HOP.has(lower))       continue  // skip connection headers
    if (lower === 'set-cookie')       continue  // handled separately below
    if (lower === 'content-encoding') continue  // body already decoded by fetch
    if (lower === 'content-length')   continue  // length can change after decoding
    response.headers.set(key, value)
  }

  // Forward ALL Set-Cookie headers
  //
  // Spring Boot sends TWO separate Set-Cookie headers:
  //   Set-Cookie: access_token=xxx;  HttpOnly; Max-Age=900
  //   Set-Cookie: refresh_token=yyy; HttpOnly; Max-Age=604800
  //
  // Headers.get('set-cookie') → returns only the FIRST one ❌
  // headers.getSetCookie()    → returns ALL as string[]    ✅
  //
  // We use .append() not .set() so both cookies are preserved.
  const setCookies =
    upstream.headers.getSetCookie?.() ??
    upstream.headers.get('set-cookie')?.split(/,(?=\s*\w+=)/) ??
    []

  for (const cookie of setCookies) {
    response.headers.append('set-cookie', cookie)
  }

  return response
}
