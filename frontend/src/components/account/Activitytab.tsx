"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  CheckCircle2,
  CircleDot,
  Layers,
  TrendingUp,
  BarChart3,
  Timer,
  Trash2,
  CheckCheck,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useLessonProgressActions } from "@/hooks/useLessonProgress";
import type { LessonProgressResponse } from "@/types/lessonProgressType";
import { toast } from "sonner";
import { learningCourseLinks } from "@/components/constants/roadmap-data";
import {
  buildCourseProgressSummaries,
  type CourseProgressSummary,
  estimateLessonReadMinutes,
  formatDurationCompactKh,
} from "./progress-utils";

interface ActivityTabProps {
  progressLoading: boolean;
  totalLessonsTracked: number;
  lessonsCompleted: number;
  completedCourses: number;
  lessonsProgressPct: number;
  totalReadSeconds: number;
  progressByCourse: Record<string, LessonProgressResponse[]>;
}

function StatCard({
  icon,
  label,
  value,
  loading,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  loading: boolean;
}) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
      <div className="mb-2 flex items-center gap-2">
        {icon}
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <p className="text-2xl font-bold text-slate-900 dark:text-white">
        {loading ? (
          <span className="inline-block h-7 w-10 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
        ) : (
          value
        )}
      </p>
    </div>
  );
}

