"use client";

import { useState, useMemo } from "react";
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
  Layers,
  Filter,
  Download,
  Grid3X3,
  List,
  GraduationCap,
  Clock,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useCourses } from "@/hooks/useCourses";
import { useCategories } from "@/hooks/useCategories";
import type { CourseResponse } from "@/types/apiType";

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
        <CardContent className="flex items-center gap-4 p-4">
          <Skeleton className="h-12 w-12 rounded-xl" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-6 w-20" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardContent className="flex items-center gap-4 p-4">
        <div
          className="h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: `${color}15` }}
        >
          <Icon className="h-6 w-6" style={{ color }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-muted-foreground font-medium">{label}</p>
          <div className="flex items-center gap-2">
            <p className="text-2xl font-bold">{value}</p>
            {trend && (
              <span
                className={`text-xs font-medium flex items-center ${
                  trend.isPositive ? "text-emerald-600" : "text-red-600"
                }`}
              >
                <TrendingUp className={`h-3 w-3 mr-0.5 ${!trend.isPositive && "rotate-180"}`} />
                {trend.value}%
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Course Row Skeleton ──────────────────────────────────────────────────────

function CourseRowSkeleton() {
  return (
    <TableRow>
      <TableCell>
        <div className="flex items-center gap-3">
          <Skeleton className="h-12 w-12 rounded-lg" />
          <div className="space-y-1">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
      </TableCell>
      <TableCell><Skeleton className="h-5 w-20" /></TableCell>
      <TableCell><Skeleton className="h-5 w-16" /></TableCell>
      <TableCell><Skeleton className="h-5 w-16" /></TableCell>
      <TableCell><Skeleton className="h-4 w-12" /></TableCell>
      <TableCell><Skeleton className="h-8 w-8" /></TableCell>
    </TableRow>
  );
}

// ─── Level Badge ──────────────────────────────────────────────────────────────

function LevelBadge({ level }: { level: string }) {
  const config: Record<string, { color: string; bg: string }> = {
    BEGINNER: { color: "text-emerald-700 dark:text-emerald-300", bg: "bg-emerald-100 dark:bg-emerald-900/40" },
    INTERMEDIATE: { color: "text-amber-700 dark:text-amber-300", bg: "bg-amber-100 dark:bg-amber-900/40" },
    ADVANCED: { color: "text-rose-700 dark:text-rose-300", bg: "bg-rose-100 dark:bg-rose-900/40" },
  };

  const { color, bg } = config[level] || config.BEGINNER;

  return (
    <Badge variant="outline" className={`${bg} ${color} border-0 text-xs`}>
      {level}
    </Badge>
  );
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { color: string; bg: string }> = {
    PUBLISHED: { color: "text-emerald-700 dark:text-emerald-300", bg: "bg-emerald-100 dark:bg-emerald-900/40" },
    DRAFT: { color: "text-slate-700 dark:text-slate-300", bg: "bg-slate-100 dark:bg-slate-800" },
    ARCHIVED: { color: "text-red-700 dark:text-red-300", bg: "bg-red-100 dark:bg-red-900/40" },
  };

  const { color, bg } = config[status] || config.DRAFT;

  return (
    <Badge variant="outline" className={`${bg} ${color} border-0 text-xs`}>
      {status}
    </Badge>
  );
}

// ─── Course Card (Grid View) ──────────────────────────────────────────────────

function CourseCard({ course }: { course: CourseResponse }) {
  const gradients = [
    "from-violet-500 via-purple-500 to-indigo-500",
    "from-blue-500 via-cyan-500 to-teal-500",
    "from-emerald-500 via-green-500 to-lime-500",
    "from-orange-500 via-amber-500 to-yellow-500",
    "from-pink-500 via-rose-500 to-red-500",
  ];
  const gradient = gradients[course.id % gradients.length];

  return (
    <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300">
      <div className={`h-32 bg-gradient-to-br ${gradient} relative`}>
        <div className="absolute inset-0 bg-black/10" />
        <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end">
          <Badge className="bg-white/90 text-slate-900 hover:bg-white">
            {course.categoryName}
          </Badge>
          <StatusBadge status={course.status ?? 'DRAFT'} />
        </div>
      </div>
      <CardContent className="p-4 space-y-3">
        <div>
          <h3 className="font-semibold line-clamp-1 group-hover:text-primary transition-colors">
            {course.title}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
            {course.description ?? ''}
          </p>
        </div>

        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <BookOpen className="h-3.5 w-3.5" />
              {course.totalLessons}
            </span>
            <span className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              {course.enrolledCount}
            </span>
          </div>
          <LevelBadge level={course.level ?? 'BEGINNER'} />
        </div>

        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center gap-1 text-amber-500">
            <Star className="h-4 w-4 fill-current" />
            <span className="text-sm font-medium">{(course.avgRating ?? 0).toFixed(1)}</span>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 px-2">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/courses/${course.id}`} className="gap-2">
                  <Eye className="h-4 w-4" />
                  View Details
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2">
                <Edit className="h-4 w-4" />
                Edit Course
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive gap-2">
                <Trash2 className="h-4 w-4" />
                Delete Course
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
  const [levelFilter, setLevelFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [selectedTab, setSelectedTab] = useState("all");

  const { data, loading, refetch } = useCourses({ page, size: pageSize, sortBy: "createdAt", sortDir: "desc" });
  const { data: categoriesData } = useCategories({ page: 0, size: 50 });

  const courses = data?.content || [];
  const totalElements = data?.totalElements || 0;
  const totalPages = data?.totalPages || 1;
  const categories = categoriesData?.content || [];

  // Filter courses
  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      const matchesSearch =
        searchTerm === "" ||
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (course.description ?? '').toLowerCase().includes(searchTerm.toLowerCase());

      const matchesLevel = levelFilter === "All" || course.level === levelFilter;
      const matchesStatus = statusFilter === "All" || course.status === statusFilter;
      const matchesCategory =
        categoryFilter === "All" || course.categoryName === categoryFilter;

      const matchesTab =
        selectedTab === "all" ||
        (selectedTab === "published" && course.status === "PUBLISHED") ||
        (selectedTab === "draft" && course.status === "DRAFT") ||
        (selectedTab === "featured" && course.isFeatured);

      return matchesSearch && matchesLevel && matchesStatus && matchesCategory && matchesTab;
    });
  }, [courses, searchTerm, levelFilter, statusFilter, categoryFilter, selectedTab]);

  // Stats
  const stats = useMemo(() => {
    return {
      total: totalElements,
      published: courses.filter((c) => c.status === "PUBLISHED").length,
      totalEnrollments: courses.reduce((acc, c) => acc + (c.enrolledCount ?? 0), 0),
      avgRating:
        courses.length > 0
          ? (courses.reduce((acc, c) => acc + (c.avgRating ?? 0), 0) / courses.length).toFixed(1)
          : "0.0",
    };
  }, [courses, totalElements]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Courses</h1>
          <p className="text-muted-foreground mt-1">
            Manage your course catalog and content
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button size="sm" className="gap-2" asChild>
            <Link href="/dashboard/courses/new">
              <Plus className="h-4 w-4" />
              Add Course
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={BookOpen}
          label="Total Courses"
          value={stats.total}
          color="#8b5cf6"
          loading={loading}
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          icon={Eye}
          label="Published"
          value={stats.published}
          color="#10b981"
          loading={loading}
        />
        <StatCard
          icon={Users}
          label="Total Enrollments"
          value={stats.totalEnrollments}
          color="#3b82f6"
          loading={loading}
          trend={{ value: 18, isPositive: true }}
        />
        <StatCard
          icon={Star}
          label="Avg. Rating"
          value={stats.avgRating}
          color="#f59e0b"
          loading={loading}
        />
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Course Management</CardTitle>
              <CardDescription>View and manage all courses</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === "list" ? "secondary" : "ghost"}
                size="icon"
                className="h-8 w-8"
                onClick={() => setViewMode("list")}
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "grid" ? "secondary" : "ghost"}
                size="icon"
                className="h-8 w-8"
                onClick={() => setViewMode("grid")}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" className="gap-2 ml-2">
                <Download className="h-4 w-4" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Tabs */}
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList>
              <TabsTrigger value="all" className="gap-2">
                <BookOpen className="h-4 w-4" />
                All Courses
              </TabsTrigger>
              <TabsTrigger value="published" className="gap-2">
                <Eye className="h-4 w-4" />
                Published
              </TabsTrigger>
              <TabsTrigger value="draft" className="gap-2">
                <Clock className="h-4 w-4" />
                Drafts
              </TabsTrigger>
              <TabsTrigger value="featured" className="gap-2">
                <Star className="h-4 w-4" />
                Featured
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Filters */}
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.name}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={levelFilter} onValueChange={setLevelFilter}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Levels</SelectItem>
                <SelectItem value="BEGINNER">Beginner</SelectItem>
                <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                <SelectItem value="ADVANCED">Advanced</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Status</SelectItem>
                <SelectItem value="PUBLISHED">Published</SelectItem>
                <SelectItem value="DRAFT">Draft</SelectItem>
                <SelectItem value="ARCHIVED">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Content */}
          {viewMode === "grid" ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {loading
                ? Array.from({ length: 6 }).map((_, i) => (
                    <Card key={i} className="overflow-hidden">
                      <Skeleton className="h-32" />
                      <CardContent className="p-4 space-y-3">
                        <Skeleton className="h-5 w-3/4" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-2/3" />
                      </CardContent>
                    </Card>
                  ))
                : filteredCourses.map((course) => (
                    <CourseCard key={course.id} course={course} />
                  ))}
              {!loading && filteredCourses.length === 0 && (
                <div className="col-span-full text-center py-12">
                  <BookOpen className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                  <p className="font-medium text-muted-foreground">No courses found</p>
                  <p className="text-sm text-muted-foreground">Try adjusting your search or filters</p>
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold">Course</TableHead>
                    <TableHead className="font-semibold">Category</TableHead>
                    <TableHead className="font-semibold">Level</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold">Enrollments</TableHead>
                    <TableHead className="text-right font-semibold">Actions</TableHead>
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
                            <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                              {course.title.charAt(0)}
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium truncate max-w-[200px] group-hover:text-primary transition-colors">
                                {course.title}
                              </p>
                              <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <BookOpen className="h-3 w-3" />
                                {course.totalLessons} lessons
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{course.categoryName}</Badge>
                        </TableCell>
                        <TableCell>
                          <LevelBadge level={course.level ?? 'BEGINNER'} />
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={course.status ?? 'DRAFT'} />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{course.enrolledCount}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link href={`/dashboard/courses/${course.id}`} className="gap-2">
                                  <Eye className="h-4 w-4" />
                                  View Details
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem className="gap-2">
                                <Edit className="h-4 w-4" />
                                Edit Course
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-destructive gap-2">
                                <Trash2 className="h-4 w-4" />
                                Delete Course
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="h-32 text-center">
                        <div className="flex flex-col items-center justify-center text-muted-foreground">
                          <BookOpen className="h-12 w-12 mb-3 opacity-50" />
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
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Rows per page:</span>
              <Select
                value={String(pageSize)}
                onValueChange={(v) => {
                  setPageSize(Number(v));
                  setPage(0);
                }}
              >
                <SelectTrigger className="h-8 w-[70px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
              <span className="ml-2">
                {filteredCourses.length} of {totalElements} courses
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground mr-2">
                Page {page + 1} of {totalPages || 1}
              </span>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => setPage(0)}
                disabled={page === 0}
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => setPage(totalPages - 1)}
                disabled={page >= totalPages - 1}
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
