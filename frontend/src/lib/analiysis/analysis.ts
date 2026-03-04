import { apiGet } from "@/lib/api";
import { fetchUsers } from "@/lib/user/user";
import { fetchCourses } from "@/lib/course/course";
import type { DashboardStats, PageResponse, UserDto } from "@/lib/types";
import type { CourseDto } from "@/lib/course/types";
import type { AnalyticsSummary } from "./types";

const BASE = "/api/v1/analytics";

// ─── Dashboard Stats (aggregated) ────────────────────────────────────────────

const emptyUserPage = (): PageResponse<UserDto> => ({
  content: [], pageNumber: 0, pageSize: 10, totalElements: 0, totalPages: 0,
});

const emptyCoursePage = (): PageResponse<CourseDto> => ({
  content: [], pageNumber: 0, pageSize: 10, totalElements: 0, totalPages: 0,
});

export async function fetchDashboardStats(): Promise<DashboardStats> {
  const [usersPage, coursesPage] = await Promise.all([
    fetchUsers({ page: 0, size: 10 }).catch(emptyUserPage),
    fetchCourses({ page: 0, size: 10 }).catch(emptyCoursePage),
  ]);

  return {
    totalUsers:       usersPage.totalElements  || usersPage.content.length,
    totalCourses:     coursesPage.totalElements || coursesPage.content.length,
    totalEnrollments: coursesPage.content.reduce((s, c) => s + (c.enrolledCount ?? 0), 0),
    totalLessons:     coursesPage.content.reduce((s, c) => s + (c.totalLessons  ?? 0), 0),
    recentUsers:      usersPage.content.slice(0, 5),
    popularCourses:   coursesPage.content.slice(0, 5),
    userGrowth:       [],
    enrollmentTrend:  [],
  };
}

// ─── Server-side analytics endpoints (if they exist) ─────────────────────────

export async function fetchAnalyticsSummary(): Promise<AnalyticsSummary | null> {
  try {
    const res = await apiGet<AnalyticsSummary>(`${BASE}/summary`, { revalidate: 0 });
    return res.data;
  } catch {
    return null;
  }
}
