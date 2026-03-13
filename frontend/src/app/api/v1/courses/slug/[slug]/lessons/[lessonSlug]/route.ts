
import { NextRequest } from 'next/server'
import { proxyToBackend } from '@/lib/proxy'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; lessonSlug: string }> }
) {
  const { slug, lessonSlug } = await params
  return proxyToBackend(request, `/api/v1/courses/slug/${slug}/lessons/${lessonSlug}`)
}
