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
  size: number
  number: number
  first: boolean
  last: boolean
  empty: boolean
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