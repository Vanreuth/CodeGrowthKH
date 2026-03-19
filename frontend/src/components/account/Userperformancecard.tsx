"use client";

import { useMemo, useState } from "react";
import {
  Clock,
  CalendarDays,
  ShieldCheck,
  TrendingUp,
  Minus,
  Flame,
  BookOpen,
  Star,
  AlertTriangle,
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

type Grade = "S" | "A" | "B" | "C" | "D" | "F";

interface PerformanceResult {
  totalScore   : number;
  grade        : Grade;
  gradeLabel   : string;
  gradeColor   : string;
  gradeBg      : string;
  gradeBorder  : string;
  summary      : string;
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
  // ── Metric 2 · Avg Read Time / lesson  (weight 30) ────────
  const totalReadSec = data.reduce((s, p) => s + (p.readTimeSeconds ?? 0), 0);
  const avgReadSec   = total > 0 ? totalReadSec / total : 0;
  const readRaw      =
    avgReadSec >= 300 ? 100 :
    avgReadSec >= 180 ? 78  :
    avgReadSec >= 90  ? 55  :
    avgReadSec >= 30  ? 30  :
    avgReadSec > 0    ? 12  : 0;
  // ── Metric 3 · Avg Scroll Depth on completed  (weight 20) ─
  const avgScroll =
    completed.length > 0
      ? completed.reduce((s, p) => s + (p.scrollPct ?? 0), 0) / completed.length
      : 0;
  const scrollRaw = Math.round(avgScroll);
  // ── Metric 4 · PDF Engagement  (weight 15) ────────────────
  const pdfRate  = total > 0 ? pdfItems.length / total : 0;
  const pdfRaw   = Math.round(pdfRate * 100);

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
    D: { label: "កំពុងកែលម្អ",    color: "text-orange-600",  bg: "bg-orange-50 dark:bg-orange-950/30",   border: "border-orange-200 dark:border-orange-800",   summary: "អ្នកបានចាប់ផ្តើមហើយ។ រៀនបន្តិចៗរៀងរាល់ថ្ងៃ នឹងធ្វើឱ្យលទ្ធផលកាន់តែល្អឡើង" },
    F: { label: "ទើបចាប់ផ្តើម",  color: "text-rose-600",    bg: "bg-rose-50 dark:bg-rose-950/30",       border: "border-rose-200 dark:border-rose-800",       summary: "ចូររៀនមេរៀនដំបូង! ដំណើររយពាន់ ចាប់ផ្តើមពីក្រ" },
  };

  const g = gradeMap[grade];

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
    memberDays, daysActive, activityRate,
    currentStreak, longestStreak,
    isAccountActive, isAdmin,
  };
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
  const activeCells = heatmap.filter((cell) => cell.count > 0).length;
  const weeks = useMemo(() => {
    const columns: typeof heatmap[] = [];
    for (let index = 0; index < heatmap.length; index += 7) {
      columns.push(heatmap.slice(index, index + 7));
    }
    return columns;
  }, [heatmap]);

  return (
    <Card className="overflow-hidden border-slate-200/80 bg-gradient-to-br from-white via-white to-emerald-50/60 shadow-sm dark:border-slate-800 dark:from-slate-900/95 dark:via-slate-900/88 dark:to-emerald-950/25">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <CalendarDays className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              ប្រតិទិនសកម្មភាពប្រចាំសប្ដាហ៍
            </CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              មើលសកម្មភាពសិក្សារបស់អ្នកក្នុងរយៈពេល 8 សប្ដាហ៍ចុងក្រោយ
            </p>
          </div>
          <Badge className="rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
            {activeCells} ថ្ងៃមានសកម្មភាព
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-2xl border border-emerald-100/70 bg-white/80 p-4 shadow-sm backdrop-blur-sm dark:border-slate-800 dark:bg-slate-950/40">
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
        </div>

        <div className="flex flex-col gap-3 rounded-xl bg-slate-50 px-4 py-3 text-sm dark:bg-slate-800/60 sm:flex-row sm:items-center sm:justify-between">
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
    <Card className="border-slate-200/80 bg-gradient-to-br from-white via-white to-blue-50/70 shadow-sm dark:border-slate-800 dark:from-slate-900/95 dark:via-slate-900/88 dark:to-blue-950/25">
      <CardHeader className="pb-3">
        <div>
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            ប្រៀបធៀបសប្ដាហ៍នេះ
          </CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">
            តាមដានថាល្បឿនសិក្សារបស់អ្នកកំពុងឡើង ធ្លាក់ ឬថេរដដែល
          </p>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between rounded-2xl border border-blue-100/70 bg-blue-50 px-4 py-3 shadow-sm dark:border-blue-900/30 dark:bg-blue-950/30">
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

        <div className="space-y-3 rounded-2xl border border-slate-200/80 bg-white/80 p-4 dark:border-slate-800 dark:bg-slate-950/30">
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
    <Card className="border-slate-200/80 bg-gradient-to-br from-white via-white to-violet-50/60 shadow-sm dark:border-slate-800 dark:from-slate-900/95 dark:via-slate-900/88 dark:to-violet-950/25">
      <CardHeader className="pb-3">
        <div>
          <CardTitle className="flex items-center gap-2 text-base">
            <Clock className="h-5 w-5 text-violet-600 dark:text-violet-400" />
            គំនូសតាងពេលវេលាអានតាមវគ្គសិក្សា
          </CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">
            មើលថាអ្នកចំណាយពេលសិក្សាច្រើនលើវគ្គណាខ្លះ
          </p>
        </div>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white/70 px-4 py-10 text-center text-sm text-muted-foreground dark:border-slate-700 dark:bg-slate-800/50">
            មិនទាន់មានពេលវេលាអានគ្រប់គ្រាន់សម្រាប់បង្ហាញគំនូសតាងនៅឡើយ។
          </div>
        ) : (
          <div className="rounded-2xl border border-violet-100/70 bg-white/80 p-3 shadow-sm dark:border-slate-800 dark:bg-slate-950/30">
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
          </div>
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
    <Card className="border-slate-200/80 bg-gradient-to-br from-white via-white to-amber-50/70 shadow-sm dark:border-slate-800 dark:from-slate-900/95 dark:via-slate-900/88 dark:to-amber-950/25">
      <CardHeader className="pb-3">
        <div>
          <CardTitle className="flex items-center gap-2 text-base">
            <Target className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            គោលដៅមេរៀនប្រចាំថ្ងៃ
          </CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">
            កំណត់គោលដៅតូចៗ ដើម្បីរក្សាចង្វាក់សិក្សាប្រចាំថ្ងៃ
          </p>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-2xl border border-amber-100/70 bg-white/80 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950/30">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex-1 space-y-2">
              <label className="text-sm text-muted-foreground">កំណត់គោលដៅមេរៀនក្នុងមួយថ្ងៃ</label>
              <Input
                type="number"
                min={1}
                max={20}
                value={draftGoal}
                onChange={(event) => setDraftGoal(event.target.value)}
                className="h-11 rounded-xl border-amber-200/70 bg-white dark:border-slate-700"
              />
            </div>
            <Button
              type="button"
              className="h-11 rounded-xl bg-amber-500 text-white hover:bg-amber-600 dark:bg-amber-500 dark:text-slate-950"
              onClick={() => {
                const parsed = Number.parseInt(draftGoal, 10);
                setGoal(Number.isFinite(parsed) ? Math.min(Math.max(parsed, 1), 20) : 1);
              }}
            >
              រក្សាទុក
            </Button>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {[1, 3, 5, 7].map((value) => (
              <Button
                key={value}
                type="button"
                variant="outline"
                size="sm"
                className="rounded-full border-amber-200/70 bg-white/90 hover:border-amber-300 hover:bg-amber-50 dark:border-slate-700 dark:bg-slate-900"
                onClick={() => {
                  setDraftGoal(String(value));
                  setGoal(value);
                }}
              >
                {value} មេរៀន
              </Button>
            ))}
          </div>
        </div>

        <div className={`rounded-2xl border p-4 shadow-sm ${isDone ? "border-emerald-200/80 bg-emerald-50 dark:border-emerald-900/40 dark:bg-emerald-950/30" : "border-amber-200/80 bg-amber-50 dark:border-amber-900/40 dark:bg-amber-950/30"}`}>
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
      <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed border-slate-200 bg-gradient-to-br from-white via-white to-slate-50 py-14 text-center shadow-sm dark:border-slate-700 dark:from-slate-900/90 dark:via-slate-900/80 dark:to-slate-950/90">
        <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-100 shadow-inner dark:bg-slate-800">
          <TrendingUp className="h-7 w-7 text-muted-foreground/50" />
        </div>
        <p className="text-lg font-semibold text-slate-700 dark:text-slate-200">
          មិនទាន់មានទិន្នន័យវឌ្ឍនភាព
        </p>
        <p className="max-w-md text-sm leading-6 text-muted-foreground">
          ចាប់ផ្តើមរៀនមេរៀនដំបូងរបស់អ្នក ហើយផ្ទាំងវឌ្ឍនភាពនេះនឹងបង្ហាញស្ថិតិ និងសកម្មភាពដោយស្វ័យប្រវត្តិ។
        </p>
      </div>
    );
  }

  const {
    totalScore, grade, gradeLabel, gradeColor, gradeBg, gradeBorder, summary,
    memberDays, daysActive, activityRate, currentStreak, longestStreak,
    isAccountActive, isAdmin,
  } = result;
  const memberLabel = memberDays > 0
    ? `${memberDays} ថ្ងៃជា​សមាជិក`
    : "មិនទាន់មានព័ត៌មានថ្ងៃចូលរៀន";
  const activeDaysLabel = daysActive > 0
    ? `សកម្ម ${daysActive} ថ្ងៃ`
    : "មិនទាន់មានសកម្មភាព";
  const activityRateLabel = memberDays > 0
    ? `${daysActive}/${memberDays} ថ្ងៃ (${activityRate}%)`
    : `${daysActive} ថ្ងៃសកម្ម`;
  const hideGradeScore = grade === "D";
  const heroTitle = hideGradeScore ? "សេចក្តីសង្ខេបការរៀន" : gradeLabel;
  const heroSubtitle = hideGradeScore
    ? "បន្តសិក្សាបន្តិចៗរៀងរាល់ថ្ងៃ ដើម្បីឃើញការរីកចម្រើនកាន់តែច្បាស់"
    : summary;

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
      <div className={`relative overflow-hidden rounded-3xl border p-5 shadow-sm ${gradeBg} ${gradeBorder}`}>
        {/* Decorative blob */}
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full blur-3xl opacity-20"
          style={{ background: ringColor }} />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-r from-white/70 via-transparent to-white/20 dark:from-white/5 dark:to-transparent" />

        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center">

          {/* Text */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge className="rounded-full bg-white/80 text-slate-700 shadow-sm dark:bg-slate-900/50 dark:text-slate-200">
                សង្ខេបវឌ្ឍនភាព
              </Badge>
              <span className={`text-xl font-bold ${hideGradeScore ? "text-slate-900 dark:text-white" : gradeColor}`}>{heroTitle}</span>
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
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-400">
              {heroSubtitle}
            </p>

            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/70 bg-white/75 p-3 shadow-sm backdrop-blur dark:border-white/10 dark:bg-slate-950/30">
                <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
                  <CalendarDays className="h-3.5 w-3.5 text-blue-500" />
                  រយៈពេល
                </div>
                <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-white">{memberLabel}</p>
              </div>
              <div className="rounded-2xl border border-white/70 bg-white/75 p-3 shadow-sm backdrop-blur dark:border-white/10 dark:bg-slate-950/30">
                <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
                  <BookOpen className="h-3.5 w-3.5 text-emerald-500" />
                  សកម្មភាព
                </div>
                <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-white">{activeDaysLabel}</p>
              </div>
              <div className="rounded-2xl border border-white/70 bg-white/75 p-3 shadow-sm backdrop-blur dark:border-white/10 dark:bg-slate-950/30">
                <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
                  <Flame className="h-3.5 w-3.5 text-orange-500" />
                  ស្ទ្រីក
                </div>
                <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-white">ស្ទ្រីកបច្ចុប្បន្ន {currentStreak} ថ្ងៃ</p>
              </div>
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

      {/* ── Activity & streak card ───────────────────────────── */}
      <Card className="border-slate-200/80 bg-gradient-to-br from-white via-white to-orange-50/50 shadow-sm dark:border-slate-800 dark:from-slate-900/95 dark:via-slate-900/88 dark:to-orange-950/15">
        <CardHeader className="pb-2 pt-4 px-5">
          <CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
            <Flame className="h-4 w-4 text-orange-500" />
            សកម្មភាព និងស្ទ្រីក
          </CardTitle>
        </CardHeader>
        <CardContent className="px-5 pb-4 space-y-3">

          {/* Activity rate */}
          <div className="space-y-2 rounded-2xl border border-orange-100/70 bg-white/75 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950/30">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">អត្រាសកម្ម</span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {activityRateLabel}
              </span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-violet-500 to-blue-500 transition-all duration-700"
                style={{ width: `${memberDays > 0 ? Math.min(activityRate, 100) : daysActive > 0 ? 100 : 0}%` }}
              />
            </div>
          </div>

          {/* Streak stats */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="flex items-center gap-3 rounded-2xl border border-orange-100/70 bg-orange-50 p-3 shadow-sm dark:border-orange-900/20 dark:bg-orange-950/20">
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
            <div className="flex items-center gap-3 rounded-2xl border border-violet-100/70 bg-violet-50 p-3 shadow-sm dark:border-violet-900/20 dark:bg-violet-950/20">
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
      <Card className="border-slate-200/80 bg-gradient-to-br from-white via-white to-emerald-50/50 shadow-sm dark:border-slate-800 dark:from-slate-900/95 dark:via-slate-900/88 dark:to-emerald-950/15">
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
              className="flex items-center justify-between rounded-2xl border border-slate-100/80 bg-white/75 px-4 py-3 shadow-sm dark:border-slate-800 dark:bg-slate-950/30"
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
