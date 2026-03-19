"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  BookOpen, Users, Layers, TrendingUp, Star, Eye,
  Plus, ArrowRight, Sparkles, Clock,
  Activity, BarChart3, Mail, Calendar, Shield,
  ArrowUpRight, ArrowDownRight, ChevronRight, FileText,
  GraduationCap,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table, TableBody, TableCell,
  TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { cn } from "@/lib/utils";

/* ── Chart tooltip ──────────────────────────────────────────────── */
function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-border/50 bg-background/95 px-3 py-2.5 shadow-xl backdrop-blur-sm text-xs">
      {label && <p className="mb-1.5 font-semibold text-foreground">{label}</p>}
      {payload.map((p: any, i: number) => (
        <div key={i} className="flex items-center gap-2">
          <span className="size-2 rounded-full shrink-0" style={{ background: p.color }} />
          <span className="capitalize text-muted-foreground">{p.name}</span>
          <span className="ml-1 font-semibold text-foreground">{p.value}</span>
        </div>
      ))}
    </div>
  );
}

/* ── Stat card ──────────────────────────────────────────────────── */
interface StatCardProps {
  title: string;
  value: number | string;
  sub: string;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  trend?: number;
  loading?: boolean;
}

function StatCard({ title, value, sub, icon: Icon, iconBg, iconColor, trend, loading }: StatCardProps) {
  if (loading) return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-start justify-between mb-4">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="size-10 rounded-xl" />
      </div>
      <Skeleton className="h-8 w-16 mb-2" />
      <Skeleton className="h-3 w-32" />
    </div>
  );

  return (
    <div className="group rounded-xl border border-border bg-card p-5 hover:border-border/80 hover:shadow-sm transition-all duration-200">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[12px] font-medium text-muted-foreground truncate">{title}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-foreground tabular-nums">
            {typeof value === "number" ? value.toLocaleString() : value}
          </p>
          <p className="mt-1.5 text-[11px] text-muted-foreground">{sub}</p>
        </div>
        <div className={cn("flex size-10 shrink-0 items-center justify-center rounded-xl", iconBg)}>
          <Icon className={cn("size-5", iconColor)} strokeWidth={1.75} />
        </div>
      </div>
      {trend !== undefined && trend !== 0 && (
        <div className={cn(
          "mt-3 inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-semibold",
          trend > 0
            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
            : "bg-red-500/10 text-red-500"
        )}>
          {trend > 0 ? <ArrowUpRight className="size-2.5" /> : <ArrowDownRight className="size-2.5" />}
          {Math.abs(trend)}% this month
        </div>
      )}
    </div>
  );
}

/* ── Status badge ───────────────────────────────────────────────── */
function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; className: string }> = {
    PUBLISHED: {
      label: "Published",
      className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    },
    DRAFT: {
      label: "Draft",
      className: "bg-muted text-muted-foreground",
    },
    ARCHIVED: {
      label: "Archived",
      className: "bg-red-500/10 text-red-500",
    },
  };
  const c = config[status] ?? config.DRAFT;
  return (
    <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold", c.className)}>
      {c.label}
    </span>
  );
}

/* ── Role badge ─────────────────────────────────────────────────── */
function RoleBadge({ role }: { role: string }) {
  const config: Record<string, { className: string; icon: React.ElementType }> = {
    ADMIN: { className: "bg-violet-500/10 text-violet-600 dark:text-violet-400", icon: Shield },
    USER:  { className: "bg-muted text-muted-foreground",                         icon: Users },
  };
  const c = config[role] ?? config.USER;
  const RoleIcon = c.icon;
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold", c.className)}>
      <RoleIcon className="size-2.5" />
      {role}
    </span>
  );
}

/* ── Course thumbnail ───────────────────────────────────────────── */
const GRADIENTS = [
  "from-violet-500 to-indigo-600",
  "from-blue-500 to-cyan-500",
  "from-emerald-500 to-teal-500",
  "from-orange-500 to-amber-500",
  "from-pink-500 to-rose-500",
  "from-sky-500 to-indigo-500",
];

