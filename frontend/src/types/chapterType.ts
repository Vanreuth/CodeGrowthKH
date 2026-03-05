import type {
  LessonResponse,
} from '@/types/lessonType'

export interface ChapterResponse {
  id: number
  title: string
  orderIndex: number
  courseId: number
  /** Extra fields returned by some endpoints */
  description?: string | null
  courseTitle?: string
  lessonCount?: number
  lessons?: LessonResponse[]
  createdAt: string
  updatedAt?: string
}

export interface ChapterRequest {
  title: string
  orderIndex?: number
  courseId: number
}