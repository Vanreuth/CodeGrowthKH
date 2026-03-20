"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import type { CoursePdfExportResponse } from "@/types/coursePDFType";
import { courseService } from "@/lib/api/courseService";
import { pdfService } from "@/lib/api/pdfService";
import { useCategories } from "@/hooks/useCategories";
import { toast } from "sonner";
import { PdfCourseCard, type BusyAction, type LevelOption, normalizeLevel } from "@/components/course/PdfCourseCard";
import { PdfFilterBar } from "@/components/course/PdfFilterBar";

function toErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

export default function CourseDownloadPdfPage() {
  const [rows, setRows] = useState<CoursePdfExportResponse[]>([]);
  const [loadingRows, setLoadingRows] = useState(true);
  const [query, setQuery] = useState("");
  const [selectedLevel, setSelectedLevel] = useState<LevelOption>("All");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | undefined>(undefined);
  const [categoryCourseIds, setCategoryCourseIds] = useState<Set<number> | null>(null);
  const [busyByCourse, setBusyByCourse] = useState<Record<number, BusyAction | undefined>>({});
  const [debouncedQuery, setDebouncedQuery] = useState("");

  const { data: categoriesPage } = useCategories({ size: 100, sortBy: "orderIndex", sortDir: "asc" });

  const mergeRow = useCallback((row: CoursePdfExportResponse) => {
    setRows((prev) => prev.map((item) => (item.courseId === row.courseId ? { ...item, ...row } : item)));
  }, []);

  const ensurePdf = useCallback(async (courseId: number) => {
    const existing = rows.find((item) => item.courseId === courseId);
    if (existing?.pdfUrl ?? existing?.fileUrl) return existing;
    const generated = await pdfService.generate(courseId);
    mergeRow(generated);
    return generated;
  }, [rows, mergeRow]);

  const loadRows = useCallback(async (params?: { search?: string; level?: LevelOption }) => {
    setLoadingRows(true);
    try {
      const data = await pdfService.getAll({
        search: params?.search || undefined,
        status: "PUBLISHED",
        level: params?.level && params.level !== "All" && params.level !== "OTHER"
          ? params.level
          : undefined,
        categoryId: selectedCategoryId,
      });
      setRows(data);
    } catch (error) {
      toast.error(toErrorMessage(error, "មិនអាចផ្ទុកបញ្ជី Course PDF"));
      setRows([]);
    } finally {
      setLoadingRows(false);
    }
  }, [selectedCategoryId]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, 250);

    return () => window.clearTimeout(timeoutId);
  }, [query]);

  useEffect(() => {
    void loadRows({
      search: debouncedQuery || undefined,
      level: selectedLevel,
    });
  }, [debouncedQuery, selectedLevel, selectedCategoryId, loadRows]);

  useEffect(() => {
    let cancelled = false;

    async function loadCategoryCourseIds() {
      if (selectedCategoryId === undefined) {
        setCategoryCourseIds(null);
        return;
      }

      try {
        const page = await courseService.getAll({
          page: 0,
          size: 500,
          sortBy: "orderIndex",
          sortDir: "asc",
          status: "PUBLISHED",
          categoryId: selectedCategoryId,
        });

        if (cancelled) return;
        setCategoryCourseIds(new Set(page.content.map((course) => course.id)));
      } catch {
        if (cancelled) return;
        setCategoryCourseIds(null);
      }
    }

    void loadCategoryCourseIds();

    return () => {
      cancelled = true;
    };
  }, [selectedCategoryId]);

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      const level = normalizeLevel(row.level);
      const matchesLevel =
        selectedLevel === "All"
          ? true
          : selectedLevel === "OTHER"
            ? level === "OTHER"
            : level === selectedLevel;

      const matchesCategory =
        selectedCategoryId === undefined
          ? true
          : categoryCourseIds
            ? categoryCourseIds.has(row.courseId)
            : (row.categoryIds ?? []).includes(selectedCategoryId);

      return matchesLevel && matchesCategory;
    });
  }, [rows, selectedLevel, selectedCategoryId, categoryCourseIds]);

  const categoryOptions = useMemo(() => {
    const apiCategories = categoriesPage?.content ?? [];
    return [{ id: undefined, name: "All" }, ...apiCategories.map((category) => ({
      id: category.id,
      name: category.name,
    }))];
  }, [categoriesPage]);

  const hasActiveFilters =
    query.trim().length > 0 || selectedLevel !== "All" || selectedCategoryId !== undefined;

  const clearFilters = useCallback(() => {
    setQuery("");
    setSelectedLevel("All");
    setSelectedCategory("All");
    setSelectedCategoryId(undefined);
  }, []);

  const setBusy = useCallback((courseId: number, action?: BusyAction) => {
    setBusyByCourse((prev) => {
      const next = { ...prev };
      if (!action) { delete next[courseId]; return next; }
      next[courseId] = action;
      return next;
    });
  }, []);

  const handleGenerate = useCallback(async (courseId: number) => {
    setBusy(courseId, "generating");
    try {
      const generated = await pdfService.generate(courseId);
      mergeRow(generated);
      toast.success("បានបង្កើត PDF ជោគជ័យ");
    } catch (error) {
      toast.error(toErrorMessage(error, "បរាជ័យក្នុងការបង្កើត PDF"));
    } finally {
      setBusy(courseId);
    }
  }, [setBusy, mergeRow]);

  const handleDownload = useCallback(async (row: CoursePdfExportResponse) => {
    const courseId = row.courseId;
    setBusy(courseId, "downloading");
    try {
      const current = await ensurePdf(courseId);
      const downloadUrl = current?.pdfUrl ?? current?.fileUrl;
      if (!downloadUrl) { toast.error("មិនមាន URL សម្រាប់ទាញយក PDF"); return; }
      if (!(row.pdfUrl ?? row.fileUrl)) toast.success("បានបង្កើត PDF រួចរាល់, កំពុងទាញយក...");
      window.open(downloadUrl, "_blank", "noopener,noreferrer");
      try {
        const updated = await pdfService.incrementDownload(courseId);
        mergeRow(updated);
      } catch { /* Download already opened. */ }
    } catch (error) {
      toast.error(toErrorMessage(error, `មិនអាចទាញយក PDF សម្រាប់ ${row.courseTitle}`));
    } finally {
      setBusy(courseId);
    }
  }, [setBusy, ensurePdf, mergeRow]);

  const handleView = useCallback(async (row: CoursePdfExportResponse) => {
    const courseId = row.courseId;
    setBusy(courseId, "viewing");
    try {
      const current = await ensurePdf(courseId);
      const viewUrl = current?.pdfUrl ?? current?.fileUrl;
      if (!viewUrl) { toast.error("មិនមាន URL សម្រាប់មើល PDF"); return; }
      window.open(viewUrl, "_blank", "noopener,noreferrer");
    } catch (error) {
      toast.error(toErrorMessage(error, `មិនអាចមើល PDF សម្រាប់ ${row.courseTitle}`));
    } finally {
      setBusy(courseId);
    }
  }, [setBusy, ensurePdf]);

  return (
    <div className="space-y-8 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 mt-10">
      {/* ── Hero ── */}
      <div className="mx-auto max-w-4xl text-center">
				<div className="mx-auto mb-4 h-1 w-28 rounded-full bg-gradient-to-r from-blue-600 to-indigo-500" />
				<h2 className="text-3xl font-black text-slate-900 dark:text-white md:text-5xl">
					 ទាញយកសៀវភៅមេរៀន<span className="bg-gradient-to-r from-violet-600 to-pink-500 bg-clip-text text-transparent">PDFរបស់យើង</span>
				</h2>
				<p className="mx-auto mt-3 max-w-3xl text-sm text-slate-600 dark:text-slate-400 md:text-base">
				 ទាញយកសៀវភៅមេរៀនសម្រាប់វគ្គសិក្សានីមួយៗ ជាមួយប៊ូតុងតែម្តង។
				</p>
			</div>

      {/* ── Filters ── */}
      <PdfFilterBar
        query={query}
        onQueryChange={setQuery}
        selectedLevel={selectedLevel}
        onLevelChange={setSelectedLevel}
        selectedCategory={selectedCategory}
        onCategoryChange={(name, id) => {
          setSelectedCategory(name);
          setSelectedCategoryId(id);
        }}
        categoryOptions={categoryOptions}
        totalCount={filteredRows.length}
        hasActiveFilters={hasActiveFilters}
        onClearFilters={clearFilters}
      />
      {/* ── Grid ── */}
      {loadingRows ? (
        <div className="flex items-center justify-center py-20 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="ml-2">កំពុងផ្ទុកវគ្គសិក្សា...</span>
        </div>
      ) : filteredRows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card/60 p-10 text-center text-sm text-muted-foreground">
          {hasActiveFilters
            ? "មិនមានវគ្គសិក្សាត្រូវនឹង filter ដែលអ្នកបានជ្រើសទេ។"
            : "មិនទាន់មានវគ្គសិក្សាសម្រាប់ទាញយក PDF នៅឡើយទេ។"}
        </div>
      ) : (
        <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {filteredRows.map((row) => (
            <PdfCourseCard
              key={row.courseId}
              row={row}
              busyAction={busyByCourse[row.courseId]}
              onDownload={handleDownload}
              onView={handleView}
              onGenerate={handleGenerate}
            />
          ))}
        </section>
      )}
    </div>
  );
}
