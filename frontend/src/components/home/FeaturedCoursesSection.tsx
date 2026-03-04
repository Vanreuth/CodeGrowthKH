"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  BookOpen,
  ChevronRight,
  Eye,
  Loader2,
  Search,
  Users,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { fetchCourses } from "@/lib/course/course";
import type { CourseDto } from "@/lib/course/types";

type HomeCourse = {
  id: number;
  slug: string;
  title: string;
  description: string;
  categoryName: string;
  levelLabel: string;
  isFree: boolean;
  thumbnail: string | null;
  totalLessons: number;
  enrolledCount: number;
  viewCount: number;
};

const levelBadge: Record<string, string> = {
  "ចាប់ផ្តើម":
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  "មធ្យម":
    "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  "កម្រិតខ្ពស់":
    "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
};

function toLevelLabel(level?: string): string {
  if (!level) return "ចាប់ផ្តើម";
  const normalized = level.toUpperCase();
  if (normalized === "INTERMEDIATE") return "មធ្យម";
  if (normalized === "ADVANCED") return "កម្រិតខ្ពស់";
  return "ចាប់ផ្តើម";
}

function getCourseVisual(title: string): { bg: string; icon: string } {
  const t = title.toLowerCase();
  if (t.includes("html"))
    return { bg: "from-orange-500 via-red-400 to-pink-500", icon: "🌐" };
  if (t.includes("css"))
    return { bg: "from-blue-500 via-cyan-400 to-teal-400", icon: "🎨" };
  if (t.includes("javascript") || t.includes("js"))
    return { bg: "from-yellow-400 via-amber-400 to-orange-400", icon: "⚡" };
  if (t.includes("next"))
    return { bg: "from-slate-700 via-slate-600 to-slate-500", icon: "▲" };
  if (t.includes("react"))
    return { bg: "from-sky-500 via-blue-400 to-indigo-500", icon: "⚛️" };
  if (t.includes("spring") || t.includes("java"))
    return { bg: "from-green-500 via-emerald-400 to-teal-500", icon: "🍃" };
  if (t.includes("docker") || t.includes("devops"))
    return { bg: "from-blue-600 via-blue-500 to-cyan-500", icon: "🐳" };
  if (t.includes("python"))
    return { bg: "from-yellow-500 via-blue-500 to-blue-600", icon: "🐍" };
  if (t.includes("git"))
    return { bg: "from-orange-500 via-red-500 to-orange-700", icon: "🧩" };
  return { bg: "from-violet-500 via-purple-400 to-indigo-500", icon: "📚" };
}

function formatKmNumber(value: number): string {
  return new Intl.NumberFormat("km-KH").format(value);
}

function mapCourse(course: CourseDto): HomeCourse {
  return {
    id: course.id,
    slug: course.slug,
    title: course.title,
    description: course.description ?? "",
    categoryName: course.categoryName ?? "ទូទៅ",
    levelLabel: toLevelLabel(course.level),
    isFree: course.isFree || course.price === 0,
    thumbnail: course.thumbnail,
    totalLessons: course.totalLessons ?? 0,
    enrolledCount: course.enrolledCount ?? 0,
    viewCount: course.viewCount ?? 0,
  };
}

