'use client'

import { useState } from 'react'
import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from '@tanstack/react-query'
import { courseService } from '../services/courseService'
import { chapterService } from '../services/chapterService'
import { lessonService } from '../services/lessonService'
import type { PageResponse, PaginationParams } from '../types/apiType'
import type { CourseResponse, CourseRequest } from '../types/courseType'
import type { ChapterResponse } from '../types/chapterType'
import type { LessonResponse } from '../types/lessonType'

// ─────────────────────────────────────────────────────────────
//  Query Keys
// ─────────────────────────────────────────────────────────────

export const courseKeys = {
  all              : ['courses'] as const,
  lists            : () => ['courses', 'list'] as const,
  list             : (params: object) => ['courses', 'list', params] as const,
  slug             : (slug: string) => ['courses', slug] as const,
  withChapters     : (slug: string) => ['courses', slug, 'chapters'] as const,
  featured         : (params: object) => ['courses', 'featured', params] as const,
  comingSoon       : (params: object) => ['courses', 'coming-soon', params] as const,
  byCategory       : (catId: number, params: object) => ['courses', 'category', catId, params] as const,
  lesson           : (courseSlug: string, lessonSlug: string) => ['courses', courseSlug, 'lessons', lessonSlug] as const,
  chaptersByCourse : (courseId: number) => ['courses', courseId, 'chapters'] as const,
  lessonsByCourse  : (courseId: number) => ['courses', courseId, 'lessons'] as const,
}

// Shared cache config for stable reference data
const STABLE_QUERY = { staleTime: 5 * 60 * 1000, gcTime: 10 * 60 * 1000, retry: 2 } as const

function toState<T>(q: { data?: T; isPending: boolean; error: Error | null }) {
  return { data: q.data ?? null, loading: q.isPending, error: q.error?.message ?? null }
}

// ═════════════════════════════════════════════════════════════
//  1. useCourses — paginated list
// ═════════════════════════════════════════════════════════════

export function useCourses(params: PaginationParams = {}) {
  const { size = 10, sortBy = 'createdAt', sortDir = 'desc' } = params
  const [page, setPage] = useState(params.page ?? 0)
  const query = useQuery({
    queryKey       : courseKeys.list({ page, size, sortBy, sortDir }),
    queryFn        : () => courseService.getAll({ page, size, sortBy, sortDir }),
    placeholderData: keepPreviousData,
  })
  return { ...toState<PageResponse<CourseResponse>>(query), page, setPage, refetch: query.refetch }
}

// ═════════════════════════════════════════════════════════════
//  2. useCourseBySlug — single course (basic)
// ═════════════════════════════════════════════════════════════

export function useCourseBySlug(slug: string) {
  const query = useQuery({
    queryKey: courseKeys.slug(slug),
    queryFn : () => courseService.getBySlug(slug),
    enabled : !!slug,
  })
  return { ...toState<CourseResponse>(query), refetch: query.refetch }
}

// ═════════════════════════════════════════════════════════════
//  3. useCourseWithChapters — full course tree
// ═════════════════════════════════════════════════════════════

export function useCourseWithChapters(slug: string) {
  const query = useQuery({
    queryKey : courseKeys.withChapters(slug),
    queryFn  : () => courseService.getWithChapters(slug),
    enabled  : !!slug,
    ...STABLE_QUERY,
  })
  return { ...toState<CourseResponse>(query), refetch: query.refetch }
}

// ═════════════════════════════════════════════════════════════
//  4. useLessonBySlug
// ═════════════════════════════════════════════════════════════

export function useLessonBySlug(courseSlug: string, lessonSlug: string) {
  const query = useQuery({
    queryKey : courseKeys.lesson(courseSlug, lessonSlug),
    queryFn  : () => courseService.getLessonBySlug(courseSlug, lessonSlug),
    enabled  : !!courseSlug && !!lessonSlug,
    ...STABLE_QUERY,
  })
  return { ...toState<LessonResponse>(query), refetch: query.refetch }
}

// ═════════════════════════════════════════════════════════════
//  5b. useChaptersByCourse — all chapters for a course
// ═════════════════════════════════════════════════════════════

