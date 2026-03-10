"use client";

import { useState, useMemo } from "react";
import {
  BookOpen, Users, Star, Eye, Plus, Sparkles, GraduationCap,
} from "lucide-react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { toast } from "sonner";

import { DataTable }             from "@/components/dataTable/DataTable";
import { StatCard }              from "@/components/StatCard";
import { Badge }                 from "@/components/ui/badge";
import { Button }                from "@/components/ui/button";
import { CourseDialog }          from "@/components/dialog/CourseDialog";
import { DeleteConfirmDialog }   from "@/components/dialog/DeleteConfirmDialog";

import { useCourses, useCourseAdmin, courseKeys } from "@/hooks/useCourses";
import { useCategories }  from "@/hooks/useCategories";
import { courseService }  from "@/services/courseService";
import type { CourseResponse, CourseRequest } from "@/types/courseType";

// ─── Gradients ────────────────────────────────────────────────────────────────
const GRADIENTS = [
  "from-violet-500 via-purple-500 to-indigo-600",
  "from-blue-500 via-cyan-500 to-teal-500",
  "from-emerald-500 via-green-500 to-lime-500",
  "from-orange-500 via-amber-500 to-yellow-500",
  "from-pink-500 via-rose-500 to-red-500",
  "from-sky-500 via-blue-500 to-indigo-500",
];

// ─── Course Thumbnail ─────────────────────────────────────────────────────────
function CourseThumbnail({ course, className = "h-10 w-10 rounded-lg" }: {
  course: CourseResponse; className?: string;
}) {
  if (course.thumbnail) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={course.thumbnail} alt={course.title} className={`${className} object-cover flex-shrink-0`} />;
  }
  return (
    <div className={`${className} bg-gradient-to-br ${GRADIENTS[course.id % GRADIENTS.length]} flex items-center justify-center text-white font-bold flex-shrink-0`}>
      {course.title.charAt(0)}
    </div>
  );
}

// ─── Level Badge ──────────────────────────────────────────────────────────────
function LevelBadge({ level }: { level: string }) {
  const cfg: Record<string, { color: string; bg: string }> = {
    BEGINNER:     { color: "text-emerald-700 dark:text-emerald-300", bg: "bg-emerald-100 dark:bg-emerald-900/40" },
    INTERMEDIATE: { color: "text-amber-700 dark:text-amber-300",    bg: "bg-amber-100 dark:bg-amber-900/40" },
    ADVANCED:     { color: "text-rose-700 dark:text-rose-300",      bg: "bg-rose-100 dark:bg-rose-900/40" },
  };
  const { color, bg } = cfg[level] ?? cfg.BEGINNER;
  return (
    <Badge variant="outline" className={`${bg} ${color} border-0 text-xs font-medium`}>
      {level.charAt(0) + level.slice(1).toLowerCase()}
    </Badge>
  );
}

// ─── Status Badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const cfg: Record<string, { color: string; bg: string; dot: string }> = {
    PUBLISHED:   { color: "text-emerald-700 dark:text-emerald-300", bg: "bg-emerald-100 dark:bg-emerald-900/40", dot: "bg-emerald-500" },
    DRAFT:       { color: "text-slate-600 dark:text-slate-300",     bg: "bg-slate-100 dark:bg-slate-800",        dot: "bg-slate-400" },
    FEATURED:    { color: "text-amber-700 dark:text-amber-300",     bg: "bg-amber-100 dark:bg-amber-900/40",     dot: "bg-amber-500" },
    COMING_SOON: { color: "text-sky-700 dark:text-sky-300",         bg: "bg-sky-100 dark:bg-sky-900/40",         dot: "bg-sky-500" },
  };
  const { color, bg, dot } = cfg[status] ?? cfg.DRAFT;
  const label = status === "COMING_SOON" ? "Coming Soon" : status.charAt(0) + status.slice(1).toLowerCase();
  return (
    <Badge variant="outline" className={`${bg} ${color} border-0 text-xs font-medium gap-1.5`}>
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
      {label}
    </Badge>
  );
}

