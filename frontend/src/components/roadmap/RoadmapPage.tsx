"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  ChevronRight,
  Clock,
  ExternalLink,
  FolderGit2,
  Goal,
  Layers,
  Sparkles,
  TimerReset,
  Trophy,
  Zap,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { roadmapPaths, type RoadmapPath, type RoadmapStage } from "@/components/constants/roadmap-data";

// ─── Accent colour helpers ────────────────────────────────────────────────────
const accentMap = {
  blue: {
    tab: "bg-blue-600 text-white shadow-blue-500/30",
    tabInactive:
      "text-slate-600 hover:text-blue-600 hover:bg-blue-50 dark:text-slate-400 dark:hover:text-blue-300 dark:hover:bg-blue-500/10",
    badge:
      "border-blue-200/60 bg-blue-50 text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300",
    dot: "bg-blue-500 dark:bg-blue-400",
    pill: "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300",
    ring: "ring-blue-500/20",
    project: "border-blue-200/60 bg-blue-50/80 dark:border-blue-400/20 dark:bg-blue-500/10",
    projectLabel: "text-blue-700 dark:text-blue-300",
    stepBg: "from-blue-600 to-sky-500",
  },
  emerald: {
    tab: "bg-emerald-600 text-white shadow-emerald-500/30",
    tabInactive:
      "text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 dark:text-slate-400 dark:hover:text-emerald-300 dark:hover:bg-emerald-500/10",
    badge:
      "border-emerald-200/60 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300",
    dot: "bg-emerald-500 dark:bg-emerald-400",
    pill: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300",
    ring: "ring-emerald-500/20",
    project: "border-emerald-200/60 bg-emerald-50/80 dark:border-emerald-400/20 dark:bg-emerald-500/10",
    projectLabel: "text-emerald-700 dark:text-emerald-300",
    stepBg: "from-emerald-600 to-teal-500",
  },
  violet: {
    tab: "bg-violet-600 text-white shadow-violet-500/30",
    tabInactive:
      "text-slate-600 hover:text-violet-600 hover:bg-violet-50 dark:text-slate-400 dark:hover:text-violet-300 dark:hover:bg-violet-500/10",
    badge:
      "border-violet-200/60 bg-violet-50 text-violet-700 dark:border-violet-500/30 dark:bg-violet-500/10 dark:text-violet-300",
    dot: "bg-violet-500 dark:bg-violet-400",
    pill: "bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-300",
    ring: "ring-violet-500/20",
    project: "border-violet-200/60 bg-violet-50/80 dark:border-violet-400/20 dark:bg-violet-500/10",
    projectLabel: "text-violet-700 dark:text-violet-300",
    stepBg: "from-violet-600 to-purple-500",
  },
};

type AccentKey = keyof typeof accentMap;

