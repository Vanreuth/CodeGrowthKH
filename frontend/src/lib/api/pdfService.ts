import { get, post, del } from '@/lib/api/client'
import type { CoursePdfExportResponse } from '@/types/coursePDFType'
import type { CourseFilterParams } from '@/types/api'

const PDF_PATH = '/api/v1/course/pdf'

export const pdfService = {
  /** GET / → CoursePdfExportResponse[] */
  getAll: (params: Pick<CourseFilterParams, 'search' | 'status' | 'level' | 'categoryId'> = {}): Promise<CoursePdfExportResponse[]> =>
    get<CoursePdfExportResponse[]>(PDF_PATH, { params }),

  /** GET /:courseId */
  getByCourse: (courseId: number): Promise<CoursePdfExportResponse> =>
    get<CoursePdfExportResponse>(`${PDF_PATH}/${courseId}`),

  /** POST /:courseId/download — increment download counter (public) */
  incrementDownload: (courseId: number): Promise<CoursePdfExportResponse> =>
    post<CoursePdfExportResponse>(`${PDF_PATH}/${courseId}/download`),

  /** POST /:courseId/generate — [ADMIN] */
  generate: (courseId: number): Promise<CoursePdfExportResponse> =>
    post<CoursePdfExportResponse>(`${PDF_PATH}/${courseId}/generate`),

  /** DELETE /:courseId — [ADMIN] */
  remove: (courseId: number): Promise<void> =>
    del<void>(`${PDF_PATH}/${courseId}`, { raw: true }),
}
