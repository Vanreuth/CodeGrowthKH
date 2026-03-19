/**
 * GET  /api/v1/courses   — paginated list with filters
 * POST /api/v1/courses   — [ADMIN] create (multipart)
 */
import { NextRequest } from 'next/server'
import { proxyToBackend } from '@/lib/proxy'

export async function GET(request: NextRequest) {
  return proxyToBackend(request, '/api/v1/courses')
}
export async function POST(request: NextRequest) {
  return proxyToBackend(request, '/api/v1/courses')
}
