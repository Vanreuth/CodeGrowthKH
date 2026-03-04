import type { CodeSnippetDto } from "../codeShippet/types";

export interface LessonDto {
  id: number;
  title: string;
  slug?: string;
  description: string | null;
  content: string;
  orderIndex: number;
  createdAt: string;
  updatedAt: string | null;
  chapterId: number;
  chapterTitle: string;
  courseId: number;
  courseTitle: string;
  codeSnippets?: CodeSnippetDto[];
}

export interface CreateLessonRequest {
  title: string;
  description?: string;
  content: string;
  orderIndex: number;
  chapterId: number;
  courseId: number;
}

export interface UpdateLessonRequest extends Partial<CreateLessonRequest> {}
