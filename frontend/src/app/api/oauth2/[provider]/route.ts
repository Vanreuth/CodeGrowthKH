
import { NextResponse } from 'next/server'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ provider: string }> }
) {
  const { provider } = await params
  const backend =
    process.env.NEXT_PUBLIC_API_URL ??
    process.env.API_BASE_URL ??
    "https://codegrowthkh.onrender.com"

  return NextResponse.redirect(
    `${backend}/oauth2/authorization/${provider}`
  )
}