export function useChaptersByCourse(courseId: number | null) {
  const query = useQuery({
    queryKey : courseKeys.chaptersByCourse(courseId ?? 0),
    queryFn  : () => chapterService.getByCourse(courseId!),
    enabled  : courseId != null && courseId > 0,
    ...STABLE_QUERY,
  })
  return { ...toState<ChapterResponse[]>(query), refetch: query.refetch }
}

// ═════════════════════════════════════════════════════════════
//  5c. useLessonsByCourse — all lessons for a course (flat)
// ═════════════════════════════════════════════════════════════

export function useLessonsByCourse(courseId: number | null) {
  const query = useQuery({
    queryKey : courseKeys.lessonsByCourse(courseId ?? 0),
    queryFn  : () => lessonService.getByCourse(courseId!),
    enabled  : courseId != null && courseId > 0,
    ...STABLE_QUERY,
  })
  return { ...toState<LessonResponse[]>(query), refetch: query.refetch }
}

// ═════════════════════════════════════════════════════════════
//  5. useFeaturedCourses
// ═════════════════════════════════════════════════════════════

export function useFeaturedCourses(params: PaginationParams = {}) {
  const { size = 10, sortBy = 'createdAt', sortDir = 'desc' } = params
  const [page, setPage] = useState(0)
  const query = useQuery({
    queryKey       : courseKeys.featured({ page, size, sortBy, sortDir }),
    queryFn        : () => courseService.getFeatured({ page, size, sortBy, sortDir }),
    placeholderData: keepPreviousData,
  })
  return { ...toState<PageResponse<CourseResponse>>(query), page, setPage, refetch: query.refetch }
}

// ═════════════════════════════════════════════════════════════
//  6. useComingSoonCourses
// ═════════════════════════════════════════════════════════════

export function useComingSoonCourses(params: PaginationParams = {}) {
  const { size = 10 } = params
  const [page, setPage] = useState(0)
  const query = useQuery({
    queryKey       : courseKeys.comingSoon({ page, size }),
    queryFn        : () => courseService.getComingSoon({ page, size }),
    placeholderData: keepPreviousData,
  })
  return { ...toState<PageResponse<CourseResponse>>(query), page, setPage, refetch: query.refetch }
}

// ═════════════════════════════════════════════════════════════
//  7. useCoursesByCategory
// ═════════════════════════════════════════════════════════════

export function useCoursesByCategory(categoryId: number, params: PaginationParams = {}) {
  const { size = 10 } = params
  const [page, setPage] = useState(0)
  const query = useQuery({
    queryKey       : courseKeys.byCategory(categoryId, { page, size }),
    queryFn        : () => courseService.getByCategory(categoryId, { page, size }),
    enabled        : !!categoryId,
    placeholderData: keepPreviousData,
  })
  return { ...toState<PageResponse<CourseResponse>>(query), page, setPage, refetch: query.refetch }
}

// ═════════════════════════════════════════════════════════════
//  8. useCourseAdmin — CRUD mutations for admin
// ═════════════════════════════════════════════════════════════

export function useCourseAdmin() {
  const qc         = useQueryClient()
  const invalidate = () => qc.invalidateQueries({ queryKey: courseKeys.lists() })

  const createMutation = useMutation({
    mutationFn: ({ payload, thumbnail }: { payload: CourseRequest; thumbnail?: File }) =>
      courseService.create(payload, thumbnail),
    onSuccess: invalidate,
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, payload, thumbnail }: { id: number; payload: CourseRequest; thumbnail?: File }) =>
      courseService.update(id, payload, thumbnail),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: courseKeys.slug(data.slug) })
      invalidate()
    },
  })

  const removeMutation = useMutation({
    mutationFn: (id: number) => courseService.remove(id),
    onSuccess : invalidate,
  })

  return {
    creating: createMutation.isPending,
    updating: updateMutation.isPending,
    removing: removeMutation.isPending,
    error   : (createMutation.error ?? updateMutation.error ?? removeMutation.error)?.message ?? null,
    create  : (payload: CourseRequest, thumbnail?: File) =>
      createMutation.mutateAsync({ payload, thumbnail }),
    update  : (id: number, payload: CourseRequest, thumbnail?: File) =>
      updateMutation.mutateAsync({ id, payload, thumbnail }),
    remove  : (id: number) =>
      removeMutation.mutateAsync(id).then(() => true as const).catch(() => false as const),
  }
}