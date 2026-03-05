
export interface CodeSnippetResponse {
  id: number
  language: string
  code: string
  description?: string
  orderIndex: number
  lessonId: number
}

export interface CodeSnippetRequest {
  language: string
  code: string
  description?: string
  orderIndex?: number
  lessonId: number
}
