import { get, post, put, del, buildFormData } from '../lib/BaseApi' // Adjust path to your new functional utilities
import type {
  PageResponse,
  PaginationParams,
  CourseFilterParams,
} from '../types/apiType'

import type {
  LessonResponse
} from '../types/lessonType'

import type { CourseStatus, CourseLevel ,CourseRequest,CourseResponse} from '../types/courseType'


// ═════════════════════════════════════════════════════════════
//  3. COURSE SERVICE
// ═════════════════════════════════════════════════════════════

const COURSE_PATH = '/api/v1/courses'

export const courseService = {
  /** GET / — paginated courses with optional filters */
  getAll: (params: CourseFilterParams = {}): Promise<PageResponse<CourseResponse>> => {
    const { page = 0, size = 10, sortBy = 'createdAt', sortDir = 'desc', categoryId, status, level, search, isFeatured, isFree } = params
    const queryParams: Record<string, unknown> = { page, size, sortBy, sortDir }
    if (categoryId !== undefined) queryParams.categoryId = categoryId
    if (status)                   queryParams.status = status
    if (level)                    queryParams.level = level
    if (search)                   queryParams.search = search
    if (isFeatured !== undefined) queryParams.isFeatured = isFeatured
    // if (isFree !== undefined)     queryParams.isFree = isFree
    return get<PageResponse<CourseResponse>>(COURSE_PATH, { params: queryParams })
  },

  /** GET /:id */
  getById: (id: number): Promise<CourseResponse> => {
    return get<CourseResponse>(`${COURSE_PATH}/${id}`)
  },

  /** GET /slug/:slug */
  getBySlug: (slug: string): Promise<CourseResponse> => {
    return get<CourseResponse>(`${COURSE_PATH}/slug/${slug}`)
  },

  /** GET /slug/:slug/full — course with nested chapters + lessons */
  getWithChapters: (slug: string): Promise<CourseResponse> => {
    return get<CourseResponse>(`${COURSE_PATH}/slug/${slug}/full`)
  },

  /** GET /slug/:courseSlug/lessons/:lessonSlug */
  getLessonBySlug: (courseSlug: string, lessonSlug: string): Promise<LessonResponse> => {
    return get<LessonResponse>(`${COURSE_PATH}/slug/${courseSlug}/lessons/${lessonSlug}`)
  },

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
    const { page = 0, size = 10, sortBy = 'createdAt', sortDir = 'desc' } = params
    return get<PageResponse<CourseResponse>>(`${COURSE_PATH}/featured`, { params: { page, size, sortBy, sortDir } })
  },

  /** GET /coming-soon — paginated, sorted by launchDate asc */
  getComingSoon: (
    params: Pick<PaginationParams, 'page' | 'size'> = {}
  ): Promise<PageResponse<CourseResponse>> => {
    const { page = 0, size = 10 } = params
    return get<PageResponse<CourseResponse>>(`${COURSE_PATH}/coming-soon`, { params: { page, size } })
  },

  /** POST / — [ADMIN] multipart/form-data */
  create: (payload: CourseRequest, thumbnail?: File): Promise<CourseResponse> => {
    const form = buildFormData(payload as unknown as Record<string, unknown>, { thumbnail })
    return post<CourseResponse>(COURSE_PATH, form, { multipart: true })
  },

  /** PUT /:id — [ADMIN] multipart/form-data */
  update: (id: number, payload: CourseRequest, thumbnail?: File): Promise<CourseResponse> => {
    const form = buildFormData(payload as unknown as Record<string, unknown>, { thumbnail })
    return put<CourseResponse>(`${COURSE_PATH}/${id}`, form, { multipart: true })
  },

  /** DELETE /:id — [ADMIN] */
  remove: (id: number): Promise<void> => {
    return del<void>(`${COURSE_PATH}/${id}`, { raw: true })
  }
}
