"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Loader2, User, TrendingUp, Settings } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
} from "@/components/account";
import type { ProfileFormValues } from "@/components/account";
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

  const distinctCourses =
    new Set(data.map((p) => p.courseId).filter(Boolean)).size;

  // Sum all reading time tracked via POST /upsert (readTimeSeconds field)
  const totalReadSeconds = data.reduce(
    (sum, p) => sum + (p.readTimeSeconds ?? p.readingTimeSeconds ?? 0),
    0,
  );

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

  return {
    lessonsCompleted,
    totalLessonsTracked,
    lessonsProgressPct,
    distinctCourses,
    totalReadSeconds,
    progressByCourse,
  };
}

// ─────────────────────────────────────────────────────────────
//  Page
// ─────────────────────────────────────────────────────────────

export default function AccountPage() {
  const router = useRouter();
  const { user, initialized, updateProfile, logout } = useAuth();
  const { data: progressData, loading: progressLoading } = useMyProgress();
  const { data: completedCount } = useCompletedCount();
  const stats = useMemo(() => deriveStats(progressData), [progressData]);

  const trueCompleted = completedCount ?? stats.lessonsCompleted;

  // ── Local state ────────────────────────────────────────────
  const [isLoading,      setIsLoading]      = useState(false);
  const [isEditing,      setIsEditing]      = useState(false);
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [previewUrl,     setPreviewUrl]     = useState<string | null>(null);

  // ── Form ──────────────────────────────────────────────────
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: { username: "", phoneNumber: "", address: "", bio: "" },
  });

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
    form.reset({
      username:    user.username    || "",
      phoneNumber: user.phoneNumber || "",
      address:     user.address     || "",
      bio:         user.bio         || "",
    });
  }, [user, form]);

  // Revoke object URL on unmount to avoid memory leaks
  useEffect(
    () => () => { if (previewUrl) URL.revokeObjectURL(previewUrl); },
    [previewUrl],
  );

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

  const cancelEdit = () => {
    setIsEditing(false);
    setProfilePicture(null);
    setPreviewUrl((prev) => { if (prev) URL.revokeObjectURL(prev); return null; });
    form.reset({
      username:    user?.username    || "",
      phoneNumber: user?.phoneNumber || "",
      address:     user?.address     || "",
      bio:         user?.bio         || "",
    });
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
      setPreviewUrl((prev) => { if (prev) URL.revokeObjectURL(prev); return null; });
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

  // ── Render ─────────────────────────────────────────────────
  return (
    <div className="space-y-8 py-8 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
      <ProfileHero
        user={user}
        isEditing={isEditing}
        previewUrl={previewUrl}
        profilePicture={profilePicture}
        progressLoading={progressLoading}
        totalLessonsTracked={stats.totalLessonsTracked}
        lessonsCompleted={trueCompleted}
        totalReadSeconds={stats.totalReadSeconds}
        onEditToggle={() => setIsEditing(true)}
        onCancelEdit={cancelEdit}
        onImageChange={handleImageChange}
      />

      {/* ── Tabs ───────────────────────────────────────────── */}
      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
          <TabsTrigger value="profile" className="gap-2">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">ព័ត៌មាន</span>
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
              userEmail={user.email}
              onSubmit={onSubmit}
            />
            <div className="space-y-6">
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
        <TabsContent value="activity" className="space-y-6">
          <ActivityTab
            progressLoading={progressLoading}
            totalLessonsTracked={stats.totalLessonsTracked}
            lessonsCompleted={trueCompleted}
            distinctCourses={stats.distinctCourses}
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