"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { CategoryResponse } from "@/types/category";
import type { CourseResponse, CourseStatus, CourseLevel } from "@/types/courseType";
import { courseService } from "@/services/courseService";
import { categoryService } from "@/services/categoryService";
import { CourseFilterBar } from "@/components/course/CourseFilterBar";
import { CourseGrid } from "@/components/course/CourseGrid";
import { CourseGuidanceSection } from "@/components/course/CourseGuidanceSection";

export default function CoursesPage() {
	const [query, setQuery] = useState("");
	const [selectedLevel, setSelectedLevel] = useState<CourseLevel | "All">("All");
	const [selectedCategory, setSelectedCategory] = useState<string>("All");
	const [selectedCategoryId, setSelectedCategoryId] = useState<number | undefined>(undefined);
	const [selectedStatus, setSelectedStatus] = useState<CourseStatus | "All">("All");

	const [apiCourses, setApiCourses] = useState<CourseResponse[]>([]);
	const [apiCategories, setApiCategories] = useState<CategoryResponse[]>([]);
	const [loading, setLoading] = useState(true);
	const [apiError, setApiError] = useState(false);

	useEffect(() => {
		categoryService.getAll({ page: 0, size: 50 }).then((p) => {
			setApiCategories(p.content);
		}).catch(() => {});
	}, []);

	const fetchCourses = useCallback(() => {
		let cancelled = false;
		setLoading(true);
		courseService.getAll({
			page: 0,
			size: 50,
			...(selectedCategoryId !== undefined && { categoryId: selectedCategoryId }),
			...(selectedStatus !== "All" && { status: selectedStatus }),
			...(selectedLevel !== "All" && { level: selectedLevel }),
			...(query.trim() && { search: query.trim() }),
		})
			.then((coursesPage) => {
				if (!cancelled) {
					setApiCourses(coursesPage.content);
					setApiError(false);
				}
			})
			.catch(() => {
				if (!cancelled) {
					setApiError(true);
					setApiCourses([]);
				}
			})
			.finally(() => {
				if (!cancelled) setLoading(false);
			});
		return () => { cancelled = true; };
	}, [selectedCategoryId, selectedStatus, selectedLevel, query]);

	useEffect(() => {
		const cancel = fetchCourses();
		return cancel;
	}, [fetchCourses]);

	const categoryOptions = useMemo(
		() => [{ id: undefined as number | undefined, name: "All" }, ...apiCategories.map((c) => ({ id: c.id, name: c.name }))],
		[apiCategories]
	);

	const clearFilters = () => {
		setQuery("");
		setSelectedLevel("All");
		setSelectedCategory("All");
		setSelectedCategoryId(undefined);
		setSelectedStatus("All");
	};

	const hasActiveFilters =
		query.trim() !== "" || selectedLevel !== "All" || selectedCategory !== "All" || selectedStatus !== "All";

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
				totalCount={apiCourses.length}
				hasActiveFilters={hasActiveFilters}
				onClearFilters={clearFilters}
				isLiveApi={!apiError && !loading}
				isApiError={apiError}
			/>

			{/* ── Course Grid ── */}
			<CourseGrid
				courses={apiCourses}
				loading={loading}
				onClearFilters={clearFilters}
			/>

			{/* ── Guidance ── */}
			<CourseGuidanceSection />
		</div>
	);
}
