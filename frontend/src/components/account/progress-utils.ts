import type { LessonProgressResponse } from "@/types/lessonProgressType";

export interface CourseProgressSummary {
  courseId?: number;
  courseTitle: string;
  lessons: LessonProgressResponse[];
  totalLessons: number;
  completedLessons: number;
  progressPct: number;
  totalReadSeconds: number;
  lastActivityAt?: string;
}

export interface ActivityHeatmapCell {
  date: Date;
  dateKey: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
  isToday: boolean;
}

export interface WeekComparison {
  thisWeek: number;
  lastWeek: number;
  delta: number;
  direction: "up" | "down" | "flat";
}

function startOfDay(date: Date): Date {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

function toDate(value?: string | null): Date | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function toDateKey(value?: string | Date | null): string | null {
  if (!value) return null;

  const date = value instanceof Date ? value : toDate(value);
  if (!date) return null;

  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");

  return `${yyyy}-${mm}-${dd}`;
}

export function getPrimaryActivityAt(progress: LessonProgressResponse): string | undefined {
  return progress.completedAt ?? progress.updatedAt ?? progress.createdAt;
}

export function formatDurationKh(seconds: number): string {
  const wholeSeconds = Math.round(seconds);
  if (wholeSeconds <= 0) return "0 នាទី";

  const hours = Math.floor(wholeSeconds / 3600);
  const minutes = Math.floor((wholeSeconds % 3600) / 60);

  if (hours > 0 && minutes > 0) return `${hours} ម៉ោង ${minutes} នាទី`;
  if (hours > 0) return `${hours} ម៉ោង`;
  if (minutes > 0) return `${minutes} នាទី`;

  return `${wholeSeconds} វិនាទី`;
}

export function formatDurationCompactKh(seconds: number): string {
  const wholeSeconds = Math.round(seconds);
  if (wholeSeconds <= 0) return "--";
  if (wholeSeconds >= 3600) return `${(wholeSeconds / 3600).toFixed(wholeSeconds >= 36_000 ? 0 : 1)} ម៉.`;
  if (wholeSeconds >= 60) return `${Math.round(wholeSeconds / 60)} នា.`;
  return `${wholeSeconds} វិ.`;
}

export function estimateLessonReadMinutes(progress: LessonProgressResponse): number {
  const trackedMinutes = Math.ceil((progress.readTimeSeconds ?? 0) / 60);
  if (trackedMinutes > 0) return trackedMinutes;

  const scrollPct = progress.scrollPct ?? 0;
  if (progress.completed) return 8;
  if (scrollPct >= 75) return 6;
  if (scrollPct >= 40) return 4;
  return 3;
}

export function buildCourseProgressSummaries(
  groups: Record<string, LessonProgressResponse[]>,
): CourseProgressSummary[] {
  return Object.entries(groups)
    .map(([courseTitle, lessons]) => {
      const completedLessons = lessons.filter((lesson) => lesson.completed).length;
      const totalLessonsFromCourse = lessons.reduce(
        (max, lesson) => Math.max(max, lesson.courseTotalLessons ?? 0),
        0,
      );
      const totalLessons = Math.max(totalLessonsFromCourse, lessons.length);
      const progressPct = totalLessons > 0
        ? Math.round((completedLessons / totalLessons) * 100)
        : 0;
      const totalReadSeconds = lessons.reduce(
        (sum, lesson) => sum + (lesson.readTimeSeconds ?? 0),
        0,
      );
      const sorted = [...lessons].sort(
        (a, b) =>
          new Date(getPrimaryActivityAt(b) ?? 0).getTime() -
          new Date(getPrimaryActivityAt(a) ?? 0).getTime(),
      );

      return {
        courseId: lessons[0]?.courseId,
        courseTitle,
        lessons: sorted,
        totalLessons,
        completedLessons,
        progressPct,
        totalReadSeconds,
        lastActivityAt: getPrimaryActivityAt(sorted[0]),
      };
    })
    .sort(
      (a, b) =>
        new Date(b.lastActivityAt ?? 0).getTime() -
        new Date(a.lastActivityAt ?? 0).getTime(),
    );
}

export function buildActivityHeatmap(
  list: LessonProgressResponse[],
  weeks: number = 8,
): ActivityHeatmapCell[] {
  const dailyActivity = new Map<string, Set<string>>();

  for (const progress of list) {
    const progressId = String(progress.id ?? progress.lessonId);
    const activeDays = new Set(
      [progress.createdAt, progress.updatedAt, progress.completedAt]
        .map((value) => toDateKey(value))
        .filter((value): value is string => Boolean(value)),
    );

    for (const day of activeDays) {
      const bucket = dailyActivity.get(day) ?? new Set<string>();
      bucket.add(progressId);
      dailyActivity.set(day, bucket);
    }
  }

  const today = startOfDay(new Date());
  const totalDays = weeks * 7;
  const start = new Date(today);
  start.setDate(today.getDate() - (totalDays - 1));

  return Array.from({ length: totalDays }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    const dateKey = toDateKey(date) ?? "";
    const count = dailyActivity.get(dateKey)?.size ?? 0;

    let level: ActivityHeatmapCell["level"] = 0;
    if (count >= 5) level = 4;
    else if (count >= 3) level = 3;
    else if (count >= 2) level = 2;
    else if (count >= 1) level = 1;

    return {
      date,
      dateKey,
      count,
      level,
      isToday: dateKey === toDateKey(today),
    };
  });
}

