"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Activity,
  BookOpen,
  GraduationCap,
  Layers,
  TrendingUp,
  Users,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  Clock,
  BarChart3,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { useCourses } from "@/hooks/useCourses";
import { useCategories } from "@/hooks/useCategories";
import { useUsers } from "@/hooks/useUsers";
import type { CourseResponse, UserResponse, CategoryResponse } from "@/types/apiType";

// ─── Stats Card Component ─────────────────────────────────────────────────────

interface StatCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: React.ReactNode;
  trend?: { value: number; isPositive: boolean };
  loading?: boolean;
  color: string;
}

function StatCard({ title, value, description, icon, trend, loading, color }: StatCardProps) {
  if (loading) {
    return (
      <Card className="overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-10 rounded-xl" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-20 mb-2" />
          <Skeleton className="h-4 w-32" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 border-l-4" style={{ borderLeftColor: color }}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div
          className="p-2.5 rounded-xl transition-colors"
          style={{ backgroundColor: `${color}15` }}
        >
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold tracking-tight">{value}</div>
        <div className="flex items-center gap-2 mt-1">
          {trend && (
            <span
              className={`flex items-center text-xs font-medium ${
                trend.isPositive ? "text-emerald-600" : "text-red-600"
              }`}
            >
              {trend.isPositive ? (
                <ArrowUpRight className="h-3 w-3 mr-0.5" />
              ) : (
                <ArrowDownRight className="h-3 w-3 mr-0.5" />
              )}
              {Math.abs(trend.value)}%
            </span>
          )}
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Course Card Component ────────────────────────────────────────────────────

function CourseCard({ course, loading }: { course?: CourseResponse; loading?: boolean }) {
  if (loading || !course) {
    return (
      <div className="flex items-start gap-4 p-4 rounded-xl border bg-card hover:bg-muted/30 transition-colors">
        <Skeleton className="h-14 w-14 rounded-xl flex-shrink-0" />
        <div className="flex-1 min-w-0 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
          <div className="flex gap-4">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
      </div>
    );
  }

  const levelColors: Record<string, string> = {
    BEGINNER: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
    INTERMEDIATE: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
    ADVANCED: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
  };

  const statusColors: Record<string, string> = {
    PUBLISHED: "bg-emerald-100 text-emerald-700",
    DRAFT: "bg-slate-100 text-slate-700",
    ARCHIVED: "bg-red-100 text-red-700",
  };

  return (
    <Link
      href={`/dashboard/courses/${course.id}`}
      className="flex items-start gap-4 p-4 rounded-xl border bg-card hover:bg-muted/30 hover:border-primary/20 transition-all duration-200 group"
    >
      <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-violet-500 via-purple-500 to-indigo-500 flex items-center justify-center text-white font-bold text-lg flex-shrink-0 shadow-lg shadow-violet-500/20">
        {course.title.charAt(0)}
      </div>
      <div className="flex-1 min-w-0 space-y-1.5">
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-semibold text-sm truncate group-hover:text-primary transition-colors">
            {course.title}
          </h4>
          <Badge variant="outline" className={`${statusColors[course.status] || ""} text-[10px] flex-shrink-0`}>
            {course.status}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground truncate">{course.categoryName}</p>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            {course.enrolledCount}
          </span>
          <span className="flex items-center gap-1">
            <BookOpen className="h-3 w-3" />
            {course.totalLessons} lessons
          </span>
          <Badge className={`${levelColors[course.level] || "bg-slate-100"} text-[10px]`}>
            {course.level}
          </Badge>
        </div>
      </div>
    </Link>
  );
}

// ─── User Row Component ───────────────────────────────────────────────────────

function UserRow({ user, loading }: { user?: UserResponse; loading?: boolean }) {
  if (loading || !user) {
    return (
      <div className="flex items-center gap-3 py-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="flex-1 space-y-1">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-32" />
        </div>
        <Skeleton className="h-5 w-16" />
      </div>
    );
  }

  const roleColors: Record<string, string> = {
    ADMIN: "bg-violet-100 text-violet-700 border-violet-200",
    INSTRUCTOR: "bg-blue-100 text-blue-700 border-blue-200",
    USER: "bg-slate-100 text-slate-700 border-slate-200",
  };

  return (
    <div className="flex items-center gap-3 py-3 group">
      <Avatar className="h-10 w-10 border-2 border-background shadow-sm">
        <AvatarImage src={user.avatar || undefined} alt={user.username} />
        <AvatarFallback className="bg-gradient-to-br from-violet-500 to-indigo-500 text-white font-medium">
          {user.username.slice(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate group-hover:text-primary transition-colors">
          {user.username}
        </p>
        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
      </div>
      <Badge
        variant="outline"
        className={`${roleColors[user.role] || "bg-slate-100"} text-[10px]`}
      >
        {user.role}
      </Badge>
    </div>
  );
}

// ─── Category Item Component ──────────────────────────────────────────────────

function CategoryItem({ category, loading }: { category?: CategoryResponse; loading?: boolean }) {
  if (loading || !category) {
    return (
      <div className="flex items-center justify-between py-2">
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-8 rounded-lg" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-4 w-12" />
      </div>
    );
  }

  const colors = [
    "from-violet-500 to-purple-500",
    "from-blue-500 to-cyan-500",
    "from-emerald-500 to-teal-500",
    "from-orange-500 to-amber-500",
    "from-pink-500 to-rose-500",
  ];
  const colorIndex = category.id % colors.length;

  return (
    <div className="flex items-center justify-between py-2 group">
      <div className="flex items-center gap-3">
        <div
          className={`h-8 w-8 rounded-lg bg-gradient-to-br ${colors[colorIndex]} flex items-center justify-center text-white text-xs font-bold shadow-sm`}
        >
          {category.name.charAt(0)}
        </div>
        <span className="text-sm font-medium group-hover:text-primary transition-colors">
          {category.name}
        </span>
      </div>
      <Badge variant="secondary" className="font-mono text-xs">
        {category.courseCount}
      </Badge>
    </div>
  );
}

// ─── Main Dashboard Component ─────────────────────────────────────────────────

export default function DashboardPage() {
  const { data: stats, loading: statsLoading, error: statsError, refetch: refetchStats } = useDashboardStats();
  const { data: coursesData, loading: coursesLoading } = useCourses({ page: 0, size: 5 });
  const { data: categoriesData, loading: categoriesLoading } = useCategories({ page: 0, size: 10 });
  const { data: usersData, loading: usersLoading } = useUsers({ page: 0, size: 5 });

  const courses = coursesData?.content || [];
  const categories = categoriesData?.content || [];
  const users = usersData?.content || [];

  const totalCourses = stats?.totalCourses || coursesData?.totalElements || 0;
  const totalUsers = stats?.totalUsers || usersData?.totalElements || 0;
  const totalEnrollments = stats?.totalEnrollments || 0;
  const totalLessons = stats?.totalLessons || 0;

  const isLoading = statsLoading || coursesLoading || categoriesLoading || usersLoading;

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Welcome back! Here&apos;s an overview of your e-learning platform.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetchStats()}
            disabled={statsLoading}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${statsLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {statsError && (
        <Card className="border-red-200 bg-red-50 dark:border-red-900/50 dark:bg-red-900/20">
          <CardContent className="flex items-center gap-3 py-4">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <p className="text-sm text-red-700 dark:text-red-400">
              Failed to load dashboard data. Using cached values or defaults.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetchStats()}
              className="ml-auto"
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Users"
          value={totalUsers.toLocaleString()}
          description="Registered users"
          icon={<Users className="h-5 w-5" style={{ color: "#8b5cf6" }} />}
          trend={{ value: 12.5, isPositive: true }}
          loading={isLoading}
          color="#8b5cf6"
        />
        <StatCard
          title="Total Courses"
          value={totalCourses.toLocaleString()}
          description="Published courses"
          icon={<BookOpen className="h-5 w-5" style={{ color: "#3b82f6" }} />}
          trend={{ value: 8.2, isPositive: true }}
          loading={isLoading}
          color="#3b82f6"
        />
        <StatCard
          title="Enrollments"
          value={totalEnrollments.toLocaleString()}
          description="Total enrollments"
          icon={<GraduationCap className="h-5 w-5" style={{ color: "#10b981" }} />}
          trend={{ value: 23.1, isPositive: true }}
          loading={isLoading}
          color="#10b981"
        />
        <StatCard
          title="Total Lessons"
          value={totalLessons.toLocaleString()}
          description="Across all courses"
          icon={<Layers className="h-5 w-5" style={{ color: "#f59e0b" }} />}
          trend={{ value: 5.4, isPositive: true }}
          loading={isLoading}
          color="#f59e0b"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Popular Courses */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <div>
              <CardTitle className="text-lg font-semibold">Popular Courses</CardTitle>
              <CardDescription>Top performing courses by enrollment</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/courses" className="gap-1">
                View all
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {coursesLoading
              ? Array.from({ length: 4 }).map((_, i) => <CourseCard key={i} loading />)
              : courses.slice(0, 4).map((course) => (
                  <CourseCard key={course.id} course={course} />
                ))}
            {!coursesLoading && courses.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No courses found</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Categories */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <div>
              <CardTitle className="text-lg font-semibold">Categories</CardTitle>
              <CardDescription>Course distribution</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/categories" className="gap-1">
                Manage
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-1">
            {categoriesLoading
              ? Array.from({ length: 5 }).map((_, i) => <CategoryItem key={i} loading />)
              : categories.slice(0, 6).map((cat) => (
                  <CategoryItem key={cat.id} category={cat} />
                ))}
            {!categoriesLoading && categories.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Layers className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No categories found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Users & Quick Actions */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Users */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <div>
              <CardTitle className="text-lg font-semibold">Recent Users</CardTitle>
              <CardDescription>Latest registered users</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/users" className="gap-1">
                View all
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="divide-y">
            {usersLoading
              ? Array.from({ length: 4 }).map((_, i) => <UserRow key={i} loading />)
              : users.slice(0, 4).map((user) => <UserRow key={user.id} user={user} />)}
            {!usersLoading && users.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No users found</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
            <CardDescription>Common management tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="flex flex-col items-center justify-center h-24 gap-2 hover:bg-violet-50 hover:border-violet-200 hover:text-violet-700 dark:hover:bg-violet-900/20"
                asChild
              >
                <Link href="/dashboard/courses/new">
                  <BookOpen className="h-6 w-6" />
                  <span className="text-sm font-medium">Add Course</span>
                </Link>
              </Button>
              <Button
                variant="outline"
                className="flex flex-col items-center justify-center h-24 gap-2 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 dark:hover:bg-blue-900/20"
                asChild
              >
                <Link href="/dashboard/users">
                  <Users className="h-6 w-6" />
                  <span className="text-sm font-medium">Manage Users</span>
                </Link>
              </Button>
              <Button
                variant="outline"
                className="flex flex-col items-center justify-center h-24 gap-2 hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-700 dark:hover:bg-emerald-900/20"
                asChild
              >
                <Link href="/dashboard/analytics">
                  <BarChart3 className="h-6 w-6" />
                  <span className="text-sm font-medium">Analytics</span>
                </Link>
              </Button>
              <Button
                variant="outline"
                className="flex flex-col items-center justify-center h-24 gap-2 hover:bg-amber-50 hover:border-amber-200 hover:text-amber-700 dark:hover:bg-amber-900/20"
                asChild
              >
                <Link href="/dashboard/settings">
                  <Activity className="h-6 w-6" />
                  <span className="text-sm font-medium">Settings</span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activity Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
          <CardDescription>Latest platform activities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { icon: Users, text: "New user registered", time: "2 minutes ago", color: "bg-violet-500" },
              { icon: BookOpen, text: "New course published", time: "15 minutes ago", color: "bg-blue-500" },
              { icon: GraduationCap, text: "Student completed a course", time: "1 hour ago", color: "bg-emerald-500" },
              { icon: Eye, text: "Course view milestone reached", time: "2 hours ago", color: "bg-amber-500" },
            ].map((activity, i) => (
              <div key={i} className="flex items-center gap-4 p-3 rounded-lg border bg-card/50 hover:bg-muted/30 transition-colors">
                <div className={`w-2 h-2 rounded-full ${activity.color}`} />
                <activity.icon className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm font-medium">{activity.text}</p>
                </div>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {activity.time}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
