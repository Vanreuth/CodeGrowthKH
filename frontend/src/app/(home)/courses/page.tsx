"use client";

import { useMemo, useState } from "react";
import { BookOpen } from "lucide-react";
import { CourseFilterBar } from "@/components/course/CourseFilterBar";
import { CourseGrid } from "@/components/course/CourseGrid";
import { Button } from "@/components/ui/button";
import { useCategories } from "@/hooks/useCategories";
import { useCourses } from "@/hooks/useCourses";
import type { CourseLevel } from "@/types/courseType";

const PAGE_SIZE = 12;

export default function CoursesPage() {
  const [query, setQuery] = useState("");
  const [selectedLevel, setSelectedLevel] = useState<CourseLevel | "All">("All");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | undefined>(undefined);

  const {
    data: coursesPage,
    loading,
    error: coursesError,
    page,
    setPage,
  } = useCourses({
    size: PAGE_SIZE,
    search: query.trim() || undefined,
    level: selectedLevel === "All" ? undefined : selectedLevel,
    categoryId: selectedCategoryId,
    sortBy: "createdAt",
    sortDir: "desc",
  });

  const { data: categoriesPage } = useCategories({ size: 100, sortBy: "orderIndex", sortDir: "asc" });

  const courses = coursesPage?.content ?? [];
  const totalCount = coursesPage?.totalElements ?? courses.length;
  const totalPages = coursesPage?.totalPages ?? 0;

  const categoryOptions = useMemo(() => {
    const apiCategories = categoriesPage?.content ?? [];
    return [{ id: undefined, name: "All" }, ...apiCategories.map((c) => ({ id: c.id, name: c.name }))];
  }, [categoriesPage]);

  const hasActiveFilters =
    query.trim().length > 0 || selectedLevel !== "All" || selectedCategoryId !== undefined;

  const clearFilters = () => {
    setQuery("");
    setSelectedLevel("All");
    setSelectedCategory("All");
    setSelectedCategoryId(undefined);
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-6 rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-[#2f8d46]/10 p-2.5 text-[#2f8d46]">
            <BookOpen className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">វគ្គសិក្សាទាំងអស់</h1>
            <p className="text-sm text-muted-foreground">ជ្រើសរើសវគ្គដែលសាកសមសម្រាប់អ្នក</p>
          </div>
        </div>
      </header>

      <div className="space-y-6">
        <CourseFilterBar
          query={query}
          onQueryChange={setQuery}
          selectedLevel={selectedLevel}
          onLevelChange={setSelectedLevel}
          selectedCategory={selectedCategory}
          selectedCategoryId={selectedCategoryId}
          onCategoryChange={(name, id) => {
            setSelectedCategory(name);
            setSelectedCategoryId(id);
          }}
          categoryOptions={categoryOptions}
          totalCount={totalCount}
          hasActiveFilters={hasActiveFilters}
          onClearFilters={clearFilters}
          isLiveApi={true}
          isApiError={Boolean(coursesError)}
        />

        <CourseGrid courses={courses} loading={loading} onClearFilters={clearFilters} />

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 pt-2">
            <Button variant="outline" onClick={() => setPage(Math.max(page - 1, 0))} disabled={page <= 0 || loading}>
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {page + 1} / {totalPages}
            </span>
            <Button
              variant="outline"
              onClick={() => setPage(Math.min(page + 1, totalPages - 1))}
              disabled={page >= totalPages - 1 || loading}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}