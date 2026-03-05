import { get, post, put, del } from '../lib/BaseApi'
import type {
  LessonResponse,
  LessonRequest,
} from '../types/lessonType'


// ═════════════════════════════════════════════════════════════
//  5. LESSON SERVICE
// ════════════════════════════════════

const LESSON_PATH = '/api/v1/lessons'

export const lessonService = {
  /** GET /chapter/:chapterId → LessonResponse[] */
  getByChapter: (chapterId: number): Promise<LessonResponse[]> => {
    return get<LessonResponse[]>(`${LESSON_PATH}/chapter/${chapterId}`)
  },

  /** GET /course/:courseId → LessonResponse[] */
  getByCourse: (courseId: number): Promise<LessonResponse[]> => {
    return get<LessonResponse[]>(`${LESSON_PATH}/course/${courseId}`)
  },

  /** GET /:id */
  getById: (id: number): Promise<LessonResponse> => {
    return get<LessonResponse>(`${LESSON_PATH}/${id}`)
  },

  /** POST / — [ADMIN] */
  create: (payload: LessonRequest): Promise<LessonResponse> => {
    return post<LessonResponse>(LESSON_PATH, payload)
  },

  /** PUT /:id — [ADMIN] */
  update: (id: number, payload: LessonRequest): Promise<LessonResponse> => {
    return put<LessonResponse>(`${LESSON_PATH}/${id}`, payload)
  },

  /** DELETE /:id — [ADMIN] */
  remove: (id: number): Promise<void> => {
    return del<void>(`${LESSON_PATH}/${id}`, { raw: true })
  }
}