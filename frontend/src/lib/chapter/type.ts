import type { LessonDto } from "../lesson/types";

export interface ChapterDto {
  id: number;
  title: string;
  description: string | null;
  content?: string | null;
  orderIndex: number;
  durationMinutes?: number | null;
  videoUrl?: string | null;
  createdAt: string;
  courseId: number;
  courseTitle: string;
  lessonCount: number;
  lessons?: LessonDto[];
}

export interface CreateChapterRequest {
  title: string;
  description?: string;
  orderIndex: number;
  courseId: number;
}

export interface UpdateChapterRequest extends Partial<CreateChapterRequest> {}