// ─── Page ────────────────────────────────────────────────────────────────────
export default function RoadmapPage() {
  const [activePathId, setActivePathId] = useState<RoadmapPath["id"]>("frontend");
  const activePath = roadmapPaths.find((p) => p.id === activePathId)!;
  const colors = accentMap[activePath.accent as AccentKey];

  return (
    <div className="space-y-8 pb-16 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 mt-10">
      {/* ── Hero ── */}
      <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white/80 p-7 shadow-sm md:p-10 dark:border-white/10 dark:bg-slate-900/70">
        {/* decorative blob */}
        <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-gradient-to-br from-blue-400/10 via-violet-400/10 to-pink-400/10 blur-3xl" />
        <div className="relative">
          <Badge className="mb-3 border-violet-200/60 bg-violet-50 text-violet-700 dark:border-violet-500/30 dark:bg-violet-500/10 dark:text-violet-300">
            <Sparkles className="mr-1.5 h-3 w-3" />
            Learning Roadmap — roadmap.sh inspired
          </Badge>
          <h1 className="mt-2 text-3xl font-extrabold leading-tight tracking-tight text-slate-900 md:text-5xl dark:text-white">
            ផ្លូវឆ្ពោះទៅ{" "}
            <span className="bg-gradient-to-r from-blue-600 via-violet-500 to-pink-500 bg-clip-text text-transparent">
              Developer
            </span>{" "}
            ក្នុង 6–12 ខែ
          </h1>
          <p className="mt-3 max-w-2xl text-slate-600 md:text-lg dark:text-slate-300">
            Roadmap ច្បាស់លាស់ចាប់ពីមូលដ្ឋានដល់ production — ជ្រើសសម្រាប់{" "}
            <strong>Frontend, Backend</strong> ឬ <strong>Fullstack</strong> developer
          </p>

          {/* Quick stats row */}
          <div className="mt-6 flex flex-wrap gap-3">
            {[
              { icon: Goal, label: "1 project milestone / phase" },
              { icon: TimerReset, label: "5–7 hrs focused / week" },
              { icon: CheckCircle2, label: "Weekly mentor checkpoints" },
              { icon: Trophy, label: "Certificate on completion" },
            ].map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-medium text-slate-600 shadow-sm dark:border-white/10 dark:bg-slate-900 dark:text-slate-300"
              >
                <Icon className="h-3.5 w-3.5 shrink-0 text-violet-500" />
                {label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Path Tabs ── */}
      <div className="flex flex-wrap gap-2">
        {roadmapPaths.map((path) => {
          const c = accentMap[path.accent as AccentKey];
          const isActive = path.id === activePathId;
          return (
            <button
              key={path.id}
              onClick={() => setActivePathId(path.id)}
              className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold shadow-sm transition-all duration-200 ${
                isActive ? `${c.tab} shadow-lg` : c.tabInactive
              }`}
            >
              <span className="text-base leading-none">{path.icon}</span>
              <span>{path.label}</span>
              <span className="hidden text-xs font-normal opacity-75 sm:inline">
                / {path.labelKh}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Active path header ── */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            {activePath.icon} {activePath.label} Developer Roadmap
          </h2>
          <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
            {activePath.taglineKh}
          </p>
        </div>
        <Badge className={`shrink-0 self-start ${colors.badge}`}>
          {activePath.stages.length} phases • {activePath.stages[activePath.stages.length - 1].window.replace("ខែ ", "")} months
        </Badge>
      </div>

      {/* ── Stages ── */}
      <div className="relative space-y-5">
        {/* Vertical connector line */}
        <div className="absolute left-[18px] top-10 hidden h-[calc(100%-40px)] w-px bg-gradient-to-b from-slate-300/60 to-transparent dark:from-slate-700/60 md:block" />

        {activePath.stages.map((stage, index) => (
          <StageCard
            key={stage.id}
            stage={stage}
            index={index}
            colors={colors}
            isLast={index === activePath.stages.length - 1}
          />
        ))}
      </div>

      {/* ── CTA banner ── */}
      <section className={`relative overflow-hidden rounded-3xl bg-gradient-to-r ${activePath.gradient} p-8 text-white shadow-xl md:p-10`}>
        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
        <div className="relative flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-widest opacity-75">
              ត្រៀមចាប់ផ្តើម?
            </p>
            <h3 className="mt-1 text-2xl font-extrabold">
              ចូលរៀន {activePath.label} Path ថ្ងៃនេះ — ឥតគិតថ្លៃ
            </h3>
            <p className="mt-1 text-sm opacity-80">
              Courses, projects, mentor support — គ្រប់យ៉ាងជាភាសាខ្មែរ
            </p>
          </div>
          <Link
            href="/courses"
            className="inline-flex shrink-0 items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-slate-900 shadow-lg transition-all hover:scale-105 hover:shadow-xl"
          >
            ចាប់ផ្តើម Free
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}

// ─── Stage Card ───────────────────────────────────────────────────────────────
function StageCard({
  stage,
  index,
  colors,
  isLast,
}: {
  stage: RoadmapStage;
  index: number;
  colors: (typeof accentMap)[AccentKey];
  isLast: boolean;
}) {
  const [open, setOpen] = useState(index === 0);

  return (
    <div className="relative md:pl-12">
      {/* Phase number bubble (desktop only) */}
      <div
        className={`absolute left-0 top-4 hidden h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br ${stage.color} text-sm font-bold text-white shadow-md md:flex`}
      >
        {stage.phase}
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md dark:border-white/10 dark:bg-slate-900/70">
        {/* Card header — always visible */}
        <button
          onClick={() => setOpen((o) => !o)}
          className="flex w-full items-start justify-between gap-4 p-5 text-left md:p-6"
        >
          <div className="flex items-start gap-4">
            {/* Phase bubble (mobile) */}
            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${stage.color} text-sm font-bold text-white shadow-sm md:hidden`}
            >
              {stage.phase}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {stage.title}
                </h3>
                <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-xs font-medium text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-400">
                  {stage.titleKh}
                </span>
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${colors.pill}`}
                >
                  <Clock className="h-3 w-3" />
                  {stage.window}
                </span>
                <span className="hidden text-xs text-slate-400 dark:text-slate-500 sm:block">
                  {stage.focus}
                </span>
              </div>
            </div>
          </div>

          <div
            className={`mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-slate-200 text-slate-400 transition-transform duration-200 dark:border-white/15 dark:text-slate-500 ${
              open ? "rotate-90" : ""
            }`}
          >
            <ChevronRight className="h-4 w-4" />
          </div>
        </button>

        {/* Expandable content */}
        {open && (
          <div className="border-t border-slate-100 dark:border-white/8">
            {/* Focus description */}
            <p className="px-5 pt-4 text-sm text-slate-600 dark:text-slate-400 md:px-6">
              {stage.focusKh}
            </p>

            {/* Topics chips */}
            <div className="flex flex-wrap gap-2 px-5 pt-3 md:px-6">
              {stage.topics.map((t) => (
                <div
                  key={t.name}
                  title={t.desc}
                  className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:border-slate-300 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:border-white/20"
                >
                  <span className="text-sm leading-none">{t.icon}</span>
                  {t.name}
                </div>
              ))}
            </div>

            {/* Outcomes + Project */}
            <div className="grid gap-4 p-5 md:grid-cols-2 md:p-6">
              {/* Outcomes */}
              <div>
                <div className="mb-3 flex items-center gap-2">
                  <Zap className="h-3.5 w-3.5 text-slate-400" />
                  <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                    លទ្ធផលរំពឹងទុក
                  </p>
                </div>
                <ul className="space-y-2">
                  {stage.outcomesKh.map((o, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-slate-700 dark:text-slate-300">
                      <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${colors.dot}`} />
                      {o}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Milestone Project */}
              <div
                className={`rounded-xl border p-4 ${colors.project}`}
              >
                <div className="mb-2 flex items-center gap-2">
                  <FolderGit2 className={`h-3.5 w-3.5 ${colors.projectLabel}`} />
                  <p className={`text-xs font-semibold uppercase tracking-widest ${colors.projectLabel}`}>
                    Milestone Project
                  </p>
                </div>
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {stage.projectKh}
                </p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{stage.project}</p>
              </div>
            </div>

            {/* Resources footer */}
            {stage.resources.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 px-5 py-3 dark:border-white/8 md:px-6">
                <span className="text-xs font-medium text-slate-400">Resources:</span>
                {stage.resources.map((r) => (
                  <a
                    key={r.url}
                    href={r.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-600 transition-colors hover:border-slate-300 hover:text-slate-900 dark:border-white/10 dark:bg-white/5 dark:text-slate-400 dark:hover:text-white"
                  >
                    {r.label}
                    <ExternalLink className="h-3 w-3 opacity-60" />
                  </a>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}