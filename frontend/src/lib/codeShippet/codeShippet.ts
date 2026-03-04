import { apiGet, apiPost, apiPut, apiPatch, apiDelete } from "@/lib/api";
import type { ApiResponse } from "@/lib/types";
import type { CodeSnippetDto, CreateSnippetRequest, UpdateSnippetRequest } from "./types";

const BASE = "/api/v1/snippets";

export async function fetchSnippetsByLesson(lessonId: number): Promise<CodeSnippetDto[]> {
  const res = await apiGet<CodeSnippetDto[]>(`${BASE}/lesson/${lessonId}`);
  return res.data;
}

export async function fetchSnippetById(id: number): Promise<CodeSnippetDto> {
  const res = await apiGet<CodeSnippetDto>(`${BASE}/${id}`);
  return res.data;
}

export async function createSnippet(data: CreateSnippetRequest): Promise<CodeSnippetDto> {
  const res = await apiPost<CodeSnippetDto>(BASE, data);
  return res.data;
}

export async function updateSnippet(
  id: number,
  data: UpdateSnippetRequest
): Promise<CodeSnippetDto> {
  const res = await apiPut<CodeSnippetDto>(`${BASE}/${id}`, data);
  return res.data;
}

export async function patchSnippet(
  id: number,
  data: Partial<UpdateSnippetRequest>
): Promise<CodeSnippetDto> {
  const res = await apiPatch<CodeSnippetDto>(`${BASE}/${id}`, data);
  return res.data;
}

export async function deleteSnippet(id: number): Promise<void> {
  await apiDelete<ApiResponse<void>>(`${BASE}/${id}`);
}
