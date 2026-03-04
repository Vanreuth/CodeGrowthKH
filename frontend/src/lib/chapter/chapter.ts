import { apiGet, apiPost, apiPut, apiPatch, apiDelete } from "@/lib/api";
import type { ApiResponse } from "@/lib/types";
import type { ChapterDto, CreateChapterRequest, UpdateChapterRequest } from "./type";

const BASE = "/api/v1/chapters";

export async function fetchChaptersByCourse(courseId: number): Promise<ChapterDto[]> {
  const res = await apiGet<ChapterDto[]>(`${BASE}/course/${courseId}`);
  return res.data;
}

export async function fetchChapterById(id: number): Promise<ChapterDto> {
  const res = await apiGet<ChapterDto>(`${BASE}/${id}`);
  return res.data;
}

export async function createChapter(data: CreateChapterRequest): Promise<ChapterDto> {
  const res = await apiPost<ChapterDto>(BASE, data);
  return res.data;
}

export async function updateChapter(
  id: number,
  data: UpdateChapterRequest
): Promise<ChapterDto> {
  const res = await apiPut<ChapterDto>(`${BASE}/${id}`, data);
  return res.data;
}

export async function patchChapter(
  id: number,
  data: Partial<UpdateChapterRequest>
): Promise<ChapterDto> {
  const res = await apiPatch<ChapterDto>(`${BASE}/${id}`, data);
  return res.data;
}

export async function deleteChapter(id: number): Promise<void> {
  await apiDelete<ApiResponse<void>>(`${BASE}/${id}`);
}
