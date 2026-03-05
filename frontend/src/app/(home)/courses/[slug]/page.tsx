"use client";

import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { courseService } from "@/services/courseService";
import { lessonProgressService } from "@/services/lessonProgressService";
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
  PlayCircle,
  Clock,
  Trophy,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  useCourseWithChapters,
  useChaptersByCourse,
  useLessonsByCourse,
  courseKeys,
} from "@/hooks/useCourses";
import type { ChapterResponse } from "@/types/chapterType";
import type { LessonResponse } from "@/types/lessonType";
import { CodeSnippetTabs } from "@/components/course/CodeBlock";

// ─── Visual helper ────────────────────────────────────────────────────────────

function getCourseVisual(title: string): {
  accent: string;
  accentMuted: string;
  accentRing: string;
  icon: string;
  tag: string;
} {
  const t = title.toLowerCase();
  if (t.includes("html"))
    return { accent: "#f97316", accentMuted: "rgba(249,115,22,0.12)", accentRing: "rgba(249,115,22,0.35)", icon: "🌐", tag: "HTML" };
  if (t.includes("css"))
    return { accent: "#06b6d4", accentMuted: "rgba(6,182,212,0.12)", accentRing: "rgba(6,182,212,0.35)", icon: "🎨", tag: "CSS" };
  if (t.includes("javascript") || t.includes("js"))
    return { accent: "#eab308", accentMuted: "rgba(234,179,8,0.12)", accentRing: "rgba(234,179,8,0.35)", icon: "⚡", tag: "JS" };
  if (t.includes("next"))
    return { accent: "#e2e8f0", accentMuted: "rgba(226,232,240,0.08)", accentRing: "rgba(226,232,240,0.25)", icon: "▲", tag: "Next.js" };
  if (t.includes("react"))
    return { accent: "#38bdf8", accentMuted: "rgba(56,189,248,0.12)", accentRing: "rgba(56,189,248,0.35)", icon: "⚛️", tag: "React" };
  if (t.includes("spring") || t.includes("java"))
    return { accent: "#4ade80", accentMuted: "rgba(74,222,128,0.12)", accentRing: "rgba(74,222,128,0.35)", icon: "🍃", tag: "Java" };
  if (t.includes("docker") || t.includes("devops"))
    return { accent: "#60a5fa", accentMuted: "rgba(96,165,250,0.12)", accentRing: "rgba(96,165,250,0.35)", icon: "🐳", tag: "DevOps" };
  if (t.includes("python"))
    return { accent: "#a78bfa", accentMuted: "rgba(167,139,250,0.12)", accentRing: "rgba(167,139,250,0.35)", icon: "🐍", tag: "Python" };
  return { accent: "#c084fc", accentMuted: "rgba(192,132,252,0.12)", accentRing: "rgba(192,132,252,0.35)", icon: "📚", tag: "Course" };
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function CourseDetailSkeleton() {
  return (
    <div className="flex h-screen bg-white dark:bg-[#0a0a0f]">
      <div className="w-72 shrink-0 flex flex-col border-r border-slate-200 dark:border-[#1e1e2e] bg-slate-50 dark:bg-[#0f0f17]">
        <div className="h-32 animate-pulse bg-slate-200 dark:bg-[#1a1a2e]" />
        <div className="p-3 space-y-2 flex-1">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-1">
              <div className="h-11 w-full rounded-xl animate-pulse bg-slate-200 dark:bg-[#1a1a2e]" />
              {i < 2 &&
                Array.from({ length: 3 }).map((_, j) => (
                  <div key={j} className="h-8 rounded-lg ml-5 animate-pulse bg-slate-100 dark:bg-[#161622]" style={{ width: "calc(100% - 1.25rem)" }} />
                ))}
            </div>
          ))}
        </div>
      </div>
      <div className="flex-1 p-10 space-y-5">
        <div className="h-5 w-48 rounded-full animate-pulse bg-slate-200 dark:bg-[#1a1a2e]" />
        <div className="h-8 w-2/3 rounded-xl animate-pulse bg-slate-200 dark:bg-[#1a1a2e]" />
        <div className="h-4 w-full rounded animate-pulse bg-slate-100 dark:bg-[#161622]" />
        <div className="h-4 w-5/6 rounded animate-pulse bg-slate-100 dark:bg-[#161622]" />
        <div className="h-56 w-full rounded-2xl mt-4 animate-pulse bg-slate-200 dark:bg-[#1a1a2e]" />
      </div>
    </div>
  );
}

function LessonSkeleton() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-8 py-10 space-y-5">
      <div className="h-5 w-36 rounded-full animate-pulse bg-slate-200 dark:bg-[#1a1a2e]" />
      <div className="h-8 w-3/4 rounded-xl animate-pulse bg-slate-200 dark:bg-[#1a1a2e]" />
      <div className="space-y-3 pt-3">
        {Array.from({ length: 7 }).map((_, i) => (
          <div
            key={i}
            className="h-4 rounded animate-pulse bg-slate-100 dark:bg-[#161622]"
            style={{ width: i % 3 === 2 ? "60%" : "100%" }}
          />
        ))}
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

function hasLessonPayload(lesson?: LessonResponse | null) {
  if (!lesson) return false;
  if (!Array.isArray(lesson.codeSnippets)) return false;
  return (
    (typeof lesson.content === "string" && lesson.content.trim().length > 0) ||
    lesson.codeSnippets.length > 0
  );
}

