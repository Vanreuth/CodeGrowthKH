"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useTheme } from "next-themes";
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";
import { toast } from "sonner";
import {
  BookOpen,
  Calendar,
  Code,
  Eye,
  FileText,
  Layers,
  Loader2,
  Plus,
  Trash2,
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
import { Textarea } from "@/components/ui/textarea";
import { useChaptersByCourse } from "@/hooks/useChapter";
import { useCourses } from "@/hooks/useCourses";
import { useLessonAdmin, useLessonsByChapter, useLessonsByCourse } from "@/hooks/useLesson";
import { useSnippetAdmin, useSnippetsByLesson } from "@/hooks/useSnippetCode";
import type { ApiResponse, PageResponse } from '@/types/api';
import type { CodeSnippetRequest, CodeSnippetResponse } from "@/types/codeSnippetType";
import type { LessonRequest, LessonResponse } from "@/types/lessonType";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

type EditableSnippet = {
  clientId: string;
  id?: number;
  title: string;
  language: string;
  code: string;
  explanation: string;
  orderIndex: number;
};

const SNIPPET_LANGUAGE_OPTIONS = [
  { value: "javascript", label: "JavaScript" },
  { value: "js", label: "JavaScript (js)" },
  { value: "typescript", label: "TypeScript" },
  { value: "ts", label: "TypeScript (ts)" },
  { value: "jsx", label: "JSX" },
  { value: "tsx", label: "TSX" },
  { value: "html", label: "HTML" },
  { value: "css", label: "CSS" },
  { value: "java", label: "Java" },
  { value: "python", label: "Python" },
  { value: "py", label: "Python (py)" },
  { value: "sql", label: "SQL" },
  { value: "json", label: "JSON" },
  { value: "bash", label: "Bash" },
  { value: "shell", label: "Shell" },
  { value: "sh", label: "Shell (sh)" },
  { value: "yaml", label: "YAML" },
  { value: "yml", label: "YAML (yml)" },
  { value: "docker", label: "Docker" },
  { value: "dockerfile", label: "Dockerfile" },
  { value: "php", label: "PHP" },
  { value: "go", label: "Go" },
  { value: "rust", label: "Rust" },
  { value: "kotlin", label: "Kotlin" },
  { value: "swift", label: "Swift" },
  { value: "dart", label: "Dart" },
  { value: "c", label: "C" },
  { value: "cpp", label: "C++" },
  { value: "csharp", label: "C#" },
] as const;

function createSnippetDraft(orderIndex = 0): EditableSnippet {
  return {
    clientId: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    title: "",
    language: "javascript",
    code: "",
    explanation: "",
    orderIndex,
  };
}

function toSnippetDraft(snippet: CodeSnippetResponse, index: number): EditableSnippet {
  return {
    clientId: `snippet-${snippet.id}`,
    id: snippet.id,
    title: snippet.title ?? "",
    language: snippet.language ?? "javascript",
    code: snippet.code ?? "",
    explanation: snippet.explanation ?? snippet.description ?? "",
    orderIndex: snippet.orderIndex ?? index,
  };
}

function hasSnippetContent(snippet: EditableSnippet) {
  return Boolean(
    snippet.title.trim() ||
      snippet.language.trim() ||
      snippet.code.trim() ||
      snippet.explanation.trim()
  );
}

function LessonViewDialog({
  lesson,
  open,
  onClose,
}: {
  lesson: LessonResponse | null;
  open: boolean;
  onClose: () => void;
}) {
  if (!lesson) return null;

  const snippetList = lesson.codeSnippets ?? lesson.snippets ?? [];

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>{lesson.title}</DialogTitle>
          <DialogDescription>
            <span className="inline-flex items-center gap-2">
              <Badge variant="secondary">Order {lesson.orderIndex}</Badge>
              <Badge variant="outline">{lesson.chapterTitle ?? `Chapter ${lesson.chapterId}`}</Badge>
              <span>
                {new Date(lesson.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {lesson.description && (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold">Description</h4>
              <p className="text-sm text-muted-foreground">{lesson.description}</p>
            </div>
          )}

          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Content</h4>
            <div className="rounded-xl border bg-muted/20 p-4 text-sm whitespace-pre-wrap">
              {lesson.content ?? lesson.content_raw ?? "No content"}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Code className="h-4 w-4 text-primary" />
              <h4 className="text-sm font-semibold">Code Snippets</h4>
              <Badge variant="secondary">{snippetList.length}</Badge>
            </div>

            {snippetList.length === 0 ? (
              <div className="rounded-xl border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
                No code snippets attached.
              </div>
            ) : (
              <div className="space-y-3">
                {snippetList.map((snippet, index) => (
                  <div key={snippet.id ?? index} className="space-y-3 rounded-xl border bg-background p-4">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">Snippet {index + 1}</Badge>
                      <Badge variant="secondary">{snippet.language ?? "text"}</Badge>
                      {snippet.title && <span className="text-sm font-medium">{snippet.title}</span>}
                    </div>
                    {snippet.explanation && (
                      <p className="text-sm text-muted-foreground">{snippet.explanation}</p>
                    )}
                    <pre className="overflow-x-auto rounded-lg bg-slate-950 p-4 text-xs text-slate-100">
                      <code>{snippet.code}</code>
                    </pre>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function LessonsPage() {
  const storageKey = "dashboard.lessons.selectedCourseId";
  const { resolvedTheme } = useTheme();
  const colorMode = resolvedTheme === "dark" ? "dark" : "light";

  const [selectedCourseId, setSelectedCourseId] = useState<number>(0);
  const [selectedChapterId, setSelectedChapterId] = useState<number>(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<LessonResponse | null>(null);
  const [viewingLesson, setViewingLesson] = useState<LessonResponse | null>(null);
  const [deleteLessonId, setDeleteLessonId] = useState<number | null>(null);
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formContent, setFormContent] = useState("");
  const [formOrder, setFormOrder] = useState(0);
  const [formChapterId, setFormChapterId] = useState<number>(0);
  const [snippetDrafts, setSnippetDrafts] = useState<EditableSnippet[] | null>(null);
  const [deletedSnippetIds, setDeletedSnippetIds] = useState<number[]>([]);

  const { data: coursesData, loading: coursesLoading } = useCourses({
    size: 100,
    sortBy: "orderIndex",
    sortDir: "desc",
  });
  const { data: chaptersData, loading: chaptersLoading } = useChaptersByCourse(selectedCourseId);
  const {
    data: lessonsByChapter,
    loading: lessonsLoading,
    refetch: refetchChapterLessons,
  } = useLessonsByChapter(selectedChapterId);
  const {
    data: allCourseLessons,
    loading: allLessonsLoading,
    refetch: refetchCourseLessons,
  } = useLessonsByCourse(selectedCourseId);
  const { creating, updating, removing, create, update, remove } = useLessonAdmin();
  const {
    data: lessonSnippets,
    loading: snippetsLoading,
    refetch: refetchSnippets,
  } = useSnippetsByLesson(editingLesson?.id ?? 0);
  const {
    creating: creatingSnippet,
    updating: updatingSnippet,
    removing: removingSnippet,
    create: createSnippet,
    update: updateSnippet,
    remove: removeSnippet,
  } = useSnippetAdmin();

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
  const lessons = useMemo(
    () => (selectedChapterId > 0 ? lessonsByChapter ?? [] : allCourseLessons ?? []),
    [allCourseLessons, lessonsByChapter, selectedChapterId]
  );
  const isLoadingLessons = selectedChapterId > 0 ? lessonsLoading : allLessonsLoading;
  const isSaving = creating || updating || creatingSnippet || updatingSnippet || removingSnippet;
  const resolvedSnippetDrafts = useMemo(() => {
    if (!editingLesson) return [] as EditableSnippet[];
    const source = lessonSnippets ?? editingLesson.codeSnippets ?? editingLesson.snippets ?? [];
    return source.map((snippet, index) => toSnippetDraft(snippet, index));
  }, [editingLesson, lessonSnippets]);
  const currentSnippetDrafts = snippetDrafts ?? resolvedSnippetDrafts;
  const totalLessons = lessons.length;
  const totalSnippets = lessons.reduce(
    (sum, lesson) => sum + (lesson.codeSnippets?.length ?? lesson.snippets?.length ?? 0),
    0
  );
  const selectedCourse = courses.find((course) => course.id === selectedCourseId);
  const selectedChapter = chapters.find((chapter) => chapter.id === selectedChapterId);

  const resetEditorState = () => {
    setEditingLesson(null);
    setFormTitle("");
    setFormDescription("");
    setFormContent("");
    setFormOrder(0);
    setFormChapterId(0);
    setSnippetDrafts(null);
    setDeletedSnippetIds([]);
  };

  const handleDialogChange = (open: boolean) => {
    setDialogOpen(open);
    if (!open) resetEditorState();
  };

  const refreshLessonViews = async () => {
    if (selectedCourseId > 0) await refetchCourseLessons();
    if (selectedChapterId > 0) await refetchChapterLessons();
  };

  const handleCourseChange = (value: string) => {
    setSelectedCourseId(Number(value));
    setSelectedChapterId(0);
  };

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
      setSelectedChapterId(0);
    }
  }, [courses, coursesLoading, latestOrderCourseId, selectedCourseId]);

  useEffect(() => {
    if (selectedChapterId === 0 || chaptersLoading) return;

    const chapterExists = chapters.some((chapter) => chapter.id === selectedChapterId);
    if (!chapterExists) {
      setSelectedChapterId(0);
    }
  }, [chapters, chaptersLoading, selectedChapterId]);

  const openCreateDialog = () => {
    setEditingLesson(null);
    setFormTitle("");
    setFormDescription("");
    setFormContent("");
    setFormOrder(lessons.length);
    setFormChapterId(selectedChapterId > 0 ? selectedChapterId : (chapters[0]?.id ?? 0));
    setSnippetDrafts([createSnippetDraft(0)]);
    setDeletedSnippetIds([]);
    setDialogOpen(true);
  };

  const openEditDialog = (lesson: LessonResponse) => {
    setEditingLesson(lesson);
    setFormTitle(lesson.title);
    setFormDescription(lesson.description ?? "");
    setFormContent(lesson.content ?? lesson.content_raw ?? "");
    setFormOrder(lesson.orderIndex);
    setFormChapterId(lesson.chapterId);
    setSnippetDrafts(null);
    setDeletedSnippetIds([]);
    setDialogOpen(true);
  };

  const updateSnippetDraft = (
    clientId: string,
    field: keyof Omit<EditableSnippet, "clientId" | "id">,
    value: string | number
  ) => {
    setSnippetDrafts((current) =>
      (current ?? currentSnippetDrafts).map((snippet) =>
        snippet.clientId === clientId ? { ...snippet, [field]: value } : snippet
      )
    );
  };

  const addSnippetDraft = () => {
    setSnippetDrafts((current) => {
      const base = current ?? currentSnippetDrafts;
      return [...base, createSnippetDraft(base.length)];
    });
  };

  const removeSnippetDraft = (clientId: string) => {
    setSnippetDrafts((current) => {
      const base = current ?? currentSnippetDrafts;
      const target = base.find((snippet) => snippet.clientId === clientId);
      if (!target) return base;

      if (target.id) {
        const targetId = target.id;
        setDeletedSnippetIds((existing) =>
          existing.includes(targetId) ? existing : [...existing, targetId]
        );
      }

      return base.filter((snippet) => snippet.clientId !== clientId);
    });
  };

  const syncSnippets = async (lessonId: number, drafts: EditableSnippet[]) => {
    for (const snippetId of deletedSnippetIds) {
      const ok = await removeSnippet(snippetId);
      if (!ok) throw new Error("Failed to delete code snippet");
    }

    for (const [index, snippet] of drafts.entries()) {
      const payload: CodeSnippetRequest = {
        title: snippet.title.trim() || undefined,
        language: snippet.language.trim(),
        code: snippet.code,
        explanation: snippet.explanation.trim() || undefined,
        orderIndex: Number.isFinite(snippet.orderIndex) ? snippet.orderIndex : index,
        lessonId,
      };

      if (snippet.id) {
        await updateSnippet(snippet.id, payload);
      } else {
        await createSnippet(payload);
      }
    }
  };

  const handleSubmit = async () => {
    if (!selectedCourseId && !editingLesson?.courseId) {
      toast.error("Please select a course");
      return;
    }
    if (!formTitle.trim()) {
      toast.error("Lesson title is required");
      return;
    }
    if (!formContent.trim()) {
      toast.error("Lesson content is required");
      return;
    }
    if (!formChapterId) {
      toast.error("Please select a chapter");
      return;
    }

    const preparedSnippets = currentSnippetDrafts
      .map((snippet, index) => ({
        ...snippet,
        title: snippet.title.trim(),
        language: snippet.language.trim(),
        explanation: snippet.explanation.trim(),
        orderIndex: Number.isFinite(snippet.orderIndex) ? snippet.orderIndex : index,
      }))
      .filter(hasSnippetContent);

    for (const [index, snippet] of preparedSnippets.entries()) {
      if (!snippet.language) {
        toast.error(`Snippet ${index + 1} needs a language`);
        return;
      }
      if (!snippet.code.trim()) {
        toast.error(`Snippet ${index + 1} needs code content`);
        return;
      }
    }

    const payload: LessonRequest = {
      title: formTitle.trim(),
      description: formDescription.trim() || undefined,
      content: formContent,
      orderIndex: formOrder,
      chapterId: formChapterId,
      courseId: selectedCourseId || editingLesson?.courseId || 0,
    };

    try {
      const savedLesson = editingLesson ? await update(editingLesson.id, payload) : await create(payload);
      await syncSnippets(savedLesson.id, preparedSnippets);
      await refreshLessonViews();

      if (editingLesson) {
        await refetchSnippets();
        toast.success("Lesson updated successfully");
      } else {
        toast.success("Lesson created successfully");
      }

      handleDialogChange(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Operation failed");
    }
  };

  const handleDelete = async () => {
    if (!deleteLessonId) return;
    const ok = await remove(deleteLessonId);
    if (ok) {
      toast.success("Lesson deleted successfully");
      await refreshLessonViews();
    } else {
      toast.error("Failed to delete lesson");
    }
    setDeleteLessonId(null);
  };

  const useLessonsTable = (params: {
    page?: number;
    size?: number;
    sortBy?: string;
    sortDir?: "asc" | "desc";
    search?: string;
  }) => {
    const { page = 0, size = 10, sortBy = "orderIndex", sortDir = "asc", search } = params;
    const normalizedSearch = search?.trim().toLowerCase() ?? "";
    const filtered = normalizedSearch
      ? lessons.filter(
          (lesson) =>
            lesson.title.toLowerCase().includes(normalizedSearch) ||
            (lesson.description ?? "").toLowerCase().includes(normalizedSearch) ||
            (lesson.chapterTitle ?? "").toLowerCase().includes(normalizedSearch)
        )
      : lessons;

    const sorted = [...filtered].sort((left, right) => {
      const multiplier = sortDir === "desc" ? -1 : 1;
      if (sortBy === "title") return left.title.localeCompare(right.title) * multiplier;
      if (sortBy === "createdAt") {
        return (new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime()) * multiplier;
      }
      if (sortBy === "chapterTitle") {
        return (left.chapterTitle ?? "").localeCompare(right.chapterTitle ?? "") * multiplier;
      }
      return (left.orderIndex - right.orderIndex) * multiplier;
    });

    const totalElements = sorted.length;
    const totalPages = Math.max(1, Math.ceil(totalElements / size));
    const startIndex = page * size;

    return {
      data: {
        success: true as const,
        message: "",
        data: {
          content: sorted.slice(startIndex, startIndex + size),
          totalElements,
          totalPages,
          pageNumber: page,
          pageSize: size,
        },
      } as ApiResponse<PageResponse<LessonResponse>>,
      isLoading: isLoadingLessons,
      isError: false,
      error: null,
      refetch: refreshLessonViews,
    };
  };

  const lessonColumns = useMemo(
    () => [
      {
        key: "title",
        label: "Lesson",
        sortable: true,
        render: (value: string, lesson: LessonResponse) => (
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 font-semibold text-blue-600">
              {value.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="truncate font-medium">{value}</p>
              <p className="truncate text-xs text-muted-foreground">
                {lesson.description || "No description"}
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
        key: "chapterTitle",
        label: "Chapter",
        sortable: true,
        render: (value: string, lesson: LessonResponse) => (
          <Badge variant="outline">{value ?? `Ch ${lesson.chapterId}`}</Badge>
        ),
      },
      {
        key: "content",
        label: "Content",
        render: (_value: string, lesson: LessonResponse) => {
          const snippetCount = lesson.codeSnippets?.length ?? lesson.snippets?.length ?? 0;
          const contentLength = (lesson.content ?? lesson.content_raw ?? "").length;
          return (
            <div className="flex items-center gap-2">
              {contentLength > 0 ? (
                <Badge variant="secondary" className="gap-1 text-xs">
                  <Eye className="h-3 w-3" />
                  {contentLength > 100 ? `${Math.round(contentLength / 100) * 100}+` : contentLength} chars
                </Badge>
              ) : (
                <span className="text-xs text-muted-foreground">-</span>
              )}
              {snippetCount > 0 && (
                <Badge variant="outline" className="gap-1 text-xs">
                  <Code className="h-3 w-3" />
                  {snippetCount}
                </Badge>
              )}
            </div>
          );
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

  const lessonFilters = useMemo(
    () => [
      {
        key: "courseId",
        label: "Course",
        type: "select" as const,
        value: selectedCourseId > 0 ? String(selectedCourseId) : undefined,
        onChange: (value: string | undefined) => {
          handleCourseChange(value ?? "0");
        },
        placeholder: "Select a course",
        allLabel: "All courses",
        options: sortedCourses.map((course) => ({
          label: course.title,
          value: String(course.id),
        })),
      },
      {
        key: "chapterId",
        label: "Chapter",
        type: "select" as const,
        value: selectedChapterId > 0 ? String(selectedChapterId) : undefined,
        onChange: (value: string | undefined) => setSelectedChapterId(value ? Number(value) : 0),
        placeholder: selectedCourseId > 0 ? "All chapters" : "Select a course first",
        allLabel: "All chapters",
        options: chapters.map((chapter) => ({
          label: chapter.title,
          value: String(chapter.id),
        })),
      },
    ],
    [chapters, selectedChapterId, selectedCourseId, sortedCourses]
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Lessons</h2>
          <p className="text-muted-foreground">
            Manage lesson content and code snippets with reusable dashboard components.
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon={FileText} label="Total Lessons" value={totalLessons} color="#8b5cf6" loading={selectedCourseId > 0 && isLoadingLessons} />
        <StatCard icon={Layers} label="Chapters" value={chapters.length} color="#3b82f6" loading={selectedCourseId > 0 && chaptersLoading} />
        <StatCard icon={Code} label="Code Snippets" value={totalSnippets} color="#10b981" loading={selectedCourseId > 0 && isLoadingLessons} />
      </div>

      <DataTable<LessonResponse>
        title="Lesson Management"
        description={
          selectedChapter
            ? `Lessons in "${selectedChapter.title}"`
            : selectedCourse
              ? `All lessons for "${selectedCourse.title}"`
              : "Select a course from the filters to manage lessons."
        }
        columns={lessonColumns}
        useDataHook={useLessonsTable}
        filters={lessonFilters}
        defaultShowFilters
        onView={(lesson) => setViewingLesson(lesson)}
        onEdit={openEditDialog}
        onDelete={(lesson) => setDeleteLessonId(lesson.id)}
        headerActions={
          <Button onClick={openCreateDialog} disabled={!selectedCourseId || chapters.length === 0}>
            <Plus className="mr-2 h-4 w-4" />
            Add Lesson
          </Button>
        }
      />

      <LessonViewDialog lesson={viewingLesson} open={viewingLesson !== null} onClose={() => setViewingLesson(null)} />

      <Dialog open={dialogOpen} onOpenChange={handleDialogChange}>
        <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>{editingLesson ? "Edit Lesson" : "Add New Lesson"}</DialogTitle>
            <DialogDescription>
              {editingLesson
                ? "Update the lesson content and keep its code examples in sync."
                : "Create a lesson, write its content, and attach code snippets in one step."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Chapter</Label>
                <Select value={formChapterId ? String(formChapterId) : ""} onValueChange={(value) => setFormChapterId(Number(value))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select chapter..." />
                  </SelectTrigger>
                  <SelectContent>
                    {chapters.map((chapter) => (
                      <SelectItem key={chapter.id} value={String(chapter.id)}>
                        {chapter.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Order Index</Label>
                <Input type="number" min={0} value={formOrder} onChange={(event) => setFormOrder(parseInt(event.target.value, 10) || 0)} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Title</Label>
              <Input placeholder="e.g., Introduction to Variables" value={formTitle} onChange={(event) => setFormTitle(event.target.value)} />
            </div>

            <div className="space-y-2">
              <Label>Description (optional)</Label>
              <Textarea placeholder="Short summary of what this lesson covers..." value={formDescription} onChange={(event) => setFormDescription(event.target.value)} rows={2} className="resize-none" />
            </div>

            <div className="space-y-2">
              <Label>Content</Label>
              <div data-color-mode={colorMode} className="overflow-hidden rounded-md">
                <MDEditor value={formContent} onChange={(value) => setFormContent(value ?? "")} height={340} preview="live" visibleDragbar={false} />
              </div>
              <p className="text-xs text-muted-foreground">{formContent.length} characters</p>
            </div>

            <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Code className="h-4 w-4 text-primary" />
                    <p className="text-sm font-semibold">Code Snippets</p>
                    <Badge variant="secondary">{currentSnippetDrafts.length}</Badge>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Add examples, starter code, or exercises for this lesson.
                  </p>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={addSnippetDraft}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Snippet
                </Button>
              </div>

              {editingLesson && snippetsLoading ? (
                <div className="mt-4 space-y-3">
                  {Array.from({ length: 2 }).map((_, index) => (
                    <div key={index} className="space-y-3 rounded-xl border bg-background p-4">
                      <Skeleton className="h-5 w-24" />
                      <div className="grid gap-3 md:grid-cols-3">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                      </div>
                      <Skeleton className="h-20 w-full" />
                      <Skeleton className="h-40 w-full" />
                    </div>
                  ))}
                </div>
              ) : currentSnippetDrafts.length === 0 ? (
                <div className="mt-4 rounded-xl border border-dashed bg-background/60 px-4 py-8 text-center">
                  <p className="text-sm text-muted-foreground">No snippets added yet.</p>
                </div>
              ) : (
                <div className="mt-4 space-y-3">
                  {currentSnippetDrafts.map((snippet, index) => (
                    <div key={snippet.clientId} className="space-y-4 rounded-xl border bg-background p-4 shadow-sm">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">Snippet {index + 1}</Badge>
                          <Badge variant="secondary">{snippet.id ? "Saved" : "New"}</Badge>
                        </div>
                        <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-red-500" onClick={() => removeSnippetDraft(snippet.clientId)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_180px_120px]">
                        <div className="space-y-2">
                          <Label>Snippet Title (optional)</Label>
                          <Input placeholder="e.g., Basic example" value={snippet.title} onChange={(event) => updateSnippetDraft(snippet.clientId, "title", event.target.value)} />
                        </div>
                        <div className="space-y-2">
                          <Label>Language</Label>
                          <Select
                            value={snippet.language}
                            onValueChange={(value) =>
                              updateSnippetDraft(snippet.clientId, "language", value)
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select language" />
                            </SelectTrigger>
                            <SelectContent>
                              {SNIPPET_LANGUAGE_OPTIONS.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Order</Label>
                          <Input type="number" min={0} value={snippet.orderIndex} onChange={(event) => updateSnippetDraft(snippet.clientId, "orderIndex", parseInt(event.target.value, 10) || 0)} />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Explanation (optional)</Label>
                        <Textarea placeholder="Explain what this snippet demonstrates..." value={snippet.explanation} onChange={(event) => updateSnippetDraft(snippet.clientId, "explanation", event.target.value)} rows={2} className="resize-none" />
                      </div>

                      <div className="space-y-2">
                        <Label>Code</Label>
                        <Textarea placeholder="Write the snippet code here..." value={snippet.code} onChange={(event) => updateSnippetDraft(snippet.clientId, "code", event.target.value)} rows={8} className="font-mono text-sm" />
                        <p className="text-xs text-muted-foreground">{snippet.code.length} characters</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => handleDialogChange(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingLesson ? "Save Changes" : "Create Lesson"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteLessonId !== null} onOpenChange={(open) => !open && setDeleteLessonId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Lesson</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this lesson? This will also remove all code snippets within it. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 text-white hover:bg-red-700" disabled={removing}>
              {removing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
