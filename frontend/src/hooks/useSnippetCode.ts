'use client'

import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'
import { snippetService } from '../services/snippetCodeService'
import type { CodeSnippetResponse, CodeSnippetRequest } from '../types/codeSnippetType'

// ─────────────────────────────────────────────────────────────
//  Query Keys
// ─────────────────────────────────────────────────────────────

export const snippetKeys = {
  all     : ['snippets'] as const,
  byLesson: (lessonId: number) => ['snippets', 'lesson', lessonId] as const,
  detail  : (id: number)      => ['snippets', id] as const,
}

function toState<T>(q: { data?: T; isPending: boolean; error: Error | null }) {
  return { data: q.data ?? null, loading: q.isPending, error: q.error?.message ?? null }
}

// ═════════════════════════════════════════════════════════════
//  1. useSnippetsByLesson — all snippets in a lesson
// ═════════════════════════════════════════════════════════════

export function useSnippetsByLesson(lessonId: number) {
  const query = useQuery({
    queryKey: snippetKeys.byLesson(lessonId),
    queryFn : () => snippetService.getByLesson(lessonId),
    enabled : !!lessonId,
  })
  return { ...toState<CodeSnippetResponse[]>(query), refetch: query.refetch }
}

// ═════════════════════════════════════════════════════════════
//  2. useSnippetById — single snippet by id
// ═════════════════════════════════════════════════════════════

export function useSnippetById(id: number) {
  const query = useQuery({
    queryKey: snippetKeys.detail(id),
    queryFn : () => snippetService.getById(id),
    enabled : !!id,
  })
  return { ...toState<CodeSnippetResponse>(query), refetch: query.refetch }
}

// ═════════════════════════════════════════════════════════════
//  3. useSnippetAdmin — CRUD mutations [ADMIN]
// ═════════════════════════════════════════════════════════════

export function useSnippetAdmin() {
  const qc = useQueryClient()

  const createMutation = useMutation({
    mutationFn: (payload: CodeSnippetRequest) => snippetService.create(payload),
    onSuccess : (data) => qc.invalidateQueries({ queryKey: snippetKeys.byLesson(data.lessonId) }),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: CodeSnippetRequest }) =>
      snippetService.update(id, payload),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: snippetKeys.detail(data.id) })
      qc.invalidateQueries({ queryKey: snippetKeys.byLesson(data.lessonId) })
    },
  })

  const removeMutation = useMutation({
    mutationFn: (id: number) => snippetService.remove(id),
    onSuccess : () => qc.invalidateQueries({ queryKey: snippetKeys.all }),
  })

  return {
    creating: createMutation.isPending,
    updating: updateMutation.isPending,
    removing: removeMutation.isPending,
    error   : (createMutation.error ?? updateMutation.error ?? removeMutation.error)?.message ?? null,
    create  : (payload: CodeSnippetRequest) => createMutation.mutateAsync(payload),
    update  : (id: number, payload: CodeSnippetRequest) => updateMutation.mutateAsync({ id, payload }),
    remove  : (id: number) =>
      removeMutation.mutateAsync(id).then(() => true as const).catch(() => false as const),
  }
}