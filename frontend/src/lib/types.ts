// ─── Primitive enums / unions ─────────────────────────────────────────────────

export type UserRole = "ADMIN" | "INSTRUCTOR" | "USER" | string;
export type UserStatus = "ACTIVE" | "INACTIVE" | "BANNED" | string;
export type CourseLevel = "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
export type CourseStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface AuthResponse {
  id: number;
  username: string;
  email: string;
  phoneNumber?: string | null;
  address?: string | null;
  bio?: string | null;
  profilePicture?: string | null;
  avatar?: string | null;
  roles?: UserRole[];
  role?: UserRole;
  isActive?: boolean;
  createdAt?: string | null;
  updatedAt?: string | null;
  /** JWT access token returned by login/register — save to cookie immediately */
  accessToken?: string;
}

export interface LoginRequest {
  username?: string;
  email?: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  confirmPassword?: string;
  profilePicture?: File;
  phoneNumber?: string | null;
  address?: string | null;
  bio?: string | null;
}

export interface UpdateProfileRequest {
  username?: string;
  email?: string;
  phoneNumber?: string | null;
  address?: string | null;
  bio?: string | null;
  photo?: File;
}

// ─── User ─────────────────────────────────────────────────────────────────────

export interface UserDto {
  id: number;
  username: string;
  email: string;
  phoneNumber?: string | null;
  address?: string | null;
  bio?: string | null;
  avatar?: string | null;
  profilePicture?: string | null;
  role: UserRole;
  roles?: UserRole[];
  isActive: boolean;
  status?: UserStatus | null;
  loginAttempt?: number;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface UpdateUserRequest {
  username?: string;
  email?: string;
  phoneNumber?: string | null;
  address?: string | null;
  bio?: string | null;
  avatar?: string | null;
  profilePicture?: string | null;
  isActive?: boolean;
  role?: UserRole;
}

// ─── Category ─────────────────────────────────────────────────────────────────

export interface CategoryDto {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  isActive: boolean;
  orderIndex: number;
  courseCount: number;
  createdAt: string;
}

export interface CreateCategoryRequest {
  name: string;
  slug: string;
  description?: string;
  isActive?: boolean;
  orderIndex?: number;
}

export interface UpdateCategoryRequest extends CreateCategoryRequest {}

// ─── Code Snippet ─────────────────────────────────────────────────────────────

export interface CodeSnippetDto {
  id: number;
  title?: string | null;
  language: string;
  code: string;
  description?: string | null;
  explanation?: string | null;
  lessonId: number;
  orderIndex: number;
  createdAt?: string;
}

export interface CreateSnippetRequest {
  language: string;
  code: string;
  description?: string;
  lessonId: number;
  orderIndex: number;
}

export interface UpdateSnippetRequest extends Partial<CreateSnippetRequest> {}

// ─── Lesson ───────────────────────────────────────────────────────────────────

export interface LessonDto {
  id: number;
  title: string;
  slug?: string;
  description: string | null;
  content: string;
  orderIndex: number;
  createdAt: string;
  updatedAt: string | null;
  chapterId: number;
  chapterTitle: string;
  courseId: number;
  courseTitle: string;
  codeSnippets?: CodeSnippetDto[];
}

export interface CreateLessonRequest {
  title: string;
  description?: string;
  content: string;
  orderIndex: number;
  chapterId: number;
  courseId: number;
}

export interface UpdateLessonRequest extends Partial<CreateLessonRequest> {}

// ─── Chapter ──────────────────────────────────────────────────────────────────

export interface ChapterDto {
  id: number;
  title: string;
  description: string | null;
  orderIndex: number;
  createdAt: string;
  courseId: number;
  courseTitle: string;
  lessonCount: number;
  lessons?: LessonDto[];
}

export interface CreateChapterRequest {
  title: string;
  description?: string;
  orderIndex: number;
  courseId: number;
}

export interface UpdateChapterRequest extends Partial<CreateChapterRequest> {}

// ─── Course ───────────────────────────────────────────────────────────────────

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

// ─── Course PDF ───────────────────────────────────────────────────────────────

export interface CoursePdfExportDto {
  id: number | null;
  courseId: number;
  courseTitle: string;
  thumbnail?: string | null;
  level?: string | null;
  pdfUrl?: string | null;
  pdfName?: string;
  pdfSizeKb?: number;
  totalPages?: number;
  totalLessonsIncluded?: number;
  downloadCount?: number;
  generatedAt?: string;
  createdAt?: string;
}

// ─── Lesson Progress ──────────────────────────────────────────────────────────

export interface LessonProgressDto {
  id?: number;
  lessonId: number;
  userId?: number;
  completed: boolean;
  completedAt?: string | null;
  createdAt?: string;
  updatedAt?: string | null;
}

export interface UpsertProgressRequest {
  lessonId: number;
  completed: boolean;
}

// ─── API wrapper types ────────────────────────────────────────────────────────

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

  get isUnauthorized() { return this.status === 401; }
  get isForbidden() { return this.status === 403; }
  get isNotFound() { return this.status === 404; }
  get isServerError() { return this.status >= 500; }
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
