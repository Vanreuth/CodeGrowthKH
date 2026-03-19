/**
 * types/api.ts
 *
 * Generic API-shape types and role helpers — re-exported from the canonical
 * apiType.ts so both import paths work without duplication.
 *
 * Usage:
 *   import type { ApiResponse, PageResponse, PaginationParams } from '@/types/api'
 *   import { hasAdminRole, getDefaultAppRoute } from '@/types/api'
 */

export type {
  ApiResponse,
  PageResponse,
  PaginationParams,
  CourseFilterParams,
  CategoryFilterParams,
} from './apiType'

export {
  normalizeRole,
  hasRole,
  hasAdminRole,
  hasUserRole,
  getPrimaryRole,
  getDefaultAppRoute,
} from './apiType'
