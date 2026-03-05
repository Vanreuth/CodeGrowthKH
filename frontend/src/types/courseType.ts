import type {
  ChapterResponse,
} from '@/types/chapterType'

export interface CourseResponse {
  id: number
  title: string
  slug: string
  description?: string
  thumbnail?: string | null
  featured: boolean
  isFeatured?: boolean
  comingSoon: boolean
  launchDate?: string | null
  categoryId?: number
  categoryName?: string
  instructorId?: number
  instructorName?: string
  level?: string
  status?: string
  language?: string
  price?: number
  isFree?: boolean
  requirements?: string | null
  totalLessons?: number
  totalChapters?: number
  enrolledCount?: number
  viewCount?: number
  avgRating?: number
  publishedAt?: string | null
  chapters?: ChapterResponse[]
  createdAt: string
  updatedAt: string
}

export interface CourseRequest {
  title: string
  description?: string
  featured?: boolean
  comingSoon?: boolean
  launchDate?: string
  categoryId?: number
  instructorId?: number
}