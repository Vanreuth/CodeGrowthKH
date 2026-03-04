/** Re-export shared DashboardStats */
export type { DashboardStats } from "@/lib/types";

export interface TimePoint {
  date: string;   // ISO date string
  count: number;
}

export interface CourseEngagement {
  courseId: number;
  courseTitle: string;
  views: number;
  completions: number;
  avgProgress: number;
}

export interface AnalyticsSummary {
  totalUsers: number;
  totalCourses: number;
  totalEnrollments: number;
  totalLessons: number;
  userGrowth: TimePoint[];
  enrollmentTrend: TimePoint[];
  topCourses: CourseEngagement[];
}
