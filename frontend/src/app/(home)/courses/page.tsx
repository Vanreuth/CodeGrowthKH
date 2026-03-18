"use client";

import { useMemo, useState } from "react";
import { CourseFilterBar } from "@/components/course/CourseFilterBar";
import { CourseGrid } from "@/components/course/CourseGrid";
import { Button } from "@/components/ui/button";
import { useCategories } from "@/hooks/useCategories";
import { useCourses } from "@/hooks/useCourses";
import type { CourseLevel } from "@/types/courseType";
import SectionHeader from "@/components/section/SectionHeader";

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
    status: "PUBLISHED",
    search: query.trim() || undefined,
    level: selectedLevel === "All" ? undefined : selectedLevel,
    categoryId: selectedCategoryId,
    sortBy: "orderIndex",
    sortDir: "asc",
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

      <SectionHeader
        title="វគ្គសិក្សាទាំងអស់"
        highlight="ជ្រើសរើសវគ្គដែលសាកសមសម្រាប់អ្នក"
        description="បង្ហាញវគ្គវគ្គសិក្សាទាំងអស់យើងមានសម្រាប់អ្នកជ្រើសរើស"
      />

      <div className="space-y-6 mt-6">
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
