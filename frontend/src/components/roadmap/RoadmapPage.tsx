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
  Sparkles,
  TimerReset,
  Trophy,
  Zap,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  roadmapPaths,
  type RoadmapPath,
  type RoadmapStage,
} from "@/components/constants/roadmap-data";

/* Accent colors */

const accentMap = {
  blue: {
    tab: "bg-blue-600 text-white shadow-blue-500/30",
    tabInactive:
      "text-muted-foreground hover:text-blue-600 hover:bg-blue-500/10",
    badge: "border-blue-500/30 bg-blue-500/10 text-blue-600",
    dot: "bg-blue-500",
    pill: "bg-blue-500/10 text-blue-600",
    project: "border-blue-500/20 bg-blue-500/10",
    projectLabel: "text-blue-600",
  },

  emerald: {
    tab: "bg-emerald-600 text-white shadow-emerald-500/30",
    tabInactive:
      "text-muted-foreground hover:text-emerald-600 hover:bg-emerald-500/10",
    badge: "border-emerald-500/30 bg-emerald-500/10 text-emerald-600",
    dot: "bg-emerald-500",
    pill: "bg-emerald-500/10 text-emerald-600",
    project: "border-emerald-500/20 bg-emerald-500/10",
    projectLabel: "text-emerald-600",
  },

  violet: {
    tab: "bg-violet-600 text-white shadow-violet-500/30",
    tabInactive:
      "text-muted-foreground hover:text-violet-600 hover:bg-violet-500/10",
    badge: "border-violet-500/30 bg-violet-500/10 text-violet-600",
    dot: "bg-violet-500",
    pill: "bg-violet-500/10 text-violet-600",
    project: "border-violet-500/20 bg-violet-500/10",
    projectLabel: "text-violet-600",
  },
};

type AccentKey = keyof typeof accentMap;

