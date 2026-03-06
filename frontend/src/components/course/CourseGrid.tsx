import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CourseResponse } from "@/types/courseType";
import { CourseCard } from "./courseCard";

interface CourseGridProps {
  courses: CourseResponse[];
  loading: boolean;
  onClearFilters: () => void;
}

export function CourseGrid({ courses, loading, onClearFilters }: CourseGridProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
        <span className="ml-3 text-muted-foreground">កំពុងផ្ទុក…</span>
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-violet-400/40 bg-violet-500/5 p-10 text-center">
        <p className="text-lg font-semibold text-foreground">
          មិនមានវគ្គសិក្សាត្រូវនឹងការស្វែងរក
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          សូមលុបការត្រង ឬស្វែងរកជាមួយពាក្យផ្សេង
        </p>
        <Button
          variant="outline"
          className="mt-4 border-violet-400/40 text-violet-600 dark:text-violet-400 hover:bg-violet-500/10"
          onClick={onClearFilters}
        >
          លុបការត្រង
        </Button>
      </div>
    );
  }

  return (
    <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {courses.map((course) => (
        <CourseCard key={course.id} course={course} />
      ))}
    </section>
  );
}
