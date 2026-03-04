import { apiGet, apiPost, apiPut, apiPatch, apiDelete, buildUrl, toFormData } from "@/lib/api";
import { ApiError } from "@/lib/types";
import type { ApiResponse, PageResponse, PaginationParams, CourseFilterParams } from "@/lib/types";
import type { CourseDto, CreateCourseRequest } from "./types";

const BASE = "/api/v1/courses";

/** Fetch courses with optional filtering, sorting, and pagination. */
export async function fetchCourses(
  params: CourseFilterParams = {}
): Promise<PageResponse<CourseDto>> {
  const {
    page = 0, size = 20, sortBy = "createdAt", sortDir = "desc",
    query, categoryId, level, status, isFeatured, isFree, instructorId,
  } = params;
  const url = buildUrl(BASE, {
    page, size, sortBy, sortDir,
    query, categoryId, level, status, isFeatured, isFree, instructorId,
  });
  const res = await apiGet<PageResponse<CourseDto>>(url, { revalidate: 60 });
  return res.data;
}

/** Fetch featured courses from backend curated endpoint. */
export async function fetchFeaturedCourses(
  params: PaginationParams = {}
): Promise<PageResponse<CourseDto>> {
  const { page = 0, size = 10, sortBy = "createdAt", sortDir = "desc" } = params;
  const url = buildUrl(`${BASE}/featured`, { page, size, sortBy, sortDir });
  const res = await apiGet<PageResponse<CourseDto>>(url, { revalidate: 60 });
  return res.data;
}

/** Fetch upcoming courses ordered by nearest launch date first. */
export async function fetchComingSoonCourses(
  params: Pick<PaginationParams, "page" | "size"> = {}
): Promise<PageResponse<CourseDto>> {
  const { page = 0, size = 10 } = params;
  const url = buildUrl(`${BASE}/coming-soon`, { page, size });
  const res = await apiGet<PageResponse<CourseDto>>(url, { revalidate: 60 });
  return res.data;
}

/** Alias – semantically clearer for search-driven call-sites. */
export const searchCourses = fetchCourses;

export async function fetchCourseById(id: number): Promise<CourseDto> {
  const res = await apiGet<CourseDto>(`${BASE}/${id}`);
  return res.data;
}

export async function fetchCourseBySlug(slug: string): Promise<CourseDto> {
  const res = await apiGet<CourseDto>(`${BASE}/slug/${slug}`);
  return res.data;
}

/** Fetches a course with its full chapter + lesson tree (no-store). */
export async function fetchCourseWithChaptersBySlug(slug: string): Promise<CourseDto> {
  const encodedSlug = encodeURIComponent(slug);

  try {
    const res = await apiGet<CourseDto>(`${BASE}/slug/${encodedSlug}/full`, { revalidate: 0 });
    return res.data;
  } catch (error) {
    if (error instanceof ApiError && (error.status === 404 || error.status === 405)) {
      const res = await apiGet<CourseDto>(`${BASE}/slug/${encodedSlug}`, { revalidate: 0 });
      return res.data;
    }

    throw error;
  }
}

export async function fetchCoursesByCategory(
  categoryId: number,
  params: PaginationParams = {}
): Promise<PageResponse<CourseDto>> {
  const { page = 0, size = 20, sortBy, sortDir } = params;
  const url = buildUrl(`${BASE}/category/${categoryId}`, { page, size, sortBy, sortDir });
  const res = await apiGet<PageResponse<CourseDto>>(url, { revalidate: 60 });
  return res.data;
}

export async function fetchCoursesByInstructor(
  instructorId: number,
  params: PaginationParams = {}
): Promise<PageResponse<CourseDto>> {
  const { page = 0, size = 20, sortBy, sortDir } = params;
  const url = buildUrl(`${BASE}/instructor/${instructorId}`, { page, size, sortBy, sortDir });
  const res = await apiGet<PageResponse<CourseDto>>(url, { revalidate: 60 });
  return res.data;
}

export async function createCourse(data: CreateCourseRequest): Promise<CourseDto> {
  const fd = toFormData(data as unknown as Record<string, unknown>);
  const res = await apiPost<CourseDto>(BASE, fd);
  return res.data;
}

export async function updateCourse(
  id: number,
  data: Partial<CreateCourseRequest>
): Promise<CourseDto> {
  const fd = toFormData(data as unknown as Record<string, unknown>);
  const res = await apiPut<CourseDto>(`${BASE}/${id}`, fd);
  return res.data;
}

/** Partial update – no file support (JSON only). */
export async function patchCourse(
  id: number,
  data: Partial<Omit<CreateCourseRequest, "thumbnail">>
): Promise<CourseDto> {
  const res = await apiPatch<CourseDto>(`${BASE}/${id}`, data);
  return res.data;
}

export async function deleteCourse(id: number): Promise<void> {
  await apiDelete<ApiResponse<void>>(`${BASE}/${id}`);
}
