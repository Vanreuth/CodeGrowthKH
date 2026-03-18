"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  Loader2,
  User,
  TrendingUp,
  Settings,
  BarChart2,
  CalendarDays,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

import { useAuth } from "@/hooks/useAuth";
import { useMyProgress, useCompletedCount } from "@/hooks/useLessonProgress";

import {
  ProfileHero,
  ProfileForm,
  profileFormSchema,
  LearningProgressCard,
  AchievementGrid,
  ActivityTab,
  SettingsTab,
  UserPerformanceCard,
} from "@/components/account";
import { buildCourseProgressSummaries } from "@/components/account/progress-utils";
import type { ProfileFormValues } from "@/components/account";
import type { AuthResponse } from "@/types/authType";
import type { LessonProgressResponse } from "@/types/lessonProgressType";

// ─────────────────────────────────────────────────────────────
//  deriveStats — memoised, never recomputes on unrelated renders
// ─────────────────────────────────────────────────────────────

function deriveStats(list: LessonProgressResponse[] | null) {
  const data = list ?? [];

  const lessonsCompleted    = data.filter((p) => p.completed).length;
  const totalLessonsTracked = data.length;
  const lessonsProgressPct  =
    totalLessonsTracked > 0
      ? Math.round((lessonsCompleted / totalLessonsTracked) * 100)
      : 0;

  // Sum all reading time tracked via POST /upsert (readTimeSeconds field)
  const totalReadSeconds = data.reduce((sum, p) => sum + (p.readTimeSeconds ?? 0), 0);

  // Sort newest first, then group by course title
  const progressByCourse = [...data]
    .sort(
      (a, b) =>
        new Date(b.completedAt ?? b.updatedAt ?? 0).getTime() -
        new Date(a.completedAt ?? a.updatedAt ?? 0).getTime(),
    )
    .reduce<Record<string, LessonProgressResponse[]>>((acc, p) => {
      const key = p.courseTitle ?? `Course ${p.courseId ?? p.lessonId}`;
      if (!acc[key]) acc[key] = [];
      acc[key].push(p);
      return acc;
    }, {});

  const courseSummaries = buildCourseProgressSummaries(progressByCourse);
  const completedCourses = courseSummaries.filter(
    (course) => course.totalLessons > 0 && course.completedLessons >= course.totalLessons,
  ).length;

  return {
    lessonsCompleted,
    totalLessonsTracked,
    lessonsProgressPct,
    completedCourses,
    totalReadSeconds,
    progressByCourse,
  };
}

type AccountTab = "profile" | "activity" | "settings" | "performance";

function buildProfileDefaults(user: AuthResponse | null): ProfileFormValues {
  return {
    username: user?.username || "",
    phoneNumber: user?.phoneNumber || "",
    address: user?.address || "",
    bio: user?.bio || "",
  };
}

function getPrimaryRoleLabel(user: AuthResponse): string {
  const rawRole = user.roles?.[0] ?? user.role ?? "ROLE_USER";
  return rawRole.replace(/^ROLE_/, "").replace(/_/g, " ");
}

function getAccountStatus(user: AuthResponse): string {
  return (user.status ?? "ACTIVE").toUpperCase();
}