export function FeaturedCoursesSection() {
  const [courses, setCourses] = useState<HomeCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ទាំងអស់");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const page = await fetchCourses({
        page: 0,
        size: 60,
        sortBy: "createdAt",
        sortDir: "desc",
      });

      const featuredOnly = page.content
        .filter((course) => Boolean(course.isFeatured))
        .map(mapCourse);

      setCourses(featuredOnly);
    } catch {
      setCourses([]);
      setError("មិនអាចទាញយកវគ្គសិក្សាពេញនិយមបានទេ។");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    for (const course of courses) {
      if (course.categoryName.trim()) set.add(course.categoryName);
    }
    return ["ទាំងអស់", ...[...set].sort((a, b) => a.localeCompare(b, "km"))];
  }, [courses]);

  const filteredCourses = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    return courses.filter((course) => {
      const matchCategory =
        selectedCategory === "ទាំងអស់" || selectedCategory === course.categoryName;
      const matchKeyword =
        keyword.length === 0 ||
        course.title.toLowerCase().includes(keyword) ||
        course.description.toLowerCase().includes(keyword) ||
        course.categoryName.toLowerCase().includes(keyword);
      return matchCategory && matchKeyword;
    });
  }, [courses, query, selectedCategory]);

  return (
    <section className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
      <div className="mx-auto max-w-4xl text-center">
        <div className="mx-auto mb-4 h-1 w-28 rounded-full bg-gradient-to-r from-blue-600 to-indigo-500" />
        <h2 className="text-3xl font-black text-slate-900 dark:text-white md:text-5xl">
          វគ្គសិក្សាពេញនិយម
        </h2>
        <p className="mx-auto mt-3 max-w-3xl text-sm text-slate-600 dark:text-slate-400 md:text-base">
          បង្ហាញតែវគ្គសិក្សា Featured ប៉ុណ្ណោះ
        </p>
      </div>

      <div className="mx-auto mt-8 max-w-7xl rounded-2xl border border-slate-200/70 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-white/10 dark:bg-slate-900/60">
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="ស្វែងរកវគ្គសិក្សា..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-12 border-slate-200 bg-white pl-9 dark:border-white/15 dark:bg-slate-900/80"
          />
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setSelectedCategory(category)}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                selectedCategory === category
                  ? "border-blue-600 bg-blue-600 text-white"
                  : "border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:text-blue-700 dark:border-white/15 dark:bg-slate-900 dark:text-slate-300"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <div className="mt-10 flex items-center justify-center gap-2 text-slate-500">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>កំពុងផ្ទុកវគ្គសិក្សា...</span>
        </div>
      )}

      {!loading && error && (
        <div className="mx-auto mt-10 max-w-3xl rounded-2xl border border-red-200 bg-red-50 p-6 text-center dark:border-red-500/30 dark:bg-red-500/10">
          <AlertTriangle className="mx-auto h-6 w-6 text-red-500" />
          <p className="mt-2 text-sm font-medium text-red-700 dark:text-red-300">
            {error}
          </p>
          <button
            type="button"
            onClick={() => void loadData()}
            className="mt-3 rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500"
          >
            សាកល្បងម្ដងទៀត
          </button>
        </div>
      )}

      {!loading && !error && filteredCourses.length > 0 && (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredCourses.slice(0, 6).map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      )}

      {!loading && !error && filteredCourses.length === 0 && (
        <div className="mt-10 rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500 dark:border-white/15 dark:text-slate-400">
          មិនមាន Featured Course ត្រូវនឹងពាក្យស្វែងរកទេ
        </div>
      )}

      <div className="mt-8 flex justify-center">
        <Link
          href="/courses"
          className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-white/15 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          មើលវគ្គសិក្សាទាំងអស់
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}

function CourseCard({ course }: { course: HomeCourse }) {
  const visual = getCourseVisual(course.title);

  return (
    <Link
      href={`/courses/${course.slug}`}
      className="group overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-white/10 dark:bg-slate-900/70"
    >
      <div
        className={`relative flex h-44 items-center justify-center bg-gradient-to-br ${visual.bg} p-6`}
      >
        {course.thumbnail ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={course.thumbnail}
            alt={course.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="text-6xl drop-shadow-lg">{visual.icon}</span>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />

        <span className="absolute top-4 left-4 rotate-[-10deg] rounded-md bg-red-600 px-3 py-1 text-[11px] font-bold tracking-wide text-white shadow-lg">
          ពេញនិយម
        </span>

        {course.isFree && (
          <span className="absolute right-3 top-3 rounded-full bg-emerald-500 px-2.5 py-1 text-xs font-semibold text-white">
            FREE
          </span>
        )}

        <span className="absolute bottom-3 left-3 rounded-full bg-black/35 px-2.5 py-0.5 text-xs font-medium text-white backdrop-blur-sm">
          {course.categoryName}
        </span>
      </div>

      <div className="p-5">
        <span
          className={`mb-2 inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${
            levelBadge[course.levelLabel] ?? levelBadge["ចាប់ផ្តើម"]
          }`}
        >
          {course.levelLabel}
        </span>

        <h4 className="mb-1.5 line-clamp-1 text-2xl font-bold text-slate-900 transition-colors group-hover:text-blue-700 dark:text-white dark:group-hover:text-blue-300">
          {course.title}
        </h4>
        <p className="line-clamp-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
          {course.description}
        </p>

        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
          <span className="inline-flex items-center gap-1">
            <BookOpen className="h-3.5 w-3.5" />
            {formatKmNumber(course.totalLessons)} មេរៀន
          </span>
          <span className="inline-flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            {formatKmNumber(course.enrolledCount)}
          </span>
          <span className="inline-flex items-center gap-1">
            <Eye className="h-3.5 w-3.5" />
            {formatKmNumber(course.viewCount)}
          </span>
        </div>

        <div className="mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-3 py-2 text-sm font-semibold text-white transition group-hover:from-blue-500 group-hover:to-indigo-500">
          ចូលរៀនឥឡូវ
          <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </div>
      </div>
    </Link>
  );
}
