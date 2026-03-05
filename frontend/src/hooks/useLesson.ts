'use client'

import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'
import { lessonService } from '../services/lessonService'
import type { LessonResponse, LessonRequest } from '../types/lessonType'

// ─────────────────────────────────────────────────────────────
//  Query Keys
// ─────────────────────────────────────────────────────────────

export const lessonKeys = {
  all      : ['lessons'] as const,
  byChapter: (chapterId: number) => ['lessons', 'chapter', chapterId] as const,
  byCourse : (courseId: number)  => ['lessons', 'course', courseId] as const,
  detail   : (id: number)        => ['lessons', id] as const,
}

function toState<T>(q: { data?: T; isPending: boolean; error: Error | null }) {
  return { data: q.data ?? null, loading: q.isPending, error: q.error?.message ?? null }
}


// ═════════════════════════════════════════════════════════════
//  1. useLessonsByChapter — all lessons in a chapter
// ═════════════════════════════════════════════════════════════

export function useLessonsByChapter(chapterId: number) {
  const query = useQuery({
    queryKey: lessonKeys.byChapter(chapterId),
    queryFn : () => lessonService.getByChapter(chapterId),
    enabled : !!chapterId,
  })
  return { ...toState<LessonResponse[]>(query), refetch: query.refetch }
}

// ═════════════════════════════════════════════════════════════
//  2. useLessonsByCourse — all lessons in a course (flat list)
// ═════════════════════════════════════════════════════════════

export function useLessonsByCourse(courseId: number) {
  const query = useQuery({
    queryKey: lessonKeys.byCourse(courseId),
    queryFn : () => lessonService.getByCourse(courseId),
    enabled : !!courseId,
  })
  return { ...toState<LessonResponse[]>(query), refetch: query.refetch }
}

// ═════════════════════════════════════════════════════════════
//  3. useLessonById — single lesson by id
// ═════════════════════════════════════════════════════════════

export function useLessonById(id: number) {
  const query = useQuery({
    queryKey: lessonKeys.detail(id),
    queryFn : () => lessonService.getById(id),
    enabled : !!id,
  })
  return { ...toState<LessonResponse>(query), refetch: query.refetch }
}

// ═════════════════════════════════════════════════════════════
//  4. useLessonAdmin — CRUD mutations [ADMIN]
// ═════════════════════════════════════════════════════════════

export function useLessonAdmin() {
  const qc         = useQueryClient()
  const invalidateChapter = (chapterId: number) =>
    qc.invalidateQueries({ queryKey: lessonKeys.byChapter(chapterId) })

  const createMutation = useMutation({
    mutationFn: (payload: LessonRequest) => lessonService.create(payload),
    onSuccess : (data) => invalidateChapter(data.chapterId),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: LessonRequest }) =>
      lessonService.update(id, payload),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: lessonKeys.detail(data.id) })
      invalidateChapter(data.chapterId)
    },
  })

  const removeMutation = useMutation({
    mutationFn: (id: number) => lessonService.remove(id),
    onSuccess : () => qc.invalidateQueries({ queryKey: lessonKeys.all }),
  })

  return {
    creating: createMutation.isPending,
    updating: updateMutation.isPending,
    removing: removeMutation.isPending,
    error   : (createMutation.error ?? updateMutation.error ?? removeMutation.error)?.message ?? null,
    create  : (payload: LessonRequest) => createMutation.mutateAsync(payload),
    update  : (id: number, payload: LessonRequest) => updateMutation.mutateAsync({ id, payload }),
    remove  : (id: number) =>
      removeMutation.mutateAsync(id).then(() => true as const).catch(() => false as const),
  }
}