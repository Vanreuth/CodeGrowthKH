"use client";

import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  Clock,
  Download,
  FileText,
  Loader2,
  LogIn,
  PlayCircle,
  Trophy,
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import type { ChapterResponse } from "@/types/chapterType";
import type { LessonResponse } from "@/types/lessonType";

interface Visual {
  accent: string;
  accentMuted: string;
  accentRing: string;
  icon: string;
  tag: string;
}

interface CourseInfo {
  title: string;
  totalLessons?: number;
}

interface CourseSidebarProps {
  course: CourseInfo;
  visual: Visual;
  sidebarOpen: boolean;
  chapters: ChapterResponse[];
  allLessons: LessonResponse[];
  selectedLesson: LessonResponse | null;
  expandedChapters: number[];
  completedLessons: Set<number>;
  isLoadingContent: boolean;
  isAuthenticated: boolean;
  completedCount: number;
  progressPct: number;
  hasPdf: boolean;
  pdfDownloading: boolean;
  onExpandToggle: (chapterId: number) => void;
  onLessonClick: (lesson: LessonResponse, e: React.MouseEvent) => void;
  onPdfDownload: () => void;
  getLessonHref: (lesson: LessonResponse) => string;
}

export function CourseSidebar({
  course,
  visual,
  chapters,
  allLessons,
  selectedLesson,
  expandedChapters,
  completedLessons,
  isLoadingContent,
  isAuthenticated,
  completedCount,
  progressPct,
  hasPdf,
  pdfDownloading,
  onExpandToggle,
  onLessonClick,
  onPdfDownload,
  getLessonHref,
}: CourseSidebarProps) {
  return (
    <>
      {/* â”€â”€ Course header â”€â”€ */}
      <div
        className="shrink-0 p-5"
        style={{ background: "var(--cl-bg-card)", borderBottom: "1px solid var(--cl-border)" }}
      >
        <Link
          href="/courses"
          className="inline-flex items-center gap-1.5 text-xs mb-4 transition-opacity hover:opacity-70"
          style={{ color: "var(--cl-text)" }}
        >
          <ArrowLeft className="h-3 w-3" />
          <span>All Courses</span>
        </Link>

        {/* Course identity */}
        <div className="flex items-start gap-3 mb-4">
          <div
            className="shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-lg"
            style={{ background: "#2f8d46" }}
          >
            {visual.icon}
          </div>
          <div className="flex-1 min-w-0">
            <span
              className="inline-block text-[9px] font-bold px-2 py-0.5 rounded tracking-widest uppercase mb-1.5"
              style={{
                background: "rgba(47,141,70,0.10)",
                color: "#2f8d46",
                border: "1px solid rgba(47,141,70,0.20)",
              }}
            >
              {visual.tag}
            </span>
            <h1
              className="font-semibold leading-snug line-clamp-2 text-sm"
              style={{ color: "var(--cl-text-hi)" }}
            >
              {course.title}
            </h1>
          </div>
        </div>

        {/* Stats */}
        <div
          className="flex items-center gap-4 text-[11px] mb-4"
          style={{ color: "var(--cl-text)" }}
        >
          <span className="flex items-center gap-1.5">
            <BookOpen className="h-3 w-3" />
            {chapters.length} Chapters
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="h-3 w-3" />
            {course.totalLessons || 0} Lessons
          </span>
        </div>

        {/* Progress */}
        <div>
          <div
            className="flex justify-between text-[10px] mb-2 font-medium"
            style={{ color: "var(--cl-text)" }}
          >
            <span>{completedCount} / {allLessons.length} completed</span>
            <span style={{ color: "#2f8d46", fontFamily: "'DM Mono', monospace" }}>
              {progressPct}%
            </span>
          </div>
          <div
            className="h-1.5 rounded-full overflow-hidden"
            style={{ background: "var(--cl-bg-raised)" }}
          >
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${progressPct}%`, background: "#2f8d46" }}
            />
          </div>
        </div>

        {/* PDF download */}
        {hasPdf && (
          <div className="mt-3 pt-3" style={{ borderTop: "1px solid var(--cl-border)" }}>
            <button
              type="button"
              onClick={onPdfDownload}
              disabled={pdfDownloading}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all hover:opacity-80 disabled:opacity-50"
              style={{
                background: "rgba(47,141,70,0.08)",
                color: "#2f8d46",
                border: "1px solid rgba(47,141,70,0.25)",
              }}
            >
              {pdfDownloading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : !isAuthenticated ? (
                <LogIn className="h-3.5 w-3.5" />
              ) : (
                <Download className="h-3.5 w-3.5" />
              )}
              {isAuthenticated ? "Download PDF" : "Sign in to Download PDF"}
            </button>
          </div>
        )}
      </div>

      {/* â”€â”€ Chapter / lesson list â”€â”€ */}
      <div className="flex-1 overflow-y-auto py-2">
        {isLoadingContent ? (
          <div className="py-12 flex flex-col items-center gap-3">
            <div
              className="w-5 h-5 rounded-full border-2 animate-spin"
              style={{ borderColor: "#2f8d46", borderTopColor: "transparent" }}
            />
            <p className="text-[11px]" style={{ color: "var(--cl-text)" }}>
              Loading contentâ€¦
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

            return (
              <Collapsible
                key={chapter.id}
                open={isExp}
                onOpenChange={() => onExpandToggle(chapter.id)}
              >
                <CollapsibleTrigger asChild>
                  <button
                    type="button"
                    className={`chapter-trigger ${isExp ? "chapter-open" : ""} w-full flex items-center gap-3 px-4 py-3 text-left`}
                    style={{
                      borderLeft: isExp ? "3px solid #2f8d46" : "3px solid transparent",
                      background: isExp ? "rgba(47,141,70,0.04)" : "transparent",
                    }}
                  >
                    {/* Chapter number / done badge */}
                    <div
                      className="w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold shrink-0"
                      style={{
                        background: chapterAllDone
                          ? "rgba(22,163,74,0.12)"
                          : isExp
                          ? "rgba(47,141,70,0.12)"
                          : "var(--cl-bg-raised)",
                        color: chapterAllDone ? "#16a34a" : isExp ? "#2f8d46" : "var(--cl-text)",
                        border: `1px solid ${
                          chapterAllDone
                            ? "rgba(22,163,74,0.30)"
                            : isExp
                            ? "rgba(47,141,70,0.25)"
                            : "var(--cl-border-hi)"
                        }`,
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
                      <p
                        className="text-[9px] mt-0.5"
                        style={{
                          color: "var(--cl-text-ghost)",
                          fontFamily: "'DM Mono', monospace",
                        }}
                      >
                        {doneInChapter}/{cLessons.length} lessons
                      </p>
                    </div>

                    <ChevronDown
                      className="h-3.5 w-3.5 shrink-0 transition-transform duration-200"
                      style={{
                        color: isExp ? "#2f8d46" : "var(--cl-text-ghost)",
                        transform: isExp ? "rotate(0deg)" : "rotate(-90deg)",
                      }}
                    />
                  </button>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  {/* Guide line + lessons */}
                  <div
                    className="pb-2 ml-4 pl-3 relative"
                    style={{ borderLeft: "2px solid rgba(47,141,70,0.18)" }}
                  >
                    {cLessons.map((lesson, lIdx) => {
                      const isActive = selectedLesson?.id === lesson.id;
                      const isDone = completedLessons.has(lesson.id);
                      return (
                        <Link
                          key={lesson.id}
                          href={getLessonHref(lesson)}
                          onClick={(e) => onLessonClick(lesson, e)}
                          className="sidebar-lesson-item lesson-link flex items-center gap-2.5 px-2 py-2 rounded-lg mb-0.5 relative"
                          style={{
                            textDecoration: "none",
                            background: isActive ? "rgba(47,141,70,0.10)" : "transparent",
                            border: isActive
                              ? "1px solid rgba(47,141,70,0.22)"
                              : "1px solid transparent",
                          }}
                        >
                          {/* Status dot */}
                          <div
                            className="w-4 h-4 rounded-full flex items-center justify-center shrink-0"
                            style={{
                              background: isActive
                                ? "#2f8d46"
                                : isDone
                                ? "rgba(22,163,74,0.10)"
                                : "var(--cl-bg-raised)",
                              border: `1.5px solid ${
                                isActive
                                  ? "#2f8d46"
                                  : isDone
                                  ? "rgba(22,163,74,0.35)"
                                  : "var(--cl-border-hi)"
                              }`,
                            }}
                          >
                            {isDone ? (
                              <CheckCircle2
                                className="h-2.5 w-2.5"
                                style={{ color: isActive ? "white" : "#16a34a" }}
                              />
                            ) : isActive ? (
                              <PlayCircle className="h-2.5 w-2.5" style={{ color: "white" }} />
                            ) : (
                              <span
                                style={{
                                  color: "var(--cl-text-ghost)",
                                  fontSize: "7px",
                                  fontFamily: "'DM Mono', monospace",
                                  fontWeight: 700,
                                }}
                              >
                                {lIdx + 1}
                              </span>
                            )}
                          </div>

                          <span
                            className="text-[11px] leading-snug line-clamp-2 flex-1"
                            style={{
                              color: isActive ? "#2f8d46" : "var(--cl-text)",
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

      {/* â”€â”€ Sidebar footer â”€â”€ */}
      <div
        className="shrink-0 px-4 py-3"
        style={{
          borderTop: "1px solid var(--cl-border)",
          background: "var(--cl-bg)",
        }}
      >
        {progressPct === 100 ? (
          <div
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-semibold"
            style={{
              background: "rgba(22,163,74,0.10)",
              border: "1px solid rgba(22,163,74,0.25)",
              color: "#16a34a",
            }}
          >
            <Trophy className="h-4 w-4" />
            Course Completed! ðŸŽ‰
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
    </>
  );
}
