"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Download,
  Eye,
  FileText,
  Loader2,
  Search,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { CoursePdfExportResponse } from "@/types/apiType";
import { pdfService } from "@/services/pdfService";
import { toast } from "sonner";

type BusyAction = "loading" | "generating" | "downloading" | "viewing";

const levelOptions = ["All", "BEGINNER", "INTERMEDIATE", "ADVANCED", "OTHER"] as const;

const levelLabels: Record<(typeof levelOptions)[number], string> = {
  All: "ទាំងអស់",
  BEGINNER: "ចាប់ផ្តើម",
  INTERMEDIATE: "មធ្យម",
  ADVANCED: "កម្រិតខ្ពស់",
  OTHER: "ផ្សេងទៀត",
};

const levelClasses: Record<string, string> = {
  BEGINNER: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  INTERMEDIATE: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  ADVANCED: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300",
  OTHER: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
};

function getCourseVisual(title: string): { bg: string; icon: string } {
  const t = title.toLowerCase();
  if (t.includes("html")) return { bg: "from-orange-500 via-rose-500 to-pink-500", icon: "🌐" };
  if (t.includes("css")) return { bg: "from-blue-500 via-cyan-500 to-sky-500", icon: "🎨" };
  if (t.includes("javascript") || t.includes("js")) return { bg: "from-amber-400 via-yellow-400 to-orange-400", icon: "⚡" };
  if (t.includes("python")) return { bg: "from-blue-700 via-blue-500 to-yellow-500", icon: "🐍" };
  if (t.includes("java") || t.includes("spring")) return { bg: "from-green-600 via-emerald-500 to-teal-500", icon: "🍃" };
  if (t.includes("c++") || t.includes("cpp") || t.includes("c programming")) {
    return { bg: "from-blue-800 via-indigo-700 to-blue-500", icon: "💠" };
  }
  return { bg: "from-indigo-600 via-violet-600 to-purple-600", icon: "📘" };
}