function findLessonIndex(lessons: LessonResponse[], lesson: LessonResponse | null): number {
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

interface Props {
  courseSlug: string;
  initialLessonSlug?: string;
}
interface OpenLessonOptions {
  syncUrl?: boolean;
  history?: "push" | "replace";
}

export function CourseLearningContent({ courseSlug, initialLessonSlug }: Props) {
  const router = useRouter();
  const slug = courseSlug;
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const { user } = useAuth();
  const isAuthenticated = Boolean(user);

  const completedCacheKey = useMemo(
    () => (isAuthenticated && user?.id ? cacheKey(user.id, slug) : null),
    [isAuthenticated, user?.id, slug]
  );

  const { data: course, loading: courseLoading } = useCourseWithChapters(slug);
  const shouldFetchFallbackChapters = Boolean(course?.id) && !(course?.chapters?.length);
  const shouldFetchFallbackLessons =
    Boolean(course?.id) &&
    (!(course?.chapters?.length) ||
      (course?.chapters?.some((chapter) => !chapter.lessons?.length) ?? false));
  const { data: fallbackLessons, loading: lessonsByCourseLoading } = useLessonsByCourse(
    shouldFetchFallbackLessons ? (course?.id ?? null) : null
  );
  const { data: fallbackChapters, loading: chaptersByCourseLoading } = useChaptersByCourse(
    shouldFetchFallbackChapters ? (course?.id ?? null) : null
  );

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [expandedChapters, setExpandedChapters] = useState<number[]>([]);
  const [selectedLesson, setSelectedLesson] = useState<LessonResponse | null>(null);
  const [loadingLesson, setLoadingLesson] = useState(false);
  const [completedLessons, setCompletedLessons] = useState<Set<number>>(new Set());
  const [markingComplete, setMarkingComplete] = useState(false);

  const requestRef = useRef(0);
  const normalizedInit = useMemo(
    () => normalizeLessonSlug(searchParams?.get("lesson") || initialLessonSlug),
    [initialLessonSlug, searchParams]
  );

  const persistCache = useCallback(
    (lessons: Set<number>) => {
      if (!completedCacheKey) return;
      const arr = [...lessons];
      completedCache.set(completedCacheKey, arr);
      if (typeof window !== "undefined") {
        window.localStorage.setItem(completedCacheKey, JSON.stringify(arr));
      }
    },
    [completedCacheKey]
  );

  const markLocal = useCallback(
    (id: number) => {
      setCompletedLessons((prev) => {
        const next = new Set(prev);
        next.add(id);
        persistCache(next);
        return next;
      });
    },
    [persistCache]
  );

  const chapters = useMemo<ChapterResponse[]>(() => {
    const src = course?.chapters?.length ? course.chapters : fallbackChapters;
    const lessons = [...(fallbackLessons ?? [])].sort((a, b) => a.orderIndex - b.orderIndex);
    const byChapter = new Map<number, LessonResponse[]>();
    for (const l of lessons) {
      if (!byChapter.has(l.chapterId)) byChapter.set(l.chapterId, []);
      byChapter.get(l.chapterId)!.push(l);
    }
    if (src?.length) {
      return src
        .map((ch) => {
          const attached = ch.lessons?.length
            ? [...ch.lessons].sort((a, b) => a.orderIndex - b.orderIndex)
            : (byChapter.get(ch.id) ?? []);
          return { ...ch, lessons: attached, lessonCount: attached.length };
        })
        .sort((a, b) => a.orderIndex - b.orderIndex);
    }
    if (!course || !fallbackLessons?.length) return [];
    return [
      {
        id: -1,
        title: "មេរៀនទាំងអស់",
        description: "",
        orderIndex: 0,
        createdAt: new Date().toISOString(),
        courseId: course.id,
        courseTitle: course.title,
        lessonCount: lessons.length,
        lessons,
      },
    ];
  }, [course, fallbackChapters, fallbackLessons]);

  const isLoadingContent =
    Boolean(course) &&
    !course?.chapters?.length &&
    (chaptersByCourseLoading || lessonsByCourseLoading);

  const allLessons = useMemo(() => chapters.flatMap((c) => c.lessons || []), [chapters]);

  useEffect(() => {
    requestRef.current += 1;
    setExpandedChapters([]);
    setSelectedLesson(null);
    setLoadingLesson(false);
  }, [slug]);

  const loadLessonDetail = useCallback(
    async (lesson: LessonResponse): Promise<LessonResponse> => {
      if (!lesson.slug) return lesson;
      if (hasLessonPayload(lesson)) {
        queryClient.setQueryData(courseKeys.lesson(slug, lesson.slug), lesson);
        return lesson;
      }
      return queryClient.ensureQueryData({
        queryKey: courseKeys.lesson(slug, lesson.slug),
        queryFn: () => courseService.getLessonBySlug(slug, lesson.slug!),
        staleTime: 5 * 60 * 1000,
      });
    },
    [queryClient, slug]
  );

  const selectLesson = useCallback(
    async (lesson: LessonResponse) => {
      setSelectedLesson(lesson);
      if (!lesson.slug || hasLessonPayload(lesson)) return;
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
    },
    [loadLessonDetail]
  );

  const openLesson = useCallback(
    async (lesson: LessonResponse, options: OpenLessonOptions = {}) => {
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
    },
    [router, selectLesson, slug]
  );

  const lessonFromUrl = useMemo(() => {
    if (!normalizedInit) return undefined;
    return (
      allLessons.find((l) => normalizeLessonSlug(l.slug) === normalizedInit) ??
      allLessons.find((l) => normalizeLessonSlug(l.title) === normalizedInit)
    );
  }, [allLessons, normalizedInit]);

  useEffect(() => {
    if (!chapters.length || !allLessons.length || selectedLesson) return;
    const target = lessonFromUrl ?? allLessons[0];
    const shouldSyncUrl = Boolean(lessonFromUrl);
    void openLesson(target, { syncUrl: shouldSyncUrl, history: "replace" });
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

  const currentIdx = useMemo(
    () => findLessonIndex(allLessons, selectedLesson),
    [allLessons, selectedLesson]
  );
  const canGoPrev = currentIdx > 0;
  const canGoNext = currentIdx !== -1 && currentIdx < allLessons.length - 1;
  const goPrev = () => canGoPrev && void openLesson(allLessons[currentIdx - 1]);
  const goNext = () => canGoNext && void openLesson(allLessons[currentIdx + 1]);

  useEffect(() => {
    if (currentIdx < 0) return;
    const neighbors = [allLessons[currentIdx - 1], allLessons[currentIdx + 1]];
    for (const neighbor of neighbors) {
      if (!neighbor?.slug || hasLessonPayload(neighbor)) continue;
      void queryClient.prefetchQuery({
        queryKey: courseKeys.lesson(slug, neighbor.slug),
        queryFn: () => courseService.getLessonBySlug(slug, neighbor.slug!),
        staleTime: 5 * 60 * 1000,
      });
    }
  }, [allLessons, currentIdx, queryClient, slug]);

  useEffect(() => {
    if (!completedCacheKey) return;
    const mem = completedCache.get(completedCacheKey);
    if (mem) {
      setCompletedLessons(new Set(mem));
      return;
    }
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(completedCacheKey);
      if (raw) {
        const ids = (JSON.parse(raw) as unknown[]).filter(
          (v): v is number => typeof v === "number"
        );
        completedCache.set(completedCacheKey, ids);
        setCompletedLessons(new Set(ids));
      }
    } catch {}
  }, [completedCacheKey]);

  useEffect(() => {
    if (!isAuthenticated) {
      setCompletedLessons(new Set());
      return;
    }
    lessonProgressService
      .getMine()
      .then((progress) => {
        const ids = progress
          .filter((p) => p.completed)
          .map((p) => p.lessonId)
          .filter((id): id is number => typeof id === "number");
        const s = new Set(ids);
        setCompletedLessons(s);
        persistCache(s);
      })
      .catch(() => {});
  }, [isAuthenticated, persistCache]);

  const handleMarkComplete = async () => {
    if (!selectedLesson) return;
    if (!isAuthenticated) {
      toast.info("សូមចូលប្រើប្រាស់ដើម្បីរក្សាទុកវឌ្ឍនភាព", { duration: 2000 });
      setTimeout(
        () =>
          router.push(`/login?returnUrl=${encodeURIComponent(window.location.pathname)}`),
        1500
      );
      return;
    }
    setMarkingComplete(true);
    try {
      await lessonProgressService.markCompleted(selectedLesson.id);
      markLocal(selectedLesson.id);
      toast.success("បានបញ្ចប់មេរៀន!", { description: selectedLesson.title });
      if (canGoNext) setTimeout(goNext, 500);
    } catch {
      markLocal(selectedLesson.id);
      toast.success("បានបញ្ចប់មេរៀន!", {
        description: `${selectedLesson.title} (ក្នុង device)`,
      });
      if (canGoNext) setTimeout(goNext, 500);
    } finally {
      setMarkingComplete(false);
    }
  };

  const completedCount = useMemo(
    () => allLessons.filter((l) => completedLessons.has(l.id)).length,
    [allLessons, completedLessons]
  );
  const progressPct =
    allLessons.length > 0 ? Math.round((completedCount / allLessons.length) * 100) : 0;

  // ─────────────────────────────────────────────────────────────────────────

  if (courseLoading) return <CourseDetailSkeleton />;

  if (!course)
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center min-h-screen bg-white dark:bg-[#0a0a0f]">
        <div className="h-20 w-20 rounded-2xl flex items-center justify-center mb-5 bg-slate-100 dark:bg-[#1a1a2e]">
          <BookOpen className="h-9 w-9 text-slate-400 dark:text-slate-600" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-[#e2e8f0]" style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}>
          រកមិនឃើញវគ្គសិក្សា
        </h2>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-600">
          វគ្គសិក្សានេះមិនមានក្នុងប្រព័ន្ធទេ
        </p>
        <Link
          href="/courses"
          className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all hover:opacity-80 bg-slate-100 dark:bg-[#1a1a2e] text-slate-600 dark:text-[#94a3b8] border border-slate-200 dark:border-[#1e1e2e]"
        >
          <ArrowLeft className="h-4 w-4" /> ត្រឡប់ទៅវគ្គសិក្សា
        </Link>
      </div>
    );

  const visual = getCourseVisual(course.title);
  const prevLesson = canGoPrev ? allLessons[currentIdx - 1] : null;
  const nextLesson = canGoNext ? allLessons[currentIdx + 1] : null;

  return (
    <>
      {/* ── Global font import ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Mono:wght@400;500&family=Outfit:wght@300;400;500;600;700&display=swap');

        .course-learning {
          --cl-bg:        #f8fafc;
          --cl-bg-card:   #ffffff;
          --cl-bg-raised: #f1f5f9;
          --cl-bg-muted:  #e2e8f0;
          --cl-border:    #e2e8f0;
          --cl-border-hi: #cbd5e1;
          --cl-text-hi:   #0f172a;
          --cl-text:      #475569;
          --cl-text-lo:   #94a3b8;
          --cl-text-ghost:#cbd5e1;
        }
        .dark .course-learning {
          --cl-bg:        #0a0a0f;
          --cl-bg-card:   #0f0f17;
          --cl-bg-raised: #1a1a2e;
          --cl-bg-muted:  #161622;
          --cl-border:    #1a1a2e;
          --cl-border-hi: #1e293b;
          --cl-text-hi:   #e2e8f0;
          --cl-text:      #64748b;
          --cl-text-lo:   #94a3b8;
          --cl-text-ghost:#334155;
        }

        .course-learning * { box-sizing: border-box; }
        .lesson-link { transition: background 0.15s, color 0.15s, box-shadow 0.15s; }
        .lesson-link:hover:not(.lesson-active) { background: rgba(128,128,128,0.07); }
        .chapter-trigger:hover { background: rgba(128,128,128,0.05); }
        .chapter-trigger.chapter-open { background: rgba(128,128,128,0.06); }
        .nav-btn { transition: background 0.2s, opacity 0.2s, transform 0.15s; }
        .nav-btn:not(:disabled):hover { transform: scale(1.02); }
        .nav-btn:disabled { opacity: 0.3; cursor: not-allowed; }
        .complete-btn { transition: background 0.2s, transform 0.15s, box-shadow 0.2s; }
        .complete-btn:hover { transform: translateY(-1px); }
        .sidebar-lesson-item { position: relative; transition: background 0.15s, color 0.15s; }
        @keyframes shimmer { 0%{opacity:0.5}50%{opacity:1}100%{opacity:0.5} }
        .pulse-dot { animation: shimmer 2s ease-in-out infinite; }

        .content-prose h1,.content-prose h2,.content-prose h3 {
          font-family: 'DM Serif Display', Georgia, serif;
          color: var(--cl-text-hi);
          letter-spacing: -0.02em;
        }
        .content-prose h2 { font-size:1.35rem; margin-top:2rem; margin-bottom:0.75rem; }
        .content-prose h3 { font-size:1.1rem; margin-top:1.5rem; margin-bottom:0.5rem; }
        .content-prose p { color: var(--cl-text); line-height:1.85; margin-bottom:1rem; }
        .content-prose strong { color: var(--cl-text-hi); font-weight:600; }
        .content-prose code {
          background: var(--cl-bg-raised);
          border: 1px solid var(--cl-border-hi);
          padding: 1px 6px; border-radius: 5px;
          font-family: 'DM Mono', monospace; font-size: 0.82em;
          color: var(--accent, #a78bfa);
        }
        .content-prose a { color: var(--accent, #a78bfa); text-decoration: none; }
        .content-prose a:hover { text-decoration: underline; }
        .content-prose ul,.content-prose ol { color: var(--cl-text); padding-left:1.5rem; margin-bottom:1rem; }
        .content-prose li { margin-bottom:0.4rem; line-height:1.75; }
        .content-prose img { border-radius:12px; margin:1.5rem 0; }
        .content-prose blockquote {
          border-left: 3px solid var(--accent, #a78bfa);
          padding-left: 1rem; margin: 1.5rem 0;
          color: var(--cl-text-lo); font-style: italic;
        }
        .content-prose table { width:100%; border-collapse:collapse; margin-bottom:1rem; }
        .content-prose th { background: var(--cl-bg-raised); color: var(--cl-text-hi); padding: 0.5rem 0.75rem; text-align:left; font-size:0.8rem; }
        .content-prose td { padding: 0.5rem 0.75rem; border-bottom: 1px solid var(--cl-border); color: var(--cl-text); font-size:0.85rem; }
      `}</style>

      <div
        className="course-learning flex"
        style={{
          minHeight: "calc(100vh - 4rem)",
          background: "var(--cl-bg)",
          fontFamily: "'Outfit', sans-serif",
          "--accent": visual.accent,
        } as React.CSSProperties}
      >
        {/* ── Mobile overlay ── */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-30 lg:hidden"
            style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* ── Mobile toggle ── */}
        <button
          className="fixed z-50 lg:hidden flex items-center justify-center rounded-full transition-all hover:scale-110"
          style={{
            top: "5rem",
            left: "0.75rem",
            width: 36,
            height: 36,
            background: "var(--cl-bg-raised)",
            border: `1px solid ${visual.accent}50`,
            color: visual.accent,
          }}
          onClick={() => setSidebarOpen((o) => !o)}
        >
          {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>

        {/* ══════════════════════ SIDEBAR ══════════════════════ */}
        <aside
          className={`
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
            fixed lg:sticky lg:top-0 lg:translate-x-0
            z-40 w-80 xl:w-96
            h-screen lg:h-[100dvh]
            flex flex-col
            transition-transform duration-300 ease-in-out
          `}
          style={{
            background: "var(--cl-bg-card)",
            borderRight: "1px solid var(--cl-border)",
          }}
        >
          {/* ── Course header ── */}
          <div
            className="shrink-0 p-5"
            style={{
              background: "var(--cl-bg-card)",
              borderBottom: "1px solid var(--cl-border)",
            }}
          >
            <Link
              href="/courses"
              className="inline-flex items-center gap-1.5 text-xs mb-4 transition-opacity hover:opacity-70"
              style={{ color: "var(--cl-text)", fontFamily: "'Outfit', sans-serif" }}
            >
              <ArrowLeft className="h-3 w-3" />
              <span>All Courses</span>
            </Link>

            {/* Course identity row */}
            <div className="flex items-start gap-3 mb-4">
              <div
                className="shrink-0 w-11 h-11 rounded-xl flex items-center justify-center text-2xl"
                style={{
                  background: visual.accentMuted,
                  border: `1px solid ${visual.accentRing}`,
                  fontSize: "1.3rem",
                }}
              >
                {visual.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div
                  className="inline-block text-[9px] font-semibold px-2 py-0.5 rounded-full mb-1.5 uppercase tracking-widest"
                  style={{
                    background: visual.accentMuted,
                    color: visual.accent,
                    border: `1px solid ${visual.accentRing}`,
                  }}
                >
                  {visual.tag}
                </div>
                <h1
                  className="font-semibold leading-snug line-clamp-2 text-sm"
                  style={{ color: "var(--cl-text-hi)" }}
                >
                  {course.title}
                </h1>
              </div>
            </div>

            {/* Stats row */}
            <div
              className="flex items-center gap-4 text-[11px] mb-4"
              style={{ color: "var(--cl-text)" }}
            >
              <span className="flex items-center gap-1">
                <BookOpen className="h-3 w-3" />
                {chapters.length} Chapters
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {course.totalLessons || 0} Lessons
              </span>
            </div>

            {/* Progress bar */}
            <div>
              <div
                className="flex justify-between text-[10px] mb-1.5"
                style={{ color: "var(--cl-text)" }}
              >
                <span>
                  {completedCount}/{allLessons.length} complete
                </span>
                <span style={{ color: visual.accent, fontFamily: "'DM Mono', monospace" }}>
                  {progressPct}%
                </span>
              </div>
              <div
                className="h-1 rounded-full overflow-hidden"
                style={{ background: "var(--cl-bg-raised)" }}
              >
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${progressPct}%`,
                    background: `linear-gradient(90deg, ${visual.accent}cc, ${visual.accent})`,
                    boxShadow: `0 0 8px ${visual.accent}60`,
                  }}
                />
              </div>
            </div>
          </div>

          {/* ── Chapter / lesson list ── */}
          <div className="flex-1 overflow-y-auto py-2">
            {isLoadingContent ? (
              <div className="py-12 flex flex-col items-center gap-3">
                <div className="pulse-dot h-2 w-2 rounded-full" style={{ background: visual.accent }} />
                <p className="text-[11px]" style={{ color: "var(--cl-text)" }}>
                  Loading content…
                </p>
              </div>
            ) : chapters.length === 0 ? (
              <div className="py-12 text-center">
                <FileText className="h-7 w-7 mx-auto mb-2" style={{ color: "var(--cl-border-hi)" }} />
                <p className="text-xs" style={{ color: "var(--cl-text)" }}>
                  No chapters found
                </p>
              </div>
            ) : (
              chapters.map((chapter) => {
                const isExp = expandedChapters.includes(chapter.id);
                const cLessons = chapter.lessons || [];
                const doneInChapter = cLessons.filter((l) => completedLessons.has(l.id)).length;
                const chapterAllDone = cLessons.length > 0 && doneInChapter === cLessons.length;
                const chapterPct = cLessons.length > 0 ? (doneInChapter / cLessons.length) * 100 : 0;

                return (
                  <Collapsible
                    key={chapter.id}
                    open={isExp}
                    onOpenChange={() =>
                      setExpandedChapters((p) =>
                        isExp ? p.filter((id) => id !== chapter.id) : [...p, chapter.id]
                      )
                    }
                  >
                    <CollapsibleTrigger asChild>
                      <button
                        className={`chapter-trigger ${isExp ? "chapter-open" : ""} w-full flex items-center gap-3 px-4 py-3 text-left`}
                      >
                        {/* Chapter number / done indicator */}
                        <div
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold shrink-0"
                          style={{
                            background: chapterAllDone ? "#16a34a20" : visual.accentMuted,
                            border: `1px solid ${chapterAllDone ? "#16a34a50" : visual.accentRing}`,
                            color: chapterAllDone ? "#4ade80" : visual.accent,
                          }}
                        >
                          {chapterAllDone ? (
                            <CheckCircle2 className="h-3.5 w-3.5" />
                          ) : (
                            chapter.orderIndex
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <p
                            className="text-[11px] font-semibold line-clamp-1 leading-tight"
                            style={{ color: isExp ? "var(--cl-text-hi)" : "var(--cl-text-lo)" }}
                          >
                            {chapter.title}
                          </p>
                          {/* Mini progress line */}
                          <div className="flex items-center gap-2 mt-1">
                            <div
                              className="flex-1 h-0.5 rounded-full overflow-hidden"
                              style={{ background: "var(--cl-bg-raised)" }}
                            >
                              <div
                                className="h-full rounded-full transition-all duration-500"
                                style={{
                                  width: `${chapterPct}%`,
                                  background: visual.accent,
                                }}
                              />
                            </div>
                            <span
                              className="text-[9px] shrink-0"
                              style={{ color: "var(--cl-text-ghost)", fontFamily: "'DM Mono', monospace" }}
                            >
                              {doneInChapter}/{cLessons.length}
                            </span>
                          </div>
                        </div>

                        <ChevronDown
                          className="h-3.5 w-3.5 shrink-0 transition-transform duration-200"
                          style={{
                            color: "var(--cl-text-ghost)",
                            transform: isExp ? "rotate(0deg)" : "rotate(-90deg)",
                          }}
                        />
                      </button>
                    </CollapsibleTrigger>

                    <CollapsibleContent>
                      <div className="pb-1">
                        {cLessons.map((lesson, lIdx) => {
                          const isActive = selectedLesson?.id === lesson.id;
                          const isDone = completedLessons.has(lesson.id);
                          return (
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
                                )
                                  return;
                                e.preventDefault();
                                void openLesson(lesson, { syncUrl: true, history: "push" });
                              }}
                              className={`sidebar-lesson-item lesson-link ${isActive ? "lesson-active" : ""} flex items-center gap-3 mx-2 px-3 py-2.5 rounded-xl mb-0.5`}
                              style={{
                                background: isActive ? `${visual.accent}18` : "transparent",
                                border: isActive
                                  ? `1px solid ${visual.accentRing}`
                                  : "1px solid transparent",
                                textDecoration: "none",
                              }}
                            >
                              {/* Step indicator */}
                              <div
                                className="w-5 h-5 rounded-md flex items-center justify-center shrink-0"
                                style={{
                                  background: isActive
                                    ? visual.accent
                                    : isDone
                                    ? "#16a34a20"
                                    : "var(--cl-bg-raised)",
                                  border: isActive
                                    ? "none"
                                    : isDone
                                    ? "1px solid #16a34a40"
                                    : `1px solid var(--cl-border-hi)`,
                                }}
                              >
                                {isDone ? (
                                  <CheckCircle2
                                    className="h-3 w-3"
                                    style={{ color: isActive ? "#0a0a0f" : "#4ade80" }}
                                  />
                                ) : isActive ? (
                                  <PlayCircle
                                    className="h-3 w-3"
                                    style={{ color: "#0a0a0f" }}
                                  />
                                ) : (
                                  <span
                                    style={{
                                      color: "var(--cl-text-ghost)",
                                      fontSize: "8px",
                                      fontFamily: "'DM Mono', monospace",
                                      fontWeight: 600,
                                    }}
                                  >
                                    {lIdx + 1}
                                  </span>
                                )}
                              </div>

                              <span
                                className="text-[11px] leading-tight line-clamp-2 flex-1"
                                style={{
                                  color: isActive ? visual.accent : isDone ? "#4ade80" : "var(--cl-text)",
                                  fontWeight: isActive ? 600 : 400,
                                }}
                              >
                                {lesson.title}
                              </span>
                            </Link>
                          );
                        })}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                );
              })
            )}
          </div>

          {/* ── Sidebar footer ── */}
          <div
            className="shrink-0 px-4 py-3"
            style={{
              borderTop: "1px solid var(--cl-border)",
              background: "var(--cl-bg)",
            }}
          >
            {progressPct === 100 ? (
              <div
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold"
                style={{ background: "#16a34a15", border: "1px solid #16a34a30", color: "#4ade80" }}
              >
                <Trophy className="h-4 w-4" />
                Course Completed! 🎉
              </div>
            ) : !isAuthenticated ? (
              <Link
                href={`/login?returnUrl=${encodeURIComponent(
                  typeof window !== "undefined" ? window.location.pathname : ""
                )}`}
                className="flex items-center gap-2 text-[11px] transition-opacity hover:opacity-70"
                style={{ color: "var(--cl-text)" }}
              >
                <LogIn className="h-3 w-3" />
                Sign in to save progress
              </Link>
            ) : null}
          </div>
        </aside>

        {/* ══════════════════════ MAIN CONTENT ══════════════════════ */}
        <main className="flex-1 min-w-0 overflow-y-auto">
          {selectedLesson ? (
            <>
              {/* ── Sticky topbar ── */}
              <div
                className="sticky top-0 z-20 px-6 py-3 flex items-center gap-3"
                style={{
                  background: "var(--cl-bg)",
                  backdropFilter: "blur(16px)",
                  borderBottom: "1px solid var(--cl-border)",
                }}
              >
                {/* Accent pill */}
                <div
                  className="h-5 w-1 rounded-full shrink-0"
                  style={{ background: visual.accent, boxShadow: `0 0 8px ${visual.accent}80` }}
                />
                <div className="flex items-center gap-2 text-xs min-w-0 flex-1">
                  <span
                    className="hidden sm:inline truncate"
                    style={{ color: "var(--cl-text)", fontWeight: 500 }}
                  >
                    {selectedLesson.chapterTitle}
                  </span>
                  <ChevronRight className="h-3 w-3 shrink-0 hidden sm:block" style={{ color: "var(--cl-border-hi)" }} />
                  <span
                    className="truncate font-semibold"
                    style={{ color: "var(--cl-text-hi)" }}
                  >
                    {selectedLesson.title}
                  </span>
                </div>

                {loadingLesson && (
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Loader2
                      className="h-3 w-3 animate-spin"
                      style={{ color: visual.accent }}
                    />
                    <span className="text-[10px]" style={{ color: "var(--cl-text)" }}>
                      Loading…
                    </span>
                  </div>
                )}

                {/* Lesson counter */}
                <div
                  className="shrink-0 px-2.5 py-1 rounded-lg text-[10px] font-semibold"
                  style={{
                    background: "var(--cl-bg-raised)",
                    color: "var(--cl-text)",
                    fontFamily: "'DM Mono', monospace",
                    border: "1px solid var(--cl-border-hi)",
                  }}
                >
                  {currentIdx >= 0 ? currentIdx + 1 : 0} / {allLessons.length}
                </div>
              </div>

              {/* ── Lesson body ── */}
              {loadingLesson ? (
                <LessonSkeleton />
              ) : (
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-5 py-8 pb-16">

                  {/* Lesson header */}
                  <div
                    className="rounded-2xl p-6 mb-8 relative overflow-hidden"
                    style={{
                      background: `linear-gradient(135deg, ${visual.accentMuted}, rgba(255,255,255,0.02))`,
                      border: `1px solid ${visual.accentRing}`,
                    }}
                  >
                    {/* Decorative glow */}
                    <div
                      className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-10 blur-3xl"
                      style={{ background: visual.accent, transform: "translate(30%, -30%)" }}
                    />
                    <div className="relative">
                      <div className="flex items-center gap-2 mb-3">
                        <span
                          className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider"
                          style={{
                            background: visual.accentMuted,
                            color: visual.accent,
                            border: `1px solid ${visual.accentRing}`,
                          }}
                        >
                          {selectedLesson.chapterTitle}
                        </span>
                        <span
                          className="text-[10px]"
                          style={{ color: "var(--cl-text-ghost)", fontFamily: "'DM Mono', monospace" }}
                        >
                          Lesson {selectedLesson.orderIndex}
                        </span>
                      </div>
                      <h1
                        className="text-xl lg:text-2xl leading-tight mb-1"
                        style={{
                          color: "var(--cl-text-hi)",
                          fontFamily: "'DM Serif Display', Georgia, serif",
                          letterSpacing: "-0.025em",
                        }}
                      >
                        {selectedLesson.title}
                      </h1>
                      {selectedLesson.description && (
                        <p
                          className="text-sm leading-relaxed mt-2 line-clamp-2"
                          style={{ color: "var(--cl-text)" }}
                        >
                          {selectedLesson.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Lesson content */}
                  <div className="content-prose mb-10">
                    {selectedLesson.content ? (
                      <div dangerouslySetInnerHTML={{ __html: selectedLesson.content }} />
                    ) : (
                      <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div
                          className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                          style={{ background: "var(--cl-bg-raised)", border: "1px solid var(--cl-border-hi)" }}
                        >
                          <FileText className="h-7 w-7" style={{ color: "var(--cl-text-ghost)" }} />
                        </div>
                        <p
                          className="text-sm italic"
                          style={{ color: "var(--cl-text-ghost)" }}
                        >
                          No content for this lesson yet.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Code snippets */}
                  {selectedLesson.codeSnippets && selectedLesson.codeSnippets.length > 0 && (
                    <div className="mb-10">
                      <div className="flex items-center gap-3 mb-3">
                        <div
                          className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold"
                          style={{
                            background: visual.accentMuted,
                            border: `1px solid ${visual.accentRing}`,
                            color: visual.accent,
                          }}
                        >
                          <Code2 className="h-3.5 w-3.5" />
                          Code Examples
                        </div>
                        <span
                          className="text-[11px]"
                          style={{
                            color: "var(--cl-text-ghost)",
                            fontFamily: "'DM Mono', monospace",
                          }}
                        >
                          {selectedLesson.codeSnippets.length} snippet
                          {selectedLesson.codeSnippets.length > 1 ? "s" : ""}
                        </span>
                      </div>
                      <CodeSnippetTabs
                        snippets={selectedLesson.codeSnippets.sort(
                          (a, b) => a.orderIndex - b.orderIndex
                        )}
                      />
                    </div>
                  )}

                  {/* ── Bottom action bar ── */}
                  <div
                    className="rounded-2xl overflow-hidden"
                    style={{
                      background: "var(--cl-bg-card)",
                      border: "1px solid var(--cl-border)",
                    }}
                  >
                    {/* Mark complete */}
                    <div
                      className="px-5 py-4 flex items-center justify-between gap-4"
                      style={{ borderBottom: "1px solid var(--cl-border)" }}
                    >
                      {completedLessons.has(selectedLesson.id) ? (
                        <div className="flex items-center gap-3">
                          <div
                            className="h-9 w-9 rounded-xl flex items-center justify-center"
                            style={{ background: "#16a34a20", border: "1px solid #16a34a40" }}
                          >
                            <CheckCircle2 className="h-4 w-4" style={{ color: "#4ade80" }} />
                          </div>
                          <div>
                            <p
                              className="text-sm font-semibold"
                              style={{ color: "#4ade80" }}
                            >
                              Lesson completed
                            </p>
                            <p className="text-[10px]" style={{ color: "var(--cl-text-ghost)" }}>
                              Great work! Keep going.
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <p className="text-sm font-medium" style={{ color: "var(--cl-text)" }}>
                            Understood this lesson?
                          </p>
                          <p className="text-[10px]" style={{ color: "var(--cl-text-ghost)" }}>
                            Mark it complete and continue
                          </p>
                        </div>
                      )}
                      {!completedLessons.has(selectedLesson.id) && (
                        <button
                          onClick={handleMarkComplete}
                          disabled={markingComplete}
                          className="complete-btn flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold shrink-0"
                          style={{
                            background: "#16a34a",
                            color: "#fff",
                            border: "none",
                            cursor: markingComplete ? "not-allowed" : "pointer",
                            opacity: markingComplete ? 0.7 : 1,
                            boxShadow: "0 4px 14px rgba(22,163,74,0.3)",
                          }}
                        >
                          {markingComplete ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <CheckCircle2 className="h-4 w-4" />
                          )}
                          {isAuthenticated ? "Mark Complete" : "Sign in & Mark"}
                        </button>
                      )}
                    </div>

                    {/* Prev / Next navigation */}
                    <div className="grid grid-cols-2">
                      {/* Prev */}
                      <button
                        onClick={goPrev}
                        disabled={!canGoPrev}
                        className="nav-btn flex items-center gap-3 px-5 py-4 text-left"
                        style={{
                          background: "transparent",
                          border: "none",
                          borderRight: "1px solid var(--cl-border)",
                          cursor: canGoPrev ? "pointer" : "not-allowed",
                        }}
                      >
                        <div
                          className="h-8 w-8 rounded-xl flex items-center justify-center shrink-0"
                          style={{ background: "var(--cl-bg-raised)", border: "1px solid var(--cl-border-hi)" }}
                        >
                          <ChevronLeft className="h-4 w-4" style={{ color: "var(--cl-text)" }} />
                        </div>
                        <div className="min-w-0">
                          <p
                            className="text-[9px] uppercase tracking-widest mb-0.5"
                            style={{ color: "var(--cl-text-ghost)", fontFamily: "'DM Mono', monospace" }}
                          >
                            Previous
                          </p>
                          <p
                            className="text-xs font-medium line-clamp-1"
                            style={{ color: "var(--cl-text)" }}
                          >
                            {prevLesson?.title ?? "—"}
                          </p>
                        </div>
                      </button>

                      {/* Next */}
                      <button
                        onClick={goNext}
                        disabled={!canGoNext}
                        className="nav-btn flex items-center gap-3 px-5 py-4 text-right justify-end"
                        style={{
                          background: "transparent",
                          border: "none",
                          cursor: canGoNext ? "pointer" : "not-allowed",
                        }}
                      >
                        <div className="min-w-0">
                          <p
                            className="text-[9px] uppercase tracking-widest mb-0.5"
                            style={{
                              color: "var(--cl-text-ghost)",
                              fontFamily: "'DM Mono', monospace",
                            }}
                          >
                            Next
                          </p>
                          <p
                            className="text-xs font-medium line-clamp-1"
                            style={{ color: canGoNext ? "var(--cl-text-lo)" : "var(--cl-text-ghost)" }}
                          >
                            {nextLesson?.title ?? "—"}
                          </p>
                        </div>
                        <div
                          className="h-8 w-8 rounded-xl flex items-center justify-center shrink-0"
                          style={{
                            background: canGoNext ? visual.accent : "var(--cl-bg-raised)",
                            boxShadow: canGoNext ? `0 0 12px ${visual.accent}50` : "none",
                          }}
                        >
                          <ChevronRight
                            className="h-4 w-4"
                            style={{ color: canGoNext ? "var(--cl-bg)" : "var(--cl-text-ghost)" }}
                          />
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            /* ── Welcome / landing screen ── */
            <div
              className="flex items-center justify-center min-h-full p-8"
              style={{ minHeight: "calc(100vh - 4rem)" }}
            >
              <div className="text-center max-w-2xl w-full">
                {/* Hero icon with glow */}
                <div className="relative mx-auto mb-8 inline-flex">
                  <div
                    className="absolute inset-0 rounded-3xl blur-2xl opacity-40"
                    style={{ background: visual.accent, transform: "scale(1.3)" }}
                  />
                  <div
                    className="relative w-24 h-24 rounded-3xl flex items-center justify-center"
                    style={{
                      background: visual.accentMuted,
                      border: `1px solid ${visual.accentRing}`,
                      fontSize: "3rem",
                    }}
                  >
                    {visual.icon}
                  </div>
                </div>

                {/* Tag */}
                <div
                  className="inline-block text-[10px] font-semibold px-3 py-1 rounded-full mb-4 uppercase tracking-widest"
                  style={{
                    background: visual.accentMuted,
                    color: visual.accent,
                    border: `1px solid ${visual.accentRing}`,
                  }}
                >
                  {visual.tag}
                </div>

                <h2
                  className="text-2xl lg:text-3xl mb-3 leading-tight"
                  style={{
                    color: "var(--cl-text-hi)",
                    fontFamily: "'DM Serif Display', Georgia, serif",
                    letterSpacing: "-0.03em",
                  }}
                >
                  {course.title}
                </h2>

                {course.description && (
                  <p
                    className="text-sm leading-relaxed mb-8 max-w-md mx-auto"
                    style={{ color: "var(--cl-text)" }}
                  >
                    {course.description}
                  </p>
                )}

                {/* Stats */}
                <div className="flex items-center justify-center gap-3 flex-wrap mb-8">
                  {[
                    { icon: <BookOpen className="h-3.5 w-3.5" />, label: `${chapters.length} Chapters` },
                    { icon: <FileText className="h-3.5 w-3.5" />, label: `${course.totalLessons || 0} Lessons` },
                    {
                      icon: <Users className="h-3.5 w-3.5" />,
                      label: `${(course.enrolledCount || 0).toLocaleString()} Students`,
                    },
                  ].map(({ icon, label }) => (
                    <span
                      key={label}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium"
                      style={{
                        background: "#0f0f17",
                        border: "1px solid #1a1a2e",
                        color: "#64748b",
                      }}
                    >
                      <span style={{ color: visual.accent }}>{icon}</span>
                      {label}
                    </span>
                  ))}
                </div>

                {/* CTA */}
                {allLessons.length > 0 && (
                  <button
                    onClick={() =>
                      void openLesson(allLessons[0], { syncUrl: true, history: "replace" })
                    }
                    className="complete-btn inline-flex items-center gap-2.5 px-8 py-3.5 rounded-2xl text-sm font-semibold"
                    style={{
                      background: visual.accent,
                      color: "#0a0a0f",
                      border: "none",
                      cursor: "pointer",
                      boxShadow: `0 8px 24px ${visual.accent}40`,
                      fontFamily: "'Outfit', sans-serif",
                    }}
                  >
                    <PlayCircle className="h-5 w-5" />
                    Start Learning
                  </button>
                )}

                {!isAuthenticated && (
                  <p
                    className="mt-5 flex items-center justify-center gap-1.5 text-xs"
                    style={{ color: "var(--cl-text-ghost)" }}
                  >
                    <Lock className="h-3 w-3" />
                    <Link
                      href="/login"
                      className="underline underline-offset-2 transition-colors hover:opacity-70"
                      style={{ color: "var(--cl-text)" }}
                    >
                      Sign in
                    </Link>{" "}
                    to save your progress
                  </p>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  );
}

export default function CourseDetailPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  if (!slug) return <CourseDetailSkeleton />;
  return <CourseLearningContent courseSlug={decodeURIComponent(slug)} />;
}