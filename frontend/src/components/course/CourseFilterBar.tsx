"use client";

import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { CourseLevel, CourseStatus } from "@/types/courseType";

interface CategoryOption {
  id: number | undefined;
  name: string;
}

interface CourseFilterBarProps {
  query: string;
  onQueryChange: (v: string) => void;
  selectedLevel: CourseLevel | "All";
  onLevelChange: (v: CourseLevel | "All") => void;
  selectedCategory: string;
  selectedCategoryId: number | undefined;
  onCategoryChange: (name: string, id: number | undefined) => void;
  categoryOptions: CategoryOption[];
  totalCount: number;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
  isLiveApi: boolean;
  isApiError: boolean;
}

const LEVELS: (CourseLevel | "All")[] = ["All", "BEGINNER", "INTERMEDIATE", "ADVANCED"];

const levelLabel: Record<string, string> = {
  All:          "ទាំងអស់",
  BEGINNER:     "ចាប់ផ្តើម",
  INTERMEDIATE: "មធ្យម",
  ADVANCED:     "ខ្ពស់",
};

export function CourseFilterBar({
  query,
  onQueryChange,
  selectedLevel,
  onLevelChange,
  selectedCategory,
  onCategoryChange,
  categoryOptions,
  totalCount,
  hasActiveFilters,
  onClearFilters,
  isLiveApi,
  isApiError,
}: CourseFilterBarProps) {
  return (
    <section className="rounded-2xl border border-border bg-card/80 p-4 shadow-sm backdrop-blur-sm md:p-5">
      {/* Search row */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="ស្វែងរកវគ្គសិក្សា…"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            className="pl-9 bg-background border-border focus-visible:ring-violet-400"
          />
        </div>
        {hasActiveFilters && (
          <Button
            variant="outline"
            size="icon"
            onClick={onClearFilters}
            className="shrink-0 border-border bg-background hover:bg-red-500/10 hover:text-red-500"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Level pills */}
      <div className="mt-3 flex flex-wrap gap-2">
        {LEVELS.map((lvl) => (
          <button
            key={lvl}
            type="button"
            onClick={() => onLevelChange(lvl)}
            className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-all duration-150 ${
              selectedLevel === lvl
                ? "border-violet-500 bg-violet-600 text-white shadow-sm shadow-violet-400/30"
                : "border-border bg-background text-muted-foreground hover:border-violet-400/60 hover:bg-violet-500/10 hover:text-violet-600"
            }`}
          >
            {levelLabel[lvl] ?? lvl}
          </button>
        ))}
      </div>

      {/* Category pills */}
      <div className="mt-2 flex flex-wrap gap-2">
        {categoryOptions.map((opt) => (
          <button
            key={opt.name}
            type="button"
            onClick={() => onCategoryChange(opt.name, opt.id)}
            className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-all duration-150 ${
              selectedCategory === opt.name
                ? "border-indigo-500 bg-indigo-600 text-white shadow-sm shadow-indigo-400/30"
                : "border-border bg-background text-muted-foreground hover:border-indigo-400/60 hover:bg-indigo-500/10 hover:text-indigo-600"
            }`}
          >
            {opt.name === "All" ? "ប្រភេទទាំងអស់" : opt.name}
          </button>
        ))}
      </div>

      {/* Footer row */}
      <div className="mt-3 flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          បង្ហាញ{" "}
          <span className="font-semibold text-violet-600 dark:text-violet-400">{totalCount}</span>{" "}
          វគ្គ
        </p>
        {isLiveApi && (
          <span className="rounded-full bg-green-500/10 px-2 py-0.5 text-[10px] font-medium text-green-600 dark:text-green-400">
            ● Live from API
          </span>
        )}
        {isApiError && (
          <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-600 dark:text-amber-400">
            ⚠ Static data (API offline)
          </span>
        )}
      </div>
    </section>
  );
}