function formatBytes(bytes = 0) {
  if (bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  let value = bytes;
  let index = 0;
  while (value >= 1024 && index < units.length - 1) {
    value /= 1024;
    index += 1;
  }
  return `${value.toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
}

function toErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

function normalizeLevel(level?: string | null): (typeof levelOptions)[number] {
  if (!level) return "OTHER";
  if (level === "BEGINNER" || level === "INTERMEDIATE" || level === "ADVANCED") return level;
  return "OTHER";
}

export default function CourseDownloadPdfPage() {
  const [rows, setRows] = useState<CoursePdfExportResponse[]>([]);
  const [loadingRows, setLoadingRows] = useState(true);
  const [query, setQuery] = useState("");
  const [selectedLevel, setSelectedLevel] = useState<(typeof levelOptions)[number]>("All");
  const [busyByCourse, setBusyByCourse] = useState<Record<number, BusyAction | undefined>>({});

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

  const loadRows = useCallback(async () => {
    setLoadingRows(true);
    try {
      const data = await pdfService.getAll();
      setRows(data);
    } catch (error) {
      toast.error(toErrorMessage(error, "មិនអាចផ្ទុកបញ្ជី Course PDF"));
      setRows([]);
    } finally {
      setLoadingRows(false);
    }
  }, []);

  useEffect(() => {
    void loadRows();
  }, [loadRows]);

  const filteredRows = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    return rows.filter((row) => {
      const level = normalizeLevel(row.level);
      const matchesLevel = selectedLevel === "All" || level === selectedLevel;
      const matchesQuery =
        keyword.length === 0 ||
        row.courseTitle.toLowerCase().includes(keyword);
      return matchesLevel && matchesQuery;
    });
  }, [rows, query, selectedLevel]);

  const setBusy = useCallback((courseId: number, action?: BusyAction) => {
    setBusyByCourse((prev) => {
      const next = { ...prev };
      if (!action) {
        delete next[courseId];
        return next;
      }
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
      if (!downloadUrl) {
        toast.error("មិនមាន URL សម្រាប់ទាញយក PDF");
        return;
      }
      if (!(row.pdfUrl ?? row.fileUrl)) {
        toast.success("បានបង្កើត PDF រួចរាល់, កំពុងទាញយក...");
      }
      window.open(downloadUrl, "_blank", "noopener,noreferrer");

      try {
        const updated = await pdfService.incrementDownload(courseId);
        mergeRow(updated);
      } catch {
        // Download already opened.
      }
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
      if (!viewUrl) {
        toast.error("មិនមាន URL សម្រាប់មើល PDF");
        return;
      }
      window.open(viewUrl, "_blank", "noopener,noreferrer");
    } catch (error) {
      toast.error(toErrorMessage(error, `មិនអាចមើល PDF សម្រាប់ ${row.courseTitle}`));
    } finally {
      setBusy(courseId);
    }
  }, [setBusy, ensurePdf]);

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-3xl border border-white/60 bg-white/70 px-6 py-10 shadow-xl shadow-slate-200/50 backdrop-blur-md dark:border-white/10 dark:bg-slate-900/60 dark:shadow-black/20 md:px-10">
        <div className="pointer-events-none absolute -top-24 left-1/3 h-44 w-44 rounded-full bg-blue-300/30 blur-3xl dark:bg-blue-700/20" />
        <div className="pointer-events-none absolute -bottom-28 right-0 h-56 w-56 rounded-full bg-indigo-300/30 blur-3xl dark:bg-indigo-700/20" />

        <p className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
          <Sparkles className="h-3.5 w-3.5" />
          Download Book
        </p>
        <h1 className="mt-4 text-3xl font-extrabold leading-tight text-slate-900 dark:text-white md:text-5xl">
          សៀវភៅមេរៀន
          <span className="ml-2 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-indigo-400">
            PDF
          </span>
        </h1>
        <p className="mt-3 max-w-3xl text-sm text-slate-600 dark:text-slate-400 md:text-base">
          ទាញយកសៀវភៅមេរៀនសម្រាប់វគ្គសិក្សានីមួយៗ ជាមួយប៊ូតុងតែម្តង។ ប្រសិនបើមិនទាន់មាន PDF ប្រព័ន្ធនឹងបង្កើតអោយស្វ័យប្រវត្តិ។
        </p>
      </section>

      <section className="space-y-4 rounded-2xl border border-white/60 bg-white/80 p-4 shadow-sm backdrop-blur-sm dark:border-white/10 dark:bg-slate-900/60">
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="ស្វែងរកឈ្មោះវគ្គ ឬប្រភេទ..."
            className="h-11 border-slate-200 bg-white pl-9 dark:border-white/15 dark:bg-slate-900/70"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {levelOptions.map((level) => (
            <button
              key={level}
              type="button"
              onClick={() => setSelectedLevel(level)}
              className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition ${
                selectedLevel === level
                  ? "border-blue-500 bg-blue-600 text-white shadow-sm shadow-blue-400/30"
                  : "border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 dark:border-white/15 dark:bg-slate-900/70 dark:text-slate-300 dark:hover:border-blue-500/40 dark:hover:bg-blue-900/30"
              }`}
            >
              {levelLabels[level]}
            </button>
          ))}
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          បង្ហាញ {filteredRows.length} វគ្គសិក្សា
        </p>
      </section>

      {loadingRows ? (
        <div className="flex items-center justify-center py-20 text-slate-500">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="ml-2">កំពុងផ្ទុកវគ្គសិក្សា...</span>
        </div>
      ) : filteredRows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white/70 p-10 text-center text-sm text-slate-600 dark:border-white/15 dark:bg-slate-900/50 dark:text-slate-400">
          មិនមានវគ្គសិក្សាត្រូវនឹងការស្វែងរកទេ។
        </div>
      ) : (
        <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {filteredRows.map((row) => {
            const visual = getCourseVisual(row.courseTitle);
            const busyAction = busyByCourse[row.courseId];
            const busy = Boolean(busyAction);
            const hasPdf = Boolean(row.pdfUrl ?? row.fileUrl);
            const level = normalizeLevel(row.level);

            return (
              <article
                key={row.courseId}
                className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl dark:border-white/10 dark:bg-slate-900/70"
              >
                <div className={`relative h-44 bg-gradient-to-br ${visual.bg} p-4`}>
                  {row.thumbnail ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={row.thumbnail} alt={row.courseTitle} className="h-full w-full rounded-xl object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center rounded-xl bg-black/10 text-7xl backdrop-blur-[1px]">
                      {visual.icon}
                    </div>
                  )}

                  <div className="absolute top-3 right-3 rounded-full bg-black/30 px-2.5 py-0.5 text-xs font-medium text-white backdrop-blur-sm">
                    #{row.courseId}
                  </div>
                </div>

                <div className="space-y-3 p-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${levelClasses[level] ?? levelClasses.OTHER}`}>
                      {levelLabels[level]}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      Course ID: {row.courseId}
                    </span>
                  </div>

                  <h3 className="line-clamp-1 text-lg font-bold text-slate-900 dark:text-white">{row.courseTitle}</h3>

                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-2.5 text-xs dark:border-white/10 dark:bg-slate-800/50">
                    {hasPdf ? (
                      <div className="space-y-1 text-slate-600 dark:text-slate-300">
                        <p className="inline-flex items-center gap-1">
                          <FileText className="h-3.5 w-3.5 text-blue-500" />
                          {row.pdfName || "course.pdf"}
                        </p>
                        <p>ទំហំ: {formatBytes((row.pdfSizeKb || 0) * 1024)}</p>
                        <p>ទាញយក: {row.downloadCount || 0} ដង</p>
                      </div>
                    ) : (
                      <p className="text-slate-500 dark:text-slate-400">មិនទាន់មាន PDF សម្រាប់វគ្គនេះ</p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => void handleDownload(row)}
                      disabled={busy}
                      className="h-10 flex-1 bg-gradient-to-r from-emerald-600 to-green-500 text-white hover:from-emerald-500 hover:to-green-500"
                    >
                      {busyAction === "downloading" || busyAction === "generating" || busyAction === "viewing" ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Download className="mr-2 h-4 w-4" />
                      )}
                      {hasPdf ? "ទាញយក PDF" : "បង្កើត + ទាញយក"}
                    </Button>

                    <Button
                      size="icon"
                      variant="outline"
                      className="h-10 w-12"
                      onClick={() => void handleView(row)}
                      disabled={busy}
                    >
                        <Eye className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <button
                      type="button"
                      onClick={() => void handleGenerate(row.courseId)}
                      disabled={busy}
                      className="text-slate-500 hover:text-blue-600 disabled:opacity-50 dark:text-slate-400 dark:hover:text-blue-300"
                    >
                      បង្កើត/អាប់ដេត PDF
                    </button>
                    <button
                      type="button"
                      onClick={() => window.open(row.pdfUrl ?? row.fileUrl ?? '', "_blank", "noopener,noreferrer")}
                      disabled={busy || !(row.pdfUrl ?? row.fileUrl)}
                      className="text-slate-500 hover:text-indigo-600 disabled:opacity-50 dark:text-slate-400 dark:hover:text-indigo-300"
                    >
                      មើល PDF
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      )}
    </div>
  );
}
