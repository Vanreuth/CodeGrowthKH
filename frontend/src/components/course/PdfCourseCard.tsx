import { Download, Eye, FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CoursePdfExportResponse } from "@/types/coursePDFType";

export type BusyAction = "loading" | "generating" | "downloading" | "viewing";

export const levelOptions = ["All", "BEGINNER", "INTERMEDIATE", "ADVANCED", "OTHER"] as const;
export type LevelOption = (typeof levelOptions)[number];

export const levelLabels: Record<LevelOption, string> = {
  All: "ទាំងអស់",
  BEGINNER: "ចាប់ផ្តើម",
  INTERMEDIATE: "មធ្យម",
  ADVANCED: "កម្រិតខ្ពស់",
  OTHER: "ផ្សេងទៀត",
};

const levelClasses: Record<string, string> = {
  BEGINNER: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  INTERMEDIATE: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
  ADVANCED: "bg-rose-500/10 text-rose-700 dark:text-rose-300",
  OTHER: "bg-muted text-muted-foreground",
};

export function normalizeLevel(level?: string | null): LevelOption {
  if (level === "BEGINNER" || level === "INTERMEDIATE" || level === "ADVANCED") return level;
  return "OTHER";
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

interface PdfCourseCardProps {
  row: CoursePdfExportResponse;
  busyAction: BusyAction | undefined;
  onDownload: (row: CoursePdfExportResponse) => void;
  onView: (row: CoursePdfExportResponse) => void;
  onGenerate: (courseId: number) => void;
}

export function PdfCourseCard({
                                row,
                                busyAction,
                                onDownload,
                                onView,
                                onGenerate,
                              }: PdfCourseCardProps) {
  const busy = Boolean(busyAction);
  const hasPdf = Boolean(row.pdfUrl ?? row.fileUrl);
  const level = normalizeLevel(row.level);

  return (
      <article className="group overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl">

        {/* Thumbnail from API */}
        {row.thumbnail && (
            <div className="relative h-44 overflow-hidden">
              <img
                  src={row.thumbnail}
                  alt={row.courseTitle}
                  className="h-full w-full object-cover"
              />

              <div className="absolute top-3 right-3 rounded-full bg-black/30 px-2.5 py-0.5 text-xs font-medium text-white backdrop-blur-sm">
                #{row.courseId}
              </div>
            </div>
        )}

        {/* Body */}
        <div className="space-y-3 p-4">
          <div className="flex items-center justify-between gap-2">
          <span
              className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                  levelClasses[level] ?? levelClasses.OTHER
              }`}
          >
            {levelLabels[level]}
          </span>

            <span className="text-xs text-muted-foreground">
            Course ID: {row.courseId}
          </span>
          </div>

          <h3 className="line-clamp-1 text-lg font-bold text-foreground">
            {row.courseTitle}
          </h3>

          <div className="rounded-lg border border-border bg-muted/40 p-2.5 text-xs">
            {hasPdf ? (
                <div className="space-y-1 text-muted-foreground">
                  <p className="inline-flex items-center gap-1">
                    <FileText className="h-3.5 w-3.5 text-blue-500" />
                    {row.pdfName || "course.pdf"}
                  </p>
                  <p>ទំហំ: {formatBytes((row.pdfSizeKb || 0) * 1024)}</p>
                  <p>ទាញយក: {row.downloadCount || 0} ដង</p>
                </div>
            ) : (
                <p className="text-muted-foreground">
                  មិនទាន់មាន PDF សម្រាប់វគ្គនេះ
                </p>
            )}
          </div>

          <div className="flex gap-2">
            <Button
                onClick={() => onDownload(row)}
                disabled={busy}
                className="h-10 flex-1 bg-gradient-to-r from-emerald-600 to-green-500 text-white hover:from-emerald-500 hover:to-green-500"
            >
              {busyAction === "downloading" ||
              busyAction === "generating" ||
              busyAction === "viewing" ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                  <Download className="mr-2 h-4 w-4" />
              )}

              {hasPdf ? "ទាញយក PDF" : "ទាញយក"}
            </Button>

            <Button
                size="icon"
                variant="outline"
                className="h-10 w-12"
                onClick={() => onView(row)}
                disabled={busy}
            >
              <Eye className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center justify-between text-xs">
            <button
                type="button"
                onClick={() => onGenerate(row.courseId)}
                disabled={busy}
                className="text-muted-foreground hover:text-blue-600 disabled:opacity-50 dark:hover:text-blue-300"
            >
              បង្កើត/អាប់ដេត PDF
            </button>

            <button
                type="button"
                onClick={() =>
                    window.open(row.pdfUrl ?? row.fileUrl ?? "", "_blank", "noopener,noreferrer")
                }
                disabled={busy || !(row.pdfUrl ?? row.fileUrl)}
                className="text-muted-foreground hover:text-indigo-600 disabled:opacity-50 dark:hover:text-indigo-300"
            >
              មើល PDF
            </button>
          </div>
        </div>
      </article>
  );
}