export default function RoadmapPage() {
  const [activePathId, setActivePathId] =
    useState<RoadmapPath["id"]>("frontend");

  const activePath = roadmapPaths.find((p) => p.id === activePathId)!;

  const colors = accentMap[activePath.accent as AccentKey];

  const progress = 0;

  return (
    <div className="mx-auto mt-10 w-full max-w-7xl pb-20 px-4">

      {/* HERO */}

      <section className="grid items-center gap-10 mb-12 lg:grid-cols-2">

        <div>

          <Badge className="mb-3 border-violet-500/30 bg-violet-500/10 text-violet-600">
            <Sparkles className="mr-1 h-3 w-3" />
            Learning Roadmap
          </Badge>

          <h1 className="text-4xl font-extrabold leading-tight">
            ផ្លូវឆ្ពោះទៅ{" "}
            <span className="bg-gradient-to-r from-blue-600 via-violet-500 to-pink-500 bg-clip-text text-transparent">
              Developer
            </span>{" "}
            ក្នុង 6–12 ខែ
          </h1>

          <p className="mt-4 text-muted-foreground max-w-xl">
            រៀនតាម roadmap ច្បាស់លាស់ពី Beginner → Professional
          </p>

          {/* stats */}

          <div className="flex flex-wrap gap-3 mt-6">

            {[
              { icon: Goal, label: "1 project / phase" },
              { icon: TimerReset, label: "5–7 hrs / week" },
              { icon: CheckCircle2, label: "Mentor support" },
              { icon: Trophy, label: "Certificate" },
            ].map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs bg-background"
              >
                <Icon className="w-3 h-3 text-violet-500" />
                {label}
              </div>
            ))}

          </div>
        </div>

        {/* visual side */}

        <div className="rounded-3xl border bg-muted/40 p-8 shadow-sm">

          <h3 className="font-semibold mb-4 text-sm">
            Developer Path
          </h3>

          <div className="space-y-3 text-sm">

            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              HTML → CSS → JavaScript
            </div>

            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-violet-500 rounded-full"></div>
              React → Next.js
            </div>

            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
              APIs → Databases
            </div>

          </div>
        </div>

      </section>

      {/* PATH TABS */}

      <div className="flex flex-wrap gap-3 mb-8">

        {roadmapPaths.map((path) => {
          const c = accentMap[path.accent as AccentKey];
          const active = path.id === activePathId;

          return (
            <button
              key={path.id}
              onClick={() => setActivePathId(path.id)}
              className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold transition-all
              
              ${
                active
                  ? c.tab
                  : `${c.tabInactive} hover:scale-105`
              }
              
              `}
            >
              {path.icon}
              {path.label}
            </button>
          );
        })}

      </div>

      {/* PROGRESS */}

      <div className="mb-10">

        <div className="flex justify-between text-xs text-muted-foreground mb-2">
          <span>Roadmap Progress</span>
          <span>
            {progress}/{activePath.stages.length} phases
          </span>
        </div>

        <div className="h-2 bg-muted rounded-full overflow-hidden">

          <div
            className={`h-full bg-gradient-to-r ${activePath.gradient}`}
            style={{ width: `${progress}%` }}
          />

        </div>

      </div>

      {/* STAGES */}

      <div className="relative space-y-6">

        <div className="absolute left-[18px] top-10 hidden h-full w-[2px] bg-gradient-to-b from-border to-transparent md:block" />

        {activePath.stages.map((stage, index) => (

          <StageCard
            key={stage.id}
            stage={stage}
            index={index}
            colors={colors}
          />

        ))}

      </div>

      {/* CTA */}

      <section
        className={`mt-16 rounded-3xl bg-gradient-to-r ${activePath.gradient} p-10 text-white shadow-2xl`}
      >

        <h3 className="text-2xl font-bold">
          ចាប់ផ្តើម {activePath.label} Path
        </h3>

        <p className="mt-1 opacity-80">
          Courses + projects + mentor support
        </p>

        <Link
          href="/courses"
          className="inline-flex items-center gap-2 mt-5 bg-white text-black px-6 py-3 rounded-full font-semibold hover:scale-105 transition"
        >
          Start Learning
          <ChevronRight className="w-4 h-4" />
        </Link>

      </section>

    </div>
  );
}

/* Stage Card */

function StageCard({
  stage,
  index,
  colors,
}: {
  stage: RoadmapStage;
  index: number;
  colors: any;
}) {

  const [open, setOpen] = useState(index === 0);

  return (
    <div className="md:pl-12">

      <div className="rounded-2xl border bg-card shadow-sm hover:shadow-xl hover:-translate-y-1 transition">

        <button
          onClick={() => setOpen(!open)}
          className="flex w-full items-center justify-between p-6"
        >

          <div>

            <h3 className="font-bold">
              Phase {stage.phase} — {stage.title}
            </h3>

            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">

              <Clock className="w-3 h-3" />
              {stage.window}

            </div>

          </div>

          <ChevronRight
            className={`transition-transform ${
              open ? "rotate-90 text-primary" : ""
            }`}
          />

        </button>

        {open && (

          <div className="border-t p-6">

            {/* topics */}

            <div className="flex flex-wrap gap-2 mb-5">

              {stage.topics.map((t) => (
                <div
                  key={t.name}
                  className="px-3 py-1 text-xs rounded-full border bg-muted hover:bg-muted/80 transition"
                >
                  {t.icon} {t.name}
                </div>
              ))}

            </div>

            {/* outcomes */}

            <ul className="space-y-2 mb-5">

              {stage.outcomesKh.map((o, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-sm"
                >
                  <span
                    className={`w-2 h-2 rounded-full mt-2 ${colors.dot}`}
                  />
                  {o}
                </li>
              ))}

            </ul>

            {/* project */}

            <div
              className={`rounded-xl border p-4 ${colors.project}`}
            >

              <div className="flex items-center gap-2 text-xs font-semibold mb-1">

                <FolderGit2 className="w-3 h-3" />

                Milestone Project

              </div>

              <p className="font-semibold">
                {stage.projectKh}
              </p>

              <p className="text-xs text-muted-foreground">
                {stage.project}
              </p>

            </div>

            {/* resources */}

            {stage.resources.length > 0 && (

              <div className="mt-5 flex flex-wrap gap-2">

                {stage.resources.map((r) => (

                  <a
                    key={r.url}
                    href={r.url}
                    target="_blank"
                    className="text-xs border px-2 py-1 rounded-full hover:bg-muted transition"
                  >

                    {r.label}

                    <ExternalLink className="inline w-3 h-3 ml-1" />

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