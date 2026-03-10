// ─────────────────────────────────────────────────────────────
//  Generic wrappers
// ─────────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

export interface PageResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  // backend returns pageNumber/pageSize (Spring default names may vary)
  pageNumber?: number
  pageSize?: number
  number?: number
  size?: number
  first?: boolean
  last?: boolean
  empty?: boolean
}


export function hasAdminRole(roles: string[] = []): boolean {
  return roles.some((r) => r === 'ADMIN' || r === 'ROLE_ADMIN')
}

export function hasRole(roles: string[] = [], role: string): boolean {
  return roles.includes(role) || roles.includes(`ROLE_${role}`)
}


// ─────────────────────────────────────────────────────────────
//  Shared query params
// ─────────────────────────────────────────────────────────────

export interface PaginationParams {
  page?: number
  size?: number
  sortBy?: string
  sortDir?: 'asc' | 'desc'
}

export interface CourseFilterParams extends PaginationParams {
  categoryId?: number
  status?: import('./courseType').CourseStatus
  level?: import('./courseType').CourseLevel
  search?: string
  isFeatured?: boolean | string
  isFree?: boolean | string
}

export interface CategoryFilterParams extends PaginationParams {
  search?: string
  status?: string
  hasCourses?: boolean | string
}