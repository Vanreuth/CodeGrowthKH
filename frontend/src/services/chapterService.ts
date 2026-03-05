import { get, post, put, del} from '../lib/BaseApi'
import type {
  ChapterResponse,
  ChapterRequest,
} from '../types/apiType'

// ═════════════════════════════════════════════════════════════
//  4. CHAPTER SERVICE
// ═════════════════════════════════════════════════════════════

const CHAPTER_PATH = '/api/v1/chapters'

export const chapterService = {
  /** GET /course/:courseId → ChapterResponse[] */
  getByCourse: (courseId: number): Promise<ChapterResponse[]> => {
    return get<ChapterResponse[]>(`${CHAPTER_PATH}/course/${courseId}`)
  },

  /** GET /:id */
  getById: (id: number): Promise<ChapterResponse> => {
    return get<ChapterResponse>(`${CHAPTER_PATH}/${id}`)
  },

  /** POST / — [ADMIN] */
  create: (payload: ChapterRequest): Promise<ChapterResponse> => {
    return post<ChapterResponse>(CHAPTER_PATH, payload)
  },

  /** PUT /:id — [ADMIN] */
  update: (id: number, payload: ChapterRequest): Promise<ChapterResponse> => {
    return put<ChapterResponse>(`${CHAPTER_PATH}/${id}`, payload)
  },

  /** DELETE /:id — [ADMIN] */
  remove: (id: number): Promise<void> => {
    return del<void>(`${CHAPTER_PATH}/${id}`, { raw: true })
  }
}