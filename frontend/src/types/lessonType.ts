import type {
  CodeSnippetResponse,
} from '@/types/codeSnippetType'

export interface LessonResponse {
  id: number
  title: string
  slug?: string
  /** Rich text content of the lesson */
  content?: string
  description?: string | null
  orderIndex: number
  chapterId: number
  chapterTitle?: string
  courseId: number
  courseTitle?: string
  /** Named 'snippets' on the server; 'codeSnippets' is also accepted for lib/types compat */
  snippets?: CodeSnippetResponse[]
  codeSnippets?: CodeSnippetResponse[]
  createdAt: string
  updatedAt?: string | null
  /** Alias — some responses use 'content', kept for lib/types compat */
  readonly content_raw?: string
}

export interface LessonRequest {
  title: string
  content?: string
  orderIndex?: number
  chapterId: number
}