function startOfWeek(date: Date): Date {
  const next = startOfDay(date);
  const dayIndex = (next.getDay() + 6) % 7;
  next.setDate(next.getDate() - dayIndex);
  return next;
}

export function buildWeekComparison(list: LessonProgressResponse[]): WeekComparison {
  const today = new Date();
  const thisWeekStart = startOfWeek(today);
  const lastWeekStart = new Date(thisWeekStart);
  lastWeekStart.setDate(thisWeekStart.getDate() - 7);
  const thisWeekEnd = new Date(thisWeekStart);
  thisWeekEnd.setDate(thisWeekStart.getDate() + 7);

  const completedDates = list
    .filter((progress) => progress.completed && progress.completedAt)
    .map((progress) => toDate(progress.completedAt))
    .filter((value): value is Date => Boolean(value));

  const thisWeek = completedDates.filter(
    (date) => date >= thisWeekStart && date < thisWeekEnd,
  ).length;

  const lastWeek = completedDates.filter(
    (date) => date >= lastWeekStart && date < thisWeekStart,
  ).length;

  const delta = thisWeek - lastWeek;

  return {
    thisWeek,
    lastWeek,
    delta,
    direction: delta > 0 ? "up" : delta < 0 ? "down" : "flat",
  };
}

export function countCompletedToday(list: LessonProgressResponse[]): number {
  const todayKey = toDateKey(new Date());

  return list.filter((progress) => {
    if (!progress.completed) return false;
    return toDateKey(progress.completedAt) === todayKey;
  }).length;
}

export function buildReadingTimeChartData(list: LessonProgressResponse[]) {
  const grouped = new Map<string, { courseTitle: string; seconds: number }>();

  for (const progress of list) {
    const courseTitle = progress.courseTitle ?? `វគ្គសិក្សា ${progress.courseId ?? progress.lessonId}`;
    const current = grouped.get(courseTitle) ?? { courseTitle, seconds: 0 };
    current.seconds += progress.readTimeSeconds ?? 0;
    grouped.set(courseTitle, current);
  }

  return [...grouped.values()]
    .filter((item) => item.seconds > 0)
    .sort((a, b) => b.seconds - a.seconds)
    .slice(0, 6)
    .map((item) => ({
      ...item,
      label: item.courseTitle.length > 18 ? `${item.courseTitle.slice(0, 18)}…` : item.courseTitle,
      hours: Number((item.seconds / 3600).toFixed(1)),
    }));
}
