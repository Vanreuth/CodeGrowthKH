import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ provider: string }> }
) {
  const { provider } = await params
  const backend = process.env.API_BASE_URL ?? 'https://growcodekh.onrender.com'
  return NextResponse.redirect(`${backend}/oauth2/authorization/${provider}`)
}