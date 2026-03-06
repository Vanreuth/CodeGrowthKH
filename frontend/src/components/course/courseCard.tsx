import Link from "next/link";
import { BookOpen, Eye, Star, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CourseResponse } from "@/types/courseType";

// ─── Level badge colours ──────────────────────────────────────────────────────
const levelColors: Record<string, string> = {
  BEGINNER:     "bg-green-500/10 text-green-600 dark:text-green-400",
  Beginner:     "bg-green-500/10 text-green-600 dark:text-green-400",
  INTERMEDIATE: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  Intermediate: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  ADVANCED:     "bg-rose-500/10 text-rose-600 dark:text-rose-400",
  Advanced:     "bg-rose-500/10 text-rose-600 dark:text-rose-400",
};

const levelLabel: Record<string, string> = {
  BEGINNER:     "ចាប់ផ្តើម",
  INTERMEDIATE: "មធ្យម",
  ADVANCED:     "ខ្ពស់",
};

// ─── Course visual (thumbnail fallback) ──────────────────────────────────────
export function getCourseVisual(title: string): { bg: string; icon: string } {
  const t = title.toLowerCase();
  if (t.includes("html"))                           return { bg: "bg-gradient-to-br from-orange-500 via-red-400 to-pink-500",    icon: "🌐" };
  if (t.includes("css"))                            return { bg: "bg-gradient-to-br from-blue-500 via-cyan-400 to-teal-400",     icon: "🎨" };
  if (t.includes("javascript") || t.includes("js")) return { bg: "bg-gradient-to-br from-yellow-400 via-amber-400 to-orange-400", icon: "⚡" };
  if (t.includes("next"))                           return { bg: "bg-gradient-to-br from-slate-700 via-slate-600 to-slate-500",  icon: "▲" };
  if (t.includes("react"))                          return { bg: "bg-gradient-to-br from-sky-500 via-blue-400 to-indigo-500",    icon: "⚛️" };
  if (t.includes("spring") || t.includes("java"))  return { bg: "bg-gradient-to-br from-green-500 via-emerald-400 to-teal-500", icon: "🍃" };
  if (t.includes("docker") || t.includes("devops")) return { bg: "bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-500",    icon: "🐳" };
  if (t.includes("python"))                         return { bg: "bg-gradient-to-br from-yellow-500 via-blue-500 to-blue-600",  icon: "🐍" };
  if (t.includes("git"))                            return { bg: "bg-gradient-to-br from-orange-500 via-red-500 to-orange-700",  icon: "🧩" };
  if (t.includes("sql") || t.includes("data"))     return { bg: "bg-gradient-to-br from-purple-500 via-violet-400 to-indigo-500", icon: "📊" };
  return                                                   { bg: "bg-gradient-to-br from-violet-500 via-purple-400 to-indigo-500", icon: "📚" };
}

// ─── CourseCard ───────────────────────────────────────────────────────────────
export function CourseCard({ course, badge }: { course: CourseResponse; badge?: string }) {
  const { bg, icon } = getCourseVisual(course.title);
  const isFree = !course.price || course.price === 0;

  return (
    <div className="group overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md hover:shadow-violet-500/10">
      {/* Thumbnail */}
      <div className={`relative h-44 ${bg} flex items-center justify-center overflow-hidden`}>
        {course.thumbnail ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={course.thumbnail}
            alt={course.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <span className="text-7xl drop-shadow-lg transition-transform duration-300 group-hover:scale-110">{icon}</span>
        )}
        {badge && (
          <span className="absolute top-4 left-4 rotate-[-10deg] rounded-md bg-red-600 px-3 py-1 text-xs font-bold text-white shadow">
            {badge}
          </span>
        )}
        {isFree && (
          <span className="absolute top-3 right-3 rounded-full bg-green-500 px-2.5 py-0.5 text-xs font-bold text-white shadow-md">
            FREE
          </span>
        )}
        <span className="absolute bottom-3 left-3 rounded-full bg-black/35 px-2.5 py-0.5 text-xs font-medium text-white backdrop-blur-sm">
          {course.categoryName}
        </span>
      </div>

      {/* Body */}
      <div className="p-4">
        <div className="mb-2.5 flex items-center justify-between gap-2">
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
            levelColors[course.level ?? ""] ?? levelColors["BEGINNER"]
          }`}>
            {levelLabel[course.level ?? ""] ?? course.level ?? ""}
          </span>
          <span className="text-sm font-bold text-violet-600 dark:text-violet-400">
            {isFree ? "ឥតគិតថ្លៃ" : `$${course.price}`}
          </span>
        </div>

        <h3 className="font-bold text-foreground leading-snug">{course.title}</h3>
        <p className="mt-1.5 text-sm text-muted-foreground line-clamp-2">{course.description}</p>

        {/* Meta row */}
        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <BookOpen className="h-3.5 w-3.5" />
            {course.totalLessons || 0} មេរៀន
          </span>
          <span className="flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            {(course.enrolledCount || 0).toLocaleString()}
          </span>
          <span className="flex items-center gap-1">
            <Eye className="h-3.5 w-3.5" />
            {(course.viewCount || 0).toLocaleString()}
          </span>
          {(course.avgRating ?? 0) > 0 && (
            <span className="flex items-center gap-1 text-amber-500">
              <Star className="h-3.5 w-3.5 fill-amber-400" />
              {(course.avgRating ?? 0).toFixed(1)}
            </span>
          )}
        </div>

        {/* CTA */}
        <Button
          asChild
          className="mt-4 w-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-sm shadow-violet-400/20 hover:from-violet-500 hover:to-indigo-500"
          size="sm"
        >
          <Link href={`/${course.slug}`}>
            {isFree ? "ចូលរៀនឥតគិតថ្លៃ" : "មើលវគ្គសិក្សា"}
          </Link>
        </Button>
      </div>
    </div>
  );
}
