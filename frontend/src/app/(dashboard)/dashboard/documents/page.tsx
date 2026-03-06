"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	FileText,
	Search,
	MoreHorizontal,
	Download,
	Trash2,
	RefreshCw,
	AlertCircle,
	BookOpen,
	Loader2,
} from "lucide-react";
import {
	useAllCoursePdfs,
	useCoursePdfAdmin,
} from "@/hooks/useCoursesPdf";
import { pdfService } from "@/services/pdfService";
import type { CoursePdfExportResponse } from "@/types/coursePDFType";

// ─── helpers ──────────────────────────────────────────────────

function formatBytes(kb?: number): string {
	if (kb == null) return "—";
	if (kb < 1024) return `${kb} KB`;
	return `${(kb / 1024).toFixed(1)} MB`;
}

function formatDate(iso?: string): string {
	if (!iso) return "—";
	return new Date(iso).toLocaleDateString(undefined, {
		year: "numeric",
		month: "short",
		day: "numeric",
	});
}

// ─── level badge colour ────────────────────────────────────────

const levelVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
	BEGINNER: "secondary",
	INTERMEDIATE: "default",
	ADVANCED: "destructive",
};

// ─── row component ─────────────────────────────────────────────

function PdfRow({
	pdf,
	onDownload,
	onRegenerate,
	onDelete,
	isRegenerating,
	isDeleting,
}: {
	pdf: CoursePdfExportResponse;
	onDownload: (pdf: CoursePdfExportResponse) => void;
	onRegenerate: (courseId: number) => void;
	onDelete: (courseId: number) => void;
	isRegenerating: boolean;
	isDeleting: boolean;
}) {
	const fileUrl = pdf.fileUrl ?? pdf.pdfUrl;
	const level = pdf.level?.toUpperCase() ?? "";

	return (
		<div>
			<div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors">
				<div className="flex items-center gap-3 min-w-0">
					<div className="shrink-0 p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
						<FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
					</div>
					<div className="min-w-0">
						<p className="font-medium truncate">{pdf.pdfName ?? `${pdf.courseTitle}.pdf`}</p>
						<div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground mt-0.5">
							<span className="flex items-center gap-1">
								<BookOpen className="h-3.5 w-3.5" />
								{pdf.courseTitle}
							</span>
							<span>{formatBytes(pdf.pdfSizeKb)}</span>
							{pdf.totalPages != null && <span>{pdf.totalPages} pages</span>}
							{pdf.totalLessonsIncluded != null && (
								<span>{pdf.totalLessonsIncluded} lessons</span>
							)}
							<span className="flex items-center gap-1">
								<Download className="h-3.5 w-3.5" />
								{pdf.downloadCount ?? 0} downloads
							</span>
							<span>{formatDate(pdf.generatedAt ?? pdf.createdAt)}</span>
						</div>
					</div>
				</div>

				<div className="flex items-center gap-2 shrink-0 ml-4">
					{level && (
						<Badge variant={levelVariant[level] ?? "outline"} className="hidden sm:inline-flex text-xs">
							{level}
						</Badge>
					)}

					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="ghost" size="icon" disabled={isRegenerating || isDeleting}>
								{isRegenerating || isDeleting ? (
									<Loader2 className="h-4 w-4 animate-spin" />
								) : (
									<MoreHorizontal className="h-4 w-4" />
								)}
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DropdownMenuItem
								disabled={!fileUrl}
								onClick={() => onDownload(pdf)}
							>
								<Download className="mr-2 h-4 w-4" />
								Download
							</DropdownMenuItem>
							<DropdownMenuItem onClick={() => onRegenerate(pdf.courseId)}>
								<RefreshCw className="mr-2 h-4 w-4" />
								Regenerate
							</DropdownMenuItem>
							<DropdownMenuItem
								className="text-red-600 focus:text-red-600"
								onClick={() => onDelete(pdf.courseId)}
							>
								<Trash2 className="mr-2 h-4 w-4" />
								Delete
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</div>
			<Separator />
		</div>
	);
}

// ─── page ──────────────────────────────────────────────────────

