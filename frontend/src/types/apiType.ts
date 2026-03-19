// ─────────────────────────────────────────────────────────────
//  Generic wrappers
// ─────────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
  timestamp?: string
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


export function normalizeRole(role: string): string {
  return role.startsWith('ROLE_') ? role : `ROLE_${role}`
}


export function hasRole(roles: string[] = [], role: string): boolean {
  const expected = normalizeRole(role)
  return roles.some((currentRole) => normalizeRole(currentRole) === expected)
}


export function hasAdminRole(roles: string[] = []): boolean {
  return hasRole(roles, 'ADMIN')
}

export function hasInstructorRole(roles: string[] = []): boolean {
  return hasRole(roles, 'INSTRUCTOR')
}

export function hasUserRole(roles: string[] = []): boolean {
  return hasRole(roles, 'USER')
}

export function getPrimaryRole(roles: string[] = []): string {
  if (hasAdminRole(roles)) return 'ROLE_ADMIN'
  if (hasInstructorRole(roles)) return 'ROLE_INSTRUCTOR'
  if (hasUserRole(roles)) return 'ROLE_USER'
  return roles[0] ? normalizeRole(roles[0]) : 'ROLE_USER'
}

export function getDefaultAppRoute(roles: string[] = []): string {
  const primaryRole = getPrimaryRole(roles)

  if (primaryRole === 'ROLE_ADMIN') return '/dashboard'
  if (primaryRole === 'ROLE_INSTRUCTOR') return '/instructor'
  return '/account'
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
