import Link from "next/link";
import Image from "next/image";
import { BookOpen, Eye, Star, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CourseResponse } from "@/types/courseType";

const levelColors: Record<string, string> = {
    BEGINNER: "bg-green-500/10 text-green-600 dark:text-green-400",
    INTERMEDIATE: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    ADVANCED: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
};

const levelLabel: Record<string, string> = {
    BEGINNER: "កម្រិតចាប់ផ្តើម",
    INTERMEDIATE: "កម្រិតមធ្យម",
    ADVANCED: "កម្រិតខ្ពស់",
};

export function CourseCard({
                               course,
                               badge,
                           }: {
    course: CourseResponse;
    badge?: string;
}) {
    const isFree = !course.price || course.price === 0;

    return (
        <div className="group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg" style={{ '--tw-shadow-color': 'rgba(47,141,70,0.12)' } as React.CSSProperties}>

            {/* Thumbnail */}
            <div className="relative h-44 overflow-hidden">

                <Image
                    src={course.thumbnail || "/eduction_online.png"}
                    alt={course.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                />

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />

                {/* Category */}
                {course.categoryName && (
                    <span className="absolute bottom-3 left-3 rounded-full bg-black/40 px-3 py-1 text-xs text-white backdrop-blur">
            {course.categoryName}
          </span>
                )}

                {/* Badge */}
                {badge && (
                    <span className="absolute left-3 top-3 rounded-md bg-red-600 px-2 py-1 text-xs font-semibold text-white shadow">
            {badge}
          </span>
                )}

                {/* Free */}
                {isFree && (
                    <span className="absolute right-3 top-3 rounded-full bg-green-500 px-2.5 py-0.5 text-xs font-semibold text-white shadow">
            FREE
          </span>
                )}

            </div>

            {/* Body */}
            <div className="flex flex-col flex-1 p-4">

                {/* Level + Price */}
                <div className="mb-2 flex items-center justify-between">

          <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                  levelColors[course.level ?? ""] ?? levelColors["BEGINNER"]
              }`}
          >
            {levelLabel[course.level ?? ""] ?? course.level ?? ""}
          </span>

                    <span className="text-sm font-bold" style={{ color: '#2f8d46' }}>
            {isFree ? "ឥតគិតថ្លៃ" : `$${course.price}`}
          </span>

                </div>

                {/* Title */}
                <h3 className="line-clamp-2 font-semibold text-foreground transition-colors" style={{ color: 'inherit' }}>
                    {course.title}
                </h3>

                {/* Description */}
                {course.description && (
                    <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                        {course.description}
                    </p>
                )}

                {/* Meta */}
                <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">

          <span className="flex items-center gap-1">
            <BookOpen className="h-3.5 w-3.5" />
              {course.totalLessons ?? 0}
          </span>

                    <span className="flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
                        {(course.enrolledCount ?? 0).toLocaleString()}
          </span>

                    <span className="flex items-center gap-1">
            <Eye className="h-3.5 w-3.5" />
                        {(course.viewCount ?? 0).toLocaleString()}
          </span>

                    {(course.avgRating ?? 0) > 0 && (
                        <span className="flex items-center gap-1 text-amber-500">
              <Star className="h-3.5 w-3.5 fill-amber-400" />
                            {(course.avgRating ?? 0).toFixed(1)}
            </span>
                    )}

                </div>

                {/* CTA */}
                <Button
                    asChild
                    size="sm"
                    className="mt-4 w-full text-white shadow-sm"
                    style={{ background: '#2f8d46' }}
                >
                    <Link href={`/courses/${course.slug}`}>
                        {isFree ? "ចូលរៀនឥតគិតថ្លៃ" : "មើលវគ្គសិក្សា"}
                    </Link>
                </Button>

            </div>
        </div>
    );
}