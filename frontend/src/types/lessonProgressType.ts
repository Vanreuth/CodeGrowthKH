export interface LessonProgressResponse {
  id: number
  userId: number
  username?: string
  lessonId: number
  lessonTitle?: string
  courseId?: number
  courseTitle?: string
  courseTotalLessons?: number
  completed: boolean
  scrollPct?: number
  scrollPosition?: number
  readTimeSeconds?: number       // ← backend response field name
  pdfDownloaded: boolean
  completedAt?: string
  updatedAt?: string
  createdAt?: string
}

export interface LessonProgressRequest {
  lessonId: number
  scrollPosition?: number
  readTimeSeconds?: number       // ✅ must match Java DTO field (getReadTimeSeconds)
  completed?: boolean
  pdfDownloaded?: boolean
  userId?: number                // injected server-side, optional on client
}
