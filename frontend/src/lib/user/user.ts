import { apiDelete, apiGet, apiPut, buildUrl } from "@/lib/api";
import type { ApiResponse, PageResponse, PaginationParams } from "@/lib/types";
import type { UpdateUserRequest, UserDto } from "./types";

const BASE = "/api/v1/users";

export async function fetchUsers(
  params: PaginationParams & { search?: string } = {}
): Promise<PageResponse<UserDto>> {
  const { page = 0, size = 20, sortBy, sortDir, ...rest } = params;
  const url = buildUrl(BASE, { page, size, sortBy, sortDir, ...rest });
  const res = await apiGet<PageResponse<UserDto>>(url, { revalidate: 0 });
  return res.data;
}

export async function fetchUserById(id: number): Promise<UserDto> {
  const res = await apiGet<UserDto>(`${BASE}/${id}`, { revalidate: 0 });
  return res.data;
}

export async function updateUser(id: number, data: UpdateUserRequest): Promise<UserDto> {
  const res = await apiPut<UserDto>(`${BASE}/${id}`, data);
  return res.data;
}

export async function deleteUser(id: number): Promise<void> {
  await apiDelete<ApiResponse<void>>(`${BASE}/${id}`);
}
