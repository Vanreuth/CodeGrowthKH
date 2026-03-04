import { apiGet, apiPost, buildUrl } from "@/lib/api";
import { ApiError } from "@/lib/api";
import type { FetchOptions } from "@/lib/types";
import type { LessonProgressDto, UpsertProgressRequest } from "./types";

const BASE = "/api/v1/lesson-progress";

export async function upsertLessonProgress(
  data: UpsertProgressRequest
): Promise<LessonProgressDto> {
  const res = await apiPost<LessonProgressDto>(BASE, data);
  return res.data;
}

export async function markLessonComplete(
  userIdOrLessonId: number,
  maybeLessonId?: number
): Promise<LessonProgressDto> {
  const lessonId = maybeLessonId ?? userIdOrLessonId;
  const url = buildUrl(`${BASE}/complete`, { lessonId });
  const res = await apiPost<LessonProgressDto>(url);
  return res.data;
}

export async function getLessonProgress(
  userIdOrLessonId: number,
  maybeLessonIdOrOpts?: number | FetchOptions,
  maybeOpts?: FetchOptions,
  opts?: FetchOptions
): Promise<LessonProgressDto | null> {
  const lessonId =
    typeof maybeLessonIdOrOpts === "number" ? maybeLessonIdOrOpts : userIdOrLessonId;
  const finalOpts =
    (typeof maybeLessonIdOrOpts === "object" ? maybeLessonIdOrOpts : maybeOpts) ?? opts;

  try {
    const url = buildUrl(BASE, { lessonId });
    const res = await apiGet<LessonProgressDto>(url, { revalidate: 0, ...finalOpts });
    return res.data;
  } catch (err) {
    if (err instanceof ApiError && err.isNotFound) return null;
    throw err;
  }
}

export async function getUserProgress(
  _userId?: number,
  opts?: FetchOptions
): Promise<LessonProgressDto[]> {
  const res = await apiGet<LessonProgressDto[]>(
    `${BASE}/me`,
    { revalidate: 0, ...opts }
  );
  return res.data;
}

export async function getUserCompletedCount(userId?: number): Promise<number> {
  void userId;
  const res = await apiGet<number>(
    `${BASE}/me/completed-count`,
    { revalidate: 0 }
  );
  return res.data;
}

export async function getCourseProgress(
  courseId: number,
  userId?: number
): Promise<number> {
  void userId;
  const res = await apiGet<number>(
    `${BASE}/course/${courseId}/completed-count`,
    { revalidate: 0 }
  );
  return res.data;
}
