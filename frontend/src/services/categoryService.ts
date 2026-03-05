import { get, post, put, del} from '../lib/BaseApi' // Adjust path to your new functional utilities
import type {
  PageResponse,
  PaginationParams,
} from '@/types/apiType'

import type {
  CategoryResponse,
  CategoryRequest,
} from '@/types/category'





// ═════════════════════════════════════════════════════════════
//  2. CATEGORY SERVICE
// ═════════════════════════════════════════════════════════════

const CATEGORY_PATH = '/api/v1/categories'

export const categoryService = {
  /** GET / — paginated list of categories */
  getAll: (params: PaginationParams = {}): Promise<PageResponse<CategoryResponse>> => {
    const { page = 0, size = 10, sortBy = 'orderIndex', sortDir = 'asc' } = params
    return get<PageResponse<CategoryResponse>>(CATEGORY_PATH, { params: { page, size, sortBy, sortDir } })
  },

  /** GET /:id */
  getById: (id: number): Promise<CategoryResponse> => {
    return get<CategoryResponse>(`${CATEGORY_PATH}/${id}`)
  },

  /** GET /slug/:slug */
  getBySlug: (slug: string): Promise<CategoryResponse> => {
    return get<CategoryResponse>(`${CATEGORY_PATH}/slug/${slug}`)
  },

  /** POST / — [ADMIN] */
  create: (payload: CategoryRequest): Promise<CategoryResponse> => {
    return post<CategoryResponse>(CATEGORY_PATH, payload)
  },

  /** PUT /:id — [ADMIN] */
  update: (id: number, payload: CategoryRequest): Promise<CategoryResponse> => {
    return put<CategoryResponse>(`${CATEGORY_PATH}/${id}`, payload)
  },

  /** DELETE /:id — [ADMIN] */
  remove: (id: number): Promise<void> => {
    return del<void>(`${CATEGORY_PATH}/${id}`, { raw: true })
  }
}
