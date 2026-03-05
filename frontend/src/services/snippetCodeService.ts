import { get, post, put, del } from '../lib/BaseApi'
import type {
  CodeSnippetResponse,
  CodeSnippetRequest,
} from '../types/codeSnippetType'


// ═════════════════════════════════════════════════════════════
//  6. SNIPPET SERVICE
// ═════════════════════════════════════════════════════════════

const SNIPPET_PATH = '/api/v1/snippets'

export const snippetService = {
  /** GET /lesson/:lessonId → CodeSnippetResponse[] */
  getByLesson: (lessonId: number): Promise<CodeSnippetResponse[]> => {
    return get<CodeSnippetResponse[]>(`${SNIPPET_PATH}/lesson/${lessonId}`)
  },

  /** GET /:id */
  getById: (id: number): Promise<CodeSnippetResponse> => {
    return get<CodeSnippetResponse>(`${SNIPPET_PATH}/${id}`)
  },

  /** POST / — [ADMIN] */
  create: (payload: CodeSnippetRequest): Promise<CodeSnippetResponse> => {
    return post<CodeSnippetResponse>(SNIPPET_PATH, payload)
  },

  /** PUT /:id — [ADMIN] */
  update: (id: number, payload: CodeSnippetRequest): Promise<CodeSnippetResponse> => {
    return put<CodeSnippetResponse>(`${SNIPPET_PATH}/${id}`, payload)
  },

  /** DELETE /:id — [ADMIN] */
  remove: (id: number): Promise<void> => {
    return del<void>(`${SNIPPET_PATH}/${id}`, { raw: true })
  }
}
