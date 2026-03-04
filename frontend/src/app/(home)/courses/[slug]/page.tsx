"use client";

import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { fetchLessonBySlug } from "@/lib/lesson/lesson";
import { markLessonComplete, getUserProgress } from "@/lib/lessonProgress/lessonProgress";
import { toast } from "sonner";
import {
  ArrowLeft,
  BookOpen,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Users,
  Loader2,
  FileText,
  Menu,
  X,
  CheckCircle2,
  LogIn,
  Code2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useCourseWithChaptersBySlug, useChaptersByCourse, useLessonsByCourse } from "@/hooks/use-api";
import type { ChapterDto, LessonDto } from "@/lib/types";
import { CodeSnippetTabs } from "@/components/course/CodeBlock";

// ─── Visual helper ────────────────────────────────────────────────────────────

function getCourseVisual(title: string): { gradient: string; icon: string } {
  const t = title.toLowerCase();
  if (t.includes("html"))                     return { gradient: "from-orange-500 via-red-400 to-pink-500",    icon: "🌐" };
  if (t.includes("css"))                      return { gradient: "from-blue-500 via-cyan-400 to-teal-400",     icon: "🎨" };
  if (t.includes("javascript") || t.includes("js")) return { gradient: "from-yellow-400 via-amber-400 to-orange-400", icon: "⚡" };
  if (t.includes("next"))                     return { gradient: "from-slate-700 via-slate-600 to-slate-500",  icon: "▲"  };
  if (t.includes("react"))                    return { gradient: "from-sky-500 via-blue-400 to-indigo-500",    icon: "⚛️" };
  if (t.includes("spring") || t.includes("java")) return { gradient: "from-green-500 via-emerald-400 to-teal-500", icon: "🍃" };
  if (t.includes("docker") || t.includes("devops")) return { gradient: "from-blue-600 via-blue-500 to-cyan-500",  icon: "🐳" };
  if (t.includes("python"))                   return { gradient: "from-yellow-500 via-blue-500 to-blue-600",   icon: "🐍" };
  return { gradient: "from-violet-500 via-purple-400 to-indigo-500", icon: "📚" };
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function CourseDetailSkeleton() {
  return (
    <div className="flex h-screen">
      <div className="w-80 border-r p-4 space-y-4">
        <Skeleton className="h-8 w-3/4" />
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full rounded-lg" />
        ))}
      </div>
      <div className="flex-1 p-8 space-y-6">
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    </div>
  );
}

// ─── Slug helpers ─────────────────────────────────────────────────────────────

function normalizeLessonSlug(value?: string | null) {
  if (!value) return "";
  return decodeURIComponent(value).replace(/\.asp$/i, "").trim().toLowerCase();
}

function lessonPathSegment(value?: string | null): string {
  const slug = normalizeLessonSlug(value);
  return slug ? encodeURIComponent(slug) : "";
}
function lessonCacheKey(courseSlug: string, lessonSlug?: string | null) {
  const courseKey = normalizeLessonSlug(courseSlug) || courseSlug.trim().toLowerCase();
  const lessonKey = normalizeLessonSlug(lessonSlug);
  return lessonKey ? `${courseKey}:${lessonKey}` : "";
}

function hasLessonPayload(lesson?: LessonDto | null) {
  if (!lesson) return false;
  if (!Array.isArray(lesson.codeSnippets)) return false;
  return typeof lesson.content === "string" && lesson.content.trim().length > 0 || lesson.codeSnippets.length > 0;
}

function findLessonIndex(lessons: LessonDto[], lesson: LessonDto | null): number {
  if (!lesson || lessons.length === 0) return -1;
  const id = Number(lesson.id);
  if (Number.isFinite(id)) {
    const byId = lessons.findIndex((l) => Number(l.id) === id);
    if (byId !== -1) return byId;
  }
  const n = normalizeLessonSlug(lesson.slug || lesson.title);
  if (!n) return -1;
  return lessons.findIndex((l) => normalizeLessonSlug(l.slug || l.title) === n);
}

const completedCache = new Map<string, number[]>();