function formatJoinedDate(createdAt?: string): string {
  if (!createdAt) return "មិនមានទិន្នន័យ";

  return new Date(createdAt).toLocaleDateString("km-KH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// ─────────────────────────────────────────────────────────────
//  Page
// ─────────────────────────────────────────────────────────────

export default function AccountPage() {
  const router = useRouter();
  const { user, initialized, updateProfile, logout } = useAuth();

  // GET /me — full list; React Query cache invalidation keeps it fresh
  // after any POST /complete or DELETE from child components
  const { data: progressData, loading: progressLoading } = useMyProgress();

  // GET /me/completed-count — authoritative count; always stays in sync
  // because useLessonProgressActions invalidates progressKeys.count on
  // every complete/delete mutation
  const { data: completedCount } = useCompletedCount();

  // Memoised — only recomputes when the /me response data changes
  const stats = useMemo(() => deriveStats(progressData), [progressData]);

  // The canonical completed number: prefer server count, fall back to derived
  const trueCompleted = completedCount ?? stats.lessonsCompleted;

  // ── Local state ────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<AccountTab>("profile");
  const [isLoading,      setIsLoading]      = useState(false);
  const [isEditing,      setIsEditing]      = useState(false);
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [previewUrl,     setPreviewUrl]     = useState<string | null>(null);

  // ── Form ──────────────────────────────────────────────────
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: buildProfileDefaults(user),
  });
  const hasPendingChanges = form.formState.isDirty || !!profilePicture;

  // ── Auth guards ───────────────────────────────────────────
  useEffect(() => {
    if (!initialized) return;
    if (!user) { router.replace("/login?returnUrl=/account"); return; }
    const isAdmin =
      user.roles?.includes("ADMIN") ||
      user.roles?.includes("ROLE_ADMIN") ||
      user.role === "ROLE_ADMIN";
    if (isAdmin) router.replace("/dashboard");
  }, [initialized, user, router]);

  useEffect(() => {
    if (!user) return;
    form.reset(buildProfileDefaults(user));
  }, [user, form]);

  // Revoke object URL on unmount to avoid memory leaks
  useEffect(
    () => () => { if (previewUrl) URL.revokeObjectURL(previewUrl); },
    [previewUrl],
  );

  const clearPreview = () => {
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
  };

  // ── Handlers ──────────────────────────────────────────────
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024)       { toast.error("រូបភាពត្រូវតែតូចជាង 5MB");   return; }
    if (!file.type.startsWith("image/"))   { toast.error("សូមជ្រើសរើសឯកសាររូបភាព"); return; }
    setProfilePicture(file);
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
  };

  const startEditing = () => {
    setActiveTab("profile");
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setProfilePicture(null);
    clearPreview();
    form.reset(buildProfileDefaults(user));
  };

  const onSubmit = async (data: ProfileFormValues) => {
    try {
      setIsLoading(true);
      await updateProfile(
        {
          username:    data.username,
          phoneNumber: data.phoneNumber || undefined,
          address:     data.address     || undefined,
          bio:         data.bio         || undefined,
        },
        profilePicture || undefined,
      );
      toast.success("ព័ត៌មានគណនីបានធ្វើបច្ចុប្បន្នភាពដោយជោគជ័យ");
      setIsEditing(false);
      setProfilePicture(null);
      clearPreview();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "បរាជ័យក្នុងការធ្វើបច្ចុប្បន្នភាពព័ត៌មាន",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try { await logout(); toast.success("បានចេញពីគណនីដោយជោគជ័យ"); }
    catch { /* swallow */ }
    finally { router.push("/"); }
  };

  // ── Guards ────────────────────────────────────────────────
  if (!initialized) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-violet-600" />
          <p className="text-sm text-muted-foreground">កំពុងផ្ទុកព័ត៌មានគណនី...</p>
        </div>
      </div>
    );
  }
  if (!user) return null;

  const accountStatus = getAccountStatus(user);
  const primaryRole = getPrimaryRoleLabel(user);
  const isAccountActive = accountStatus === "ACTIVE";

  // ── Render ─────────────────────────────────────────────────
  return (
    <div className="space-y-8 py-8 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">

      {/* ── Hero ──────────────────────────────────────────────
          lessonsCompleted  → useCompletedCount (authoritative server count)
          totalReadSeconds  → summed from /me response (readTimeSeconds field)
      ──────────────────────────────────────────────────────── */}
      <ProfileHero
        user={user}
        isEditing={isEditing}
        previewUrl={previewUrl}
        profilePicture={profilePicture}
        progressLoading={progressLoading}
        totalLessonsTracked={stats.totalLessonsTracked}
        lessonsCompleted={trueCompleted}
        completedCourses={stats.completedCourses}
        totalReadSeconds={stats.totalReadSeconds}
        onEditToggle={startEditing}
        onCancelEdit={cancelEdit}
        onImageChange={handleImageChange}
      />

      <section className="grid gap-4 md:grid-cols-3">
        <article className="rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/60">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100 dark:bg-emerald-900/30">
              <ShieldCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="min-w-0">
              <p className="text-sm text-muted-foreground">ស្ថានភាពគណនី</p>
              <div className="mt-2 flex items-center gap-2">
                <Badge
                  variant="secondary"
                  className={isAccountActive
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                    : "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300"}
                >
                  {accountStatus}
                </Badge>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {primaryRole}
                </span>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">
                {isAccountActive
                  ? "គណនីរបស់អ្នកអាចប្រើប្រាស់បានធម្មតា។"
                  : "សូមទាក់ទងក្រុមគាំទ្រ ប្រសិនបើអ្នកមិនអាចចូលប្រើមុខងារមួយចំនួន។"}
              </p>
            </div>
          </div>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/60">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-100 dark:bg-blue-900/30">
              <CalendarDays className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="min-w-0">
              <p className="text-sm text-muted-foreground">បានចូលរួម</p>
              <p className="mt-2 text-base font-semibold text-slate-900 dark:text-white">
                {formatJoinedDate(user.createdAt)}
              </p>
              <p className="mt-3 text-sm text-muted-foreground">
                ព័ត៌មានផ្ទាល់ខ្លួន និងវឌ្ឍនភាពសិក្សារបស់អ្នកត្រូវបានរក្សាទុកនៅទីនេះ។
              </p>
            </div>
          </div>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/60">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-100 dark:bg-violet-900/30">
              <Sparkles className="h-5 w-5 text-violet-600 dark:text-violet-400" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm text-muted-foreground">សង្ខេបការសិក្សា</p>
              <div className="mt-2 flex items-end justify-between gap-3">
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {stats.lessonsProgressPct}%
                </p>
                <span className="text-sm text-muted-foreground">
                  {stats.completedCourses} វគ្គបានចប់
                </span>
              </div>
              <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-violet-500 to-blue-500 transition-all duration-700"
                  style={{ width: `${stats.lessonsProgressPct}%` }}
                />
              </div>
            </div>
          </div>
        </article>
      </section>

      {/* ── Tabs ───────────────────────────────────────────── */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as AccountTab)} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 gap-2 md:grid-cols-4 lg:w-[640px]">
          <TabsTrigger value="profile" className="gap-2">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">ព័ត៌មាន</span>
          </TabsTrigger>
          <TabsTrigger value="performance" className="gap-2">
            <BarChart2 className="h-4 w-4" />
            <span className="hidden sm:inline">វឌ្ឍនភាព</span>
          </TabsTrigger>
          <TabsTrigger value="activity" className="gap-2">
            <TrendingUp className="h-4 w-4" />
            <span className="hidden sm:inline">សកម្មភាព</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="gap-2">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">ការកំណត់</span>
          </TabsTrigger>
        </TabsList>

        {/* ── Profile Tab ──────────────────────────────────── */}
        <TabsContent value="profile" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            <ProfileForm
              form={form}
              isEditing={isEditing}
              isLoading={isLoading}
              hasPendingChanges={hasPendingChanges}
              userEmail={user.email}
              onSubmit={onSubmit}
            />
            <div className="space-y-6">
              {isEditing && (
                <div className="rounded-2xl border border-violet-200 bg-violet-50/80 p-4 text-sm text-violet-900 dark:border-violet-900/60 dark:bg-violet-950/30 dark:text-violet-100">
                  កំពុងកែប្រែព័ត៌មានគណនី។ {hasPendingChanges
                    ? "អ្នកមានការផ្លាស់ប្ដូរមិនទាន់រក្សាទុក។"
                    : "បន្ថែមព័ត៌មាន ឬជ្រើសរើសរូបភាពថ្មី ដើម្បីរក្សាទុក។"}
                </div>
              )}
              <LearningProgressCard
                lessonsCompleted={trueCompleted}
                totalLessonsTracked={stats.totalLessonsTracked}
                lessonsProgressPct={stats.lessonsProgressPct}
                totalReadSeconds={stats.totalReadSeconds}
              />
              <AchievementGrid lessonsCompleted={trueCompleted} />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <UserPerformanceCard
            user={user}
            progressData={progressData}
            loading={progressLoading}
          />
        </TabsContent>

        {/* ── Activity Tab ─────────────────────────────────────
            No onProgressChange prop needed — useLessonProgressActions
            inside LessonRow calls invalidateQueries directly, which
            causes useMyProgress and useCompletedCount to refetch
            automatically via React Query.
        ──────────────────────────────────────────────────────── */}
        <TabsContent value="activity" className="space-y-6">
          <ActivityTab
            progressLoading={progressLoading}
            totalLessonsTracked={stats.totalLessonsTracked}
            lessonsCompleted={trueCompleted}
            completedCourses={stats.completedCourses}
            lessonsProgressPct={stats.lessonsProgressPct}
            totalReadSeconds={stats.totalReadSeconds}
            progressByCourse={stats.progressByCourse}
          />
        </TabsContent>

        {/* ── Settings Tab ─────────────────────────────────── */}
        <TabsContent value="settings" className="space-y-6">
          <SettingsTab onLogout={handleLogout} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
