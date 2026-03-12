import { NextRequest } from 'next/server'
import { proxyToBackend } from '@/lib/proxy'
import { expireAuthCookies } from '@/lib/cookies'

export async function POST(req: NextRequest) {
  const res = await proxyToBackend(req, '/api/v1/auth/logout')
  expireAuthCookies(res)  // force delete httpOnly cookies ✅
  return res
}