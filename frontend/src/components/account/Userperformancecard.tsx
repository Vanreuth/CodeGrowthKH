"use client";

import { useMemo, useState } from "react";
import {
  CheckCircle2,
  Clock,
  FileText,
  ScrollText,
  CalendarDays,
  ShieldCheck,
  TrendingUp,
  TrendingDown,
  Minus,
  Flame,
  BookOpen,
  Zap,
  Star,
  AlertTriangle,
  Info,
  Target,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";
import type { LessonProgressResponse } from "@/types/lessonProgressType";
import {
  buildActivityHeatmap,
  buildReadingTimeChartData,
  buildWeekComparison,
  countCompletedToday,
  formatDurationCompactKh,
  formatDurationKh,
} from "./progress-utils";

// ─────────────────────────────────────────────────────────────
//  Types
// ─────────────────────────────────────────────────────────────

interface UserShape {
  createdAt?: string;
  status?: string;
  roles?: string[];
  role?: string;
  loginAttempt?: number;
  login_attempt?: number;
}

export interface UserPerformanceCardProps {
  user: UserShape;
  progressData: LessonProgressResponse[] | null;
  loading: boolean;
}

// ─────────────────────────────────────────────────────────────
//  Helpers
// ─────────────────────────────────────────────────────────────

function daysBetween(a: Date, b: Date) {
  return Math.round(Math.abs(b.getTime() - a.getTime()) / 86_400_000);
}

// ─────────────────────────────────────────────────────────────
//  Score engine
// ─────────────────────────────────────────────────────────────

interface Metric {
  key    : string;
  label  : string;
  value  : string;
  raw    : number;         // 0-100 normalised
  weight : number;         // weight in total score (all weights sum to 100)
  icon   : React.ReactNode;
  accent : string;
  bg     : string;
  status : "excellent" | "good" | "average" | "poor";
  tip    : string;
}

type Grade = "S" | "A" | "B" | "C" | "D" | "F";

interface PerformanceResult {
  totalScore   : number;
  grade        : Grade;
  gradeLabel   : string;
  gradeColor   : string;
  gradeBg      : string;
  gradeBorder  : string;
  summary      : string;
  metrics      : Metric[];
  // account health
  memberDays   : number;
  daysActive   : number;
  activityRate : number;   // daysActive / memberDays * 100
  currentStreak: number;
  longestStreak: number;
  isAccountActive: boolean;
  isAdmin      : boolean;
}

function computeStreaks(dates: Set<string>): { current: number; longest: number } {
  if (!dates.size) return { current: 0, longest: 0 };
  const sorted = [...dates].sort();
  let longest = 1, run = 1;
  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1]);
    const curr = new Date(sorted[i]);
    if (daysBetween(prev, curr) === 1) { run++; longest = Math.max(longest, run); }
    else run = 1;
  }

  // Current streak — count backwards from today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let current = 0;
  for (let i = sorted.length - 1; i >= 0; i--) {
    const d = new Date(sorted[i]);
    d.setHours(0, 0, 0, 0);
    const diff = daysBetween(d, today) - current;
    if (diff === 0) { current++; }
    else break;
  }

  return { current, longest };
}

