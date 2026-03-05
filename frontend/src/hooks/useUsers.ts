'use client'

import { useState } from 'react'
import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from '@tanstack/react-query'
import { userService } from '../services/userService'
import type { PageResponse, PaginationParams } from '../types/apiType'
import type { UserResponse, UserRequest, UpdateUserRequest } from '../types/userType'

// ─────────────────────────────────────────────────────────────
//  Query Keys
// ─────────────────────────────────────────────────────────────

export const userKeys = {
  all   : ['users'] as const,
  lists : () => ['users', 'list'] as const,
  list  : (params: object) => ['users', 'list', params] as const,
  detail: (id: number) => ['users', id] as const,
}

function toState<T>(q: { data?: T; isPending: boolean; error: Error | null }) {
  return { data: q.data ?? null, loading: q.isPending, error: q.error?.message ?? null }
}



// ═════════════════════════════════════════════════════════════
//  1. useUsers — paginated user list [ADMIN]
// ═════════════════════════════════════════════════════════════

export function useUsers(params: PaginationParams = {}) {
  const { size = 10, sortBy = 'id', sortDir = 'asc' } = params
  const [page, setPage] = useState(params.page ?? 0)
  const query = useQuery({
    queryKey       : userKeys.list({ page, size, sortBy, sortDir }),
    queryFn        : () => userService.getAll({ page, size, sortBy, sortDir }),
    placeholderData: keepPreviousData,
  })
  return { ...toState<PageResponse<UserResponse>>(query), page, setPage, refetch: query.refetch }
}

// ═════════════════════════════════════════════════════════════
//  2. useUserById — single user [ADMIN]
// ═════════════════════════════════════════════════════════════

export function useUserById(id: number) {
  const query = useQuery({
    queryKey: userKeys.detail(id),
    queryFn : () => userService.getById(id),
    enabled : !!id,
  })
  return { ...toState<UserResponse>(query), refetch: query.refetch }
}

// ═════════════════════════════════════════════════════════════
//  3. useUserAdmin — CRUD mutations [ADMIN]
// ═════════════════════════════════════════════════════════════

export function useUserAdmin() {
  const qc         = useQueryClient()
  const invalidate = () => qc.invalidateQueries({ queryKey: userKeys.lists() })

  const createMutation = useMutation({
    mutationFn: ({ payload, profilePicture }: { payload: UserRequest; profilePicture?: File }) =>
      userService.create(payload, profilePicture),
    onSuccess: invalidate,
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, payload, photo }: { id: number; payload: UpdateUserRequest; photo?: File }) =>
      userService.update(id, payload, photo),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: userKeys.detail(id) })
      invalidate()
    },
  })

  const removeMutation = useMutation({
    mutationFn: (id: number) => userService.remove(id),
    onSuccess : invalidate,
  })

  return {
    creating: createMutation.isPending,
    updating: updateMutation.isPending,
    removing: removeMutation.isPending,
    error   : (createMutation.error ?? updateMutation.error ?? removeMutation.error)?.message ?? null,
    create  : (payload: UserRequest, profilePicture?: File) =>
      createMutation.mutateAsync({ payload, profilePicture }),
    update  : (id: number, payload: UpdateUserRequest, photo?: File) =>
      updateMutation.mutateAsync({ id, payload, photo }),
    remove  : (id: number) =>
      removeMutation.mutateAsync(id).then(() => true as const).catch(() => false as const),
  }
}