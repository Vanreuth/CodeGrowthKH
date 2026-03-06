"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AlertTriangle, ChevronRight, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useFeaturedCourses } from "@/hooks/useCourses";
import { CourseCard } from "@/components/course/courseCard";
import type { CourseResponse } from "@/types/courseType";

export function FeaturedCoursesSection() {
  const { data, loading, error, refetch } = useFeaturedCourses({ page: 0, size: 60 });
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ទាំងអស់");

  const courses = useMemo<CourseResponse[]>(
    () => data?.content ?? [],
    [data]
  );

  const categories = useMemo(() => {
    const set = new Set<string>();
    for (const course of courses) {
      if (course.categoryName?.trim()) set.add(course.categoryName);
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
        (course.description ?? "").toLowerCase().includes(keyword) ||
        (course.categoryName ?? "").toLowerCase().includes(keyword);
      return matchCategory && matchKeyword;
    });
  }, [courses, query, selectedCategory]);

  return (
    <section className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
      <div className="mx-auto max-w-4xl text-center">
        <div className="mx-auto mb-4 h-1 w-28 rounded-full bg-gradient-to-r from-blue-600 to-indigo-500" />
        <h2 className="text-3xl font-black text-foreground md:text-5xl">
          វគ្គសិក្សាពេញនិយម
        </h2>
        <p className="mx-auto mt-3 max-w-3xl text-sm text-muted-foreground md:text-base">
          បង្ហាញតែវគ្គសិក្សា Featured ប៉ុណ្ណោះ
        </p>
      </div>

      <div className="mx-auto mt-8 max-w-7xl rounded-2xl border border-border/70 bg-card/80 p-4 shadow-sm backdrop-blur">
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="ស្វែងរកវគ្គសិក្សា..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-12 border-border bg-card pl-9"
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
                  : "border-border bg-card text-foreground hover:border-primary/50 hover:text-primary"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="overflow-hidden rounded-2xl border border-border bg-card">
              <div className="h-44 animate-pulse bg-muted" />
              <div className="p-5 space-y-3">
                <div className="h-4 w-20 rounded-full animate-pulse bg-muted" />
                <div className="h-6 w-full rounded-lg animate-pulse bg-muted" />
                <div className="h-4 w-full rounded animate-pulse bg-muted/70" />
                <div className="h-4 w-3/4 rounded animate-pulse bg-muted/70" />
                <div className="mt-1 flex gap-3">
                  <div className="h-3 w-20 rounded animate-pulse bg-muted/60" />
                  <div className="h-3 w-16 rounded animate-pulse bg-muted/60" />
                </div>
                <div className="h-9 w-full rounded-xl animate-pulse bg-muted" />
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && error && (
        <div className="mx-auto mt-10 max-w-3xl rounded-2xl border border-red-200 bg-red-50 p-6 text-center dark:border-red-500/30 dark:bg-red-500/10">
          <AlertTriangle className="mx-auto h-6 w-6 text-red-500" />
          <p className="mt-2 text-sm font-medium text-red-700 dark:text-red-300">
            {error ?? "មិនអាចទាញយកវគ្គសិក្សាពេញនិយមបានទេ។"}
          </p>
          <button
            type="button"
            onClick={() => void refetch()}
            className="mt-3 rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500"
          >
            សាកល្បងម្ដងទៀត
          </button>
        </div>
      )}

      {!loading && !error && filteredCourses.length > 0 && (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredCourses.slice(0, 6).map((course) => (
            <CourseCard key={course.id} course={course} badge="ពេញនិយម" />
          ))}
        </div>
      )}

      {!loading && !error && filteredCourses.length === 0 && (
        <div className="mt-10 rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          មិនមាន Featured Course ត្រូវនឹងពាក្យស្វែងរកទេ
        </div>
      )}

      <div className="mt-8 flex justify-center">
        <Link
          href="/courses"
          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-5 py-2.5 text-sm font-semibold text-foreground shadow-sm transition hover:bg-muted/50"
        >
          មើលវគ្គសិក្សាទាំងអស់
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}
