import { get, post, put, del, buildFormData } from '@/lib/api/client'
import type { PageResponse, PaginationParams, CourseFilterParams } from '@/types/api'
import type { LessonResponse } from '@/types/lessonType'
import type {
  CourseStatus,
  CourseLevel,
  CourseRequest,
  CourseResponse,
  InstructorStatsResponse,
} from '@/types/courseType'

// ─────────────────────────────────────────────────────────────
//  COURSE SERVICE
// ─────────────────────────────────────────────────────────────

const COURSE_PATH      = '/api/v1/courses'
const INSTRUCTOR_PATH  = '/api/v1/instructor'

export const courseService = {
  /** GET / — paginated courses with optional filters */
  getAll: (params: CourseFilterParams = {}): Promise<PageResponse<CourseResponse>> => {
    const { page = 0, size = 10, sortBy = 'orderIndex', sortDir = 'asc',
            categoryId, status, level, search, isFeatured, isFree } = params
    const q: Record<string, unknown> = { page, size, sortBy, sortDir }
    if (categoryId !== undefined) q.categoryId = categoryId
    if (status)                   q.status     = status
    if (level)                    q.level      = level
    if (search)                   q.search     = search
    if (isFeatured !== undefined) q.isFeatured = isFeatured
    if (isFree !== undefined)     q.isFree     = isFree
    return get<PageResponse<CourseResponse>>(COURSE_PATH, { params: q })
  },

  /** GET /:id */
  getById: (id: number): Promise<CourseResponse> =>
    get<CourseResponse>(`${COURSE_PATH}/${id}`),

  /** GET /slug/:slug */
  getBySlug: (slug: string): Promise<CourseResponse> =>
    get<CourseResponse>(`${COURSE_PATH}/slug/${slug}`),

  /** GET /slug/:slug/full — course with nested chapters + lessons */
  getWithChapters: (slug: string): Promise<CourseResponse> =>
    get<CourseResponse>(`${COURSE_PATH}/slug/${slug}/full`),

  /** GET /slug/:courseSlug/lessons/:lessonSlug */
  getLessonBySlug: (courseSlug: string, lessonSlug: string): Promise<LessonResponse> =>
    get<LessonResponse>(`${COURSE_PATH}/slug/${courseSlug}/lessons/${lessonSlug}`),

  /** GET /category/:categoryId — paginated */
  getByCategory: (
    categoryId: number,
    params: Pick<PaginationParams, 'page' | 'size'> = {}
  ): Promise<PageResponse<CourseResponse>> => {
    const { page = 0, size = 10 } = params
    return get<PageResponse<CourseResponse>>(`${COURSE_PATH}/category/${categoryId}`, { params: { page, size } })
  },

  /** GET /instructor/:instructorId — paginated */
  getByInstructor: (
    instructorId: number,
    params: Pick<PaginationParams, 'page' | 'size'> = {}
  ): Promise<PageResponse<CourseResponse>> => {
    const { page = 0, size = 10 } = params
    return get<PageResponse<CourseResponse>>(`${COURSE_PATH}/instructor/${instructorId}`, { params: { page, size } })
  },

  /** GET /featured — paginated */
  getFeatured: (params: PaginationParams = {}): Promise<PageResponse<CourseResponse>> => {
    const { page = 0, size = 10, sortBy = 'orderIndex', sortDir = 'asc' } = params
    return get<PageResponse<CourseResponse>>(`${COURSE_PATH}/featured`, { params: { page, size, sortBy, sortDir } })
  },

  /** GET /coming-soon — paginated, sorted by launchDate asc */
  getComingSoon: (
    params: Pick<PaginationParams, 'page' | 'size'> = {}
  ): Promise<PageResponse<CourseResponse>> => {
    const { page = 0, size = 10 } = params
    return get<PageResponse<CourseResponse>>(`${COURSE_PATH}/coming-soon`, { params: { page, size } })
  },

  /** GET /instructor/courses — courses owned by current instructor */
  getMine: (params: CourseFilterParams = {}): Promise<PageResponse<CourseResponse>> => {
    const { page = 0, size = 10, sortBy = 'orderIndex', sortDir = 'asc',
            categoryId, status, level, search, isFeatured, isFree } = params
    const q: Record<string, unknown> = { page, size, sortBy, sortDir }
    if (categoryId !== undefined) q.categoryId = categoryId
    if (status)                   q.status     = status
    if (level)                    q.level      = level
    if (search)                   q.search     = search
    if (isFeatured !== undefined) q.isFeatured = isFeatured
    if (isFree !== undefined)     q.isFree     = isFree
    return get<PageResponse<CourseResponse>>(`${INSTRUCTOR_PATH}/courses`, { params: q })
  },

  getMyCourseById: (id: number): Promise<CourseResponse> =>
    get<CourseResponse>(`${INSTRUCTOR_PATH}/courses/${id}`),

  getInstructorStats: (): Promise<InstructorStatsResponse> =>
    get<InstructorStatsResponse>(`${INSTRUCTOR_PATH}/stats`),

  /** POST / — [ADMIN, INSTRUCTOR] multipart/form-data */
  create: (payload: CourseRequest, thumbnail?: File): Promise<CourseResponse> => {
    const form = buildFormData(payload as unknown as Record<string, unknown>, { thumbnail })
    return post<CourseResponse>(COURSE_PATH, form, { multipart: true })
  },

  /** PUT /:id — [ADMIN, INSTRUCTOR] multipart/form-data */
  update: (id: number, payload: CourseRequest, thumbnail?: File): Promise<CourseResponse> => {
    const form = buildFormData(payload as unknown as Record<string, unknown>, { thumbnail })
    return put<CourseResponse>(`${COURSE_PATH}/${id}`, form, { multipart: true })
  },

  /** DELETE /:id — [ADMIN, INSTRUCTOR] */
  remove: (id: number): Promise<void> =>
    del<void>(`${COURSE_PATH}/${id}`, { raw: true }),
}

// Re-export unused type aliases to prevent "imported but never used" warnings
export type { CourseStatus, CourseLevel }
