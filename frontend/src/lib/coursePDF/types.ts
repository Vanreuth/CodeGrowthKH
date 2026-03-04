export interface CoursePdfExportDto {
  id: number | null;
  courseId: number;
  courseTitle: string;
  thumbnail?: string | null;
  level?: string | null;
  pdfUrl?: string | null;
  pdfName?: string;
  pdfSizeKb?: number;
  totalPages?: number;
  totalLessonsIncluded?: number;
  downloadCount?: number;
  generatedAt?: string;
  createdAt?: string;
}
