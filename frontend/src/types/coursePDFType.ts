
export interface CoursePdfExportResponse {
  id: number | null
  courseId: number
  /** Legacy alias — same as fileUrl */
  pdfUrl?: string | null
  fileUrl?: string
  courseTitle: string
  thumbnail?: string | null
  level?: string | null
  categoryIds?: number[]
  categoryNames?: string[]
  pdfName?: string
  pdfSizeKb?: number
  totalPages?: number
  totalLessonsIncluded?: number
  downloadCount?: number
  generatedAt?: string
  createdAt?: string
}