function normalizeCourseTitle(value?: string): string {
  return (value ?? "")
    .toLowerCase()
    .replace(/[.\-_/]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function resolveCourseHref(courseTitle?: string): string | undefined {
  const normalizedTitle = normalizeCourseTitle(courseTitle);
  if (!normalizedTitle) return undefined;

  return learningCourseLinks.find(
    (course) => normalizeCourseTitle(course.label) === normalizedTitle,
  )?.href;
}

function toLessonSlug(value?: string): string {
  return (value ?? "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9\u1780-\u17FF-]/g, "")
    .replace(/--+/g, "-")
    .replace(/^-|-$/g, "");
}

function resolveLessonHref(progress: LessonProgressResponse): string | undefined {
  const courseHref = resolveCourseHref(progress.courseTitle);
  const lessonSlug = toLessonSlug(progress.lessonTitle);

  if (!courseHref) return undefined;
  if (!lessonSlug) return courseHref;

  return `${courseHref}/${encodeURIComponent(lessonSlug)}`;
}

function CourseProgressRing({
  progressPct,
  completedLessons,
  totalLessons,
}: {
  progressPct: number;
  completedLessons: number;
  totalLessons: number;
}) {
  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - progressPct / 100);
  const ringColor = progressPct >= 100 ? "#10b981" : "#8b5cf6";

  return (
    <div className="relative shrink-0">
      <svg width="56" height="56" viewBox="0 0 56 56">
        <circle
          cx="28"
          cy="28"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="6"
          className="text-slate-200 dark:text-slate-700"
        />
        <circle
          cx="28"
          cy="28"
          r={radius}
          fill="none"
          stroke={ringColor}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          transform="rotate(-90 28 28)"
          style={{ transition: "stroke-dashoffset 500ms ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[11px] font-bold text-slate-900 dark:text-white">
          {progressPct}%
        </span>
        <span className="text-[9px] text-muted-foreground">
          {completedLessons}/{totalLessons}
        </span>
      </div>
    </div>
  );
}

function CourseConfetti({ active }: { active: boolean }) {
  if (!active) return null;

  const pieces = Array.from({ length: 16 }, (_, index) => ({
    id: index,
    left: 8 + ((index * 11) % 84),
    delay: (index % 5) * 80,
    rotate: (index % 2 === 0 ? 1 : -1) * (20 + index * 7),
    color: ["#8b5cf6", "#10b981", "#f59e0b", "#3b82f6"][index % 4],
  }));

  return (
    <>
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {pieces.map((piece) => (
          <span
            key={piece.id}
            className="confetti-piece absolute top-8 h-3 w-2 rounded-full opacity-0"
            style={{
              left: `${piece.left}%`,
              backgroundColor: piece.color,
              animationDelay: `${piece.delay}ms`,
              ["--confetti-rotate" as string]: `${piece.rotate}deg`,
            }}
          />
        ))}
      </div>
      <style jsx>{`
        .confetti-piece {
          animation: confetti-burst 1200ms ease-out forwards;
        }

        @keyframes confetti-burst {
          0% {
            opacity: 0;
            transform: translateY(0) rotate(0deg) scale(0.6);
          }
          15% {
            opacity: 1;
          }
          100% {
            opacity: 0;
            transform: translateY(72px) translateX(-10px) rotate(var(--confetti-rotate)) scale(1);
          }
        }
      `}</style>
    </>
  );
}

function LessonRow({ progress }: { progress: LessonProgressResponse }) {
  const {
    markCompleted,
    remove,
    isCompletePending,
    isRemovePending,
  } = useLessonProgressActions(progress.lessonId);

  const scrollPct = progress.scrollPct ?? 0;
  const estimateMinutes = estimateLessonReadMinutes(progress);
  const trackedReadLabel = formatDurationCompactKh(progress.readTimeSeconds ?? 0);
  const dateStr = progress.completedAt ?? progress.createdAt;
  const courseHref = resolveCourseHref(progress.courseTitle);
  const lessonHref = resolveLessonHref(progress);

  const handleMarkComplete = async () => {
    try {
      await markCompleted();
      toast.success("មេរៀនបានបញ្ចប់ដោយជោគជ័យ");
    } catch {
      toast.error("មិនអាចធ្វើបច្ចុប្បន្នភាពវឌ្ឍនភាពបានទេ");
    }
  };

  const handleDelete = async () => {
    try {
      await remove();
      toast.success("បានលុបវឌ្ឍនភាពដោយជោគជ័យ");
    } catch {
      toast.error("មិនអាចលុបវឌ្ឍនភាពបានទេ");
    }
  };

  return (
    <div className="group flex items-start gap-4 px-5 py-4 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/40">
      <div
        className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
          progress.completed
            ? "bg-emerald-100 dark:bg-emerald-900/30"
            : "bg-blue-100 dark:bg-blue-900/30"
        }`}
      >
        {progress.completed ? (
          <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
        ) : (
          <CircleDot className="h-4 w-4 text-blue-500 dark:text-blue-400" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="mb-1 flex items-center gap-2 text-[11px] text-muted-foreground">
          {courseHref ? (
            <Link
              href={courseHref}
              className="rounded-full bg-slate-100 px-2 py-0.5 transition-colors hover:bg-violet-100 hover:text-violet-700 dark:bg-slate-800 dark:hover:bg-violet-900/30 dark:hover:text-violet-300"
            >
              {progress.courseTitle ?? "វគ្គសិក្សា"}
            </Link>
          ) : (
            <span className="rounded-full bg-slate-100 px-2 py-0.5 dark:bg-slate-800">
              {progress.courseTitle ?? "វគ្គសិក្សា"}
            </span>
          )}
          <span>{dateStr ? new Date(dateStr).toLocaleDateString("km-KH") : "--"}</span>
        </div>

        <div className="flex items-start justify-between gap-2">
          {lessonHref ? (
            <Link
              href={lessonHref}
              className="truncate text-sm font-medium leading-snug text-slate-900 transition-colors hover:text-violet-700 dark:text-white dark:hover:text-violet-300"
            >
              {progress.lessonTitle ?? `មេរៀនទី ${progress.lessonId}`}
            </Link>
          ) : (
            <p className="truncate text-sm font-medium leading-snug text-slate-900 dark:text-white">
              {progress.lessonTitle ?? `មេរៀនទី ${progress.lessonId}`}
            </p>
          )}
        </div>

        <div className="mt-1.5 flex flex-wrap items-center gap-3">
          {scrollPct > 0 && scrollPct < 100 && (
            <div className="flex items-center gap-1.5">
              <div className="h-1 w-16 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                <div
                  className="h-full rounded-full bg-violet-400"
                  style={{ width: `${scrollPct}%` }}
                />
              </div>
              <span className="text-[10px] text-muted-foreground">{scrollPct}%</span>
            </div>
          )}

          {(progress.readTimeSeconds ?? 0) > 0 && (
            <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
              <Timer className="h-3 w-3" />
              បានអាន {trackedReadLabel}
            </span>
          )}

          {progress.pdfDownloaded && (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
              ឯកសារ PDF
            </span>
          )}
        </div>
      </div>

      <div className="mt-0.5 flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        {!progress.completed && (
          <Button
            size="icon"
            variant="ghost"
            disabled={isCompletePending}
            className="h-7 w-7 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-950/20"
            title="សម្គាល់ថាបានបញ្ចប់"
            onClick={handleMarkComplete}
          >
            {isCompletePending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <CheckCheck className="h-3.5 w-3.5" />
            )}
          </Button>
        )}

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              size="icon"
              variant="ghost"
              disabled={isRemovePending}
              className="h-7 w-7 text-rose-500 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/20"
              title="លុបវឌ្ឍនភាព"
            >
              {isRemovePending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Trash2 className="h-3.5 w-3.5" />
              )}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>លុបវឌ្ឍនភាព?</AlertDialogTitle>
              <AlertDialogDescription>
                នេះនឹងលុបកំណត់ត្រាវឌ្ឍនភាពរបស់អ្នកសម្រាប់{" "}
                <span className="font-semibold text-slate-900 dark:text-white">
                  {progress.lessonTitle ?? `មេរៀនទី ${progress.lessonId}`}
                </span>
                ។ ដំណើរការនេះមិនអាចត្រឡប់វិញបានទេ។
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>បោះបង់</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-rose-600 hover:bg-rose-700"
              >
                លុបវឌ្ឍនភាព
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}

function CourseGroup({ course }: { course: CourseProgressSummary }) {
  const [showConfetti, setShowConfetti] = useState(false);
  const previousPctRef = useRef(course.progressPct);
  const courseHref = resolveCourseHref(course.courseTitle);

  useEffect(() => {
    if (previousPctRef.current < 100 && course.progressPct === 100) {
      setShowConfetti(true);
      const timeout = window.setTimeout(() => setShowConfetti(false), 1400);
      previousPctRef.current = course.progressPct;
      return () => window.clearTimeout(timeout);
    }

    previousPctRef.current = course.progressPct;
    return undefined;
  }, [course.progressPct]);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
      <CourseConfetti active={showConfetti} />

      <div className="flex items-center justify-between gap-3 border-b border-slate-100 bg-gradient-to-r from-violet-50 to-blue-50 px-5 py-4 dark:border-slate-800 dark:from-violet-950/30 dark:to-blue-950/30">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-100 dark:bg-violet-900/40">
            <Layers className="h-4 w-4 text-violet-600 dark:text-violet-400" />
          </div>
          <div>
            {courseHref ? (
              <Link
                href={courseHref}
                className="text-sm font-semibold leading-tight text-slate-900 transition-colors hover:text-violet-700 dark:text-white dark:hover:text-violet-300"
              >
                {course.courseTitle}
              </Link>
            ) : (
              <p className="text-sm font-semibold leading-tight text-slate-900 dark:text-white">
                {course.courseTitle}
              </p>
            )}
            <p className="mt-0.5 text-xs text-muted-foreground">
              {course.completedLessons}/{course.totalLessons} មេរៀនបានបញ្ចប់ · អាន {formatDurationCompactKh(course.totalReadSeconds)}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          {course.progressPct === 100 && (
            <span className="hidden rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 sm:inline-flex">
              បានបញ្ចប់ 100%
            </span>
          )}
          <CourseProgressRing
            progressPct={course.progressPct}
            completedLessons={course.completedLessons}
            totalLessons={course.totalLessons}
          />
        </div>
      </div>

      <div className="divide-y divide-slate-100 dark:divide-slate-800">
        {course.lessons.map((progress) => (
          <LessonRow key={progress.id ?? progress.lessonId} progress={progress} />
        ))}
      </div>
    </div>
  );
}

function ActivitySkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((item) => (
        <div
          key={item}
          className="rounded-2xl border border-slate-100 bg-white p-5 dark:border-slate-800 dark:bg-slate-900/60"
        >
          <div className="mb-4 h-4 w-40 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
          <div className="space-y-3">
            {[1, 2].map((row) => (
              <div key={row} className="flex items-center gap-3">
                <div className="h-9 w-9 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-700" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3.5 w-48 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
                  <div className="h-2.5 w-24 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyActivity() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-slate-200 bg-white py-16 text-center dark:border-slate-700 dark:bg-slate-900/40">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800">
        <BookOpen className="h-8 w-8 text-muted-foreground/40" />
      </div>
      <div>
        <p className="font-medium text-slate-700 dark:text-slate-300">
          មិនទាន់មានសកម្មភាពនៅឡើយ
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          ចាប់ផ្តើមរៀនមេរៀនដំបូងរបស់អ្នក!
        </p>
      </div>
      <Link href="/courses">
        <Button className="mt-1 gap-2">
          <BookOpen className="h-4 w-4" />
          រុករកវគ្គសិក្សា
        </Button>
      </Link>
    </div>
  );
}

export function ActivityTab({
  progressLoading,
  totalLessonsTracked,
  lessonsCompleted,
  completedCourses,
  lessonsProgressPct,
  totalReadSeconds,
  progressByCourse,
}: ActivityTabProps) {
  const courseSummaries = useMemo(
    () => buildCourseProgressSummaries(progressByCourse),
    [progressByCourse],
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard
          loading={progressLoading}
          label="មេរៀនសរុប"
          value={totalLessonsTracked}
          icon={
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-900/30">
              <BookOpen className="h-4 w-4 text-violet-600 dark:text-violet-400" />
            </div>
          }
        />

        <StatCard
          loading={progressLoading}
          label="បានបញ្ចប់"
          value={lessonsCompleted}
          icon={
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </div>
          }
        />

        <StatCard
          loading={progressLoading}
          label="វគ្គបានចប់"
          value={completedCourses}
          icon={
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
              <Layers className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
          }
        />

        <StatCard
          loading={progressLoading}
          label="ម៉ោងសិក្សា"
          value={progressLoading ? null : formatDurationCompactKh(totalReadSeconds)}
          icon={
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30">
              <BarChart3 className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            </div>
          }
        />
      </div>

      {!progressLoading && totalLessonsTracked > 0 && (
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-violet-600" />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                វឌ្ឍនភាពសរុប
              </span>
            </div>
            <span className="text-sm font-semibold text-violet-600">
              {lessonsCompleted}/{totalLessonsTracked} មេរៀន
            </span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-violet-500 to-emerald-500 transition-all duration-700"
              style={{ width: `${lessonsProgressPct}%` }}
            />
          </div>
        </div>
      )}

      {!progressLoading && totalLessonsTracked > 0 && (
        <p className="px-1 text-xs text-muted-foreground">
          ចុចលើរូបតំណាង{" "}
          <span className="inline-flex items-center gap-0.5 font-medium text-emerald-600">
            <CheckCheck className="inline h-3 w-3" /> បញ្ចប់
          </span>{" "}
          ឬ{" "}
          <span className="inline-flex items-center gap-0.5 font-medium text-rose-500">
            <Trash2 className="inline h-3 w-3" /> លុប
          </span>{" "}
          ដើម្បីគ្រប់គ្រងវឌ្ឍនភាពរបស់អ្នក។ បើវគ្គសិក្សាមួយដល់ 100% អ្នកនឹងឃើញអានីមេសិនអបអរសាទរ។
        </p>
      )}

      {progressLoading ? (
        <ActivitySkeleton />
      ) : courseSummaries.length > 0 ? (
        <div className="space-y-4">
          {courseSummaries.map((course) => (
            <CourseGroup key={course.courseTitle} course={course} />
          ))}
        </div>
      ) : (
        <EmptyActivity />
      )}
    </div>
  );
}
