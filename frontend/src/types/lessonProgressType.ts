
// ─────────────────────────────────────────────────────────────
//  Lesson Progress
// ─────────────────────────────────────────────────────────────

export interface LessonProgressResponse {
  id: number
  userId: number
  username?: string
  lessonId: number
  lessonTitle?: string
  courseId?: number
  courseTitle?: string
  completed: boolean
  scrollPct?: number
  scrollPosition?: number
  readTimeSeconds?: number
  readingTimeSeconds?: number
  pdfDownloaded: boolean
  completedAt?: string
  updatedAt: string
  createdAt?: string
}

export interface LessonProgressRequest {
  lessonId: number
  scrollPosition?: number
  readingTimeSeconds?: number
  completed?: boolean
  pdfDownloaded?: boolean
  userId?: number // injected server-side, optional on client
}
