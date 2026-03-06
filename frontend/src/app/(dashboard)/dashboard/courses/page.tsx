"use client";

import { useState, useMemo, useRef } from "react";
import Link from "next/link";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  MoreHorizontal,
  RefreshCw,
  BookOpen,
  Users,
  Star,
  Eye,
  Download,
  Grid3X3,
  List,
  Clock,
  TrendingUp,
  X,
  Sparkles,
  GraduationCap,
  ImageOff,
  Upload,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useCourses, useCourseAdmin } from "@/hooks/useCourses";
import { useCategories } from "@/hooks/useCategories";
import type { CourseResponse, CourseRequest, CourseStatus, CourseLevel } from "@/types/courseType";

// ─── Empty form default ────────────────────────────────────────────────────────

const emptyForm = (): CourseRequest & { _categoryStr: string } => ({
  title: "",
  description: "",
  level: "BEGINNER",
  status: "DRAFT",
  language: "English",
  categoryId: undefined,
  featured: false,
  comingSoon: false,
  isFree: true,
  price: 0,
  requirements: "",
  launchDate: "",
  _categoryStr: "",
});

// ─── Stats Card ───────────────────────────────────────────────────────────────

function StatCard({
  icon: Icon,
  label,
  value,
  color,
  loading,
  trend,
}: {
  icon: typeof BookOpen;
  label: string;
  value: number | string;
  color: string;
  loading?: boolean;
  trend?: { value: number; isPositive: boolean };
}) {
  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center gap-4 p-5">
          <Skeleton className="h-12 w-12 rounded-xl" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-7 w-20" />
          </div>
        </CardContent>
      </Card>
    );
  }
  return (
    <Card className="overflow-hidden">
      <CardContent className="flex items-center gap-4 p-5">
        <div
          className="h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: `${color}18` }}
        >
          <Icon className="h-6 w-6" style={{ color }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{label}</p>
          <div className="flex items-end gap-2 mt-0.5">
            <p className="text-2xl font-bold leading-none">{value}</p>
            {trend && (
              <span
                className={`text-xs font-semibold flex items-center pb-0.5 ${
                  trend.isPositive ? "text-emerald-600" : "text-red-500"
                }`}
              >
                <TrendingUp className={`h-3 w-3 mr-0.5 ${!trend.isPositive ? "rotate-180" : ""}`} />
                {trend.value}%
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

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

function CourseThumbnail({
  course,
  className = "h-12 w-12 rounded-lg",
}: {
  course: CourseResponse;
  className?: string;
}) {
  if (course.thumbnail) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={course.thumbnail} alt={course.title} className={`${className} object-cover flex-shrink-0`} />
    );
  }
  const gradient = GRADIENTS[course.id % GRADIENTS.length];
  return (
    <div className={`${className} bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-bold flex-shrink-0 text-lg`}>
      {course.title.charAt(0)}
    </div>
  );
}

// ─── Skeleton Row ─────────────────────────────────────────────────────────────

function CourseRowSkeleton() {
  return (
    <TableRow>
      <TableCell>
        <div className="flex items-center gap-3">
          <Skeleton className="h-12 w-12 rounded-lg flex-shrink-0" />
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-44" />
            <Skeleton className="h-3 w-28" />
          </div>
        </div>
      </TableCell>
      <TableCell><Skeleton className="h-5 w-20" /></TableCell>
      <TableCell><Skeleton className="h-5 w-20" /></TableCell>
      <TableCell><Skeleton className="h-5 w-16" /></TableCell>
      <TableCell><Skeleton className="h-4 w-14" /></TableCell>
      <TableCell><Skeleton className="h-4 w-12" /></TableCell>
      <TableCell><Skeleton className="h-8 w-8" /></TableCell>
    </TableRow>
  );
}

// ─── Level Badge ──────────────────────────────────────────────────────────────

function LevelBadge({ level }: { level: string }) {
  const config: Record<string, { color: string; bg: string }> = {
    BEGINNER:     { color: "text-emerald-700 dark:text-emerald-300", bg: "bg-emerald-100 dark:bg-emerald-900/40" },
    INTERMEDIATE: { color: "text-amber-700 dark:text-amber-300",   bg: "bg-amber-100 dark:bg-amber-900/40" },
    ADVANCED:     { color: "text-rose-700 dark:text-rose-300",     bg: "bg-rose-100 dark:bg-rose-900/40" },
  };
  const { color, bg } = config[level] ?? config.BEGINNER;
  return (
    <Badge variant="outline" className={`${bg} ${color} border-0 text-xs font-medium`}>
      {level.charAt(0) + level.slice(1).toLowerCase()}
    </Badge>
  );
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { color: string; bg: string; dot: string }> = {
    PUBLISHED:   { color: "text-emerald-700 dark:text-emerald-300", bg: "bg-emerald-100 dark:bg-emerald-900/40",  dot: "bg-emerald-500" },
    DRAFT:       { color: "text-slate-600 dark:text-slate-300",     bg: "bg-slate-100 dark:bg-slate-800",          dot: "bg-slate-400" },
    FEATURED:    { color: "text-amber-700 dark:text-amber-300",     bg: "bg-amber-100 dark:bg-amber-900/40",       dot: "bg-amber-500" },
    COMING_SOON: { color: "text-sky-700 dark:text-sky-300",         bg: "bg-sky-100 dark:bg-sky-900/40",           dot: "bg-sky-500" },
  };
  const { color, bg, dot } = config[status] ?? config.DRAFT;
  const label = status === "COMING_SOON" ? "Coming Soon" : status.charAt(0) + status.slice(1).toLowerCase();
  return (
    <Badge variant="outline" className={`${bg} ${color} border-0 text-xs font-medium gap-1.5`}>
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
      {label}
    </Badge>
  );
}

// ─── Course Card (Grid View) ──────────────────────────────────────────────────

function CourseCard({
  course,
  onEdit,
  onDelete,
}: {
  course: CourseResponse;
  onEdit: (course: CourseResponse) => void;
  onDelete: (course: CourseResponse) => void;
}) {
  const gradient = GRADIENTS[course.id % GRADIENTS.length];
  return (
    <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 border-border/60">
      <div className="h-36 relative overflow-hidden">
        {course.thumbnail ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={course.thumbnail} alt={course.title} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className={`h-full w-full bg-gradient-to-br ${gradient}`} />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute top-3 right-3 flex items-center gap-1.5">
          {(course.featured || course.isFeatured) && (
            <span className="flex items-center gap-1 rounded-full bg-amber-400/90 px-2 py-0.5 text-[10px] font-bold text-amber-900">
              <Sparkles className="h-2.5 w-2.5" />
              Featured
            </span>
          )}
          <StatusBadge status={course.status ?? "DRAFT"} />
        </div>
        <div className="absolute bottom-3 left-3">
          {course.categoryName && (
            <Badge className="bg-white/90 text-slate-900 text-[11px] hover:bg-white border-0">
              {course.categoryName}
            </Badge>
          )}
        </div>
      </div>

      <CardContent className="p-4 space-y-3">
        <div>
          <h3 className="font-semibold line-clamp-1 group-hover:text-primary transition-colors text-sm">{course.title}</h3>
          {course.instructorName && (
            <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
              <GraduationCap className="h-3 w-3" />{course.instructorName}
            </p>
          )}
          {course.description && (
            <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{course.description}</p>
          )}
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1"><BookOpen className="h-3.5 w-3.5" />{course.totalLessons ?? 0} lessons</span>
            <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" />{course.enrolledCount ?? 0}</span>
          </div>
          <LevelBadge level={course.level ?? "BEGINNER"} />
        </div>

        <div className="flex items-center justify-between pt-2.5 border-t border-border/60">
          <div className="flex items-center gap-1 text-amber-500">
            <Star className="h-3.5 w-3.5 fill-current" />
            <span className="text-sm font-semibold">{(course.avgRating ?? 0).toFixed(1)}</span>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-7 px-2">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem asChild>
                <Link href={`/${course.slug}`} target="_blank" className="gap-2">
                  <Eye className="h-4 w-4" />Preview
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2" onClick={() => onEdit(course)}>
                <Edit className="h-4 w-4" />Edit Course
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive gap-2 focus:text-destructive" onClick={() => onDelete(course)}>
                <Trash2 className="h-4 w-4" />Delete Course
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function CoursesManagementPage() {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [levelFilter, setLevelFilter] = useState<CourseLevel | "All">("All");
  const [statusFilter, setStatusFilter] = useState<CourseStatus | "All">("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [selectedTab, setSelectedTab] = useState("all");

  // ── Dialog state ─────────────────────────────────────────────
  const [courseDialogOpen, setCourseDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<CourseResponse | null>(null);
  const [form, setForm] = useState(emptyForm());
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Delete state ─────────────────────────────────────────────
  const [deletingCourse, setDeletingCourse] = useState<CourseResponse | null>(null);

  const { data, loading, refetch } = useCourses({ page, size: pageSize, sortBy: "createdAt", sortDir: "desc" });
  const { data: categoriesData } = useCategories({ page: 0, size: 50 });
  const { create, creating, update, updating, remove, removing } = useCourseAdmin();

  const courses = data?.content ?? [];
  const totalElements = data?.totalElements ?? 0;
  const totalPages = data?.totalPages ?? 1;
  const categories = categoriesData?.content ?? [];

  const activeFilters =
    (searchTerm ? 1 : 0) +
    (levelFilter !== "All" ? 1 : 0) +
    (statusFilter !== "All" ? 1 : 0) +
    (categoryFilter !== "All" ? 1 : 0);

  const clearFilters = () => {
    setSearchTerm("");
    setLevelFilter("All");
    setStatusFilter("All");
    setCategoryFilter("All");
  };

  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      const matchesSearch =
        searchTerm === "" ||
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (course.description ?? "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (course.instructorName ?? "").toLowerCase().includes(searchTerm.toLowerCase());
      const matchesLevel    = levelFilter    === "All" || course.level        === levelFilter;
      const matchesStatus   = statusFilter   === "All" || course.status       === statusFilter;
      const matchesCategory = categoryFilter === "All" || course.categoryName === categoryFilter;
      const matchesTab =
        selectedTab === "all" ||
        (selectedTab === "published"   && course.status === "PUBLISHED") ||
        (selectedTab === "draft"       && course.status === "DRAFT") ||
        (selectedTab === "featured"    && (course.status === "FEATURED" || course.featured || course.isFeatured)) ||
        (selectedTab === "coming_soon" && course.status === "COMING_SOON");
      return matchesSearch && matchesLevel && matchesStatus && matchesCategory && matchesTab;
    });
  }, [courses, searchTerm, levelFilter, statusFilter, categoryFilter, selectedTab]);

  const stats = useMemo(() => ({
    total: totalElements,
    published: courses.filter((c) => c.status === "PUBLISHED").length,
    totalEnrollments: courses.reduce((acc, c) => acc + (c.enrolledCount ?? 0), 0),
    avgRating: courses.length > 0
      ? (courses.reduce((acc, c) => acc + (c.avgRating ?? 0), 0) / courses.length).toFixed(1)
      : "0.0",
  }), [courses, totalElements]);

  // ── Dialog helpers ────────────────────────────────────────────

  const openCreateDialog = () => {
    setEditingCourse(null);
    setForm(emptyForm());
    setThumbnailFile(null);
    setThumbnailPreview(null);
    setCourseDialogOpen(true);
  };

  const openEditDialog = (course: CourseResponse) => {
    setEditingCourse(course);
    setForm({
      title:       course.title,
      description: course.description ?? "",
      level:       course.level ?? "BEGINNER",
      status:      course.status ?? "DRAFT",
      language:    course.language ?? "English",
      categoryId:  course.categoryId,
      featured:    course.featured ?? false,
      comingSoon:  course.comingSoon ?? false,
      isFree:      course.isFree ?? true,
      price:       course.price ?? 0,
      requirements: course.requirements ?? "",
      launchDate:  course.launchDate ?? "",
      _categoryStr: course.categoryId ? String(course.categoryId) : "",
    });
    setThumbnailFile(null);
    setThumbnailPreview(course.thumbnail ?? null);
    setCourseDialogOpen(true);
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setThumbnailFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setThumbnailPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const setField = <K extends keyof typeof form>(key: K, value: typeof form[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async () => {
    if (!form.title.trim()) {
      toast.error("Course title is required");
      return;
    }
    const payload: CourseRequest = {
      title:        form.title.trim(),
      description:  form.description || undefined,
      level:        form.level,
      status:       form.status,
      language:     form.language || undefined,
      categoryId:   form.categoryId,
      featured:     form.featured,
      comingSoon:   form.comingSoon,
      isFree:       form.isFree,
      price:        form.isFree ? 0 : (form.price ?? 0),
      requirements: form.requirements || undefined,
      launchDate:   form.comingSoon && form.launchDate ? form.launchDate : undefined,
    };
    try {
      if (editingCourse) {
        await update(editingCourse.id, payload, thumbnailFile ?? undefined);
        toast.success("Course updated", { description: payload.title });
      } else {
        await create(payload, thumbnailFile ?? undefined);
        toast.success("Course created", { description: payload.title });
      }
      setCourseDialogOpen(false);
      void refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Operation failed");
    }
  };

  const handleDelete = async () => {
    if (!deletingCourse) return;
    const ok = await remove(deletingCourse.id);
    setDeletingCourse(null);
    if (ok) {
      toast.success("Course deleted", { description: deletingCourse.title });
      void refetch();
    } else {
      toast.error("Failed to delete course");
    }
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
        <div className="flex items-center gap-2 shrink-0">
          <Button variant="outline" size="sm" onClick={() => void refetch()} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button size="sm" className="gap-2" onClick={openCreateDialog}>
            <Plus className="h-4 w-4" />
            Add Course
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={BookOpen} label="Total Courses"     value={stats.total}            color="#8b5cf6" loading={loading} trend={{ value: 12, isPositive: true }} />
        <StatCard icon={Eye}      label="Published"         value={stats.published}         color="#10b981" loading={loading} />
        <StatCard icon={Users}    label="Total Enrollments" value={stats.totalEnrollments}  color="#3b82f6" loading={loading} trend={{ value: 18, isPositive: true }} />
        <StatCard icon={Star}     label="Avg. Rating"       value={stats.avgRating}         color="#f59e0b" loading={loading} />
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Course Management</CardTitle>
              <CardDescription>{totalElements} total courses · {stats.published} published</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center rounded-lg border border-border p-0.5">
                <Button variant={viewMode === "list" ? "secondary" : "ghost"} size="icon" className="h-7 w-7" onClick={() => setViewMode("list")}>
                  <List className="h-4 w-4" />
                </Button>
                <Button variant={viewMode === "grid" ? "secondary" : "ghost"} size="icon" className="h-7 w-7" onClick={() => setViewMode("grid")}>
                  <Grid3X3 className="h-4 w-4" />
                </Button>
              </div>
              <Button variant="outline" size="sm" className="gap-2">
                <Download className="h-4 w-4" />Export
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Tabs */}
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="h-9">
              <TabsTrigger value="all" className="gap-1.5 text-xs">
                <BookOpen className="h-3.5 w-3.5" />All
                <Badge variant="secondary" className="text-[10px] h-4 px-1.5 ml-0.5">{totalElements}</Badge>
              </TabsTrigger>
              <TabsTrigger value="published"   className="gap-1.5 text-xs"><Eye className="h-3.5 w-3.5" />Published</TabsTrigger>
              <TabsTrigger value="draft"       className="gap-1.5 text-xs"><Clock className="h-3.5 w-3.5" />Drafts</TabsTrigger>
              <TabsTrigger value="featured"    className="gap-1.5 text-xs"><Sparkles className="h-3.5 w-3.5" />Featured</TabsTrigger>
              <TabsTrigger value="coming_soon" className="gap-1.5 text-xs"><Clock className="h-3.5 w-3.5" />Coming Soon</TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Filters */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input placeholder="Search by title, description or instructor…" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9 h-9" />
              {searchTerm && (
                <button onClick={() => setSearchTerm("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="h-9 w-[160px]"><SelectValue placeholder="Category" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Categories</SelectItem>
                  {categories.map((cat) => <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={levelFilter} onValueChange={(v) => setLevelFilter(v as CourseLevel | "All")}>
                <SelectTrigger className="h-9 w-[130px]"><SelectValue placeholder="Level" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Levels</SelectItem>
                  <SelectItem value="BEGINNER">Beginner</SelectItem>
                  <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                  <SelectItem value="ADVANCED">Advanced</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as CourseStatus | "All")}>
                <SelectTrigger className="h-9 w-[140px]"><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Status</SelectItem>
                  <SelectItem value="PUBLISHED">Published</SelectItem>
                  <SelectItem value="DRAFT">Draft</SelectItem>
                  <SelectItem value="FEATURED">Featured</SelectItem>
                  <SelectItem value="COMING_SOON">Coming Soon</SelectItem>
                </SelectContent>
              </Select>
              {activeFilters > 0 && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1.5 text-muted-foreground h-9">
                  <X className="h-3.5 w-3.5" />Clear ({activeFilters})
                </Button>
              )}
            </div>
          </div>

          {!loading && (
            <p className="text-sm text-muted-foreground">
              Showing <span className="font-medium text-foreground">{filteredCourses.length}</span> of{" "}
              <span className="font-medium text-foreground">{totalElements}</span> courses
            </p>
          )}

          {/* Content */}
          {viewMode === "grid" ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {loading
                ? Array.from({ length: 6 }).map((_, i) => (
                    <Card key={i} className="overflow-hidden">
                      <Skeleton className="h-36" />
                      <CardContent className="p-4 space-y-3">
                        <Skeleton className="h-4 w-3/4" /><Skeleton className="h-3 w-1/2" />
                        <Skeleton className="h-3 w-full" /><Skeleton className="h-3 w-2/3" />
                      </CardContent>
                    </Card>
                  ))
                : filteredCourses.map((course) => (
                    <CourseCard key={course.id} course={course} onEdit={openEditDialog} onDelete={setDeletingCourse} />
                  ))}
              {!loading && filteredCourses.length === 0 && (
                <div className="col-span-full text-center py-16">
                  <ImageOff className="h-12 w-12 mx-auto mb-3 text-muted-foreground/40" />
                  <p className="font-medium text-muted-foreground">No courses found</p>
                  <p className="text-sm text-muted-foreground mt-1">Try adjusting your search or filters</p>
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50 hover:bg-muted/50">
                    <TableHead className="font-semibold w-[280px]">Course</TableHead>
                    <TableHead className="font-semibold">Category</TableHead>
                    <TableHead className="font-semibold">Level</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold">Enrollments</TableHead>
                    <TableHead className="font-semibold">Rating</TableHead>
                    <TableHead className="text-right font-semibold w-16">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => <CourseRowSkeleton key={i} />)
                  ) : filteredCourses.length > 0 ? (
                    filteredCourses.map((course) => (
                      <TableRow key={course.id} className="group hover:bg-muted/30">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <CourseThumbnail course={course} />
                            <div className="min-w-0">
                              <p className="font-medium truncate max-w-[200px] group-hover:text-primary transition-colors text-sm">{course.title}</p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                  <BookOpen className="h-3 w-3" />{course.totalLessons ?? 0} lessons
                                </p>
                                {(course.featured || course.isFeatured) && <span className="text-amber-500"><Sparkles className="h-3 w-3" /></span>}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs font-medium">{course.categoryName ?? "—"}</Badge>
                        </TableCell>
                        <TableCell><LevelBadge level={course.level ?? "BEGINNER"} /></TableCell>
                        <TableCell><StatusBadge status={course.status ?? "DRAFT"} /></TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5 text-sm">
                            <Users className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="font-medium">{(course.enrolledCount ?? 0).toLocaleString()}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-amber-500">
                            <Star className="h-3.5 w-3.5 fill-current" />
                            <span className="text-sm font-semibold text-foreground">{(course.avgRating ?? 0).toFixed(1)}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-44">
                              <DropdownMenuItem asChild>
                                <Link href={`/${course.slug}`} target="_blank" className="gap-2">
                                  <Eye className="h-4 w-4" />Preview
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem className="gap-2" onClick={() => openEditDialog(course)}>
                                <Edit className="h-4 w-4" />Edit Course
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-destructive gap-2 focus:text-destructive" onClick={() => setDeletingCourse(course)}>
                                <Trash2 className="h-4 w-4" />Delete Course
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="h-32 text-center">
                        <div className="flex flex-col items-center justify-center text-muted-foreground gap-2">
                          <BookOpen className="h-10 w-10 opacity-30" />
                          <p className="font-medium">No courses found</p>
                          <p className="text-sm">Try adjusting your search or filters</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pt-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Rows per page:</span>
              <Select value={String(pageSize)} onValueChange={(v) => { setPageSize(Number(v)); setPage(0); }}>
                <SelectTrigger className="h-8 w-16"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm text-muted-foreground mr-2">Page {page + 1} of {totalPages || 1}</span>
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setPage(0)} disabled={page === 0}><ChevronsLeft className="h-4 w-4" /></Button>
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0}><ChevronLeft className="h-4 w-4" /></Button>
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}><ChevronRight className="h-4 w-4" /></Button>
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setPage(totalPages - 1)} disabled={page >= totalPages - 1}><ChevronsRight className="h-4 w-4" /></Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ─── Create / Edit Dialog ──────────────────────────────────────── */}
      <Dialog open={courseDialogOpen} onOpenChange={(open) => !isSaving && setCourseDialogOpen(open)}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingCourse ? "Edit Course" : "Create New Course"}</DialogTitle>
            <DialogDescription>
              {editingCourse ? "Update the course details below." : "Fill in the details to publish a new course."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-2">
            {/* Thumbnail */}
            <div className="space-y-2">
              <Label>Thumbnail</Label>
              <div className="flex items-center gap-4">
                <div className="h-24 w-40 rounded-lg border-2 border-dashed border-border overflow-hidden flex items-center justify-center bg-muted/30 flex-shrink-0">
                  {thumbnailPreview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={thumbnailPreview} alt="preview" className="h-full w-full object-cover" />
                  ) : (
                    <div className="text-center text-muted-foreground">
                      <ImageOff className="h-8 w-8 mx-auto mb-1 opacity-40" />
                      <p className="text-xs">No image</p>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Button type="button" variant="outline" size="sm" className="gap-2" onClick={() => fileInputRef.current?.click()}>
                    <Upload className="h-4 w-4" />
                    {thumbnailPreview ? "Change Image" : "Upload Image"}
                  </Button>
                  {thumbnailPreview && (
                    <Button type="button" variant="ghost" size="sm" className="gap-2 text-muted-foreground" onClick={() => { setThumbnailFile(null); setThumbnailPreview(null); }}>
                      <X className="h-4 w-4" />Remove
                    </Button>
                  )}
                  <p className="text-xs text-muted-foreground">JPG, PNG or WebP. Max 5 MB.</p>
                </div>
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleThumbnailChange} />
            </div>

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="course-title">Title <span className="text-destructive">*</span></Label>
              <Input id="course-title" placeholder="e.g., Complete React Developer Course" value={form.title} onChange={(e) => setField("title", e.target.value)} />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="course-desc">Description</Label>
              <Textarea id="course-desc" placeholder="What will students learn in this course?" rows={3} value={form.description} onChange={(e) => setField("description", e.target.value)} />
            </div>

            {/* Level + Status */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Level</Label>
                <Select value={form.level} onValueChange={(v) => setField("level", v as CourseLevel)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BEGINNER">Beginner</SelectItem>
                    <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                    <SelectItem value="ADVANCED">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => setField("status", v as CourseStatus)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DRAFT">Draft</SelectItem>
                    <SelectItem value="PUBLISHED">Published</SelectItem>
                    <SelectItem value="FEATURED">Featured</SelectItem>
                    <SelectItem value="COMING_SOON">Coming Soon</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Category + Language */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={form._categoryStr || "none"}
                  onValueChange={(v) => setForm((p) => ({ ...p, _categoryStr: v === "none" ? "" : v, categoryId: v && v !== "none" ? Number(v) : undefined }))}
                >
                  <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No category</SelectItem>
                    {categories.map((cat) => <SelectItem key={cat.id} value={String(cat.id)}>{cat.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="course-lang">Language</Label>
                <Input id="course-lang" placeholder="e.g., English" value={form.language} onChange={(e) => setField("language", e.target.value)} />
              </div>
            </div>

            {/* Requirements */}
            <div className="space-y-2">
              <Label htmlFor="course-req">Requirements</Label>
              <Textarea id="course-req" placeholder="List prerequisites or requirements for this course…" rows={2} value={form.requirements} onChange={(e) => setField("requirements", e.target.value)} />
            </div>

            {/* Pricing */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Free Course</Label>
                  <p className="text-xs text-muted-foreground mt-0.5">Toggle off to set a price</p>
                </div>
                <Switch checked={form.isFree ?? true} onCheckedChange={(v) => setField("isFree", v)} />
              </div>
              {!form.isFree && (
                <div className="space-y-2">
                  <Label htmlFor="course-price">Price (USD)</Label>
                  <Input
                    id="course-price"
                    type="number"
                    min={0}
                    step={0.01}
                    placeholder="0.00"
                    value={form.price ?? 0}
                    onChange={(e) => setField("price", parseFloat(e.target.value) || 0)}
                  />
                </div>
              )}
            </div>

            {/* Toggles */}
            <div className="space-y-3 rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Featured</Label>
                  <p className="text-xs text-muted-foreground mt-0.5">Show in featured section</p>
                </div>
                <Switch checked={form.featured ?? false} onCheckedChange={(v) => setField("featured", v)} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Coming Soon</Label>
                  <p className="text-xs text-muted-foreground mt-0.5">Mark as not yet available</p>
                </div>
                <Switch checked={form.comingSoon ?? false} onCheckedChange={(v) => setField("comingSoon", v)} />
              </div>
              {form.comingSoon && (
                <div className="space-y-2 pt-1">
                  <Label htmlFor="course-launch">Launch Date</Label>
                  <Input id="course-launch" type="date" value={form.launchDate ?? ""} onChange={(e) => setField("launchDate", e.target.value)} />
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCourseDialogOpen(false)} disabled={isSaving}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingCourse ? "Save Changes" : "Create Course"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Delete Confirmation ───────────────────────────────────────── */}
      <AlertDialog open={!!deletingCourse} onOpenChange={(open) => !open && setDeletingCourse(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Course</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <span className="font-semibold text-foreground">"{deletingCourse?.title}"</span>?
              This action cannot be undone. All chapters, lessons and enrollments will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={removing}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={removing} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {removing ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Deleting…</> : "Delete Course"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}