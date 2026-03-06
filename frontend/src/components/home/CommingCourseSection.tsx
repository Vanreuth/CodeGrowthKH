"use client";

import Link from "next/link";
import { useMemo } from "react";
import { CalendarDays, Clock3 } from "lucide-react";
import { useComingSoonCourses } from "@/hooks/useCourses";
import { getCourseVisual } from "@/components/course/courseCard";
import type { CourseResponse } from "@/types/courseType";

type ComingCourse = {
  id: number;
  slug: string;
  title: string;
  description: string;
  categoryName: string;
  launchDate: string | null;
  thumbnail: string | null;
};

const demoCourses: ComingCourse[] = [
  {
    id: 10001,
    slug: "spring-boot-mastery",
    title: "ស៊ូរ៉ា Spring Boot Mastery",
    description: "ត្រៀមរៀន REST API, Security, JPA និង Deployment ជាភាសាខ្មែរ។",
    categoryName: "Backend",
    launchDate: null,
    thumbnail: null,
  },
  {
    id: 10002,
    slug: "mongodb-for-beginners",
    title: "មូលដ្ឋាន MongoDB",
    description: "ស្គាល់ Schema Design, Query និង Aggregation សម្រាប់ Project ពិត។",
    categoryName: "Database",
    launchDate: null,
    thumbnail: null,
  },
  {
    id: 10003,
    slug: "bootstrap-ui-fast",
    title: "Bootstrap UI Fast Track",
    description: "បង្កើត Responsive UI ឆាប់ និងស្អាតសម្រាប់ Web App។",
    categoryName: "Frontend",
    launchDate: null,
    thumbnail: null,
  },
];

function toComingCourse(course: CourseResponse): ComingCourse {
  return {
    id: course.id,
    slug: course.slug,
    title: course.title,
    description: course.description ?? "",
    categoryName: course.categoryName ?? "ទូទៅ",
    launchDate: course.launchDate ?? null,
    thumbnail: course.thumbnail ?? null,
  };
}

function formatKhDate(value?: string | null): string {
  if (!value) return "នឹងបង្ហាញឆាប់ៗ";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "នឹងបង្ហាញឆាប់ៗ";
  return new Intl.DateTimeFormat("km-KH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(d);
}

export function CommingCourseSection() {
  const { data, loading, error } = useComingSoonCourses({ page: 0, size: 6 });

  const visibleCourses = useMemo(() => {
    const apiCourses = data?.content.map(toComingCourse) ?? [];
    return apiCourses.length > 0 ? apiCourses : demoCourses;
  }, [data]);

  return (
    <section className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-foreground md:text-3xl">
            វគ្គសិក្សា Coming Soon
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            វគ្គដែលនឹងបើកឆាប់ៗ ដើម្បីអ្នកត្រៀមផ្លូវសិក្សាមុន
          </p>
        </div>
        <Link
          href="/courses"
          className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground hover:bg-muted/50 transition-colors"
        >
          មើលទាំងអស់
        </Link>
      </div>

      {loading && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="overflow-hidden rounded-2xl border border-border bg-card">
              <div className="h-40 animate-pulse bg-muted" />
              <div className="p-5 space-y-3">
                <div className="h-6 w-3/4 rounded-lg animate-pulse bg-muted" />
                <div className="h-4 w-full rounded animate-pulse bg-muted/70" />
                <div className="h-4 w-5/6 rounded animate-pulse bg-muted/70" />
                <div className="h-8 w-44 rounded-lg animate-pulse bg-muted" />
                <div className="h-9 w-full rounded-xl animate-pulse bg-muted" />
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {visibleCourses.map((course) => (
            <article
              key={course.id}
              className="group overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              <div className={`relative h-40 ${getCourseVisual(course.title).bg} flex items-center justify-center overflow-hidden`}>
                {course.thumbnail ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="h-full w-full object-cover opacity-85"
                  />
                ) : (
                  <span className="text-6xl drop-shadow-lg">{getCourseVisual(course.title).icon}</span>
                )}
                <span className="absolute top-4 left-4 rotate-[-10deg] rounded-md bg-red-600 px-3 py-1 text-xs font-bold text-white shadow">
                  មកដល់ឆាប់ៗ
                </span>
                <span className="absolute bottom-3 left-3 rounded-full bg-black/45 px-2.5 py-0.5 text-xs text-white">
                  {course.categoryName}
                </span>
              </div>

              <div className="p-5">
                <h3 className="line-clamp-1 text-xl font-bold text-foreground">
                  {course.title}
                </h3>
                <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                  {course.description}
                </p>

                <div className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-700 dark:bg-amber-500/15 dark:text-amber-300">
                  <CalendarDays className="h-3.5 w-3.5" />
                  បើកវគ្គ៖ {formatKhDate(course.launchDate)}
                </div>

                <div className="mt-4 inline-flex w-full items-center justify-center gap-1 rounded-xl bg-muted px-3 py-2 text-sm font-semibold text-muted-foreground">
                  <Clock3 className="h-4 w-4" />
                  រង់ចាំបើកវគ្គ
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {!loading && error && (
        <p className="mt-4 text-center text-xs text-muted-foreground">
          កំពុងបង្ហាញ Demo Coming Soon (API មិនទាន់រួចរាល់)
        </p>
      )}
    </section>
  );
}
