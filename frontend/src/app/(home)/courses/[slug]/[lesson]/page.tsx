"use client";

import { usePathname, useRouter, useParams, useSearchParams } from "next/navigation";
import { useEffect, useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { CourseLearningContent } from "@/components/course/CourseLearningContent";
interface LessonRouteParams {
  [key: string]: string | string[] | undefined;
  slug?: string;
  lesson?: string;
}

function normalizeLessonParam(value?: string | string[] | null | undefined): string {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw) return "";
  return decodeURIComponent(raw).replace(/\.asp$/i, "").trim().toLowerCase();
}

export default function CourseLessonPage() {
  const params = useParams<LessonRouteParams>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const courseSlug = useMemo(() => {
    if (!params?.slug) return "";
    return decodeURIComponent(params.slug as string);
  }, [params?.slug]);

  const rawLessonParam = useMemo(() => {
    const lessonParam = params?.lesson;
    return Array.isArray(lessonParam) ? lessonParam[0] : (lessonParam as string | undefined);
  }, [params?.lesson]);

  const lessonFromPath = useMemo(() => normalizeLessonParam(params?.lesson as string), [params?.lesson]);
  const lessonFromQuery = useMemo(
    () => normalizeLessonParam(searchParams?.get("lesson")),
    [searchParams]
  );

  useEffect(() => {
    if (!courseSlug || !rawLessonParam || !pathname) return;

    const canonicalLesson = lessonFromQuery || lessonFromPath;
    if (!canonicalLesson) return;

    const params = new URLSearchParams(searchParams?.toString());
    params.set("lesson", canonicalLesson);
    const canonical = `/courses/${encodeURIComponent(courseSlug)}?${params.toString()}`;

    if (`${pathname}${searchParams?.toString() ? `?${searchParams.toString()}` : ""}` !== canonical) {
      router.replace(canonical, { scroll: false });
    }
  }, [courseSlug, lessonFromPath, lessonFromQuery, pathname, rawLessonParam, router, searchParams]);

  const initialLessonSlug = lessonFromQuery || lessonFromPath;

  if (!courseSlug) return <Skeleton className="h-screen w-full" />;

  return (
    <CourseLearningContent
      courseSlug={courseSlug}
      initialLessonSlug={initialLessonSlug}
    />
  );
}
