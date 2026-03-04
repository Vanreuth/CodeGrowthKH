import { apiDelete, apiGet, apiPatch, apiPost, apiPut } from "@/lib/api";
import type { ApiResponse, FetchOptions } from "@/lib/types";
import type { CreateLessonRequest, LessonDto, UpdateLessonRequest } from "./types";

const BASE = "/api/v1/lessons";

export async function fetchLessonsByChapter(chapterId: number): Promise<LessonDto[]> {
  const res = await apiGet<LessonDto[]>(`${BASE}/chapter/${chapterId}`);
  return res.data;
}

export async function fetchLessonsByCourse(courseId: number): Promise<LessonDto[]> {
  const res = await apiGet<LessonDto[]>(`${BASE}/course/${courseId}`);
  return res.data;
}

export async function fetchLessonById(id: number): Promise<LessonDto> {
  const res = await apiGet<LessonDto>(`${BASE}/${id}`);
  return res.data;
}

export async function fetchLessonBySlug(
  courseSlug: string,
  lessonSlug: string,
  opts?: FetchOptions
): Promise<LessonDto> {
  const res = await apiGet<LessonDto>(
    `/api/v1/courses/slug/${courseSlug}/lessons/${lessonSlug}`,
    { revalidate: 0, ...opts }
  );
  return res.data;
}

export async function createLesson(data: CreateLessonRequest): Promise<LessonDto> {
  const res = await apiPost<LessonDto>(BASE, data);
  return res.data;
}

export async function updateLesson(id: number, data: UpdateLessonRequest): Promise<LessonDto> {
  const res = await apiPut<LessonDto>(`${BASE}/${id}`, data);
  return res.data;
}

export async function patchLesson(id: number, data: Partial<UpdateLessonRequest>): Promise<LessonDto> {
  const res = await apiPatch<LessonDto>(`${BASE}/${id}`, data);
  return res.data;
}

export async function deleteLesson(id: number): Promise<void> {
  await apiDelete<ApiResponse<void>>(`${BASE}/${id}`);
}