export default function DocumentsPage() {
	const { data: pdfs, loading, error, refetch } = useAllCoursePdfs();
	const { generating, removing, generate, remove } = useCoursePdfAdmin();

	const [search, setSearch] = useState("");
	const [actionCourseId, setActionCourseId] = useState<number | null>(null);

	const filtered = useMemo(() => {
		if (!pdfs) return [];
		const q = search.toLowerCase();
		return pdfs.filter(
			(p) =>
				p.courseTitle.toLowerCase().includes(q) ||
				(p.pdfName ?? "").toLowerCase().includes(q)
		);
	}, [pdfs, search]);

	// stats
	const totalDownloads = pdfs?.reduce((s, p) => s + (p.downloadCount ?? 0), 0) ?? 0;
	const totalSize = pdfs?.reduce((s, p) => s + (p.pdfSizeKb ?? 0), 0) ?? 0;

	async function handleDownload(pdf: CoursePdfExportResponse) {
		const fileUrl = pdf.fileUrl ?? pdf.pdfUrl;
		if (!fileUrl) return;
		// increment counter then open
		await pdfService.incrementDownload(pdf.courseId).catch(() => null);
		window.open(fileUrl, "_blank", "noopener,noreferrer");
	}

	async function handleRegenerate(courseId: number) {
		setActionCourseId(courseId);
		try {
			await generate(courseId);
		} finally {
			setActionCourseId(null);
		}
	}

	async function handleDelete(courseId: number) {
		setActionCourseId(courseId);
		try {
			await remove(courseId);
		} finally {
			setActionCourseId(null);
		}
	}

	return (
		<div className="space-y-6">
			{/* header */}
			<div className="flex items-start justify-between gap-4">
				<div>
					<h1 className="text-3xl font-bold">Course PDFs</h1>
					<p className="text-muted-foreground mt-1">
						View, download, regenerate, and manage exported course PDFs.
					</p>
				</div>
				<Button variant="outline" size="sm" onClick={() => refetch()} disabled={loading}>
					<RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
					Refresh
				</Button>
			</div>

			{/* stats */}
			<div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
				<Card>
					<CardHeader className="pb-2 pt-4 px-4">
						<CardTitle className="text-sm font-medium text-muted-foreground">Total PDFs</CardTitle>
					</CardHeader>
					<CardContent className="px-4 pb-4">
						<p className="text-2xl font-bold">{pdfs?.length ?? "—"}</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="pb-2 pt-4 px-4">
						<CardTitle className="text-sm font-medium text-muted-foreground">Total Downloads</CardTitle>
					</CardHeader>
					<CardContent className="px-4 pb-4">
						<p className="text-2xl font-bold">{totalDownloads}</p>
					</CardContent>
				</Card>
				<Card className="col-span-2 sm:col-span-1">
					<CardHeader className="pb-2 pt-4 px-4">
						<CardTitle className="text-sm font-medium text-muted-foreground">Storage Used</CardTitle>
					</CardHeader>
					<CardContent className="px-4 pb-4">
						<p className="text-2xl font-bold">{formatBytes(totalSize)}</p>
					</CardContent>
				</Card>
			</div>

			{/* search */}
			<div className="relative max-w-sm">
				<Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
				<Input
					placeholder="Search by course or file name…"
					className="pl-10"
					value={search}
					onChange={(e) => setSearch(e.target.value)}
				/>
			</div>

			{/* list */}
			<Card>
				<CardContent className="p-6">
					{loading && (
						<div className="flex items-center justify-center py-16 gap-2 text-muted-foreground">
							<Loader2 className="h-5 w-5 animate-spin" />
							<span>Loading PDFs…</span>
						</div>
					)}

					{error && !loading && (
						<div className="flex items-center gap-2 text-destructive py-8 justify-center">
							<AlertCircle className="h-5 w-5" />
							<span>{error}</span>
						</div>
					)}

					{!loading && !error && filtered.length === 0 && (
						<div className="flex flex-col items-center gap-2 py-16 text-muted-foreground">
							<FileText className="h-10 w-10" />
							<p className="text-sm">
								{search ? "No PDFs match your search." : "No course PDFs generated yet."}
							</p>
						</div>
					)}

					{!loading && !error && filtered.length > 0 && (
						<div className="space-y-0">
							{filtered.map((pdf) => (
								<PdfRow
									key={pdf.courseId}
									pdf={pdf}
									onDownload={handleDownload}
									onRegenerate={handleRegenerate}
									onDelete={handleDelete}
									isRegenerating={generating && actionCourseId === pdf.courseId}
									isDeleting={removing && actionCourseId === pdf.courseId}
								/>
							))}
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