function CourseThumbnail({ course }: { course: any }) {
  const gradient = GRADIENTS[course.id % GRADIENTS.length];
  if (course.thumbnail) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={course.thumbnail} alt={course.title}
        className="size-9 rounded-lg object-cover shrink-0" />
    );
  }
  return (
    <div className={cn(
      "flex size-9 shrink-0 items-center justify-center rounded-lg",
      "bg-gradient-to-br text-white font-bold text-sm", gradient
    )}>
      {course.title.charAt(0)}
    </div>
  );
}

/* ── Section card ───────────────────────────────────────────────── */
function SectionCard({
  icon: Icon, title, description, action, children,
}: {
  icon: React.ElementType; title: string; description?: string;
  action?: React.ReactNode; children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-border/60">
        <div className="flex items-center gap-2.5">
          <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-foreground/5">
            <Icon className="size-3.5 text-foreground" strokeWidth={2} />
          </div>
          <div>
            <p className="text-[13px] font-semibold text-foreground">{title}</p>
            {description && (
              <p className="text-[11px] text-muted-foreground mt-0.5">{description}</p>
            )}
          </div>
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   Main Dashboard
═══════════════════════════════════════════════════════════════ */
export default function DashboardPage() {
  const stats = useDashboardStats();

  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";
  const emoji = hour < 12 ? "☀️" : hour < 17 ? "👋🏼" : "🌙";
  const dateStr = now.toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric", year: "numeric",
  });

  const publishedPct = stats.totalCourses > 0
    ? Math.round((stats.publishedCourses / stats.totalCourses) * 100) : 0;

  const LEVEL_COLORS = ["#10b981", "#f59e0b", "#ef4444"];
  const PIE_COLORS   = ["#6366f1", "#0ea5e9", "#64748b", "#10b981"];

  const STAT_CARDS: StatCardProps[] = [
    {
      title: "Total Courses",
      value: stats.totalCourses,
      sub: `${stats.publishedCourses} published · ${stats.totalCourses - stats.publishedCourses} drafts`,
      icon: BookOpen, iconBg: "bg-violet-500/10", iconColor: "text-violet-500",
      trend: 12, loading: stats.loading,
    },
    {
      title: "Total Users",
      value: stats.totalUsers,
      sub: `${stats.activeUsers} active accounts`,
      icon: Users, iconBg: "bg-sky-500/10", iconColor: "text-sky-500",
      trend: 5, loading: stats.loading,
    },
    {
      title: "Categories",
      value: stats.totalCategories,
      sub: `${stats.activeCategories} active categories`,
      icon: Layers, iconBg: "bg-amber-500/10", iconColor: "text-amber-500",
      trend: 0, loading: stats.loading,
    },
    {
      title: "Total Enrollments",
      value: stats.totalEnrollments,
      sub: `${stats.featuredCourses} featured courses`,
      icon: TrendingUp, iconBg: "bg-emerald-500/10", iconColor: "text-emerald-500",
      trend: 33, loading: stats.loading,
    },
  ];

  return (
    <div className="space-y-6">

      {/* ── Page header ─────────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {greeting} <span>{emoji}</span>
          </h1>
          <p className="mt-0.5 text-[13px] text-muted-foreground">
            Here&apos;s what&apos;s happening with your e-learning platform today.
          </p>
          <p className="mt-1 text-[11px] text-muted-foreground/50 flex items-center gap-1">
            <Calendar className="size-3" />
            {dateStr}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button variant="outline" size="sm" className="h-8 gap-1.5 text-[12px]" asChild>
            <Link href="/dashboard/analytics">
              <BarChart3 className="size-3.5" />
              Analytics
            </Link>
          </Button>
          <Button size="sm" className="h-8 gap-1.5 text-[12px]" asChild>
            <Link href="/dashboard/courses">
              <Plus className="size-3.5" />
              New Course
            </Link>
          </Button>
        </div>
      </div>

      {/* ── KPI cards ───────────────────────────────────────── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        {STAT_CARDS.map(card => <StatCard key={card.title} {...card} />)}
      </div>

      {/* ── Charts row ──────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Courses by Category — bar (2/3) */}
        <div className="lg:col-span-2 rounded-xl border border-border bg-card p-5">
          <div className="flex items-start justify-between gap-3 mb-5">
            <div className="flex items-center gap-2.5">
              <div className="flex size-7 items-center justify-center rounded-lg bg-foreground/5">
                <Activity className="size-3.5 text-foreground" strokeWidth={2} />
              </div>
              <div>
                <p className="text-[13px] font-semibold text-foreground">Courses by Category</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">Distribution across categories</p>
              </div>
            </div>
            <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
              {stats.coursesByCategory.length} categories
            </span>
          </div>
          {stats.loading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-8 w-full rounded-lg" />)}
            </div>
          ) : stats.coursesByCategory.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={stats.coursesByCategory} margin={{ top: 4, right: 4, bottom: 0, left: -24 }} barSize={36}>
                <defs>
                  <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.06} vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: "currentColor", opacity: 0.04 }} />
                <Bar dataKey="courses" fill="url(#barGrad)" radius={[5, 5, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-52 flex-col items-center justify-center gap-2 text-muted-foreground">
              <div className="flex size-12 items-center justify-center rounded-xl bg-muted/60">
                <BarChart3 className="size-5 opacity-40" />
              </div>
              <p className="text-[13px] font-medium">No category data yet</p>
            </div>
          )}
        </div>

        {/* Course Levels — donut (1/3) */}
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="flex size-7 items-center justify-center rounded-lg bg-foreground/5">
              <GraduationCap className="size-3.5 text-foreground" strokeWidth={2} />
            </div>
            <div>
              <p className="text-[13px] font-semibold text-foreground">Course Levels</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Distribution by difficulty</p>
            </div>
          </div>
          {stats.loading ? (
            <div className="flex justify-center mt-6"><Skeleton className="size-36 rounded-full" /></div>
          ) : stats.coursesByLevel.length > 0 ? (
            <>
              <div className="flex justify-center">
                <PieChart width={160} height={160}>
                  <Pie data={stats.coursesByLevel} cx={75} cy={75}
                    innerRadius={48} outerRadius={72} paddingAngle={3}
                    dataKey="value" strokeWidth={0}>
                    {stats.coursesByLevel.map((_, i) => (
                      <Cell key={i} fill={LEVEL_COLORS[i % LEVEL_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                </PieChart>
              </div>
              <div className="space-y-3 mt-2">
                {stats.coursesByLevel.map((entry, i) => {
                  const pct = stats.totalCourses > 0
                    ? Math.round((entry.value / stats.totalCourses) * 100) : 0;
                  return (
                    <div key={entry.name}>
                      <div className="flex items-center justify-between text-[11px] mb-1">
                        <span className="flex items-center gap-1.5 text-muted-foreground">
                          <span className="size-2 rounded-full shrink-0"
                            style={{ background: LEVEL_COLORS[i % LEVEL_COLORS.length] }} />
                          {entry.name}
                        </span>
                        <span className="font-semibold text-foreground">{entry.value} ({pct}%)</span>
                      </div>
                      <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
                        <div className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${pct}%`, background: LEVEL_COLORS[i % LEVEL_COLORS.length] }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="flex h-52 flex-col items-center justify-center gap-2 text-muted-foreground">
              <GraduationCap className="size-8 opacity-30" />
              <p className="text-[13px] font-medium">No level data</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Publishing Rate + User Roles + Featured ─────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Publishing Rate */}
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="flex size-7 items-center justify-center rounded-lg bg-foreground/5">
              <Eye className="size-3.5 text-foreground" strokeWidth={2} />
            </div>
            <p className="text-[13px] font-semibold text-foreground">Publishing Rate</p>
          </div>
          {stats.loading ? (
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" /><Skeleton className="h-3 w-1/2" />
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between text-[11px] mb-2">
                <span className="text-muted-foreground">Published courses</span>
                <span className="font-bold text-2xl text-foreground tabular-nums">{publishedPct}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-violet-500 transition-all duration-700"
                  style={{ width: `${publishedPct}%` }} />
              </div>
              <div className="grid grid-cols-2 gap-2.5 mt-4">
                <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/30 p-3 text-center">
                  <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                    {stats.publishedCourses}
                  </p>
                  <p className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground mt-0.5">Published</p>
                </div>
                <div className="rounded-xl bg-muted/60 p-3 text-center">
                  <p className="text-xl font-bold text-foreground tabular-nums">
                    {stats.totalCourses - stats.publishedCourses}
                  </p>
                  <p className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground mt-0.5">Drafts</p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* User Roles */}
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="flex size-7 items-center justify-center rounded-lg bg-foreground/5">
              <Users className="size-3.5 text-foreground" strokeWidth={2} />
            </div>
            <p className="text-[13px] font-semibold text-foreground">User Roles</p>
          </div>
          {stats.loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-10 w-full rounded-lg" />)}
            </div>
          ) : stats.usersByRole.length > 0 ? (
            <div className="space-y-4">
              {stats.usersByRole.map((role, i) => {
                const pct = stats.totalUsers > 0
                  ? Math.round((role.value / stats.totalUsers) * 100) : 0;
                return (
                  <div key={role.name}>
                    <div className="flex items-center justify-between text-[11px] mb-1.5">
                      <span className="flex items-center gap-1.5 text-muted-foreground">
                        <span className="size-2 rounded-full shrink-0"
                          style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                        {role.name}
                      </span>
                      <span className="font-semibold text-foreground">{role.value} ({pct}%)</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                      <div className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${pct}%`, background: PIE_COLORS[i % PIE_COLORS.length] }} />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-[11px] text-muted-foreground text-center py-6">No user data</p>
          )}
        </div>

        {/* Featured Courses */}
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="flex size-7 items-center justify-center rounded-lg bg-amber-500/10">
              <Sparkles className="size-3.5 text-amber-500" strokeWidth={2} />
            </div>
            <p className="text-[13px] font-semibold text-foreground">Featured Courses</p>
          </div>
          {stats.loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-10 w-full rounded-lg" />)}
            </div>
          ) : (
            <div className="space-y-2">
              {stats.recentCourses.filter(c => c.featured || c.isFeatured).slice(0, 4).map(course => (
                <div key={course.id}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/40 transition-colors">
                  <CourseThumbnail course={course} />
                  <div className="min-w-0 flex-1">
                    <p className="text-[12px] font-medium text-foreground truncate">{course.title}</p>
                    <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                      <Star className="size-2.5 fill-amber-400 text-amber-400" />
                      {(course.avgRating ?? 0).toFixed(1)}
                      <span className="text-muted-foreground/30 mx-0.5">·</span>
                      {course.enrolledCount ?? 0} enrolled
                    </p>
                  </div>
                </div>
              ))}
              {stats.recentCourses.filter(c => c.featured || c.isFeatured).length === 0 && (
                <p className="text-[11px] text-muted-foreground text-center py-6">No featured courses yet</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Recent Courses + Recent Users ───────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Recent Courses table */}
        <SectionCard
          icon={Clock}
          title="Recent Courses"
          description="Latest content added to the platform"
          action={
            <Button variant="ghost" size="sm" className="h-7 gap-1 text-[11px] text-muted-foreground" asChild>
              <Link href="/dashboard/courses">
                View all <ChevronRight className="size-3" />
              </Link>
            </Button>
          }
        >
          {stats.loading ? (
            <div className="divide-y divide-border/50">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 px-5 py-3">
                  <Skeleton className="size-9 rounded-lg" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-3 w-40" /><Skeleton className="h-2.5 w-24" />
                  </div>
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
              ))}
            </div>
          ) : stats.recentCourses.length > 0 ? (
            <div className="divide-y divide-border/50">
              {stats.recentCourses.slice(0, 5).map((course, i) => (
                <div key={i}
                  className="flex items-center gap-3 px-5 py-3 hover:bg-muted/30 transition-colors group">
                  <CourseThumbnail course={course} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-medium text-foreground truncate">{course.title}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-2">
                      <span className="flex items-center gap-1">
                        <Users className="size-2.5" />{course.enrolledCount ?? 0} enrolled
                      </span>
                      <span className="text-muted-foreground/30">·</span>
                      <span className="flex items-center gap-1">
                        <FileText className="size-2.5" />{course.totalLessons ?? 0} lessons
                      </span>
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <StatusBadge status={course.status ?? "DRAFT"} />
                    <Button variant="ghost" size="icon"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Eye className="size-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex h-40 flex-col items-center justify-center gap-2 text-muted-foreground">
              <BookOpen className="size-8 opacity-30" />
              <p className="text-[13px] font-medium">No courses yet</p>
            </div>
          )}
        </SectionCard>

        {/* Recent Users table */}
        <SectionCard
          icon={Users}
          title="Recent Users"
          description="Latest registrations on the platform"
          action={
            <Button variant="ghost" size="sm" className="h-7 gap-1 text-[11px] text-muted-foreground" asChild>
              <Link href="/dashboard/users">
                View all <ChevronRight className="size-3" />
              </Link>
            </Button>
          }
        >
          {stats.loading ? (
            <div className="divide-y divide-border/50">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 px-5 py-3">
                  <Skeleton className="size-9 rounded-full" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-3 w-32" /><Skeleton className="h-2.5 w-40" />
                  </div>
                  <Skeleton className="h-5 w-14 rounded-full" />
                </div>
              ))}
            </div>
          ) : stats.recentUsers?.length > 0 ? (
            <div className="divide-y divide-border/50">
              {stats.recentUsers.slice(0, 5).map((user: any) => (
                <div key={user.id}
                  className="flex items-center gap-3 px-5 py-3 hover:bg-muted/30 transition-colors">
                  <Avatar className="size-9 shrink-0">
                    <AvatarImage src={user.avatar || user.profilePicture || undefined} alt={user.username} />
                    <AvatarFallback className="rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 text-white text-[11px] font-bold">
                      {user.username.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-medium text-foreground truncate">{user.username}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1 truncate">
                      <Mail className="size-2.5 shrink-0" />{user.email}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <RoleBadge role={user.role} />
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(user.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex h-40 flex-col items-center justify-center gap-2 text-muted-foreground">
              <Users className="size-8 opacity-30" />
              <p className="text-[13px] font-medium">No users yet</p>
            </div>
          )}
        </SectionCard>
      </div>

      {/* ── Quick Actions ────────────────────────────────────── */}
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="mb-4">
          <p className="text-[13px] font-semibold text-foreground">Quick Actions</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">Common tasks and shortcuts</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { href: "/dashboard/courses",    icon: BookOpen,  color: "text-violet-500", bg: "bg-violet-500/10", label: "Manage Courses",    sub: "View & edit all courses" },
            { href: "/dashboard/categories", icon: Layers,    color: "text-emerald-500", bg: "bg-emerald-500/10", label: "Manage Categories", sub: "Organize your content" },
            { href: "/dashboard/users",      icon: Users,     color: "text-sky-500",    bg: "bg-sky-500/10",    label: "Manage Users",     sub: "Accounts & roles" },
            { href: "/dashboard/analytics",  icon: BarChart3, color: "text-amber-500",  bg: "bg-amber-500/10",  label: "View Analytics",   sub: "Insights & reports" },
          ].map(({ href, icon: Icon, color, bg, label, sub }) => (
            <Link key={href} href={href}
              className="group flex items-center gap-3 rounded-xl border border-border/60 bg-background/40 px-4 py-3.5 transition-all duration-150 hover:border-primary/20 hover:bg-accent/50">
              <div className={cn("flex size-9 shrink-0 items-center justify-center rounded-xl", bg,
                "transition-transform duration-150 group-hover:scale-110")}>
                <Icon className={cn("size-5", color)} strokeWidth={1.75} />
              </div>
              <div className="min-w-0">
                <p className="text-[12px] font-semibold text-foreground">{label}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{sub}</p>
              </div>
              <ChevronRight className="ml-auto size-3.5 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors" />
            </Link>
          ))}
        </div>
      </div>

    </div>
  );
}
