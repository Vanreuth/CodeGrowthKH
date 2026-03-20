import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { levelOptions, levelLabels, type LevelOption } from "./PdfCourseCard";

interface PdfFilterBarProps {
  query: string;
  onQueryChange: (v: string) => void;
  selectedLevel: LevelOption;
  onLevelChange: (v: LevelOption) => void;
  selectedCategory: string;
  onCategoryChange: (name: string, id: number | undefined) => void;
  categoryOptions: { id: number | undefined; name: string }[];
  totalCount: number;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
}

export function PdfFilterBar({
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
}: PdfFilterBarProps) {
  return (
    <section className="rounded-2xl border border-border bg-card/80 p-4 shadow-sm backdrop-blur-sm md:p-5">
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="ស្វែងរកឈ្មោះវគ្គសិក្សា…"
            className="h-11 border-border bg-card pl-9"
          />
        </div>

        {hasActiveFilters && (
          <Button
            variant="outline"
            size="icon"
            onClick={onClearFilters}
            className="h-11 w-11 shrink-0 border-border bg-background hover:bg-red-500/10 hover:text-red-500"
            aria-label="Clear PDF filters"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {levelOptions.map((level) => (
          <button
            key={level}
            type="button"
            onClick={() => onLevelChange(level)}
            className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition ${
              selectedLevel === level
                ? "border-blue-500 bg-blue-600 text-white shadow-sm shadow-blue-400/30"
                : "border-border bg-background text-foreground hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 dark:hover:border-blue-500/40 dark:hover:bg-blue-900/30"
            }`}
          >
            {levelLabels[level]}
          </button>
        ))}
      </div>

      <div className="mt-2 flex flex-wrap gap-2">
        {categoryOptions.map((option) => (
          <button
            key={`${option.id ?? "all"}-${option.name}`}
            type="button"
            onClick={() => onCategoryChange(option.name, option.id)}
            className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition ${
              selectedCategory === option.name
                ? "border-blue-500 bg-blue-600 text-white shadow-sm shadow-blue-400/30"
                : "border-border bg-background text-foreground hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 dark:hover:border-blue-500/40 dark:hover:bg-blue-900/30"
            }`}
          >
            {option.name === "All" ? "ប្រភេទទាំងអស់" : option.name}
          </button>
        ))}
      </div>

      <div className="mt-3 flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          បង្ហាញ <span className="font-semibold text-foreground">{totalCount}</span> វគ្គសិក្សា
        </p>
        {hasActiveFilters && (
          <span className="rounded-full bg-blue-500/10 px-2 py-0.5 text-[10px] font-medium text-blue-600 dark:text-blue-300">
            Filtering
          </span>
        )}
      </div>
    </section>
  );
}
