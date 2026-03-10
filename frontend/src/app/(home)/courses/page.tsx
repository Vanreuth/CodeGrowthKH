"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { CourseLevel } from "@/types/courseType";
import { useCourses } from "@/hooks/useCourses";
import { useCategories } from "@/hooks/useCategories";
import { CourseFilterBar } from "@/components/course/CourseFilterBar";
import { CourseGrid } from "@/components/course/CourseGrid";
import { CourseGuidanceSection } from "@/components/course/CourseGuidanceSection";
import { Button } from "@/components/ui/button";

const PAGE_SIZE = 6;

export default function CoursesPage() {
	const [query, setQuery] = useState("");
	const [selectedLevel, setSelectedLevel] = useState<CourseLevel | "All">("All");
	const [selectedCategory, setSelectedCategory] = useState<string>("All");
	const [selectedCategoryId, setSelectedCategoryId] = useState<number | undefined>(undefined);

	// ── Data via hooks ────────────────────────────────────────
	const {
		data: coursesPage,
		loading,
		page,
		setPage,
	} = useCourses({
		size    : PAGE_SIZE,
		status  : "PUBLISHED",
		level   : selectedLevel !== "All" ? selectedLevel : undefined,
		categoryId: selectedCategoryId,
		search  : query.trim() || undefined,
	});

	const { data: categoriesPage } = useCategories({ page: 0, size: 50 });

	const courses      = coursesPage?.content       ?? [];
	const totalPages   = coursesPage?.totalPages     ?? 0;
	const totalElements= coursesPage?.totalElements  ?? 0;
	const apiCategories= categoriesPage?.content     ?? [];

	// ── Derived ───────────────────────────────────────────────
	const categoryOptions = useMemo(
		() => [{ id: undefined as number | undefined, name: "All" }, ...apiCategories.map((c) => ({ id: c.id, name: c.name }))],
		[apiCategories]
	);

	const clearFilters = () => {
		setQuery("");
		setSelectedLevel("All");
		setSelectedCategory("All");
		setSelectedCategoryId(undefined);
	};

	const hasActiveFilters =
		query.trim() !== "" || selectedLevel !== "All" || selectedCategory !== "All";

	const pageNumbers = useMemo(() => {
		const delta = 2;
		const range: number[] = [];
		for (let i = Math.max(0, page - delta); i <= Math.min(totalPages - 1, page + delta); i++) {
			range.push(i);
		}
		return range;
	}, [page, totalPages]);

	return (
		<div className="space-y-8 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 mt-10">
			{/* ── Page Header ── */}
			<div className="mx-auto max-w-4xl text-center">
				<div className="mx-auto mb-4 h-1 w-28 rounded-full bg-gradient-to-r from-blue-600 to-indigo-500" />
				<h2 className="text-3xl font-black text-slate-900 dark:text-white md:text-5xl">
					ថ្នាក់សិក្សា<span className="bg-gradient-to-r from-violet-600 to-pink-500 bg-clip-text text-transparent">របស់យើង</span>
				</h2>
				<p className="mx-auto mt-3 max-w-3xl text-sm text-slate-600 dark:text-slate-400 md:text-base">
					សូមជ្រើសរើសថ្នាក់រៀនដែលអ្នកចង់រៀន ហើយចាប់ផ្តើមដំណើរការនៃការសិក្សារបស់អ្នក។
				</p>
			</div>

			{/* ── Search + Filters ── */}
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
				totalCount={totalElements}
				hasActiveFilters={hasActiveFilters}
				onClearFilters={clearFilters}
				isLiveApi={!loading}
				isApiError={false}
			/>

			{/* ── Course Grid ── */}
			<CourseGrid
				courses={courses}
				loading={loading}
				onClearFilters={clearFilters}
			/>

			{/* ── Pagination ── */}
			{!loading && totalPages > 1 && (
				<div className="flex flex-col items-center gap-4 py-6">
					<p className="text-sm text-muted-foreground">
						ទំព័រទី <span className="font-semibold text-foreground">{page + 1}</span> នៃ{" "}
						<span className="font-semibold text-foreground">{totalPages}</span>
						{" "}· សរុប <span className="font-semibold text-foreground">{totalElements}</span> វគ្គ
					</p>

					<div className="flex items-center gap-1.5">
						<Button
							variant="outline"
							size="icon"
							onClick={() => setPage((p) => Math.max(0, p - 1))}
							disabled={page === 0}
							className="h-10 w-10 rounded-full border-violet-300 dark:border-violet-700 hover:bg-violet-50 dark:hover:bg-violet-900/30 disabled:opacity-40"
						>
							<ChevronLeft className="h-4 w-4" />
						</Button>

						{pageNumbers[0] > 0 && (
							<>
								<Button variant="outline" size="sm" className="h-10 w-10 rounded-full text-sm border-violet-300 dark:border-violet-700 hover:bg-violet-50 dark:hover:bg-violet-900/30" onClick={() => setPage(0)}>1</Button>
								{pageNumbers[0] > 1 && <span className="px-1 text-muted-foreground select-none">…</span>}
							</>
						)}

						{pageNumbers.map((p) => (
							<Button
								key={p}
								size="sm"
								onClick={() => setPage(p)}
								className={
									p === page
										? "h-10 w-10 rounded-full text-sm bg-gradient-to-br from-violet-600 to-indigo-600 text-white border-0 shadow-md shadow-violet-500/30 hover:from-violet-700 hover:to-indigo-700"
										: "h-10 w-10 rounded-full text-sm border border-violet-300 dark:border-violet-700 bg-transparent hover:bg-violet-50 dark:hover:bg-violet-900/30"
								}
							>
								{p + 1}
							</Button>
						))}

						{pageNumbers[pageNumbers.length - 1] < totalPages - 1 && (
							<>
								{pageNumbers[pageNumbers.length - 1] < totalPages - 2 && <span className="px-1 text-muted-foreground select-none">…</span>}
								<Button variant="outline" size="sm" className="h-10 w-10 rounded-full text-sm border-violet-300 dark:border-violet-700 hover:bg-violet-50 dark:hover:bg-violet-900/30" onClick={() => setPage(totalPages - 1)}>{totalPages}</Button>
							</>
						)}

						<Button
							variant="outline"
							size="icon"
							onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
							disabled={page >= totalPages - 1}
							className="h-10 w-10 rounded-full border-violet-300 dark:border-violet-700 hover:bg-violet-50 dark:hover:bg-violet-900/30 disabled:opacity-40"
						>
							<ChevronRight className="h-4 w-4" />
						</Button>
					</div>
				</div>
			)}

			{/* ── Guidance ── */}
			<CourseGuidanceSection />
		</div>
	);
}
