import type { AuthResponse, LoginRequest, RegisterRequest, UpdateProfileRequest } from "./auth/types";
import type { CategoryDto, CreateCategoryRequest, UpdateCategoryRequest } from "./category/types";
import type { ChapterDto, CreateChapterRequest, UpdateChapterRequest } from "./chapter/type";
import type { CodeSnippetDto, CreateSnippetRequest, UpdateSnippetRequest } from "./codeShippet/types";
import type {
  CourseDto,
  CourseLevel,
  CourseStatus,
  CreateCourseRequest,
  UpdateCourseRequest,
} from "./course/types";
import type { CoursePdfExportDto } from "./coursePDF/types";
import type { LessonDto, CreateLessonRequest, UpdateLessonRequest } from "./lesson/types";
import type { LessonProgressDto, UpsertProgressRequest } from "./lessonProgress/types";
import type { UpdateUserRequest, UserDto } from "./user/types";

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PageResponse<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly path?: string,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = "ApiError";
    Object.setPrototypeOf(this, ApiError.prototype);
  }

  get isUnauthorized() {
    return this.status === 401;
  }

  get isForbidden() {
    return this.status === 403;
  }

  get isNotFound() {
    return this.status === 404;
  }

  get isServerError() {
    return this.status >= 500;
  }
}

export interface FetchOptions {
  revalidate?: number;
  headers?: HeadersInit;
  cache?: RequestCache;
  signal?: AbortSignal | null;
}

export interface DashboardStats {
  totalUsers: number;
  totalCourses: number;
  totalEnrollments: number;
  totalLessons: number;
  recentUsers: UserDto[];
  popularCourses: CourseDto[];
  userGrowth: { date: string; count: number }[];
  enrollmentTrend: { date: string; count: number }[];
}

export interface PaginationParams {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: "asc" | "desc";
}

export interface SearchParams extends PaginationParams {
  query?: string;
  categoryId?: number;
  level?: CourseLevel;
  status?: CourseStatus;
}

export interface CourseFilterParams extends PaginationParams {
  query?: string;
  categoryId?: number;
  level?: CourseLevel;
  status?: CourseStatus;
  isFeatured?: boolean;
  isFree?: boolean;
  instructorId?: number;
}

export type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  UpdateProfileRequest,
  CategoryDto,
  CreateCategoryRequest,
  UpdateCategoryRequest,
  ChapterDto,
  CreateChapterRequest,
  UpdateChapterRequest,
  CodeSnippetDto,
  CreateSnippetRequest,
  UpdateSnippetRequest,
  CourseDto,
  CourseLevel,
  CourseStatus,
  CreateCourseRequest,
  UpdateCourseRequest,
  CoursePdfExportDto,
  LessonDto,
  CreateLessonRequest,
  UpdateLessonRequest,
  LessonProgressDto,
  UpsertProgressRequest,
  UserDto,
  UpdateUserRequest,
};
