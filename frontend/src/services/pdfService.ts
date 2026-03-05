import { get, post, del } from '../lib/BaseApi'
import type {
  CoursePdfExportResponse,
} from '../types/coursePDFType'

// ═════════════════════════════════════════════════════════════
//  7. PDF SERVICE
// ═════════════════════════════════════════════════════════════

const PDF_PATH = '/api/v1/course/pdf'

export const pdfService = {
  /** GET / → CoursePdfExportResponse[] */
  getAll: (): Promise<CoursePdfExportResponse[]> => {
    return get<CoursePdfExportResponse[]>(PDF_PATH)
  },

  /** GET /:courseId */
  getByCourse: (courseId: number): Promise<CoursePdfExportResponse> => {
    return get<CoursePdfExportResponse>(`${PDF_PATH}/${courseId}`)
  },

  /** POST /:courseId/download — increment download counter (public) */
  incrementDownload: (courseId: number): Promise<CoursePdfExportResponse> => {
    return post<CoursePdfExportResponse>(`${PDF_PATH}/${courseId}/download`)
  },

  /** POST /:courseId/generate — [ADMIN] */
  generate: (courseId: number): Promise<CoursePdfExportResponse> => {
    return post<CoursePdfExportResponse>(`${PDF_PATH}/${courseId}/generate`)
  },

  /** DELETE /:courseId — [ADMIN] */
  remove: (courseId: number): Promise<void> => {
    return del<void>(`${PDF_PATH}/${courseId}`, { raw: true })
  }
}