// ─── Adapter: wraps useQuery to match DataTable's expected hook signature ─────
function useCoursesTable(params: any) {
  const {
    page = 0, size = 10, sortBy = "createdAt", sortDir = "desc",
    search, status, level, categoryId, isFeatured, isFree,
  } = params;
  const filterParams = { page, size, sortBy, sortDir, search, status, level, categoryId, isFeatured, isFree };
  const query = useQuery({
    queryKey       : courseKeys.list(filterParams),
    queryFn        : () => courseService.getAll(filterParams),
    placeholderData: keepPreviousData,
  });
  return {
    data     : query.data ? { success: true as const, message: "", data: query.data } : undefined,
    isLoading: query.isPending,
    isError  : query.isError,
    error    : query.error,
    refetch  : query.refetch,
  };
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function CoursesManagementPage() {
  // ── Dialog state ─────────────────────────────────────────────
  const [dialogMode, setDialogMode]     = useState<"view" | "add" | "edit">("add");
  const [courseDialogOpen, setCourseDialogOpen] = useState(false);
  const [activeCourse, setActiveCourse]         = useState<CourseResponse | null>(null);

  // ── Delete state ─────────────────────────────────────────────
  const [deletingCourse, setDeletingCourse] = useState<CourseResponse | null>(null);

  // ── Data ──────────────────────────────────────────────────────
  const { data: statsData, loading: statsLoading } = useCourses({ page: 0, size: 1000 });
  const { data: categoriesData }                   = useCategories({ page: 0, size: 50 });
  const { create, creating, update, updating, remove, removing } = useCourseAdmin();

  const categories = categoriesData?.content ?? [];
  const allCourses = statsData?.content ?? [];

  const filterConfig = useMemo(() => [
    {
      key    : "status",
      label  : "Status",
      type   : "select" as const,
      options: [
        { label: "Published",   value: "PUBLISHED"   },
        { label: "Draft",       value: "DRAFT"       },
        { label: "Featured",    value: "FEATURED"    },
        { label: "Coming Soon", value: "COMING_SOON" },
      ],
    },
    {
      key    : "level",
      label  : "Level",
      type   : "select" as const,
      options: [
        { label: "Beginner",     value: "BEGINNER"     },
        { label: "Intermediate", value: "INTERMEDIATE" },
        { label: "Advanced",     value: "ADVANCED"     },
      ],
    },
    {
      key    : "categoryId",
      label  : "Category",
      type   : "select" as const,
      options: categories.map((c) => ({ label: c.name, value: c.id })),
    },
    {
      key    : "isFeatured",
      label  : "Featured",
      type   : "select" as const,
      options: [
        { label: "Yes", value: "true"  },
        { label: "No",  value: "false" },
      ],
    },
  ], [categories]);

  const stats = useMemo(() => ({
    total            : statsData?.totalElements ?? 0,
    published        : allCourses.filter((c) => c.status === "PUBLISHED").length,
    totalEnrollments : allCourses.reduce((acc, c) => acc + (c.enrolledCount ?? 0), 0),
    avgRating        : allCourses.length > 0
      ? (allCourses.reduce((acc, c) => acc + (c.avgRating ?? 0), 0) / allCourses.length).toFixed(1)
      : "0.0",
  }), [allCourses, statsData]);

  // ── Column Definitions ────────────────────────────────────────
  const columns = useMemo(() => [
    {
      key     : "title",
      label   : "Course",
      sortable: true,
      render  : (_: any, item: CourseResponse) => (
        <div className="flex items-center gap-3">
          <CourseThumbnail course={item} />
          <div className="min-w-0">
            <p className="font-medium truncate max-w-[220px] leading-tight">{item.title}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <BookOpen className="h-3 w-3" />{item.totalLessons ?? 0} lessons
              </span>
              {(item.featured || item.isFeatured) && <Sparkles className="h-3 w-3 text-amber-500" />}
              {item.instructorName && (
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <GraduationCap className="h-3 w-3" />{item.instructorName}
                </span>
              )}
            </div>
          </div>
        </div>
      ),
    },
    {
      key   : "categoryName",
      label : "Category",
      render: (val: string) => (
        <Badge variant="outline" className="text-xs font-medium">{val ?? "—"}</Badge>
      ),
    },
    {
      key   : "level",
      label : "Level",
      render: (val: string) => <LevelBadge level={val ?? "BEGINNER"} />,
    },
    {
      key   : "status",
      label : "Status",
      render: (val: string) => <StatusBadge status={val ?? "DRAFT"} />,
    },
    {
      key   : "enrolledCount",
      label : "Enrollments",
      render: (val: number) => (
        <div className="flex items-center gap-1.5 text-sm">
          <Users className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="font-medium">{(val ?? 0).toLocaleString()}</span>
        </div>
      ),
    },
  ], []);

  // ── Dialog helpers ────────────────────────────────────────────
  const openCreateDialog = () => {
    setActiveCourse(null);
    setDialogMode("add");
    setCourseDialogOpen(true);
  };

  const openEditDialog = (course: CourseResponse) => {
    setActiveCourse(course);
    setDialogMode("edit");
    setCourseDialogOpen(true);
  };

  const openViewDialog = (course: CourseResponse) => {
    setActiveCourse(course);
    setDialogMode("view");
    setCourseDialogOpen(true);
  };

  const handleDialogSubmit = async (payload: CourseRequest, thumbnail?: File) => {
    try {
      if (dialogMode === "edit" && activeCourse) {
        await update(activeCourse.id, payload, thumbnail);
        toast.success("Course updated", { description: payload.title });
      } else {
        await create(payload, thumbnail);
        toast.success("Course created", { description: payload.title });
      }
      setCourseDialogOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Operation failed");
    }
  };

  const handleDelete = async () => {
    if (!deletingCourse) return;
    const ok = await remove(deletingCourse.id);
    setDeletingCourse(null);
    if (ok) toast.success("Course deleted", { description: deletingCourse.title });
    else    toast.error("Failed to delete course");
  };

  const isSaving = creating || updating;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Courses</h1>
          <p className="text-muted-foreground mt-1">Manage your course catalog and content</p>
        </div>
        <Button size="sm" className="gap-2 shrink-0" onClick={openCreateDialog}>
          <Plus className="h-4 w-4" /> Add Course
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={BookOpen} label="Total Courses"     value={stats.total}            color="#8b5cf6" loading={statsLoading} trend={{ value: 12, isPositive: true }} />
        <StatCard icon={Eye}      label="Published"         value={stats.published}        color="#10b981" loading={statsLoading} />
        <StatCard icon={Users}    label="Total Enrollments" value={stats.totalEnrollments} color="#3b82f6" loading={statsLoading} trend={{ value: 18, isPositive: true }} />
        <StatCard icon={Star}     label="Avg. Rating"       value={stats.avgRating}        color="#f59e0b" loading={statsLoading} />
      </div>

      {/* Table */}
      <DataTable<CourseResponse>
        title="Course Management"
        description="Manage your course catalog — publish, edit, or remove courses."
        useDataHook={useCoursesTable}
        columns={columns}
        filters={filterConfig}
        onView={(item) => openViewDialog(item)}
        onEdit={(item) => openEditDialog(item)}
        onDelete={(item) => setDeletingCourse(item)}
        headerActions={
          <Button size="sm" className="gap-2" onClick={openCreateDialog}>
            <Plus className="h-4 w-4" /> Add Course
          </Button>
        }
      />

      {/* ─── Create / Edit / View Dialog ──────────────────────────────── */}
      <CourseDialog
        isOpen={courseDialogOpen}
        onOpenChange={(open) => !isSaving && setCourseDialogOpen(open)}
        mode={dialogMode}
        course={activeCourse}
        categories={categories}
        onSubmit={handleDialogSubmit}
        isSubmitting={isSaving}
        onSwitchToEdit={(course) => {
          setActiveCourse(course);
          setDialogMode("edit");
          setCourseDialogOpen(true);
        }}
      />

      {/* ─── Delete Confirmation ───────────────────────────────────────── */}
      <DeleteConfirmDialog
        isOpen={!!deletingCourse}
        onOpenChange={(open) => !open && setDeletingCourse(null)}
        onConfirm={handleDelete}
        itemName={deletingCourse?.title}
        description={
          <>
            Are you sure you want to delete{" "}
            <span className="font-semibold text-foreground">"{deletingCourse?.title}"</span>?
            This action cannot be undone. All chapters, lessons and enrollments will be permanently removed.
          </>
        }
        isLoading={removing}
      />
    </div>
  );
}