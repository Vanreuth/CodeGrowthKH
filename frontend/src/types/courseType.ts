import type {
  ChapterResponse,
} from '@/types/chapterType'

export type CourseStatus = 'DRAFT' | 'PUBLISHED' | 'FEATURED' | 'COMING_SOON'
export type CourseLevel  = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'

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
  orderIndex?: number
  categoryId?: number
  categoryName?: string
  instructorId?: number
  instructorName?: string
  level?: CourseLevel
  status?: CourseStatus
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
  level?: CourseLevel
  status?: CourseStatus
  language?: string
  orderIndex?: number
  categoryId?: number
  featured?: boolean
  comingSoon?: boolean
  launchDate?: string
  isFree?: boolean
  price?: number
  requirements?: string
}