function cacheKey(userId: number | string, slug: string) {
  return `completed-lessons:${userId}:${slug}`;
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface Props { courseSlug: string; initialLessonSlug?: string }
interface OpenLessonOptions {
  syncUrl?: boolean;
  history?: "push" | "replace";
}

export function CourseLearningContent({ courseSlug, initialLessonSlug }: Props) {
  const router = useRouter();
  const slug = courseSlug;
  const searchParams = useSearchParams();

  const { user } = useAuth();
  const isAuthenticated = Boolean(user);

  const completedCacheKey = useMemo(
    () => (isAuthenticated && user?.id ? cacheKey(user.id, slug) : null),
    [isAuthenticated, user?.id, slug]
  );

  const { data: course, loading: courseLoading } = useCourseWithChaptersBySlug(slug);
  const shouldFetchFallbackChapters = Boolean(course?.id) && !(course?.chapters?.length);
  const shouldFetchFallbackLessons = Boolean(course?.id) && (
    !(course?.chapters?.length) ||
    (course?.chapters?.some((chapter) => !chapter.lessons?.length) ?? false)
  );
  const { data: fallbackLessons, loading: lessonsByCourseLoading } = useLessonsByCourse(
    shouldFetchFallbackLessons ? (course?.id ?? null) : null
  );
  const { data: fallbackChapters, loading: chaptersByCourseLoading } = useChaptersByCourse(
    shouldFetchFallbackChapters ? (course?.id ?? null) : null
  );

  const [sidebarOpen, setSidebarOpen]           = useState(true);
  const [expandedChapters, setExpandedChapters] = useState<number[]>([]);
  const [selectedLesson, setSelectedLesson]     = useState<LessonDto | null>(null);
  const [loadingLesson, setLoadingLesson]       = useState(false);
  const [completedLessons, setCompletedLessons] = useState<Set<number>>(new Set());
  const [markingComplete, setMarkingComplete]   = useState(false);

  const requestRef     = useRef(0);
  const detailCache    = useRef(new Map<string, LessonDto>());
  const detailInFlight = useRef(new Map<string, Promise<LessonDto>>());
  const normalizedInit = useMemo(
    () => normalizeLessonSlug(searchParams?.get("lesson") || initialLessonSlug),
    [initialLessonSlug, searchParams]
  );

  // ── Persist completion cache ──────────────────────────────────────────────
  const persistCache = useCallback((lessons: Set<number>) => {
    if (!completedCacheKey) return;
    const arr = [...lessons];
    completedCache.set(completedCacheKey, arr);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(completedCacheKey, JSON.stringify(arr));
    }
  }, [completedCacheKey]);

  const markLocal = useCallback((id: number) => {
    setCompletedLessons((prev) => {
      const next = new Set(prev);
      next.add(id);
      persistCache(next);
      return next;
    });
  }, [persistCache]);

  // ── Build chapters ────────────────────────────────────────────────────────
  const chapters = useMemo<ChapterDto[]>(() => {
    const src = course?.chapters?.length ? course.chapters : fallbackChapters;
    const lessons = [...(fallbackLessons ?? [])].sort((a, b) => a.orderIndex - b.orderIndex);
    const byChapter = new Map<number, LessonDto[]>();
    for (const l of lessons) {
      if (!byChapter.has(l.chapterId)) byChapter.set(l.chapterId, []);
      byChapter.get(l.chapterId)!.push(l);
    }
    if (src?.length) {
      return src.map((ch) => {
        const attached = ch.lessons?.length
          ? [...ch.lessons].sort((a, b) => a.orderIndex - b.orderIndex)
          : (byChapter.get(ch.id) ?? []);
        return { ...ch, lessons: attached, lessonCount: attached.length };
      }).sort((a, b) => a.orderIndex - b.orderIndex);
    }
    if (!course || !fallbackLessons?.length) return [];
    return [{
      id: -1, title: "មេរៀនទាំងអស់", description: "", orderIndex: 0,
      createdAt: new Date().toISOString(), courseId: course.id,
      courseTitle: course.title, lessonCount: lessons.length, lessons,
    }];
  }, [course, fallbackChapters, fallbackLessons]);

  const isLoadingContent = Boolean(course) && !course?.chapters?.length &&
    (chaptersByCourseLoading || lessonsByCourseLoading);

  const allLessons = useMemo(() => chapters.flatMap((c) => c.lessons || []), [chapters]);

  useEffect(() => {
    requestRef.current += 1;
    detailCache.current.clear();
    detailInFlight.current.clear();
    setExpandedChapters([]);
    setSelectedLesson(null);
    setLoadingLesson(false);
  }, [slug]);

  const loadLessonDetail = useCallback(async (lesson: LessonDto) => {
    if (!lesson.slug) return lesson;

    const key = lessonCacheKey(slug, lesson.slug);
    if (!key) return lesson;

    const cached = detailCache.current.get(key);
    if (cached) return cached;

    if (hasLessonPayload(lesson)) {
      detailCache.current.set(key, lesson);
      return lesson;
    }

    const inFlight = detailInFlight.current.get(key);
    if (inFlight) {
      return inFlight;
    }

    const request = fetchLessonBySlug(slug, lesson.slug)
      .then((full) => {
        detailCache.current.set(key, full);
        return full;
      })
      .finally(() => {
        detailInFlight.current.delete(key);
      });

    detailInFlight.current.set(key, request);
    return request;
  }, [slug]);

  // ── Lesson selection ──────────────────────────────────────────────────────
  const selectLesson = useCallback(async (lesson: LessonDto) => {
    setSelectedLesson(lesson);
    if (!lesson.slug) return;

    const key = lessonCacheKey(slug, lesson.slug);
    if (!key) return;

    const cached = detailCache.current.get(key);
    if (cached) { setSelectedLesson(cached); setLoadingLesson(false); return; }
    if (hasLessonPayload(lesson)) {
      detailCache.current.set(key, lesson); setLoadingLesson(false); return;
    }

    const reqId = ++requestRef.current;
    setLoadingLesson(true);
    try {
      const full = await loadLessonDetail(lesson);
      if (requestRef.current === reqId) setSelectedLesson(full);
    } catch (err) {
      console.error("Failed to load lesson:", err);
    } finally {
      if (requestRef.current === reqId) setLoadingLesson(false);
    }
  }, [loadLessonDetail, slug]);

  const openLesson = useCallback(async (
    lesson: LessonDto,
    options: OpenLessonOptions = {}
  ) => {
    const { syncUrl = true, history = "push" } = options;
    if (syncUrl && lesson.slug && typeof window !== "undefined") {
      const lessonPath = lessonPathSegment(lesson.slug);
      const href = `/courses/${slug}/${lessonPath}`;
      const currentPath = window.location.pathname;
      if (currentPath !== `/courses/${slug}/${lessonPath}`) {
        if (history === "replace") {
          router.replace(href, { scroll: false });
        } else {
          router.push(href, { scroll: false });
        }
      }
    }
    await selectLesson(lesson);
  }, [router, selectLesson, slug]);

  // ── Auto-select lesson ────────────────────────────────────────────────────
  const lessonFromUrl = useMemo(() => {
    if (!normalizedInit) return undefined;
    return allLessons.find((l) => normalizeLessonSlug(l.slug) === normalizedInit)
      ?? allLessons.find((l) => normalizeLessonSlug(l.title) === normalizedInit);
  }, [allLessons, normalizedInit]);

  useEffect(() => {
    if (!chapters.length || !allLessons.length || selectedLesson) return;

    const target = lessonFromUrl ?? allLessons[0];
    const shouldSyncUrl = Boolean(lessonFromUrl);
    void openLesson(target, {
      syncUrl: shouldSyncUrl,
      history: "replace",
    });

    if (!expandedChapters.length) {
      const chId = target.chapterId ?? target.courseId;
      setExpandedChapters(chapters.some((c) => c.id === chId) ? [chId] : [chapters[0].id]);
    }
  }, [allLessons, chapters, selectedLesson, openLesson, lessonFromUrl, expandedChapters.length]);

  useEffect(() => {
    if (!lessonFromUrl || !selectedLesson) return;

    const selectedSlug = normalizeLessonSlug(selectedLesson.slug || selectedLesson.title);
    const urlSlug = normalizeLessonSlug(lessonFromUrl.slug || lessonFromUrl.title);
    if (!selectedSlug || selectedSlug === urlSlug) return;

    void openLesson(lessonFromUrl, { syncUrl: false });
  }, [lessonFromUrl, openLesson, selectedLesson]);

  // ── Navigation ────────────────────────────────────────────────────────────
  const currentIdx  = useMemo(() => findLessonIndex(allLessons, selectedLesson), [allLessons, selectedLesson]);
  const canGoPrev   = currentIdx > 0;
  const canGoNext   = currentIdx !== -1 && currentIdx < allLessons.length - 1;
  const goPrev      = () => canGoPrev && void openLesson(allLessons[currentIdx - 1]);
  const goNext      = () => canGoNext && void openLesson(allLessons[currentIdx + 1]);

  // Prefetch neighbors so next/prev feels instant.
  useEffect(() => {
    if (currentIdx < 0) return;
    const prev = allLessons[currentIdx - 1];
    const next = allLessons[currentIdx + 1];

    if (prev && prev.slug) {
      const prevKey = lessonCacheKey(slug, prev.slug);
      if (prevKey && !detailCache.current.has(prevKey) && !hasLessonPayload(prev)) {
        void loadLessonDetail(prev);
      }
    }

    if (next && next.slug) {
      const nextKey = lessonCacheKey(slug, next.slug);
      if (nextKey && !detailCache.current.has(nextKey) && !hasLessonPayload(next)) {
        void loadLessonDetail(next);
      }
    }
  }, [allLessons, currentIdx, loadLessonDetail, slug]);

  // ── Progress hydration ────────────────────────────────────────────────────
  useEffect(() => {
    if (!completedCacheKey) return;
    const mem = completedCache.get(completedCacheKey);
    if (mem) { setCompletedLessons(new Set(mem)); return; }
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(completedCacheKey);
      if (raw) {
        const ids = (JSON.parse(raw) as unknown[]).filter((v): v is number => typeof v === "number");
        completedCache.set(completedCacheKey, ids);
        setCompletedLessons(new Set(ids));
      }
    } catch { /* ignore */ }
  }, [completedCacheKey]);

  useEffect(() => {
    if (!isAuthenticated) { setCompletedLessons(new Set()); return; }
    getUserProgress()
      .then((progress) => {
        const ids = progress.filter((p) => p.completed).map((p) => p.lessonId).filter((id): id is number => typeof id === "number");
        const s = new Set(ids);
        setCompletedLessons(s);
        persistCache(s);
      })
      .catch(() => { /* session auth not available */ });
  }, [isAuthenticated, persistCache]);

  // ── Mark complete ─────────────────────────────────────────────────────────
  const handleMarkComplete = async () => {
    if (!selectedLesson) return;
    if (!isAuthenticated) {
      toast.info("សូមចូលប្រើប្រាស់ដើម្បីរក្សាទុកវឌ្ឍនភាព", { duration: 2000 });
      setTimeout(() => router.push(`/login?returnUrl=${encodeURIComponent(window.location.pathname)}`), 1500);
      return;
    }
    setMarkingComplete(true);
    try {
      await markLessonComplete(selectedLesson.id);
      markLocal(selectedLesson.id);
      toast.success("បានបញ្ចប់មេរៀន!", { description: selectedLesson.title });
      if (canGoNext) setTimeout(goNext, 500);
    } catch {
      markLocal(selectedLesson.id);
      toast.success("បានបញ្ចប់មេរៀន!", { description: `${selectedLesson.title} (ក្នុង device)` });
      if (canGoNext) setTimeout(goNext, 500);
    } finally {
      setMarkingComplete(false);
    }
  };

  // ── Progress stats ────────────────────────────────────────────────────────
  const completedCount = useMemo(
    () => allLessons.filter((l) => completedLessons.has(l.id)).length,
    [allLessons, completedLessons]
  );
  const progressPct = allLessons.length > 0 ? Math.round((completedCount / allLessons.length) * 100) : 0;

  // ─────────────────────────────────────────────────────────────────────────
  if (courseLoading) return <CourseDetailSkeleton />;

  if (!course) return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="h-20 w-20 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
        <BookOpen className="h-10 w-10 text-slate-400" />
      </div>
      <h2 className="text-xl font-bold text-slate-900 dark:text-white">រកមិនឃើញវគ្គសិក្សា</h2>
      <p className="mt-2 text-slate-600 dark:text-slate-400">វគ្គសិក្សានេះមិនមានក្នុងប្រព័ន្ធទេ</p>
      <Button asChild className="mt-6" variant="outline">
        <Link href="/courses"><ArrowLeft className="mr-2 h-4 w-4" />ត្រឡប់ទៅវគ្គសិក្សា</Link>
      </Button>
    </div>
  );

  const { gradient, icon } = getCourseVisual(course.title);

  return (
    <div className="flex min-h-[calc(100vh-12rem)] -mx-4 -mt-7 -mb-12 sm:-mx-6 lg:-mx-8 bg-slate-50 dark:bg-slate-950">

      {/* Mobile sidebar toggle */}
      <Button
        variant="ghost" size="icon"
        className="fixed top-24 left-4 z-50 lg:hidden bg-white dark:bg-slate-800 shadow-lg rounded-full"
        onClick={() => setSidebarOpen((o) => !o)}
      >
        {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* ── Sidebar ── */}
      <aside className={`${sidebarOpen ? "translate-x-0" : "-translate-x-full"} fixed lg:relative lg:translate-x-0 z-40 w-80 h-[calc(100vh-8rem)] lg:h-auto bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-transform duration-300 rounded-l-2xl lg:rounded-2xl shadow-xl lg:shadow-none`}>

        {/* Course header */}
        <div className={`bg-gradient-to-br ${gradient} p-4 text-white`}>
          <Link href="/courses" className="inline-flex items-center gap-1 text-xs text-white/80 hover:text-white mb-2">
            <ArrowLeft className="h-3 w-3" />វគ្គសិក្សាទាំងអស់
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-3xl">{icon}</span>
            <div>
              <h1 className="font-bold text-lg leading-tight">{course.title}</h1>
              <p className="text-xs text-white/70 mt-1">{chapters.length} ជំពូក · {course.totalLessons || 0} មេរៀន</p>
            </div>
          </div>
        </div>

        {/* Chapter / lesson list */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {isLoadingContent ? (
            <div className="py-8 flex items-center justify-center gap-2 text-sm text-slate-500">
              <Loader2 className="h-4 w-4 animate-spin" />កំពុងផ្ទុក…
            </div>
          ) : chapters.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-400">មិនមានជំពូក</p>
          ) : chapters.map((chapter) => {
            const isExp = expandedChapters.includes(chapter.id);
            const cLessons = chapter.lessons || [];
            return (
              <Collapsible key={chapter.id} open={isExp} onOpenChange={() => setExpandedChapters((p) => isExp ? p.filter((id) => id !== chapter.id) : [...p, chapter.id])}>
                <CollapsibleTrigger className="w-full">
                  <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center text-white text-sm font-bold shrink-0">
                      {chapter.orderIndex}
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-medium text-sm text-slate-900 dark:text-white line-clamp-1">{chapter.title}</p>
                      <p className="text-xs text-slate-500">{cLessons.length} មេរៀន</p>
                    </div>
                    {isExp ? <ChevronDown className="h-4 w-4 text-slate-400" /> : <ChevronRight className="h-4 w-4 text-slate-400" />}
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="ml-5 pl-4 border-l-2 border-violet-200 dark:border-violet-800 space-y-1 py-1">
                    {cLessons.map((lesson) => (
                      <Link
                        key={lesson.id}
                        href={`/courses/${slug}/${lessonPathSegment(lesson.slug)}`}
                        onClick={(e) => {
                          if (
                            e.button !== 0 ||
                            e.metaKey ||
                            e.ctrlKey ||
                            e.shiftKey ||
                            e.altKey
                          ) {
                            return;
                          }

                          e.preventDefault();
                          void openLesson(lesson, { syncUrl: true, history: "push" });
                        }}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition ${
                          selectedLesson?.id === lesson.id
                            ? "bg-violet-100 dark:bg-violet-900/50 text-violet-700 dark:text-violet-300"
                            : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                        }`}
                      >
                        {completedLessons.has(lesson.id)
                          ? <CheckCircle2 className="h-4 w-4 shrink-0 text-green-500" />
                          : <FileText className="h-4 w-4 shrink-0 opacity-50" />}
                        <span className="line-clamp-1">{lesson.title}</span>
                      </Link>
                    ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            );
          })}
        </div>

        {/* Progress footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
          <div className="flex justify-between text-xs text-slate-500 mb-2">
            <span>វឌ្ឍនភាព</span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">{completedCount}/{allLessons.length} · {progressPct}%</span>
          </div>
          <Progress value={progressPct} className="h-2" />
          {!isAuthenticated && (
            <p className="mt-2 text-xs text-slate-400 flex items-center gap-1">
              <LogIn className="h-3 w-3" />ចូលប្រើដើម្បីរក្សាទុក
            </p>
          )}
        </div>
      </aside>

      {/* ── Main content ── */}
      <main className="flex-1 overflow-y-auto bg-white/50 dark:bg-slate-900/50 lg:rounded-2xl lg:ml-4 lg:shadow-xl">
        {selectedLesson ? (
          <div className="max-w-4xl mx-auto p-6 lg:p-8">

            {/* Lesson header */}
            <div className="mb-8">
              <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500 mb-3">
                <span className="px-2.5 py-0.5 rounded-full bg-violet-100 dark:bg-violet-900/50 text-violet-700 dark:text-violet-300 text-xs font-semibold">
                  {selectedLesson.chapterTitle}
                </span>
                <span className="text-slate-300">·</span>
                <span className="text-xs">មេរៀនទី {selectedLesson.orderIndex}</span>
                {loadingLesson && (
                  <span className="ml-2 inline-flex items-center gap-1.5 text-xs text-slate-400">
                    <Loader2 className="h-3 w-3 animate-spin" />កំពុងផ្ទុក…
                  </span>
                )}
              </div>
              <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white leading-tight">
                {selectedLesson.title}
              </h1>
              {selectedLesson.description && (
                <p className="mt-3 text-slate-600 dark:text-slate-400 leading-relaxed">
                  {selectedLesson.description}
                </p>
              )}
            </div>

            {/* Lesson body */}
            <div className="prose prose-slate dark:prose-invert max-w-none mb-8 prose-headings:font-bold prose-code:before:content-none prose-code:after:content-none prose-code:bg-slate-100 prose-code:dark:bg-slate-800 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm">
              {selectedLesson.content ? (
                <div
                  className="text-slate-700 dark:text-slate-300 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: selectedLesson.content }}
                />
              ) : !loadingLesson ? (
                <p className="text-slate-400 italic">មេរៀននេះមិនមានមាតិកាទេ។</p>
              ) : null}
            </div>

            {/* ── Code Snippets (new tabbed / improved) ── */}
            {selectedLesson.codeSnippets && selectedLesson.codeSnippets.length > 0 && (
              <div className="mb-10">
                <h2 className="flex items-center gap-2 text-base font-bold text-slate-900 dark:text-white mb-1">
                  <Code2 className="h-4.5 w-4.5 text-violet-500" />
                  កូដឧទាហរណ៍
                </h2>
                <p className="text-xs text-slate-400 mb-3">Code examples for this lesson</p>
                <CodeSnippetTabs
                  snippets={selectedLesson.codeSnippets.sort((a, b) => a.orderIndex - b.orderIndex)}
                />
              </div>
            )}

            {/* Mark complete + navigation */}
            <div className="pt-6 border-t border-slate-200 dark:border-slate-800 space-y-5">
              <div className="flex justify-center">
                {completedLessons.has(selectedLesson.id) ? (
                  <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 font-medium">
                    <CheckCircle2 className="h-5 w-5" />
                    បានបញ្ចប់មេរៀននេះ ✓
                  </div>
                ) : (
                  <Button
                    onClick={handleMarkComplete}
                    disabled={markingComplete}
                    size="lg"
                    className="rounded-full gap-2 bg-green-600 hover:bg-green-700 text-white px-8 shadow-lg shadow-green-500/20 transition-all hover:scale-[1.02]"
                  >
                    {markingComplete
                      ? <Loader2 className="h-5 w-5 animate-spin" />
                      : <CheckCircle2 className="h-5 w-5" />}
                    {isAuthenticated ? "សម្គាល់ជាបានបញ្ចប់" : "ចូល & សម្គាល់ជាបានបញ្ចប់"}
                  </Button>
                )}
              </div>

              <div className="flex items-center justify-between">
                <Button variant="outline" onClick={goPrev} disabled={!canGoPrev} className="gap-2 rounded-full">
                  <ChevronLeft className="h-4 w-4" />មុន
                </Button>
                <span className="text-xs text-slate-400 font-mono">
                  {currentIdx >= 0 ? currentIdx + 1 : 0} / {allLessons.length}
                </span>
                <Button onClick={goNext} disabled={!canGoNext} className="gap-2 rounded-full bg-violet-600 hover:bg-violet-700 text-white">
                  បន្ទាប់<ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

        ) : (
          /* Welcome screen */
          <div className="h-full flex items-center justify-center p-8">
            <div className="text-center max-w-md">
              <div className={`w-24 h-24 mx-auto rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center text-5xl mb-6 shadow-lg`}>
                {icon}
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
                សូមស្វាគមន៍មកកាន់ {course.title}
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mb-6">{course.description}</p>
              <div className="flex items-center justify-center gap-4 text-sm text-slate-500 mb-8">
                <span className="flex items-center gap-1"><BookOpen className="h-4 w-4" />{chapters.length} ជំពូក</span>
                <span className="flex items-center gap-1"><FileText className="h-4 w-4" />{course.totalLessons || 0} មេរៀន</span>
                <span className="flex items-center gap-1"><Users className="h-4 w-4" />{(course.enrolledCount || 0).toLocaleString()}</span>
              </div>
              <p className="text-slate-400 text-sm">← ជ្រើសរើសមេរៀនពីម៉ឺនុយខាងឆ្វេង</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function CourseDetailPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  if (!slug) return <CourseDetailSkeleton />;
  return <CourseLearningContent courseSlug={decodeURIComponent(slug)} />;
}
