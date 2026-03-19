"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  BookOpen,
  Calendar,
  ExternalLink,
  Eye,
  FileText,
  Layers,
  Loader2,
  Plus,
} from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DataTable } from "@/components/dataTable/DataTable";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { StatCard } from "@/components/StatCard";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useChapterAdmin, useChaptersByCourse } from "@/hooks/useChapter";
import { useCourses } from "@/hooks/useCourses";
import { useLessonsByChapter } from "@/hooks/useLesson";
import type { ApiResponse, PageResponse } from '@/types/api';
import type { ChapterRequest, ChapterResponse } from "@/types/chapterType";
import type { LessonResponse } from "@/types/lessonType";

function ChapterLessons({ chapterId }: { chapterId: number }) {
  const { data, loading, error } = useLessonsByChapter(chapterId);
  const lessons: LessonResponse[] = data ?? [];

  if (loading) {
    return (
      <div className="space-y-2 p-4">
        {Array.from({ length: 2 }).map((_, index) => (
          <Skeleton key={index} className="h-8 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (error) {
    return <div className="p-4 text-sm text-red-500">Failed to load lessons</div>;
  }

  if (lessons.length === 0) {
    return (
      <div className="px-4 py-6 text-center">
        <FileText className="mx-auto mb-2 h-8 w-8 text-muted-foreground/30" />
        <p className="text-sm text-muted-foreground">No lessons in this chapter yet</p>
        <Button variant="outline" size="sm" className="mt-2" asChild>
          <Link href="/dashboard/lessons">
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Add Lesson
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="overflow-hidden rounded-lg border bg-muted/20">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="h-8 text-[11px] font-semibold">#</TableHead>
              <TableHead className="h-8 text-[11px] font-semibold">Lesson</TableHead>
              <TableHead className="h-8 text-[11px] font-semibold text-center">Content</TableHead>
              <TableHead className="h-8 text-[11px] font-semibold">Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {lessons
              .sort((left, right) => left.orderIndex - right.orderIndex)
              .map((lesson) => (
                <TableRow key={lesson.id} className="hover:bg-muted/30">
                  <TableCell className="py-2">
                    <Badge variant="secondary" className="h-5 font-mono text-[10px]">
                      {lesson.orderIndex}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{lesson.title}</p>
                      {lesson.description && (
                        <p className="truncate text-[11px] text-muted-foreground">{lesson.description}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="py-2 text-center">
                    {lesson.content ? (
                      <Badge variant="outline" className="h-5 gap-1 text-[10px]">
                        <Eye className="h-2.5 w-2.5" />
                        {lesson.content.length} chars
                      </Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="py-2 text-[11px] text-muted-foreground">
                    {new Date(lesson.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>
      <div className="flex justify-end">
        <Button variant="ghost" size="sm" className="h-7 text-xs" asChild>
          <Link href="/dashboard/lessons">
            Manage All Lessons
            <ExternalLink className="ml-1 h-3 w-3" />
          </Link>
        </Button>
      </div>
    </div>
  );
}

function ChapterViewDialog({
  chapter,
  open,
  onClose,
}: {
  chapter: ChapterResponse | null;
  open: boolean;
  onClose: () => void;
}) {
  if (!chapter) return null;

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <div className="text-left">{chapter.title}</div>
              <div className="mt-1 flex items-center gap-2">
                <Badge variant="secondary">Order {chapter.orderIndex}</Badge>
                <Badge variant="outline">{chapter.lessonCount ?? chapter.lessons?.length ?? 0} lessons</Badge>
              </div>
            </div>
          </DialogTitle>
          <DialogDescription>
            Created on {new Date(chapter.createdAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </DialogDescription>
        </DialogHeader>
        <ChapterLessons chapterId={chapter.id} />
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function useChaptersTableData(
  courseId: number,
  params: {
    page?: number;
    size?: number;
    sortBy?: string;
    sortDir?: "asc" | "desc";
    search?: string;
  }
) {
  const { data, loading, error, refetch } = useChaptersByCourse(courseId);
  const { page = 0, size = 10, sortBy = "orderIndex", sortDir = "asc", search } = params;

  const adapted = useMemo<ApiResponse<PageResponse<ChapterResponse>>>(() => {
    const chapters = [...(data ?? [])];
    const normalizedSearch = search?.trim().toLowerCase() ?? "";
    const filtered = normalizedSearch
      ? chapters.filter(
          (chapter) =>
            chapter.title.toLowerCase().includes(normalizedSearch) ||
            (chapter.description ?? "").toLowerCase().includes(normalizedSearch)
        )
      : chapters;

    filtered.sort((left, right) => {
      const multiplier = sortDir === "desc" ? -1 : 1;
      if (sortBy === "title") return left.title.localeCompare(right.title) * multiplier;
      if (sortBy === "createdAt") {
        return (new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime()) * multiplier;
      }
      return ((left.orderIndex ?? 0) - (right.orderIndex ?? 0)) * multiplier;
    });

    const totalElements = filtered.length;
    const totalPages = Math.max(1, Math.ceil(totalElements / size));
    const startIndex = page * size;

    return {
      success: true,
      message: "",
      data: {
        content: filtered.slice(startIndex, startIndex + size),
        totalElements,
        totalPages,
        pageNumber: page,
        pageSize: size,
      },
    };
  }, [data, page, search, size, sortBy, sortDir]);

  return {
    data: courseId
      ? adapted
      : {
          success: true,
          message: "",
          data: {
            content: [],
            totalElements: 0,
            totalPages: 1,
            pageNumber: 0,
            pageSize: size,
          },
        },
    isLoading: courseId ? loading : false,
    isError: Boolean(error),
    error,
    refetch,
  };
}

export default function ChaptersPage() {
  const storageKey = "dashboard.chapters.selectedCourseId";
  const [selectedCourseId, setSelectedCourseId] = useState<number>(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingChapter, setEditingChapter] = useState<ChapterResponse | null>(null);
  const [viewingChapter, setViewingChapter] = useState<ChapterResponse | null>(null);
  const [deleteChapterId, setDeleteChapterId] = useState<number | null>(null);
  const [formTitle, setFormTitle] = useState("");
  const [formOrder, setFormOrder] = useState(0);

  const { data: coursesData, loading: coursesLoading } = useCourses({
    size: 100,
    sortBy: "orderIndex",
    sortDir: "desc",
  });
  const { data: chaptersData, loading: chaptersLoading, refetch } = useChaptersByCourse(selectedCourseId);
  const { creating, updating, removing, create, update, remove } = useChapterAdmin();

  const courses = coursesData?.content ?? [];
  const chapters = chaptersData ?? [];
  const sortedCourses = useMemo(
    () =>
      [...courses].sort((left, right) => {
        const orderDiff = (right.orderIndex ?? 0) - (left.orderIndex ?? 0);
        if (orderDiff !== 0) return orderDiff;

        const createdAtDiff = new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime();
        if (createdAtDiff !== 0) return createdAtDiff;

        return right.id - left.id;
      }),
    [courses]
  );
  const latestOrderCourseId = useMemo(() => {
    if (courses.length === 0) return 0;

    return sortedCourses[0]?.id ?? 0;
  }, [courses.length, sortedCourses]);
  const selectedCourse = courses.find((course) => course.id === selectedCourseId);
  const totalChapters = chapters.length;
  const totalLessons = chapters.reduce(
    (sum, chapter) => sum + (chapter.lessonCount ?? chapter.lessons?.length ?? 0),
    0
  );

  const useChaptersTable = (params: {
    page?: number;
    size?: number;
    sortBy?: string;
    sortDir?: "asc" | "desc";
    search?: string;
  }) => useChaptersTableData(selectedCourseId, params);

  const chapterColumns = useMemo(
    () => [
      {
        key: "title",
        label: "Chapter",
        sortable: true,
        render: (value: string, chapter: ChapterResponse) => (
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 font-semibold text-violet-600">
              {value.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="truncate font-medium">{value}</p>
              <p className="truncate text-xs text-muted-foreground">
                {chapter.description || "No description"}
              </p>
            </div>
          </div>
        ),
      },
      {
        key: "orderIndex",
        label: "Order",
        sortable: true,
        render: (value: number) => <Badge variant="secondary">{value}</Badge>,
      },
      {
        key: "lessonCount",
        label: "Lessons",
        render: (_value: number, chapter: ChapterResponse) => {
          const lessonCount = chapter.lessonCount ?? chapter.lessons?.length ?? 0;
          return <Badge variant="outline">{lessonCount} lesson{lessonCount === 1 ? "" : "s"}</Badge>;
        },
      },
      {
        key: "createdAt",
        label: "Created",
        sortable: true,
        render: (value: string) => (
          <span className="flex items-center gap-1 text-sm text-muted-foreground">
            <Calendar className="h-3.5 w-3.5" />
            {new Date(value).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>
        ),
      },
    ],
    []
  );

  const chapterFilters = useMemo(
    () => [
      {
        key: "courseId",
        label: "Course",
        type: "select" as const,
        value: selectedCourseId > 0 ? String(selectedCourseId) : undefined,
        onChange: (value: string | undefined) => setSelectedCourseId(value ? Number(value) : 0),
        placeholder: "Select a course",
        allLabel: "All courses",
        options: sortedCourses.map((course) => ({
          label: course.title,
          value: String(course.id),
        })),
      },
    ],
    [selectedCourseId, sortedCourses]
  );

  useEffect(() => {
    const storedCourseId = window.localStorage.getItem(storageKey);
    if (!storedCourseId) return;

    const parsedCourseId = Number(storedCourseId);
    if (Number.isFinite(parsedCourseId) && parsedCourseId > 0) {
      setSelectedCourseId(parsedCourseId);
    }
  }, []);

  useEffect(() => {
    if (coursesLoading || selectedCourseId > 0 || latestOrderCourseId === 0) return;

    setSelectedCourseId(latestOrderCourseId);
  }, [coursesLoading, latestOrderCourseId, selectedCourseId]);

  useEffect(() => {
    if (selectedCourseId > 0) {
      window.localStorage.setItem(storageKey, String(selectedCourseId));
      return;
    }

    window.localStorage.removeItem(storageKey);
  }, [selectedCourseId]);

  useEffect(() => {
    if (coursesLoading || selectedCourseId === 0) return;

    const courseExists = courses.some((course) => course.id === selectedCourseId);
    if (!courseExists) {
      if (latestOrderCourseId > 0) {
        setSelectedCourseId(latestOrderCourseId);
      } else {
        setSelectedCourseId(0);
        window.localStorage.removeItem(storageKey);
      }
    }
  }, [courses, coursesLoading, latestOrderCourseId, selectedCourseId]);

  const openCreateDialog = () => {
    setEditingChapter(null);
    setFormTitle("");
    setFormOrder(chapters.length);
    setDialogOpen(true);
  };

  const openEditDialog = (chapter: ChapterResponse) => {
    setEditingChapter(chapter);
    setFormTitle(chapter.title);
    setFormOrder(chapter.orderIndex);
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formTitle.trim()) {
      toast.error("Chapter title is required");
      return;
    }

    const payload: ChapterRequest = {
      title: formTitle.trim(),
      orderIndex: formOrder,
      courseId: selectedCourseId,
    };

    try {
      if (editingChapter) {
        await update(editingChapter.id, payload);
        toast.success("Chapter updated successfully");
      } else {
        await create(payload);
        toast.success("Chapter created successfully");
      }
      setDialogOpen(false);
      refetch();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Operation failed");
    }
  };

  const handleDelete = async () => {
    if (!deleteChapterId) return;

    const ok = await remove(deleteChapterId);
    if (ok) {
      toast.success("Chapter deleted successfully");
      refetch();
    } else {
      toast.error("Failed to delete chapter");
    }
    setDeleteChapterId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Chapters</h2>
          <p className="text-muted-foreground">
            Manage course chapters with reusable dashboard components.
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon={Layers} label="Total Chapters" value={totalChapters} color="#8b5cf6" loading={selectedCourseId > 0 && chaptersLoading} />
        <StatCard icon={FileText} label="Total Lessons" value={totalLessons} color="#3b82f6" loading={selectedCourseId > 0 && chaptersLoading} />
        <StatCard icon={BookOpen} label="Course Lessons" value={selectedCourse?.totalLessons ?? 0} color="#10b981" loading={selectedCourseId > 0 && chaptersLoading} />
      </div>

      <DataTable<ChapterResponse>
        title="Chapter Management"
        description={
          selectedCourse
            ? `Browse, view, edit, and delete chapters for "${selectedCourse.title}".`
            : "Select a course from the filters to manage chapters."
        }
        columns={chapterColumns}
        useDataHook={useChaptersTable}
        filters={chapterFilters}
        defaultShowFilters
        onView={(chapter) => setViewingChapter(chapter)}
        onEdit={openEditDialog}
        onDelete={(chapter) => setDeleteChapterId(chapter.id)}
        headerActions={
          <Button onClick={openCreateDialog} disabled={!selectedCourseId || coursesLoading}>
            <Plus className="mr-2 h-4 w-4" />
            Add Chapter
          </Button>
        }
      />

      <ChapterViewDialog
        chapter={viewingChapter}
        open={viewingChapter !== null}
        onClose={() => setViewingChapter(null)}
      />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingChapter ? "Edit Chapter" : "Add New Chapter"}</DialogTitle>
            <DialogDescription>
              {editingChapter
                ? "Update the chapter details below."
                : "Fill in the details to create a new chapter."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                placeholder="e.g., Getting Started"
                value={formTitle}
                onChange={(event) => setFormTitle(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Order Index</Label>
              <Input
                type="number"
                min={0}
                value={formOrder}
                onChange={(event) => setFormOrder(parseInt(event.target.value, 10) || 0)}
              />
              <p className="text-xs text-muted-foreground">Lower numbers appear first in the course.</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={creating || updating}>
              {(creating || updating) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingChapter ? "Save Changes" : "Create Chapter"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteChapterId !== null} onOpenChange={(open) => !open && setDeleteChapterId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Chapter</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this chapter? This will also remove all lessons within it.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 text-white hover:bg-red-700"
              disabled={removing}
            >
              {removing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
