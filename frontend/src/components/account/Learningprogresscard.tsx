"use client";

import { Target, Award } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { formatDurationCompactKh } from "./progress-utils";

// ─────────────────────────────────────────────────────────────
//  LearningProgressCard
// ─────────────────────────────────────────────────────────────

interface LearningProgressCardProps {
  lessonsCompleted: number;
  totalLessonsTracked: number;
  lessonsProgressPct: number;
  totalReadSeconds: number;
}

export function LearningProgressCard({
  lessonsCompleted,
  totalLessonsTracked,
  lessonsProgressPct,
  totalReadSeconds,
}: LearningProgressCardProps) {
  const readTimeLabel = formatDurationCompactKh(totalReadSeconds);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Target className="h-5 w-5 text-emerald-600" />
          វឌ្ឍនភាពសិក្សា
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Lessons */}
        <div>
          <div className="mb-2 flex justify-between text-sm">
            <span className="text-muted-foreground">មេរៀនបានបញ្ចប់</span>
            <span className="font-medium">
              {lessonsCompleted}/{totalLessonsTracked} មេរៀន
            </span>
          </div>
          <Progress value={lessonsProgressPct} className="h-2" />
        </div>

        {/* Courses — placeholder until course completion endpoint is used */}
        <div>
          <div className="mb-2 flex justify-between text-sm">
            <span className="text-muted-foreground">វគ្គសិក្សាបានបញ្ចប់</span>
            <span className="font-medium">--</span>
          </div>
          <Progress value={0} className="h-2" />
        </div>

        <Separator />

        {/* Read time row */}
        <div className="flex items-center justify-between rounded-lg bg-gradient-to-r from-blue-50 to-sky-50 p-3 dark:from-blue-950/20 dark:to-sky-950/20">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📖</span>
            <div>
              <p className="text-sm font-medium">ពេលវេលាអានសរុប</p>
              <p className="text-xs text-muted-foreground">ពេលវេលាដែលបានចំណាយ</p>
            </div>
          </div>
          <span className="text-xl font-bold text-blue-600">{readTimeLabel}</span>
        </div>

        {/* Streak */}
        <div className="flex items-center justify-between rounded-lg bg-gradient-to-r from-orange-50 to-amber-50 p-3 dark:from-orange-950/20 dark:to-amber-950/20">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🔥</span>
            <div>
              <p className="text-sm font-medium">ស្ទ្រីកបច្ចុប្បន្ន</p>
              <p className="text-xs text-muted-foreground">រៀនជារៀងរាល់ថ្ងៃ</p>
            </div>
          </div>
          <span className="text-2xl font-bold text-orange-600">--</span>
        </div>
      </CardContent>
    </Card>
  );
}

// ─────────────────────────────────────────────────────────────
//  AchievementGrid
// ─────────────────────────────────────────────────────────────

const ACHIEVEMENTS = [
  { icon: "🏆", label: "មេរៀនដំបូង", threshold: 1 },
  { icon: "🎯", label: "១០ មេរៀន", threshold: 10 },
  { icon: "⭐", label: "២៥ មេរៀន", threshold: 25 },
  { icon: "🔥", label: "៥០ មេរៀន", threshold: 50 },
  { icon: "💎", label: "១០០ មេរៀន", threshold: 100 },
  { icon: "👑", label: "២០០ មេរៀន", threshold: 200 },
];

interface AchievementGridProps {
  lessonsCompleted: number;
}

export function AchievementGrid({ lessonsCompleted }: AchievementGridProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Award className="h-5 w-5 text-amber-600" />
          សមិទ្ធិផល
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-2">
          {ACHIEVEMENTS.map((a, i) => {
            const unlocked = lessonsCompleted >= a.threshold;
            return (
              <div
                key={i}
                title={unlocked ? `បានបើកនៅ ${a.threshold} មេរៀន` : `បំពេញ ${a.threshold} មេរៀន ដើម្បីបើក`}
                className={`flex flex-col items-center gap-1 rounded-lg p-2 transition-opacity ${
                  unlocked
                    ? "bg-gradient-to-b from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20"
                    : "bg-slate-100 opacity-40 dark:bg-slate-800"
                }`}
              >
                <span className="text-2xl">{a.icon}</span>
                <span className="text-[10px] text-center text-muted-foreground leading-tight">
                  {a.label}
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
