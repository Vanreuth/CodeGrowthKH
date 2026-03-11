"use client";

import { useRef } from "react";
import {
  User,
  Mail,
  Shield,
  Camera,
  Edit3,
  X,
  BookOpen,
  GraduationCap,
  Clock,
  Award,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// ─────────────────────────────────────────────────────────────
//  Helpers
// ─────────────────────────────────────────────────────────────

function formatReadTime(seconds: number): string {
  if (seconds <= 0)      return "--";
  if (seconds >= 3600)   return `${Math.round(seconds / 3600)}h`;
  if (seconds >= 60)     return `${Math.round(seconds / 60)}m`;
  return `${seconds}s`;
}

// ─────────────────────────────────────────────────────────────
//  Types
// ─────────────────────────────────────────────────────────────

interface QuickStat {
  icon: React.ReactNode;
  value: React.ReactNode;
  label: string;
  bgClass: string;
}

interface ProfileHeroProps {
  user: {
    username?: string;
    email?: string;
    bio?: string;
    profilePicture?: string;
    roles?: string[];
    role?: string;
  };
  isEditing: boolean;
  previewUrl: string | null;
  profilePicture: File | null;
  progressLoading: boolean;
  totalLessonsTracked: number;
  lessonsCompleted: number;
  totalReadSeconds: number;
  onEditToggle: () => void;
  onCancelEdit: () => void;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

// ─────────────────────────────────────────────────────────────
//  Skeleton pulse helper
// ─────────────────────────────────────────────────────────────

function Pulse() {
  return (
    <span className="inline-block h-5 w-8 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
  );
}

// ─────────────────────────────────────────────────────────────
//  Component
// ─────────────────────────────────────────────────────────────

export function ProfileHero({
  user,
  isEditing,
  previewUrl,
  profilePicture,
  progressLoading,
  totalLessonsTracked,
  lessonsCompleted,
  totalReadSeconds,
  onEditToggle,
  onCancelEdit,
  onImageChange,
}: ProfileHeroProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isAdmin =
    user?.roles?.includes("ADMIN") ||
    user?.roles?.includes("ROLE_ADMIN") ||
    user?.role === "ROLE_ADMIN";

  const stats: QuickStat[] = [
    {
      icon: <BookOpen className="h-5 w-5 text-violet-600 dark:text-violet-400" />,
      value: progressLoading ? <Pulse /> : totalLessonsTracked,
      label: "មេរៀន",
      bgClass: "bg-violet-100 dark:bg-violet-900/30",
    },
    {
      icon: <GraduationCap className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />,
      value: progressLoading ? <Pulse /> : lessonsCompleted,
      label: "បានបញ្ចប់",
      bgClass: "bg-emerald-100 dark:bg-emerald-900/30",
    },
    {
      icon: <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />,
      value: progressLoading ? <Pulse /> : formatReadTime(totalReadSeconds),
      label: "ម៉ោងសិក្សា",
      bgClass: "bg-blue-100 dark:bg-blue-900/30",
    },
  ];

  return (
    <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-violet-50 via-white to-blue-50 p-6 shadow-sm md:p-10 dark:border-white/10 dark:from-slate-900 dark:via-slate-900/95 dark:to-slate-800">
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-gradient-to-br from-violet-400/20 via-blue-400/10 to-transparent blur-3xl" />
      <div className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-gradient-to-tr from-emerald-400/10 to-cyan-400/10 blur-2xl" />

      <div className="relative flex flex-col items-center gap-6 md:flex-row md:items-start md:gap-8">
        {/* ── Avatar ─────────────────────────────────────────── */}
        <div className="relative group">
          <div
            className={`rounded-full p-1 bg-gradient-to-br from-violet-500 via-blue-500 to-emerald-500 ${
              isEditing ? "cursor-pointer" : ""
            }`}
            onClick={() => isEditing && fileInputRef.current?.click()}
          >
            <Avatar className="h-28 w-28 border-4 border-white dark:border-slate-900 md:h-36 md:w-36">
              <AvatarImage
                src={previewUrl || user?.profilePicture || undefined}
                alt={user?.username || "Profile"}
              />
              <AvatarFallback className="bg-gradient-to-br from-violet-100 to-blue-100 text-3xl font-bold text-violet-600 dark:from-violet-900/50 dark:to-blue-900/50 dark:text-violet-300">
                {user?.username?.charAt(0).toUpperCase() || (
                  <User className="h-12 w-12" />
                )}
              </AvatarFallback>
            </Avatar>
            {isEditing && (
              <div className="absolute inset-1 flex items-center justify-center rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-all">
                <Camera className="h-8 w-8 text-white" />
              </div>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={onImageChange}
            className="hidden"
          />

          {profilePicture && (
            <Badge className="absolute -bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap bg-green-500 text-white text-[10px]">
              រូបភាពថ្មី
            </Badge>
          )}
        </div>

        {/* ── User Info ──────────────────────────────────────── */}
        <div className="flex-1 text-center md:text-left">
          <div className="flex flex-col items-center gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <div className="flex items-center justify-center gap-2 md:justify-start">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white md:text-3xl">
                  {user?.username}
                </h1>
                {isAdmin && (
                  <Badge
                    variant="secondary"
                    className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                  >
                    <Shield className="mr-1 h-3 w-3" />
                    Admin
                  </Badge>
                )}
              </div>

              <p className="mt-1 flex items-center justify-center gap-2 text-slate-600 dark:text-slate-400 md:justify-start">
                <Mail className="h-4 w-4" />
                {user?.email}
              </p>

              {user?.bio && (
                <p className="mt-3 max-w-lg text-sm text-slate-500 dark:text-slate-400">
                  {user.bio}
                </p>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex gap-2">
              {!isEditing ? (
                <Button onClick={onEditToggle} variant="outline" className="gap-2">
                  <Edit3 className="h-4 w-4" />
                  កែប្រែព័ត៌មាន
                </Button>
              ) : (
                <Button onClick={onCancelEdit} variant="ghost" className="gap-2">
                  <X className="h-4 w-4" />
                  បោះបង់
                </Button>
              )}
            </div>
          </div>

          {/* ── Quick Stats ──────────────────────────────────── */}
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {stats.map((stat, i) => (
              <div
                key={i}
                className="flex items-center gap-3 rounded-xl bg-white/80 p-3 shadow-sm dark:bg-white/5"
              >
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${stat.bgClass}`}
                >
                  {stat.icon}
                </div>
                <div>
                  <p className="text-lg font-bold text-slate-900 dark:text-white">
                    {stat.value}
                  </p>
                  <p className="text-xs text-slate-500">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}