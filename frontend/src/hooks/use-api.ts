"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type {
  CategoryDto,
  CourseDto,
  ChapterDto,
  LessonDto,
  CodeSnippetDto,
  UserDto,
  PageResponse,
  DashboardStats,
  LessonProgressDto,
} from "@/lib/types";
import { fetchCategories as fetchCategoriesLegacy } from "@/lib/category/category";
import {
  fetchCourseById,
  fetchCourseBySlug,
  fetchCourseWithChaptersBySlug,
  fetchCourses as fetchCoursesLegacy,
  fetchCoursesByCategory as fetchCoursesByCategoryLegacy,
} from "@/lib/course/course";
import { fetchChaptersByCourse } from "@/lib/chapter/chapter";
import {
  fetchLessonById,
  fetchLessonsByCourse,
  fetchLessonsByChapter,
} from "@/lib/lesson/lesson";
import { fetchSnippetsByLesson } from "@/lib/codeShippet/codeShippet";
import { fetchUsers as fetchUsersLegacy, fetchUserById } from "@/lib/user/user";
import { fetchDashboardStats } from "@/lib/analiysis/analysis";
import { getUserProgress, markLessonComplete } from "@/lib/lessonProgress/lessonProgress";
import { apiGetMe } from "@/lib/auth/auth";
import type { AuthResponse } from "@/lib/auth/types";

// ─── Generic Fetch Hook ───────────────────────────────────────────────────────

interface UseQueryResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

function useQuery<T>(
  fetcher: () => Promise<T>,
  deps: unknown[] = []
): UseQueryResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const isMounted = useRef(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetcher();
      if (isMounted.current) {
        setData(result);
      }
    } catch (e) {
      if (isMounted.current) {
        setError(e instanceof Error ? e : new Error("Unknown error"));
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    isMounted.current = true;
    fetch();
    return () => {
      isMounted.current = false;
    };
  }, [fetch]);

  return { data, loading, error, refetch: fetch };
}