function compute(
  data: LessonProgressResponse[],
  user: UserShape,
): PerformanceResult {
  const total     = data.length;
  const completed = data.filter((p) => p.completed);
  const pdfItems  = data.filter((p) => p.pdfDownloaded);

  // ── Metric 1 · Completion Rate  (weight 35) ───────────────
  const completionRate  = total > 0 ? completed.length / total : 0;
  const completionRaw   = Math.round(completionRate * 100);
  const completionTip   =
    completionRate >= 0.9 ? "ល្អបំផុត! បន្តបំពេញមេរៀន" :
    completionRate >= 0.6 ? "ល្អ — ព្យាយាមបំពេញឱ្យបាន 90%" :
    completionRate >= 0.3 ? "ត្រូវការការខិតខំ — បំពេញមេរៀនដែលបានចាប់ផ្តើម" :
                            "ចាប់ផ្តើមមេរៀន ហើយព្យាយាមបញ្ចប់វា!";

  // ── Metric 2 · Avg Read Time / lesson  (weight 30) ────────
  const totalReadSec = data.reduce((s, p) => s + (p.readTimeSeconds ?? 0), 0);
  const avgReadSec   = total > 0 ? totalReadSec / total : 0;
  const readRaw      =
    avgReadSec >= 300 ? 100 :
    avgReadSec >= 180 ? 78  :
    avgReadSec >= 90  ? 55  :
    avgReadSec >= 30  ? 30  :
    avgReadSec > 0    ? 12  : 0;
  const readTip =
    avgReadSec >= 300 ? "ពិតជាចំណាយពេលអានដោយយកចិត្តទុកដាក់!" :
    avgReadSec >= 180 ? "ល្អ — អ្នកអាន 3 នាទីក្នុងមួយមេរៀន" :
    avgReadSec >= 30  ? "ព្យាយាមចំណាយពេលច្រើនជាងនេះក្នុងការអានមេរៀន" :
                        "ចំណាយពេលអានមេរៀនឱ្យបានច្រើន ដើម្បីរៀនបានល្អ";

  // ── Metric 3 · Avg Scroll Depth on completed  (weight 20) ─
  const avgScroll =
    completed.length > 0
      ? completed.reduce((s, p) => s + (p.scrollPct ?? 0), 0) / completed.length
      : 0;
  const scrollRaw = Math.round(avgScroll);
  const scrollTip =
    avgScroll >= 90 ? "ល្អណាស់ — អ្នកអានដល់ចុងក្រោយ!" :
    avgScroll >= 70 ? "ល្អ — ព្យាយាមអានឱ្យដល់ 100%" :
    avgScroll >= 40 ? "អ្នកឈប់នៅកណ្ដាល — បន្តអានឱ្យបានដល់ចុង" :
                      "ព្យាយាមអានមេរៀនឱ្យបានគ្រប់";

  // ── Metric 4 · PDF Engagement  (weight 15) ────────────────
  const pdfRate  = total > 0 ? pdfItems.length / total : 0;
  const pdfRaw   = Math.round(pdfRate * 100);
  const pdfTip   =
    pdfRate >= 0.5 ? "ល្អណាស់ — អ្នកទាញ PDF ដើម្បីទុកអានបន្ត" :
    pdfRate > 0    ? "ល្អ — PDF ជួយអ្នករៀនខាងក្រៅ" :
                     "សាកល្បងទាញ PDF ដើម្បីអានបន្ថែម";

  // ── Weighted total ─────────────────────────────────────────
  const totalScore = Math.min(
    100,
    Math.round(
      completionRaw * 0.35 +
      readRaw       * 0.30 +
      scrollRaw     * 0.20 +
      pdfRaw        * 0.15,
    ),
  );

  // ── Grade ─────────────────────────────────────────────────
  const grade: Grade =
    totalScore >= 90 ? "S" :
    totalScore >= 80 ? "A" :
    totalScore >= 65 ? "B" :
    totalScore >= 50 ? "C" :
    totalScore >= 30 ? "D" : "F";

  type GradeMeta = { label: string; color: string; bg: string; border: string; summary: string };
  const gradeMap: Record<Grade, GradeMeta> = {
    S: { label: "ឆ្នើម",         color: "text-violet-600",  bg: "bg-violet-50 dark:bg-violet-950/30",  border: "border-violet-200 dark:border-violet-800", summary: "អ្នកជាអ្នករៀនដ៏ពូកែ! ការខិតខំប្រឹងប្រែងរបស់អ្នកគ្មានន័យ" },
    A: { label: "ល្អណាស់",       color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-950/30", border: "border-emerald-200 dark:border-emerald-800", summary: "ការខិតខំប្រឹងប្រែងរបស់អ្នកគ្រប់គ្រាន់ — បន្តទៅមុខ!" },
    B: { label: "ល្អ",            color: "text-blue-600",    bg: "bg-blue-50 dark:bg-blue-950/30",       border: "border-blue-200 dark:border-blue-800",       summary: "ល្អ! បន្តទម្លាប់ ហើយព្យាយាមបំពេញមេរៀនឱ្យបានច្រើន" },
    C: { label: "មធ្យម",          color: "text-amber-600",   bg: "bg-amber-50 dark:bg-amber-950/30",     border: "border-amber-200 dark:border-amber-800",     summary: "ការចូលរៀនល្អ ប៉ុន្តែត្រូវការការខិតខំបន្ថែមទៀត" },
    D: { label: "ត្រូវការកែ",     color: "text-orange-600",  bg: "bg-orange-50 dark:bg-orange-950/30",   border: "border-orange-200 dark:border-orange-800",   summary: "ចាប់ផ្តើមរៀនជារៀងរាល់ថ្ងៃ ទោះបែបណាក៏ចំណេញ" },
    F: { label: "ទើបចាប់ផ្តើម",  color: "text-rose-600",    bg: "bg-rose-50 dark:bg-rose-950/30",       border: "border-rose-200 dark:border-rose-800",       summary: "ចូររៀនមេរៀនដំបូង! ដំណើររយពាន់ ចាប់ផ្តើមពីក្រ" },
  };

  const g = gradeMap[grade];

  // ── Metric objects ─────────────────────────────────────────
  function status(v: number, t: [number, number, number]): Metric["status"] {
    return v >= t[0] ? "excellent" : v >= t[1] ? "good" : v >= t[2] ? "average" : "poor";
  }

  const metrics: Metric[] = [
    {
      key    : "completion",
      label  : "អត្រាបញ្ចប់",
      value  : `${completionRaw}%`,
      raw    : completionRaw,
      weight : 35,
      icon   : <CheckCircle2 className="h-4 w-4" />,
      accent : "text-emerald-600 dark:text-emerald-400",
      bg     : "bg-emerald-100 dark:bg-emerald-900/30",
      status : status(completionRaw, [80, 60, 30]),
      tip    : completionTip,
    },
    {
      key    : "readtime",
      label  : "ពេលវេលាអាន",
      value  : formatDurationCompactKh(avgReadSec),
      raw    : readRaw,
      weight : 30,
      icon   : <Clock className="h-4 w-4" />,
      accent : "text-blue-600 dark:text-blue-400",
      bg     : "bg-blue-100 dark:bg-blue-900/30",
      status : status(readRaw, [78, 55, 30]),
      tip    : readTip,
    },
    {
      key    : "scroll",
      label  : "ការអានស៊ីជម្រៅ",
      value  : `${Math.round(avgScroll)}%`,
      raw    : scrollRaw,
      weight : 20,
      icon   : <ScrollText className="h-4 w-4" />,
      accent : "text-violet-600 dark:text-violet-400",
      bg     : "bg-violet-100 dark:bg-violet-900/30",
      status : status(scrollRaw, [90, 70, 40]),
      tip    : scrollTip,
    },
    {
      key    : "pdf",
      label  : "ការប្រើ PDF",
      value  : `${pdfRaw}%`,
      raw    : pdfRaw,
      weight : 15,
      icon   : <FileText className="h-4 w-4" />,
      accent : "text-amber-600 dark:text-amber-400",
      bg     : "bg-amber-100 dark:bg-amber-900/30",
      status : status(pdfRaw, [50, 25, 5]),
      tip    : pdfTip,
    },
  ];

  // ── Account / activity ─────────────────────────────────────
  const memberDays = user.createdAt
    ? Math.max(1, daysBetween(new Date(user.createdAt), new Date()))
    : 0;

  const activityDates = new Set(
    data
      .flatMap((p) => [p.completedAt, p.updatedAt, p.createdAt])
      .filter(Boolean)
      .map((d) => d!.slice(0, 10)),
  );
  const daysActive   = activityDates.size;
  const activityRate = memberDays > 0 ? Math.round((daysActive / memberDays) * 100) : 0;

  const { current: currentStreak, longest: longestStreak } = computeStreaks(activityDates);

  const isAccountActive =
    !user.status || user.status.toUpperCase() === "ACTIVE";
  const isAdmin =
    user.roles?.some((r) => r.includes("ADMIN")) ||
    user.role?.includes("ADMIN") ||
    false;

  return {
    totalScore, grade,
    gradeLabel: g.label, gradeColor: g.color, gradeBg: g.bg, gradeBorder: g.border,
    summary: g.summary,
    metrics,
    memberDays, daysActive, activityRate,
    currentStreak, longestStreak,
    isAccountActive, isAdmin,
  };
}

// ─────────────────────────────────────────────────────────────
//  Status badge colours
// ─────────────────────────────────────────────────────────────

const statusStyle: Record<Metric["status"], { bar: string; badge: string; badgeText: string }> = {
  excellent: { bar: "bg-emerald-500", badge: "bg-emerald-100 dark:bg-emerald-900/30", badgeText: "text-emerald-700 dark:text-emerald-400" },
  good:      { bar: "bg-blue-500",    badge: "bg-blue-100 dark:bg-blue-900/30",       badgeText: "text-blue-700 dark:text-blue-400"       },
  average:   { bar: "bg-amber-500",   badge: "bg-amber-100 dark:bg-amber-900/30",     badgeText: "text-amber-700 dark:text-amber-400"     },
  poor:      { bar: "bg-rose-500",    badge: "bg-rose-100 dark:bg-rose-900/30",       badgeText: "text-rose-700 dark:text-rose-400"       },
};

const statusLabel: Record<Metric["status"], string> = {
  excellent: "ឆ្នើម", good: "ល្អ", average: "មធ្យម", poor: "ត្រូវកែ",
};

// ─────────────────────────────────────────────────────────────
//  Trend icon helper
// ─────────────────────────────────────────────────────────────

function TrendIcon({ s }: { s: Metric["status"] }) {
  if (s === "excellent" || s === "good")
    return <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />;
  if (s === "average")
    return <Minus className="h-3.5 w-3.5 text-amber-500" />;
  return <TrendingDown className="h-3.5 w-3.5 text-rose-500" />;
}

// ─────────────────────────────────────────────────────────────
//  Skeleton
// ─────────────────────────────────────────────────────────────

function PerformanceSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-32 w-full rounded-2xl animate-pulse bg-slate-200 dark:bg-slate-800" />
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="h-20 w-full rounded-2xl animate-pulse bg-slate-100 dark:bg-slate-800/60" />
      ))}
    </div>
  );
}

