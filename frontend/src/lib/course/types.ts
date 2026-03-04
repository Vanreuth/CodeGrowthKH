import type { ChapterDto } from "../chapter/type";

export type CourseLevel = "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
export type CourseStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export interface CourseDto {
  id: number;
  title: string;
  slug: string;
  description: string;
  thumbnail: string | null;
  price: number;
  level: CourseLevel;
  language: string;
  status: CourseStatus;
  isFeatured: boolean;
  isFree: boolean;
  requirements: string | null;
  totalLessons: number;
  totalChapters: number;
  viewCount: number;
  enrolledCount: number;
  avgRating: number;
  createdAt: string;
  updatedAt: string | null;
  publishedAt: string | null;
  launchDate?: string | null;
  instructorId: number;
  instructorName: string;
  categoryId: number;
  categoryName: string;
  chapters?: ChapterDto[];
}

export interface CreateCourseRequest {
  title: string;
  slug: string;
  description: string;
  requirements?: string;
  level: CourseLevel;
  language: string;
  status: CourseStatus;
  isFeatured?: boolean;
  isFree?: boolean;
  categoryId: number;
  instructorId: number;
  thumbnail?: File;
}

export type UpdateCourseRequest = Partial<CreateCourseRequest>;
