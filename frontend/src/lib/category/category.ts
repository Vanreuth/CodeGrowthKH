import type { PageResponse, PaginationParams } from "@/lib/types";
import type { CategoryDto, CreateCategoryRequest, UpdateCategoryRequest } from "./types";
import { apiGet, apiPost, apiPut, apiDelete, buildUrl } from "@/lib/api";

const BASE = "/api/v1/categories";

/** Fetch paginated categories, sorted by orderIndex ascending by default. */
export async function fetchCategories(
  params: PaginationParams & { search?: string } = {},
): Promise<PageResponse<CategoryDto>> {
  const { page = 0, size = 50, sortBy = "orderIndex", sortDir = "asc", ...rest } = params;
  const url = buildUrl(BASE, { page, size, sortBy, sortDir, ...rest });
  const response = await apiGet<PageResponse<CategoryDto>>(url, { revalidate: 60 });
  return response.data;
}

export async function fetchCategoryById(id: number): Promise<CategoryDto> {
  const response = await apiGet<CategoryDto>(`${BASE}/${id}`);
  return response.data;
}

export async function fetchCategoryBySlug(slug: string): Promise<CategoryDto> {
  const response = await apiGet<CategoryDto>(`${BASE}/slug/${slug}`);
  return response.data;
}

export async function createCategory(data: CreateCategoryRequest): Promise<CategoryDto> {
  const response = await apiPost<CategoryDto>(BASE, data);
  return response.data;
}

export async function updateCategory(
  id: number,
  data: UpdateCategoryRequest,
): Promise<CategoryDto> {
  const response = await apiPut<CategoryDto>(`${BASE}/${id}`, data);
  return response.data;
}

export async function deleteCategory(id: number): Promise<void> {
  await apiDelete<void>(`${BASE}/${id}`);
}
