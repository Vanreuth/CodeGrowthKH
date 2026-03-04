import { apiGet, apiPost, apiDelete } from "@/lib/api";
import { ApiError } from "@/lib/api";
import type { ApiResponse } from "@/lib/types";
import type { CoursePdfExportDto } from "./types";

const BASE = "/api/v1/course/pdf";

export async function getAllCoursePdf(): Promise<CoursePdfExportDto[]> {
  const res = await apiGet<CoursePdfExportDto[]>(BASE, { revalidate: 0 });
  return res.data ?? [];
}

/**
 * Returns null if no PDF export exists for this course (404).
 * Re-throws any other error.
 */
export async function getCoursePdfExport(
  courseId: number
): Promise<CoursePdfExportDto | null> {
  try {
    const res = await apiGet<CoursePdfExportDto>(`${BASE}/${courseId}`);
    return res.data;
  } catch (err) {
    if (err instanceof ApiError && err.isNotFound) return null;
    throw err;
  }
}

export async function incrementPdfDownload(
  courseId: number
): Promise<CoursePdfExportDto> {
  const res = await apiPost<CoursePdfExportDto>(`${BASE}/${courseId}/download`);
  return res.data;
}

export async function generatePdfExport(
  courseId: number
): Promise<CoursePdfExportDto> {
  const res = await apiPost<CoursePdfExportDto>(`${BASE}/${courseId}/generate`);
  return res.data;
}

export async function deletePdfExport(courseId: number): Promise<void> {
  await apiDelete<ApiResponse<void>>(`${BASE}/${courseId}`);
}
