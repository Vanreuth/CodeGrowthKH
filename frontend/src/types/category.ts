
export interface CategoryResponse {
  id: number
  name: string
  slug: string
  description?: string | null
  orderIndex: number
  isActive?: boolean
  courseCount?: number
  createdAt: string
  updatedAt: string
}

export interface CategoryRequest {
  name: string
  /** Optional slug — the server can generate it from name if omitted */
  slug?: string
  description?: string
  isActive?: boolean
  orderIndex?: number
}
