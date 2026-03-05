'use client'

import { useState } from 'react'
import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from '@tanstack/react-query'
import { categoryService } from '../services/categoryService'
import type { PageResponse, PaginationParams } from '../types/apiType'
import type { CategoryResponse, CategoryRequest } from '../types/category'

// ─────────────────────────────────────────────────────────────
//  Query Keys
// ─────────────────────────────────────────────────────────────

export const categoryKeys = {
  all   : ['categories'] as const,
  lists : () => ['categories', 'list'] as const,
  list  : (params: object) => ['categories', 'list', params] as const,
  detail: (id: number) => ['categories', id] as const,
  slug  : (slug: string) => ['categories', 'slug', slug] as const,
}

function toState<T>(q: { data?: T; isPending: boolean; error: Error | null }) {
  return { data: q.data ?? null, loading: q.isPending, error: q.error?.message ?? null }
}

// ═════════════════════════════════════════════════════════════
//  1. useCategories — paginated list
// ═════════════════════════════════════════════════════════════

export function useCategories(params: PaginationParams = {}) {
  const { size = 10, sortBy = 'orderIndex', sortDir = 'asc' } = params
  const [page, setPage] = useState(params.page ?? 0)
  const query = useQuery({
    queryKey       : categoryKeys.list({ page, size, sortBy, sortDir }),
    queryFn        : () => categoryService.getAll({ page, size, sortBy, sortDir }),
    placeholderData: keepPreviousData,
  })
  return { ...toState<PageResponse<CategoryResponse>>(query), page, setPage, refetch: query.refetch }
}

// ═════════════════════════════════════════════════════════════
//  2. useCategoryById — single category by id
// ═════════════════════════════════════════════════════════════

export function useCategoryById(id: number) {
  const query = useQuery({
    queryKey: categoryKeys.detail(id),
    queryFn : () => categoryService.getById(id),
    enabled : !!id,
  })
  return { ...toState<CategoryResponse>(query), refetch: query.refetch }
}

// ═════════════════════════════════════════════════════════════
//  3. useCategoryBySlug — single category by slug
// ═════════════════════════════════════════════════════════════

export function useCategoryBySlug(slug: string) {
  const query = useQuery({
    queryKey: categoryKeys.slug(slug),
    queryFn : () => categoryService.getBySlug(slug),
    enabled : !!slug,
  })
  return { ...toState<CategoryResponse>(query), refetch: query.refetch }
}

// ═════════════════════════════════════════════════════════════
//  4. useCategoryAdmin — CRUD mutations [ADMIN]
// ═════════════════════════════════════════════════════════════

export function useCategoryAdmin() {
  const qc         = useQueryClient()
  const invalidate = () => qc.invalidateQueries({ queryKey: categoryKeys.lists() })

  const createMutation = useMutation({
    mutationFn: (payload: CategoryRequest) => categoryService.create(payload),
    onSuccess : invalidate,
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: CategoryRequest }) =>
      categoryService.update(id, payload),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: categoryKeys.detail(id) })
      invalidate()
    },
  })

  const removeMutation = useMutation({
    mutationFn: (id: number) => categoryService.remove(id),
    onSuccess : invalidate,
  })

  return {
    creating: createMutation.isPending,
    updating: updateMutation.isPending,
    removing: removeMutation.isPending,
    error   : (createMutation.error ?? updateMutation.error ?? removeMutation.error)?.message ?? null,
    create  : (payload: CategoryRequest) => createMutation.mutateAsync(payload),
    update  : (id: number, payload: CategoryRequest) => updateMutation.mutateAsync({ id, payload }),
    remove  : (id: number) =>
      removeMutation.mutateAsync(id).then(() => true as const).catch(() => false as const),
  }
}