function isNumeric(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

async function getCurrentUser(): Promise<UserDto | null> {
  const response = await apiGetMe();
  if (!response.data) {
    return null;
  }

  const auth = response.data as AuthResponse & {
    role?: string;
    isActive?: boolean;
    createdAt?: string | null;
    updatedAt?: string | null;
  };

  return {
    id: auth.id,
    username: auth.username,
    email: auth.email,
    phoneNumber: auth.phoneNumber ?? null,
    address: auth.address ?? null,
    bio: auth.bio ?? null,
    avatar: null,
    profilePicture: auth.profilePicture ?? null,
    role: auth.roles?.[0] ?? "USER",
    roles: auth.roles,
    isActive: auth.isActive ?? true,
    status: null,
    loginAttempt: undefined,
    createdAt: auth.createdAt ?? null,
    updatedAt: auth.updatedAt ?? null,
  };
}

function fetchCategories(pageOrOptions: number | Parameters<typeof fetchCategoriesLegacy>[0], size = 50) {
  if (isNumeric(pageOrOptions)) {
    return fetchCategoriesLegacy({ page: pageOrOptions, size });
  }
  return fetchCategoriesLegacy(pageOrOptions);
}

function fetchCourses(
  pageOrOptions: number | Parameters<typeof fetchCoursesLegacy>[0],
  size = 20,
  sortBy = "createdAt",
  sortDir: "asc" | "desc" = "desc",
) {
  if (isNumeric(pageOrOptions)) {
    return fetchCoursesLegacy({
      page: pageOrOptions,
      size,
      sortBy,
      sortDir,
    });
  }

  return fetchCoursesLegacy(pageOrOptions);
}

function fetchCoursesByCategory(
  categoryId: number,
  pageOrOptions: number | Parameters<typeof fetchCoursesByCategoryLegacy>[1],
  size = 20,
) {
  if (isNumeric(pageOrOptions)) {
    return fetchCoursesByCategoryLegacy(categoryId, { page: pageOrOptions, size });
  }

  return fetchCoursesByCategoryLegacy(categoryId, pageOrOptions);
}

function fetchUsers(pageOrOptions: number | Parameters<typeof fetchUsersLegacy>[0], size = 20) {
  if (isNumeric(pageOrOptions)) {
    return fetchUsersLegacy({ page: pageOrOptions, size });
  }

  return fetchUsersLegacy(pageOrOptions);
}

// ─── Categories Hook ──────────────────────────────────────────────────────────

export function useCategories(page = 0, size = 50) {
  return useQuery<PageResponse<CategoryDto>>(
    () => fetchCategories(page, size),
    [page, size]
  );
}

// ─── Courses Hooks ────────────────────────────────────────────────────────────

export function useCourses(
  page = 0,
  size = 20,
  sortBy = "createdAt",
  sortDir: "asc" | "desc" = "desc"
) {
  return useQuery<PageResponse<CourseDto>>(
    () => fetchCourses(page, size, sortBy, sortDir),
    [page, size, sortBy, sortDir]
  );
}

export function useCourse(id: number | null) {
  return useQuery<CourseDto | null>(
    async () => (id ? fetchCourseById(id) : null),
    [id]
  );
}

export function useCourseBySlug(slug: string | null) {
  return useQuery<CourseDto | null>(
    async () => (slug ? fetchCourseBySlug(slug) : null),
    [slug]
  );
}

export function useCourseWithChaptersBySlug(slug: string | null) {
  return useQuery<CourseDto | null>(
    async () => (slug ? fetchCourseWithChaptersBySlug(slug) : null),
    [slug]
  );
}

export function useCoursesByCategory(categoryId: number | null, page = 0, size = 20) {
  return useQuery<PageResponse<CourseDto> | null>(
    async () => (categoryId ? fetchCoursesByCategory(categoryId, page, size) : null),
    [categoryId, page, size]
  );
}

// ─── Chapters Hook ────────────────────────────────────────────────────────────

export function useChaptersByCourse(courseId: number | null) {
  return useQuery<ChapterDto[] | null>(
    async () => (courseId ? fetchChaptersByCourse(courseId) : null),
    [courseId]
  );
}

// ─── Lessons Hooks ────────────────────────────────────────────────────────────

export function useLessonsByCourse(courseId: number | null) {
  return useQuery<LessonDto[] | null>(
    async () => (courseId ? fetchLessonsByCourse(courseId) : null),
    [courseId]
  );
}

export function useLessonsByChapter(chapterId: number | null) {
  return useQuery<LessonDto[] | null>(
    async () => (chapterId ? fetchLessonsByChapter(chapterId) : null),
    [chapterId]
  );
}

export function useLesson(id: number | null) {
  return useQuery<LessonDto | null>(
    async () => (id ? fetchLessonById(id) : null),
    [id]
  );
}

// ─── Snippets Hook ────────────────────────────────────────────────────────────

export function useSnippetsByLesson(lessonId: number | null) {
  return useQuery<CodeSnippetDto[] | null>(
    async () => (lessonId ? fetchSnippetsByLesson(lessonId) : null),
    [lessonId]
  );
}

// ─── Users Hooks ──────────────────────────────────────────────────────────────

export function useUsers(page = 0, size = 20) {
  return useQuery<PageResponse<UserDto>>(
    () => fetchUsers(page, size),
    [page, size]
  );
}

export function useUser(id: number | null) {
  return useQuery<UserDto | null>(
    async () => (id ? fetchUserById(id) : null),
    [id]
  );
}

export function useCurrentUser() {
  return useQuery<UserDto | null>(
    async () => {
      try {
        return await getCurrentUser();
      } catch {
        return null;
      }
    },
    []
  );
}

// ─── Dashboard Stats Hook ─────────────────────────────────────────────────────

export function useDashboardStats() {
  return useQuery<DashboardStats>(fetchDashboardStats, []);
}

// ─── User Progress Hook ───────────────────────────────────────────────────────

export function useUserProgress(userId: number | null) {
  return useQuery<LessonProgressDto[] | null>(
    async () => (userId ? getUserProgress(userId) : null),
    [userId]
  );
}

// ─── Mutation Hook ────────────────────────────────────────────────────────────

interface UseMutationResult<TData, TVariables> {
  mutate: (variables: TVariables) => Promise<TData>;
  data: TData | null;
  loading: boolean;
  error: Error | null;
  reset: () => void;
}

export function useMutation<TData, TVariables>(
  mutationFn: (variables: TVariables) => Promise<TData>
): UseMutationResult<TData, TVariables> {
  const [data, setData] = useState<TData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = useCallback(
    async (variables: TVariables) => {
      setLoading(true);
      setError(null);
      try {
        const result = await mutationFn(variables);
        setData(result);
        return result;
      } catch (e) {
        const err = e instanceof Error ? e : new Error("Unknown error");
        setError(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [mutationFn]
  );

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return { mutate, data, loading, error, reset };
}
