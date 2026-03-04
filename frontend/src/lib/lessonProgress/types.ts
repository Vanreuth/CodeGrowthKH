export interface LessonProgressDto {
  id: number;
  userId: number;
  lessonId: number;
  completed: boolean;
  scrollPct: number;
  readTimeSeconds: number;
  pdfDownloaded: boolean;
  completedAt: string | null;
  lastAccessedAt: string;
}

export interface UpsertProgressRequest {
  userId: number;
  lessonId: number;
  completed?: boolean;
  scrollPct?: number;
  readTimeSeconds?: number;
  pdfDownloaded?: boolean;
}