const HEATMAP_DAY_LABELS = ["ច", "អ", "ព", "ព្រ", "សុ", "ស", "អា"];
const HEATMAP_LEVEL_CLASSES = [
  "bg-slate-100 dark:bg-slate-800",
  "bg-emerald-200 dark:bg-emerald-950/60",
  "bg-emerald-300 dark:bg-emerald-800/80",
  "bg-emerald-500 dark:bg-emerald-600",
  "bg-emerald-700 dark:bg-emerald-400",
];

const readingChartConfig = {
  hours: {
    label: "ម៉ោងសិក្សា",
    theme: {
      light: "#2563eb",
      dark: "#60a5fa",
    },
  },
} satisfies ChartConfig;

function WeeklyHeatmapCard({ progressData }: { progressData: LessonProgressResponse[] }) {
  const heatmap = useMemo(() => buildActivityHeatmap(progressData, 8), [progressData]);
  const weeks = useMemo(() => {
    const columns: typeof heatmap[] = [];
    for (let index = 0; index < heatmap.length; index += 7) {
      columns.push(heatmap.slice(index, index + 7));
    }
    return columns;
  }, [heatmap]);

  return (
    <Card className="overflow-hidden border-slate-200/80 bg-white/90 dark:border-slate-800 dark:bg-slate-900/70">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <CalendarDays className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          ប្រតិទិនសកម្មភាពប្រចាំសប្ដាហ៍
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-3 overflow-x-auto">
          <div className="grid shrink-0 grid-rows-7 gap-2 pt-8 text-[11px] text-muted-foreground">
            {HEATMAP_DAY_LABELS.map((label) => (
              <div key={label} className="flex h-4 items-center">
                {label}
              </div>
            ))}
          </div>

          <div className="min-w-max">
            <div className="mb-2 grid grid-cols-8 gap-2 text-[11px] text-muted-foreground">
              {weeks.map((column, index) => (
                <span key={column[0]?.dateKey ?? index} className="w-4 text-center">
                  {index === 0 ? "" : column[0]?.date.toLocaleDateString("km-KH", { month: "short" })}
                </span>
              ))}
            </div>
            <div className="grid grid-flow-col grid-rows-7 gap-2">
              {weeks.map((column) =>
                column.map((cell) => (
                  <div
                    key={cell.dateKey}
                    title={`${cell.date.toLocaleDateString("km-KH")} • ${cell.count} សកម្មភាព`}
                    className={`h-4 w-4 rounded-[4px] border border-white/70 shadow-sm transition-transform hover:scale-110 dark:border-slate-900 ${HEATMAP_LEVEL_CLASSES[cell.level]} ${
                      cell.isToday ? "ring-2 ring-emerald-500/50 ring-offset-2 ring-offset-background" : ""
                    }`}
                  />
                )),
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 rounded-xl bg-slate-50 px-4 py-3 text-sm dark:bg-slate-800/60">
          <p className="text-muted-foreground">
            ប្រអប់កាន់តែងងឹត មានន័យថាអ្នករៀនច្រើនជាងមុននៅថ្ងៃនោះ។
          </p>
          <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <span>តិច</span>
            {HEATMAP_LEVEL_CLASSES.map((klass, index) => (
              <span key={index} className={`h-3 w-3 rounded-[3px] ${klass}`} />
            ))}
            <span>ច្រើន</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function WeeklyComparisonCard({ progressData }: { progressData: LessonProgressResponse[] }) {
  const comparison = useMemo(() => buildWeekComparison(progressData), [progressData]);
  const bestWeek = Math.max(comparison.thisWeek, comparison.lastWeek, 1);
  const deltaLabel = comparison.delta > 0
    ? `+${comparison.delta} មេរៀន`
    : comparison.delta < 0
      ? `${comparison.delta} មេរៀន`
      : "ស្មើសប្ដាហ៍មុន";

  return (
    <Card className="border-slate-200/80 bg-white/90 dark:border-slate-800 dark:bg-slate-900/70">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          ប្រៀបធៀបសប្ដាហ៍នេះ
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between rounded-xl bg-blue-50 px-4 py-3 dark:bg-blue-950/30">
          <div>
            <p className="text-sm text-muted-foreground">លទ្ធផលធៀបនឹងសប្ដាហ៍មុន</p>
            <p className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">
              {deltaLabel}
            </p>
          </div>
          <div
            className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${
              comparison.direction === "up"
                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                : comparison.direction === "down"
                  ? "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400"
                  : "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
            }`}
          >
            {comparison.direction === "up" ? (
              <ArrowUpRight className="h-3.5 w-3.5" />
            ) : comparison.direction === "down" ? (
              <ArrowDownRight className="h-3.5 w-3.5" />
            ) : (
              <Minus className="h-3.5 w-3.5" />
            )}
            {comparison.direction === "up"
              ? "កំពុងល្អឡើង"
              : comparison.direction === "down"
                ? "យឺតជាងមុន"
                : "ថេរដដែល"}
          </div>
        </div>

        <div className="space-y-3">
          {[
            { label: "សប្ដាហ៍នេះ", value: comparison.thisWeek, tone: "from-blue-500 to-cyan-400" },
            { label: "សប្ដាហ៍មុន", value: comparison.lastWeek, tone: "from-slate-500 to-slate-400" },
          ].map((row) => (
            <div key={row.label} className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{row.label}</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {row.value} មេរៀន
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${row.tone}`}
                  style={{ width: `${Math.max((row.value / bestWeek) * 100, row.value > 0 ? 14 : 0)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function ReadingTimeChartCard({ progressData }: { progressData: LessonProgressResponse[] }) {
  const chartData = useMemo(() => buildReadingTimeChartData(progressData), [progressData]);

  return (
    <Card className="border-slate-200/80 bg-white/90 dark:border-slate-800 dark:bg-slate-900/70">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Clock className="h-5 w-5 text-violet-600 dark:text-violet-400" />
          គំនូសតាងពេលវេលាអានតាមវគ្គសិក្សា
        </CardTitle>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center text-sm text-muted-foreground dark:border-slate-700 dark:bg-slate-800/50">
            មិនទាន់មានពេលវេលាអានគ្រប់គ្រាន់សម្រាប់បង្ហាញគំនូសតាងនៅឡើយ។
          </div>
        ) : (
          <ChartContainer config={readingChartConfig} className="h-[280px] w-full">
            <BarChart
              accessibilityLayer
              data={chartData}
              layout="vertical"
              margin={{ top: 8, right: 8, left: 8, bottom: 8 }}
            >
              <CartesianGrid horizontal={false} />
              <XAxis type="number" dataKey="hours" tickLine={false} axisLine={false} />
              <YAxis
                type="category"
                dataKey="label"
                width={110}
                tickLine={false}
                axisLine={false}
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    hideLabel
                    formatter={(_, __, item) => {
                      const payload = item?.payload as
                        | { courseTitle?: string; seconds?: number }
                        | undefined;

                      return (
                        <div className="flex min-w-[12rem] items-center justify-between gap-4">
                          <span className="text-muted-foreground">
                            {payload?.courseTitle ?? "វគ្គសិក្សា"}
                          </span>
                          <span className="font-medium text-foreground">
                            {formatDurationKh(payload?.seconds ?? 0)}
                          </span>
                        </div>
                      );
                    }}
                  />
                }
              />
              <Bar
                dataKey="hours"
                fill="var(--color-hours)"
                radius={[0, 999, 999, 0]}
              />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}

function DailyGoalCard({ todayCompleted }: { todayCompleted: number }) {
  const [draftGoal, setDraftGoal] = useState("3");
  const [goal, setGoal] = useState(3);

  const safeGoal = Math.max(goal, 1);
  const progressPct = Math.min(Math.round((todayCompleted / safeGoal) * 100), 100);
  const remaining = Math.max(safeGoal - todayCompleted, 0);
  const isDone = todayCompleted >= safeGoal;

  return (
    <Card className="border-slate-200/80 bg-white/90 dark:border-slate-800 dark:bg-slate-900/70">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Target className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          គោលដៅមេរៀនប្រចាំថ្ងៃ
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-end gap-2">
          <div className="flex-1 space-y-2">
            <label className="text-sm text-muted-foreground">កំណត់គោលដៅមេរៀនក្នុងមួយថ្ងៃ</label>
            <Input
              type="number"
              min={1}
              max={20}
              value={draftGoal}
              onChange={(event) => setDraftGoal(event.target.value)}
            />
          </div>
          <Button
            type="button"
            onClick={() => {
              const parsed = Number.parseInt(draftGoal, 10);
              setGoal(Number.isFinite(parsed) ? Math.min(Math.max(parsed, 1), 20) : 1);
            }}
          >
            រក្សាទុក
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          {[1, 3, 5, 7].map((value) => (
            <Button
              key={value}
              type="button"
              variant="outline"
              size="sm"
              className="rounded-full"
              onClick={() => {
                setDraftGoal(String(value));
                setGoal(value);
              }}
            >
              {value} មេរៀន
            </Button>
          ))}
        </div>

        <div className={`rounded-xl p-4 ${isDone ? "bg-emerald-50 dark:bg-emerald-950/30" : "bg-amber-50 dark:bg-amber-950/30"}`}>
          <div className="mb-2 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-slate-900 dark:text-white">
                ថ្ងៃនេះបានបញ្ចប់ {todayCompleted}/{safeGoal} មេរៀន
              </p>
              <p className="text-xs text-muted-foreground">
                {isDone
                  ? "អ្នកសម្រេចគោលដៅថ្ងៃនេះហើយ។ បន្តទម្លាប់ល្អនេះ!"
                  : `នៅសល់ ${remaining} មេរៀន ដើម្បីឈានដល់គោលដៅថ្ងៃនេះ។`}
              </p>
            </div>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
              isDone
                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400"
                : "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400"
            }`}>
              {progressPct}%
            </span>
          </div>
          <Progress value={progressPct} className="h-2.5" />
        </div>
      </CardContent>
    </Card>
  );
}

// ─────────────────────────────────────────────────────────────
//  Main component
// ─────────────────────────────────────────────────────────────

export function UserPerformanceCard({ user, progressData, loading }: UserPerformanceCardProps) {
  const result = useMemo(
    () => (progressData ? compute(progressData, user) : null),
    [progressData, user],
  );
  const loginAttempts = user.loginAttempt ?? user.login_attempt ?? 0;
  const todayCompleted = useMemo(
    () => countCompletedToday(progressData ?? []),
    [progressData],
  );

  if (loading) return <PerformanceSkeleton />;
  if (!result || !progressData?.length) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-slate-200 bg-white py-12 text-center dark:border-slate-700 dark:bg-slate-900/40">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800">
          <TrendingUp className="h-7 w-7 text-muted-foreground/40" />
        </div>
        <p className="font-medium text-slate-600 dark:text-slate-400">
          មិនទាន់មានទិន្នន័យវឌ្ឍនភាព
        </p>
        <p className="text-sm text-muted-foreground">ចាប់ផ្តើមរៀននៅពេលដែលទិន្នន័យនឹងបង្ហាញ</p>
      </div>
    );
  }

  const {
    totalScore, grade, gradeLabel, gradeColor, gradeBg, gradeBorder, summary,
    metrics, memberDays, daysActive, activityRate, currentStreak, longestStreak,
    isAccountActive, isAdmin,
  } = result;

  // Score ring colour
  const ringColor =
    totalScore >= 90 ? "#7c3aed" :
    totalScore >= 80 ? "#059669" :
    totalScore >= 65 ? "#2563eb" :
    totalScore >= 50 ? "#d97706" :
    totalScore >= 30 ? "#ea580c" : "#e11d48";

  const circumference = 2 * Math.PI * 42; // r=42
  const dashOffset    = circumference * (1 - totalScore / 100);

  return (
    <div className="space-y-4">

      {/* ── Score hero card ─────────────────────────────────── */}
      <div className={`relative overflow-hidden rounded-2xl border p-5 ${gradeBg} ${gradeBorder}`}>
        {/* Decorative blob */}
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full blur-3xl opacity-20"
          style={{ background: ringColor }} />

        <div className="relative flex items-center gap-5">
          {/* SVG ring */}
          <div className="relative shrink-0">
            <svg width="100" height="100" viewBox="0 0 100 100">
              {/* Track */}
              <circle cx="50" cy="50" r="42"
                fill="none" stroke="currentColor"
                strokeWidth="8" className="text-slate-200 dark:text-slate-700" />
              {/* Progress */}
              <circle cx="50" cy="50" r="42"
                fill="none"
                stroke={ringColor}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={dashOffset}
                transform="rotate(-90 50 50)"
                style={{ transition: "stroke-dashoffset 1s ease" }}
              />
            </svg>
            {/* Grade letter */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-2xl font-black leading-none ${gradeColor}`}>{grade}</span>
              <span className="mt-0.5 text-[10px] text-muted-foreground">{totalScore} ពិន្ទុ</span>
            </div>
          </div>

          {/* Text */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-xl font-bold ${gradeColor}`}>{gradeLabel}</span>
              {isAdmin && (
                <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 text-[10px]">
                  អ្នកគ្រប់គ្រង
                </Badge>
              )}
              <Badge className={`text-[10px] ${isAccountActive
                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                : "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400"}`}>
                {isAccountActive ? "សកម្ម" : "អសកម្ម"}
              </Badge>
            </div>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400 leading-snug">
              {summary}
            </p>
            {/* Mini account stats */}
            <div className="mt-3 flex items-center gap-4 flex-wrap text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <CalendarDays className="h-3.5 w-3.5" />
                {memberDays > 0 ? `${memberDays} ថ្ងៃ` : "--"} សមាជិក
              </span>
              <span className="flex items-center gap-1">
                <BookOpen className="h-3.5 w-3.5" />
                {daysActive} ថ្ងៃ សកម្ម
              </span>
              <span className="flex items-center gap-1">
                <Flame className="h-3.5 w-3.5 text-orange-500" />
                ស្ទ្រីក {currentStreak} ថ្ងៃ
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
        <WeeklyHeatmapCard progressData={progressData} />
        <div className="space-y-4">
          <WeeklyComparisonCard progressData={progressData} />
          <DailyGoalCard todayCompleted={todayCompleted} />
        </div>
      </div>

      <ReadingTimeChartCard progressData={progressData} />

      {/* ── Per-metric rows ──────────────────────────────────── */}
      <Card>
        <CardHeader className="pb-2 pt-4 px-5">
          <CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
            <Zap className="h-4 w-4 text-violet-500" />
            សូចនាករលម្អិត
          </CardTitle>
        </CardHeader>
        <CardContent className="px-5 pb-4 space-y-4">
          {metrics.map((m) => {
            const s = statusStyle[m.status];
            return (
              <div key={m.key} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${m.bg}`}>
                      <span className={m.accent}>{m.icon}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-200 leading-none">
                        {m.label}
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        ទម្ងន់ {m.weight}%
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-sm font-bold text-slate-900 dark:text-white">{m.value}</span>
                    <span className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[10px] font-semibold ${s.badge} ${s.badgeText}`}>
                      <TrendIcon s={m.status} />
                      {statusLabel[m.status]}
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${s.bar}`}
                    style={{ width: `${m.raw}%` }}
                  />
                </div>

                {/* Tip */}
                <p className="text-[11px] text-muted-foreground flex items-start gap-1 leading-snug">
                  <Info className="h-3 w-3 mt-0.5 shrink-0 text-slate-400" />
                  {m.tip}
                </p>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* ── Activity & streak card ───────────────────────────── */}
      <Card>
        <CardHeader className="pb-2 pt-4 px-5">
          <CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
            <Flame className="h-4 w-4 text-orange-500" />
            សកម្មភាព និងស្ទ្រីក
          </CardTitle>
        </CardHeader>
        <CardContent className="px-5 pb-4 space-y-3">

          {/* Activity rate */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">អត្រាសកម្ម</span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {daysActive}/{memberDays} ថ្ងៃ ({activityRate}%)
              </span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-violet-500 to-blue-500 transition-all duration-700"
                style={{ width: `${Math.min(activityRate, 100)}%` }}
              />
            </div>
          </div>

          {/* Streak stats */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="flex items-center gap-3 rounded-xl bg-orange-50 p-3 dark:bg-orange-950/20">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900/30">
                <Flame className="h-4 w-4 text-orange-500" />
              </div>
              <div>
                <p className="text-lg font-bold text-slate-900 dark:text-white leading-none">
                  {currentStreak}
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">ស្ទ្រីកបច្ចុប្បន្ន</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl bg-violet-50 p-3 dark:bg-violet-950/20">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-900/30">
                <Star className="h-4 w-4 text-violet-500" />
              </div>
              <div>
                <p className="text-lg font-bold text-slate-900 dark:text-white leading-none">
                  {longestStreak}
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">ស្ទ្រីកយូរបំផុត</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Account health card ──────────────────────────────── */}
      <Card>
        <CardHeader className="pb-2 pt-4 px-5">
          <CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            សុខភាពគណនី
          </CardTitle>
        </CardHeader>
        <CardContent className="px-5 pb-4 space-y-2">
          {[
            {
              label  : "ស្ថានភាពគណនី",
              ok     : isAccountActive,
              okText : "សកម្ម — ប្រើប្រាស់បានធម្មតា",
              badText: "អសកម្ម — គណនីត្រូវបានបញ្ឈប់",
            },
            {
              label  : "ការចូលមិនបានសម្រេច",
              ok     : loginAttempts < 3,
              okText : `${loginAttempts}/5 ដង — គ្មានបញ្ហា`,
              badText: `${loginAttempts}/5 ដង — ប្រុងប្រយ័ត្ន`,
            },
            {
              label  : "ប្រភេទគណនី",
              ok     : true,
              okText : isAdmin ? "អ្នកគ្រប់គ្រង" : "សមាជិកទូទៅ",
              badText: "",
            },
            {
              label  : "ថ្ងៃចូលរៀន",
              ok     : true,
              okText : user.createdAt
                ? new Date(user.createdAt).toLocaleDateString("km-KH", {
                    year: "numeric", month: "long", day: "numeric",
                  })
                : "--",
              badText: "",
            },
          ].map((row, i) => (
            <div
              key={i}
              className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800 last:border-0"
            >
              <span className="text-sm text-muted-foreground">{row.label}</span>
              <span
                className={`text-sm font-medium flex items-center gap-1 ${
                  !row.ok ? "text-rose-600" : "text-slate-700 dark:text-slate-300"
                }`}
              >
                {!row.ok && <AlertTriangle className="h-3.5 w-3.5 text-rose-500" />}
                {row.ok ? row.okText : row.badText}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>

    </div>
  );
}
