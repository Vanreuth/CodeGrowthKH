"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { BookOpen, Eye, Loader2, Search, Star, Users, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type {CategoryResponse } from "@/types/category";
import type { CourseResponse } from "@/types/courseType";
import { courseService } from "@/services/courseService";
import { categoryService } from "@/services/categoryService";
// ─── Level helpers ────────────────────────────────────────────────────────────

const levelColors: Record<string, string> = {
	BEGINNER: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
	Beginner: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
	INTERMEDIATE: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
	Intermediate: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
	ADVANCED: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
	Advanced: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
};

// Map course title keywords to gradient + icon for visual thumbnails
function getCourseVisual(title: string): { bg: string; icon: string } {
	const t = title.toLowerCase();
	if (t.includes("html")) return { bg: "bg-gradient-to-br from-orange-500 via-red-400 to-pink-500", icon: "🌐" };
	if (t.includes("css")) return { bg: "bg-gradient-to-br from-blue-500 via-cyan-400 to-teal-400", icon: "🎨" };
	if (t.includes("javascript") || t.includes("js")) return { bg: "bg-gradient-to-br from-yellow-400 via-amber-400 to-orange-400", icon: "⚡" };
	if (t.includes("next")) return { bg: "bg-gradient-to-br from-slate-700 via-slate-600 to-slate-500", icon: "▲" };
	if (t.includes("react")) return { bg: "bg-gradient-to-br from-sky-500 via-blue-400 to-indigo-500", icon: "⚛️" };
	if (t.includes("spring") || t.includes("java")) return { bg: "bg-gradient-to-br from-green-500 via-emerald-400 to-teal-500", icon: "🍃" };
	if (t.includes("docker") || t.includes("devops")) return { bg: "bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-500", icon: "🐳" };
	if (t.includes("python")) return { bg: "bg-gradient-to-br from-yellow-500 via-blue-500 to-blue-600", icon: "🐍" };
	if (t.includes("sql") || t.includes("data")) return { bg: "bg-gradient-to-br from-purple-500 via-violet-400 to-indigo-500", icon: "📊" };
	return { bg: "bg-gradient-to-br from-violet-500 via-purple-400 to-indigo-500", icon: "📚" };
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function CoursesPage() {
	const [query, setQuery] = useState("");
	const [selectedLevel, setSelectedLevel] = useState("All");
	const [selectedCategory, setSelectedCategory] = useState("All");

	// API state
	const [apiCourses, setApiCourses] = useState<CourseResponse[]>([]);
	const [apiCategories, setApiCategories] = useState<CategoryResponse[]>([]);
	const [loading, setLoading] = useState(true);
	const [apiError, setApiError] = useState(false);

	useEffect(() => {
		let cancelled = false;
		Promise.all([
			courseService.getAll({ page: 0, size: 50 }),
			categoryService.getAll({ page: 0, size: 50 }),
		])
			.then(([coursesPage, categoriesPage]) => {
				if (!cancelled) {
					setApiCourses(coursesPage.content);
					setApiCategories(categoriesPage.content);
					setApiError(false);
				}
			})
			.catch(() => {
				if (!cancelled) {
					setApiError(true);
					setApiCourses([]);
					setApiCategories([]);
				}
			})
			.finally(() => {
				if (!cancelled) setLoading(false);
			});
		return () => { cancelled = true; };
	}, []);

	// Derive category names for filter pills
	const categoryNames = useMemo(() => {
		return ["All", ...apiCategories.map((c) => c.name)];
	}, [apiCategories]);

	// Derive level options from courses
	const levels = ["All", "BEGINNER", "INTERMEDIATE", "ADVANCED"];

	// Courses from backend
	const allCourses = useMemo(() => {
		return apiCourses;
	}, [apiCourses]);

	const filteredCourses = useMemo(() => {
		const keyword = query.trim().toLowerCase();
		return allCourses.filter((course) => {
			const matchesLevel = selectedLevel === "All" || (course.level ?? "").toUpperCase() === selectedLevel;
			const matchesCategory = selectedCategory === "All" || course.categoryName === selectedCategory;
			const matchesQuery =
				keyword.length === 0 ||
				course.title.toLowerCase().includes(keyword) ||
				(course.description ?? "").toLowerCase().includes(keyword);
			return matchesLevel && matchesCategory && matchesQuery;
		});
	}, [allCourses, selectedLevel, selectedCategory, query]);

	const clearFilters = () => {
		setQuery("");
		setSelectedLevel("All");
		setSelectedCategory("All");
	};

	const hasActiveFilters = query.trim() !== "" || selectedLevel !== "All" || selectedCategory !== "All";

	return (
		<div className="space-y-8 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 mt-10">
			{/* ── Page Header ── */}
			<section className="relative overflow-hidden rounded-3xl border border-white/60 bg-white/60 px-6 py-10 shadow-lg shadow-violet-100/40 backdrop-blur-sm dark:border-white/10 dark:bg-slate-900/50 dark:shadow-black/20 md:px-10">
				<div className="pointer-events-none absolute -top-12 -right-12 h-40 w-40 rounded-full bg-violet-300/25 blur-2xl dark:bg-violet-700/15" />
				<p className="text-xs font-semibold uppercase tracking-widest text-violet-600 dark:text-violet-400">
					Course Catalog
				</p>
				<h1 className="mt-2 text-3xl font-extrabold text-slate-900 dark:text-white md:text-4xl">
					វគ្គសិក្សា{" "}
					<span className="bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent dark:from-violet-400 dark:to-indigo-400">
						ជាភាសាខ្មែរ
					</span>
				</h1>
				<p className="mt-3 max-w-2xl text-slate-600 dark:text-slate-400">
					វគ្គសិក្សាទាំងអស់ ឥតគិតថ្លៃ — HTML, CSS, JavaScript, React, Next.js, Spring Boot, Docker ជាភាសាខ្មែរ
				</p>
				<div className="mt-4 flex flex-wrap gap-2">
					{categoryNames.slice(1).map((cat) => (
						<button
							key={cat}
							type="button"
							onClick={() => setSelectedCategory(cat)}
							className="rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-medium text-violet-700 transition hover:bg-violet-100 dark:border-violet-700/30 dark:bg-violet-900/30 dark:text-violet-300 dark:hover:bg-violet-900/50"
						>
							{cat}
						</button>
					))}
				</div>
			</section>

			{/* ── Search + Filters ── */}
			<section className="rounded-2xl border border-white/60 bg-white/70 p-4 shadow-sm shadow-violet-100/30 backdrop-blur-sm dark:border-white/10 dark:bg-slate-900/50 dark:shadow-black/20 md:p-5">
				<div className="flex gap-3">
					<div className="relative flex-1">
						<Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
						<Input
							placeholder="ស្វែងរកវគ្គសិក្សា…"
							value={query}
							onChange={(e) => setQuery(e.target.value)}
							className="border-slate-200 bg-white pl-9 focus-visible:ring-violet-400 dark:border-white/15 dark:bg-slate-900/70"
						/>
					</div>
					{hasActiveFilters && (
						<Button
							variant="outline"
							size="icon"
							onClick={clearFilters}
							className="shrink-0 border-slate-200 bg-white hover:bg-red-50 hover:text-red-600 dark:border-white/15 dark:bg-slate-900/70"
						>
							<X className="h-4 w-4" />
						</Button>
					)}
				</div>

				{/* Level filter */}
				<div className="mt-4 flex flex-wrap gap-2">
					{levels.map((item) => (
						<button
							key={item}
							type="button"
							onClick={() => setSelectedLevel(item)}
							className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition ${
								selectedLevel === item
									? "border-violet-500 bg-violet-600 text-white shadow-sm shadow-violet-400/30"
									: "border-slate-200 bg-white text-slate-600 hover:border-violet-300 hover:bg-violet-50 hover:text-violet-700 dark:border-white/15 dark:bg-slate-900/70 dark:text-slate-300 dark:hover:border-violet-500/40 dark:hover:bg-violet-900/30"
							}`}
						>
							{item === "All" ? "ទាំងអស់" : item === "BEGINNER" ? "ចាប់ផ្តើម" : item === "INTERMEDIATE" ? "មធ្យម" : "ខ្ពស់"}
						</button>
					))}
				</div>

				{/* Category filter */}
				<div className="mt-2 flex flex-wrap gap-2">
					{categoryNames.map((item) => (
						<button
							key={item}
							type="button"
							onClick={() => setSelectedCategory(item)}
							className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition ${
								selectedCategory === item
									? "border-indigo-500 bg-indigo-600 text-white shadow-sm shadow-indigo-400/30"
									: "border-slate-200 bg-white text-slate-600 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 dark:border-white/15 dark:bg-slate-900/70 dark:text-slate-300 dark:hover:border-indigo-500/40 dark:hover:bg-indigo-900/30"
							}`}
						>
							{item === "All" ? "ប្រភេទទាំងអស់" : item}
						</button>
					))}
				</div>

				<div className="mt-3 flex items-center justify-between">
					<p className="text-xs text-slate-500 dark:text-slate-400">
						បង្ហាញ <span className="font-semibold text-violet-600 dark:text-violet-400">{filteredCourses.length}</span> វគ្គ
					</p>
					{!apiError && !loading && apiCourses && (
						<span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-medium text-green-700 dark:bg-green-900/30 dark:text-green-300">
							● Live from API
						</span>
					)}
					{apiError && (
						<span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
							⚠ Static data (API offline)
						</span>
					)}
				</div>
			</section>

			{/* ── Course Grid ── */}
			{loading ? (
				<div className="flex items-center justify-center py-20">
					<Loader2 className="h-8 w-8 animate-spin text-violet-500" />
					<span className="ml-3 text-slate-500">កំពុងផ្ទុក…</span>
				</div>
			) : (
				<section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
					{filteredCourses.length > 0 ? (
						filteredCourses.map((course) => {
							const { bg, icon } = getCourseVisual(course.title);
							const isFree = !course.price || course.price === 0;
							return (
								<div
									key={course.id}
									className="group overflow-hidden rounded-2xl border border-white/60 bg-white/80 shadow-md shadow-violet-100/30 transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-violet-200/40 dark:border-white/10 dark:bg-slate-900/60 dark:shadow-black/20 dark:hover:shadow-violet-900/20"
								>
									{/* Thumbnail */}
									<div className={`relative h-44 ${bg} flex items-center justify-center`}>
										{course.thumbnail ? (
											// eslint-disable-next-line @next/next/no-img-element
											<img
												src={course.thumbnail}
												alt={course.title}
												className="h-full w-full object-cover"
											/>
										) : (
											<span className="text-7xl drop-shadow-lg">{icon}</span>
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
									<span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${levelColors[course.level ?? ""] ?? levelColors["BEGINNER"]}`}>
										{course.level === "BEGINNER" ? "ចាប់ផ្តើម" : course.level === "INTERMEDIATE" ? "មធ្យម" : course.level === "ADVANCED" ? "ខ្ពស់" : (course.level ?? "")}
											</span>
											<span className="text-sm font-bold text-violet-700 dark:text-violet-300">
												{isFree ? "ឥតគិតថ្លៃ" : `$${course.price}`}
											</span>
										</div>

										<h3 className="font-bold text-slate-900 dark:text-white leading-snug">{course.title}</h3>
										<p className="mt-1.5 text-sm text-slate-600 dark:text-slate-400 line-clamp-2">{course.description}</p>

										{/* Meta */}
										<div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
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

										{/* View Course button */}
										<Button
											asChild
											className="mt-4 w-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-sm shadow-violet-400/20 hover:from-violet-500 hover:to-indigo-500"
											size="sm"
										>
											<Link href={`/courses/${course.slug}`}>
												{isFree ? "ចូលរៀនឥតគិតថ្លៃ" : "មើលវគ្គសិក្សា"}
											</Link>
										</Button>
									</div>
								</div>
							);
						})
					) : (
						<div className="col-span-full rounded-2xl border border-dashed border-violet-300 bg-violet-50/50 p-10 text-center dark:border-violet-700/30 dark:bg-violet-900/10">
							<p className="text-lg font-semibold text-slate-700 dark:text-slate-300">មិនមានវគ្គសិក្សាត្រូវនឹងការស្វែងរក</p>
							<p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
								សូមលុបការត្រង ឬស្វែងរកជាមួយពាក្យផ្សេង
							</p>
							<Button
								variant="outline"
								className="mt-4 border-violet-300 text-violet-700 hover:bg-violet-50 dark:border-violet-700/40 dark:text-violet-300"
								onClick={clearFilters}
							>
								លុបការត្រង
							</Button>
						</div>
					)}
				</section>
			)}

			{/* ── Guidance cards ── */}
			<section className="grid gap-5 md:grid-cols-2">
				<div className="rounded-2xl border border-white/60 bg-white/70 p-5 shadow-sm shadow-violet-100/30 backdrop-blur-sm dark:border-white/10 dark:bg-slate-900/50">
					<h3 className="font-bold text-slate-900 dark:text-white">របៀបជ្រើសរើសវគ្គសិក្សា</h3>
					<p className="mt-1 text-sm text-slate-500 dark:text-slate-400">ដំបូន្មានសម្រាប់ការចាប់ផ្តើម</p>
					<div className="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-400">
						{[
							["ជ្រើសរើសកម្រិតដែលសមស្រប", "ចាប់ផ្តើមពី Beginner ប្រសិនបើអ្នកមិនទាន់ស្គាល់ programming"],
							["ផ្តោតលើ Track មួយ", "ប្រើ 4 សប្តាហ៍ក្នុង category មួយ មុននឹងប្តូរ"],
							["Build ខណៈពេលរៀន", "រៀបចំ project ជារៀងរាល់សប្តាហ៍"],
						].map(([title, desc], i) => (
							<div key={i} className="flex gap-3">
								<span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-violet-100 text-xs font-bold text-violet-700 dark:bg-violet-900/40 dark:text-violet-300">
									{i + 1}
								</span>
								<div>
									<p className="font-semibold text-slate-800 dark:text-slate-200">{title}</p>
									<p>{desc}</p>
								</div>
							</div>
						))}
					</div>
				</div>

				<div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-600 p-5 text-white shadow-lg shadow-violet-400/30">
					<div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.15),_transparent_60%)]" />
					<div className="relative">
						<h3 className="font-bold text-lg">ត្រូវការជំនួយ?</h3>
						<p className="mt-1 text-sm text-violet-200">ទទួលបានផ្លូវសិក្សាដែលសមស្របនឹងគោលដៅរបស់អ្នក</p>
						<Button
							asChild
							className="mt-4 bg-white text-violet-700 hover:bg-violet-50 shadow-md"
						>
							<Link href="/contact">ទំនាក់ទំនងអ្នកណែនាំ</Link>
						</Button>
					</div>
				</div>
			</section>
		</div>
	);
}
