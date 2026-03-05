import { get, post, del } from '../lib/BaseApi'
import type {
  LessonProgressResponse,
  LessonProgressRequest,
} from '../types/lessonProgressType'


// ═════════════════════════════════════════════════════════════
//  8. LESSON PROGRESS SERVICE
// ══════════════════════════════════════════════════

const PROGRESS_PATH = '/api/v1/lesson-progress'

export const lessonProgressService = {
  /** POST / — upsert scroll position, reading time, completion */
  upsert: (payload: LessonProgressRequest): Promise<LessonProgressResponse> => {
    return post<LessonProgressResponse>(PROGRESS_PATH, payload)
  },

  /** POST /complete?lessonId= — mark lesson completed */
  markCompleted: (lessonId: number): Promise<LessonProgressResponse> => {
    return post<LessonProgressResponse>(`${PROGRESS_PATH}/complete`, null, { params: { lessonId } })
  },

  /** DELETE /?lessonId= — remove progress record */
  remove: (lessonId: number): Promise<void> => {
    return del<void>(PROGRESS_PATH, { params: { lessonId }, raw: true })
  },

  /** GET /?lessonId= — single lesson progress */
  get: (lessonId: number): Promise<LessonProgressResponse> => {
    return get<LessonProgressResponse>(PROGRESS_PATH, { params: { lessonId } })
  },

  /** GET /me — all progress for authenticated user */
  getMine: (): Promise<LessonProgressResponse[]> => {
    return get<LessonProgressResponse[]>(`${PROGRESS_PATH}/me`)
  },

  /** GET /course/:courseId — progress within a course */
  getByCourse: (courseId: number): Promise<LessonProgressResponse[]> => {
    return get<LessonProgressResponse[]>(`${PROGRESS_PATH}/course/${courseId}`)
  },

  /** GET /me/completed-count — total completed lessons */
  countCompleted: (): Promise<number> => {
    return get<number>(`${PROGRESS_PATH}/me/completed-count`)
  },

  /** GET /course/:courseId/completed-count */
  countCompletedByCourse: (courseId: number): Promise<number> => {
    return get<number>(`${PROGRESS_PATH}/course/${courseId}/completed-count`)
  }
}

//